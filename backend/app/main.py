from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
import asyncio
import logging

from app.db import init_db
from app.deps import get_session
from app.models import Persona, Setting
from app.schemas import SettingOut, SettingIn, PersonaIn
from app.settings_service import get_lm_studio_base_url, set_lm_studio_base_url
from app.personas_service import (
    list_personas,
    create_persona,
    update_persona,
    delete_persona,
    get_persona,
)
from app.lmstudio_client import LMStudioClient

app = FastAPI(title="OpenLLMWeb API", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response

# Initialize database
init_db()


@app.get("/api/healthz")
async def health_check():
    return {"status": "ok"}


@app.get("/api/settings", response_model=SettingOut)
async def get_settings(session: Session = Depends(get_session)):
    """Get current settings"""
    url = get_lm_studio_base_url(session)
    return SettingOut(lm_studio_base_url=url)


@app.put("/api/settings")
async def put_settings(settings: SettingIn, session: Session = Depends(get_session)):
    """Update settings"""
    try:
        logger.info(f"Updating settings with URL: {settings.lm_studio_base_url}")
        set_lm_studio_base_url(session, str(settings.lm_studio_base_url))
        logger.info("Settings updated successfully")
        return {"message": "Settings updated successfully"}
    except Exception as e:
        logger.error(f"Failed to save settings: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save settings: {str(e)}")


@app.get("/api/models")
async def fetch_models(session: Session = Depends(get_session)):
    """Fetch available models from LM Studio"""
    try:
        base_url = get_lm_studio_base_url(session)
        client = LMStudioClient(base_url)
        models = await client.list_models()
        return models
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch models from LM Studio: {str(e)}"
        )


@app.post("/api/models/refresh")
async def refresh_models(session: Session = Depends(get_session)):
    """Refresh models from LM Studio"""
    try:
        base_url = get_lm_studio_base_url(session)
        logger.info(f"Refreshing models from LM Studio URL: {base_url}")
        client = LMStudioClient(base_url)
        models = await client.list_models()
        logger.info(f"Successfully fetched {len(models.get('data', []))} models")
        return {"message": "Models refreshed successfully", "models": models}
    except Exception as e:
        logger.error(f"Failed to refresh models: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to refresh models. Check your LM Studio URL and connection: {str(e)}"
        )


@app.get("/api/personas", response_model=List[Persona])
async def list_personas_endpoint(session: Session = Depends(get_session)):
    """List all personas"""
    return list_personas(session)


@app.post("/api/personas", response_model=Persona)
async def create_persona_endpoint(
    persona: PersonaIn, session: Session = Depends(get_session)
):
    """Create a new persona"""
    try:
        logger.info(f"Creating persona: {persona.name}")
        result = create_persona(session, persona.name, persona.system_prompt)
        logger.info(f"Persona created successfully with ID: {result.id}")
        return result
    except Exception as e:
        logger.error(f"Failed to create persona: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create persona: {str(e)}")


@app.put("/api/personas/{persona_id}", response_model=Persona)
async def update_persona_endpoint(
    persona_id: int,
    persona: PersonaIn,
    session: Session = Depends(get_session),
):
    """Update an existing persona"""
    try:
        updated_persona = update_persona(session, persona_id, persona.name, persona.system_prompt)
        if not updated_persona:
            raise HTTPException(status_code=404, detail="Persona not found")
        return updated_persona
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update persona: {str(e)}")


@app.delete("/api/personas/{persona_id}")
async def delete_persona_endpoint(
    persona_id: int, session: Session = Depends(get_session)
):
    """Delete a persona"""
    try:
        success = delete_persona(session, persona_id)
        if not success:
            raise HTTPException(status_code=404, detail="Persona not found")
        return {"message": "Persona deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete persona: {str(e)}")


@app.post("/api/chat")
async def chat_endpoint(
    payload: dict,
    session: Session = Depends(get_session),
):
    """Send a chat message"""
    try:
        base_url = get_lm_studio_base_url(session)
        client = LMStudioClient(base_url)
        
        # Get persona if specified
        persona = None
        if payload.get("persona_id"):
            persona = get_persona(session, payload["persona_id"])
            if not persona:
                raise HTTPException(status_code=404, detail="Persona not found")
        
        # Prepare the chat payload
        chat_payload = {
            "model": payload["model"],
            "messages": [
                {"role": "system", "content": persona.system_prompt} if persona else None,
                {"role": "user", "content": payload["prompt"]},
            ],
            "temperature": payload.get("temperature", 0.7),
            "max_tokens": payload.get("max_tokens", 1000),
        }
        
        # Remove None values
        chat_payload["messages"] = [msg for msg in chat_payload["messages"] if msg is not None]
        
        response = await client.chat(chat_payload)
        
        # Extract the content from the response
        content = ""
        if "choices" in response and len(response["choices"]) > 0:
            content = response["choices"][0].get("message", {}).get("content", "")
        
        return {"content": content, "raw": response}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
