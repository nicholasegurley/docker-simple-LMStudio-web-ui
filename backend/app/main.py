from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
import asyncio
import logging

from app.db import init_db
from app.deps import get_session
from app.models import Persona, Setting, Chat, ChatMessage
from app.schemas import SettingOut, SettingIn, PersonaIn, ChatOut, ChatResponseOut, ChatIn
from app.settings_service import get_lm_studio_base_url, set_lm_studio_base_url, get_context_message_count, set_context_message_count
from app.personas_service import (
    list_personas,
    create_persona,
    update_persona,
    delete_persona,
    get_persona,
)
from app.chat_service import (
    create_chat,
    get_chat,
    list_chats,
    delete_chat,
    add_message,
    get_chat_messages,
    get_recent_messages_for_context,
    generate_chat_name_from_prompt,
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
    context_count = get_context_message_count(session)
    return SettingOut(lm_studio_base_url=url, context_message_count=context_count)


@app.put("/api/settings")
async def put_settings(settings: SettingIn, session: Session = Depends(get_session)):
    """Update settings"""
    try:
        logger.info(f"Updating settings with URL: {settings.lm_studio_base_url}")
        set_lm_studio_base_url(session, str(settings.lm_studio_base_url))
        
        if settings.context_message_count is not None:
            logger.info(f"Updating context message count: {settings.context_message_count}")
            set_context_message_count(session, settings.context_message_count)
        
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


@app.post("/api/chat", response_model=ChatResponseOut)
async def chat_endpoint(
    payload: ChatIn,
    session: Session = Depends(get_session),
):
    """Send a chat message"""
    try:
        base_url = get_lm_studio_base_url(session)
        client = LMStudioClient(base_url)
        
        # Get persona if specified
        persona = None
        if payload.persona_id:
            persona = get_persona(session, payload.persona_id)
            if not persona:
                raise HTTPException(status_code=404, detail="Persona not found")
        
        # Handle chat creation or retrieval
        chat = None
        if payload.chat_id:
            chat = get_chat(session, payload.chat_id)
            if not chat:
                raise HTTPException(status_code=404, detail="Chat not found")
        else:
            # Create new chat
            chat_name = generate_chat_name_from_prompt(payload.prompt)
            chat = create_chat(session, chat_name)
        
        # Get context messages if continuing an existing chat
        context_count = get_context_message_count(session)
        context_messages = []
        if payload.chat_id and context_count > 0:
            context_messages = get_recent_messages_for_context(session, chat.id, context_count)
        
        # Prepare the chat payload with system message first
        messages = []
        
        # Always include system message first if persona is specified
        if persona:
            messages.append({"role": "system", "content": persona.system_prompt})
        
        # Add context messages (user and assistant turns)
        for msg in context_messages:
            messages.append({"role": msg.role, "content": msg.content})
        
        # Add current user message
        messages.append({"role": "user", "content": payload.prompt})
        
        chat_payload = {
            "model": payload.model,
            "messages": messages,
            "temperature": payload.temperature,
            "max_tokens": payload.max_tokens,
        }
        
        response = await client.chat(chat_payload)
        
        # Extract the content from the response
        content = ""
        if "choices" in response and len(response["choices"]) > 0:
            content = response["choices"][0].get("message", {}).get("content", "")
        
        # Save messages to database
        add_message(session, chat.id, "user", payload.prompt)
        add_message(session, chat.id, "assistant", content)
        
        return ChatResponseOut(content=content, raw=response, chat_id=chat.id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process chat request: {str(e)}"
        )


@app.get("/api/chats", response_model=List[ChatOut])
async def list_chats_endpoint(session: Session = Depends(get_session)):
    """List all chats"""
    try:
        chats = list_chats(session)
        # Convert chats to ChatOut format
        chat_outs = []
        for chat in chats:
            chat_outs.append({
                "id": chat.id,
                "name": chat.name,
                "created_at": chat.created_at,
                "updated_at": chat.updated_at,
                "messages": []  # Don't load messages for list view
            })
        return chat_outs
    except Exception as e:
        logger.error(f"Failed to list chats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list chats: {str(e)}")


@app.get("/api/chats/{chat_id}", response_model=ChatOut)
async def get_chat_endpoint(chat_id: int, session: Session = Depends(get_session)):
    """Get a specific chat with its messages"""
    try:
        chat = get_chat(session, chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        # Get all messages for this chat
        messages = get_chat_messages(session, chat_id)
        
        # Convert messages to ChatMessageOut format
        message_outs = []
        for msg in messages:
            message_outs.append({
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at
            })
        
        # Return chat data with messages
        return {
            "id": chat.id,
            "name": chat.name,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
            "messages": message_outs
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get chat: {str(e)}")


@app.delete("/api/chats/{chat_id}")
async def delete_chat_endpoint(chat_id: int, session: Session = Depends(get_session)):
    """Delete a chat"""
    try:
        success = delete_chat(session, chat_id)
        if not success:
            raise HTTPException(status_code=404, detail="Chat not found")
        return {"message": "Chat deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete chat: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
