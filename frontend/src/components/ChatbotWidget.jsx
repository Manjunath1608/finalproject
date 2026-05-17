import React, { useState, useRef, useEffect } from 'react';
import API from '../api';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI Assistant. How can I help you with blood or organ donation today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await API.post('/api/ai/chat', { message: userMessage });
      const botReply = res.data.reply || "Sorry, I couldn't understand that.";
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { text: 'Oops! I am having trouble connecting to the server. Please try again later.', sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {isOpen ? (
        <div style={{
          width: '350px',
          height: '450px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e1e4e8'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🤖</span> AI Assistant
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0 5px'
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '15px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f8f9fa'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'user' ? '#2563eb' : '#e9ecef',
                color: msg.sender === 'user' ? 'white' : '#212529',
                padding: '10px 14px',
                borderRadius: '18px',
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '18px',
                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '18px',
                maxWidth: '85%',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                backgroundColor: '#e9ecef',
                color: '#6c757d',
                padding: '10px 14px',
                borderRadius: '18px',
                maxWidth: '85%',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            display: 'flex',
            padding: '10px',
            borderTop: '1px solid #e1e4e8',
            backgroundColor: '#fff'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #ced4da',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              style={{
                backgroundColor: input.trim() && !isTyping ? '#2563eb' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                marginLeft: '8px',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'background-color 0.2s'
              }}
            >
              ➤
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
            cursor: 'pointer',
            fontSize: '28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}
    </div>
  );
}
