from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import random
from core.db_instance import get_collection

router = APIRouter()

# Models
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

class SearchQuery(BaseModel):
    query: str

class EligibilityForm(BaseModel):
    age: int
    weight: float
    health_conditions: str

class MatchRequest(BaseModel):
    blood_group: str
    organ: Optional[str] = None
    location: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(msg: ChatMessage):
    """
    Mock AI Chatbot for FAQ and basic assistance.
    """
    query = msg.message.lower()
    reply = "I'm the AI Assistant. I can help you with donation FAQs and registration. How can I assist you today?"
    
    if "eligible" in query or "can i donate" in query:
        reply = "Generally, donors must be 18 to 65 years old and weigh at least 50 kg. Certain health conditions might disqualify you. Check out our Eligibility Checker for a quick answer!"
    elif "register" in query:
        reply = "You can register by clicking the 'Register' button on the top right. You will need to provide your basic details and blood group."
    elif "pain" in query or "hurt" in query:
        reply = "Blood donation involves a slight pinch, but it's generally a very safe and quick process. Organ donation is a serious procedure performed under anesthesia."
    elif "urgent" in query or "fast" in query:
        reply = "If you need an urgent match, please register as a Hospital and create a 'critical' urgency request."
        
    return {"reply": reply}


@router.post("/smart-search", response_model=Dict)
async def smart_search(search: SearchQuery):
    """
    Mock NLP Smart Search
    Extracts blood group, urgency, and location.
    """
    query = search.query.lower()
    
    blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    detected_bg = None
    for bg in blood_groups:
        if bg.lower() in query:
            detected_bg = bg
            break
            
    detected_urgency = "high" if "urgent" in query or "critical" in query else "medium"
    
    # Extract likely location based on simple list
    cities = ["bengaluru", "mumbai", "delhi", "chennai", "hyderabad", "pune", "kolkata"]
    detected_city = None
    for city in cities:
        if city in query:
            detected_city = city.capitalize()
            break

    # Find matches in DB
    donors_col = get_collection("donors")
    db_query = {}
    if detected_bg:
        db_query["blood_group"] = detected_bg
    if detected_city:
        db_query["address"] = {"$regex": detected_city, "$options": "i"} # Using regex for simple location match
        
    results = []
    try:
        cursor = donors_col.find(db_query).limit(10)
        for d in cursor:
            d["_id"] = str(d["_id"])
            results.append(d)
    except Exception as e:
        pass
        
    return {
        "extracted_params": {
            "blood_group": detected_bg,
            "location": detected_city,
            "urgency": detected_urgency
        },
        "results": results,
        "message": f"Found {len(results)} matches for your query."
    }


@router.get("/predict-demand")
async def predict_demand():
    """
    Analyze stored data (requests) and recommend high demand blood groups.
    """
    try:
        requests_col = get_collection("requests")
        pending = requests_col.find({"status": {"$in": ["pending", "matched"]}})
        
        counts = {}
        for r in pending:
            bg = r.get("blood_group")
            if bg:
                counts[bg] = counts.get(bg, 0) + 1
                
        if not counts:
            return {"prediction": "Stable demand currently across all groups."}
            
        # Find group with max requests
        max_bg = max(counts, key=counts.get)
        total_pending = sum(counts.values())
        
        return {
            "critical_blood_group": max_bg,
            "prediction": f"High demand for {max_bg} this week.",
            "data": counts
        }
    except Exception as e:
         return {"prediction": "High demand for O+ this week (Model Baseline)."}

@router.post("/eligibility")
async def check_eligibility(form: EligibilityForm):
    """
    Rules-based checking for eligibility
    """
    reasons = []
    is_eligible = True
    
    if form.age < 18:
        is_eligible = False
        reasons.append("You must be at least 18 years old.")
    elif form.age > 65:
        is_eligible = False
        reasons.append("You must be under 65 years old.")
        
    if form.weight < 50:
        is_eligible = False
        reasons.append("You must weigh at least 50kg to donate.")
        
    conditions = form.health_conditions.lower()
    bad_conditions = ["hiv", "hepatitis", "cancer", "diabetes", "heart disease"]
    
    for b in bad_conditions:
        if b in conditions:
            is_eligible = False
            reasons.append(f"Condition '{b}' disqualifies you from standard donation.")
            
    if is_eligible:
        return {"eligible": True, "message": "You are eligible to donate! Thank you for your generosity."}
    else:
        return {"eligible": False, "message": "You are not eligible to donate at this time.", "reasons": reasons}

@router.post("/match-donors")
async def match_donors_ai(req: MatchRequest):
    """
    AI Donor-Recipient Matching based on blood group, location distance, and availability.
    """
    donors_col = get_collection("donors")
    
    results = []
    try:
        query = {"availability": True}
        if req.blood_group:
            query["blood_group"] = req.blood_group
            
        cursor = donors_col.find(query).limit(50)
        
        matches = []
        for d in cursor:
            score = 0.5 # base score
            if d.get("blood_group") == req.blood_group:
                score += 0.3
            if req.location and d.get("location") and req.location.lower() in d.get("location").lower():
                score += 0.15
            if req.organ and req.organ.lower() in [o.lower() for o in d.get("organs", [])]:
                score += 0.05
                
            d["_id"] = str(d["_id"])
            d["match_score"] = round(score * 100) # Percentage score
            matches.append(d)
        
        # Sort by score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        results = matches[:5] # Top 5
    except Exception as e:
        pass
        
    return {"matches": results}


@router.get("/trigger-alerts")
async def trigger_alerts():
    """
    Analyze active requests, if high urgency, generate alerts for matching donors.
    """
    try:
        requests_col = get_collection("requests")
        critical = requests_col.find({
            "urgency": {"$in": ["high", "critical", "High", "Critical"]},
            "status": {"$in": ["pending", "matched"]}
        })
        
        alerts = []
        for req in critical:
            bg = req.get("blood_group")
            organ = req.get("organ")
            if bg:
                message = f"URGENT: High demand for {bg} blood"
                if organ and organ.lower() not in ["none", "whole blood", ""]:
                    message += f" and {organ}"
                message += " right now."
                
                alerts.append({
                    "id": str(req.get("_id")),
                    "type": "urgent_demand",
                    "blood_group": bg,
                    "organ": organ,
                    "matches": req.get("matches", []),
                    "message": message
                })
                
        return {"alerts": alerts}
    except Exception as e:
        return {"alerts": []}
