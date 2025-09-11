from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from .deps import get_session
from .schemas import SettingIn, SettingOut, PersonaIn, PersonaOut, ChatIn, ChatOut
from .settings_service import get_lm_studio_base_url, set_lm_studio_base_url
from .personas_service import list_personas, create_persona, update_persona, delete_persona
from .lmstudio_client import LMStudioClient
from .models import Persona

router = APIRouter()


@router.get("/healthz")
def healthz():
    return {"status": "ok"}


@router.get("/settings", response_model=SettingOut)
def get_settings(session: Session = Depends(get_session)):
    return {"lm_studio_base_url": get_lm_studio_base_url(session)}


@router.put("/settings", response_model=SettingOut)
def put_settings(payload: SettingIn, session: Session = Depends(get_session)):
    set_lm_studio_base_url(session, str(payload.lm_studio_base_url))
    return {"lm_studio_base_url": str(payload.lm_studio_base_url)}


@router.get("/models")
async def get_models(session: Session = Depends(get_session)):
    client = LMStudioClient(get_lm_studio_base_url(session))
    try:
        return await client.list_models()
    except Exception as e:
        raise HTTPException(502, f"Failed to fetch models from LM Studio: {e}")


@router.post("/models/refresh")
async def refresh_models(session: Session = Depends(get_session)):
    client = LMStudioClient(get_lm_studio_base_url(session))
    try:
        return await client.list_models()
    except Exception as e:
        raise HTTPException(502, f"Failed to refresh models: {e}")


@router.get("/personas", response_model=list[PersonaOut])
def personas_get(session: Session = Depends(get_session)):
    return list_personas(session)


@router.post("/personas", response_model=PersonaOut)
def personas_post(payload: PersonaIn, session: Session = Depends(get_session)):
    return create_persona(session, payload.name, payload.system_prompt)


@router.put("/personas/{pid}", response_model=PersonaOut)
def personas_put(pid: int, payload: PersonaIn, session: Session = Depends(get_session)):
    p = update_persona(session, pid, payload.name, payload.system_prompt)
    if not p:
        raise HTTPException(404, "Persona not found")
    return p


@router.delete("/personas/{pid}")
def personas_delete(pid: int, session: Session = Depends(get_session)):
    ok = delete_persona(session, pid)
    if not ok:
        raise HTTPException(404, "Persona not found")
    return {"ok": True}


@router.post("/chat", response_model=ChatOut)
async def chat(payload: ChatIn, session: Session = Depends(get_session)):
    # assemble messages
    messages = []
    if payload.persona_id:
        persona = session.get(Persona, payload.persona_id)
        if not persona:
            raise HTTPException(400, "Invalid persona_id")
        messages.append({"role": "system", "content": persona.system_prompt})
    messages.append({"role": "user", "content": payload.prompt})

    client = LMStudioClient(get_lm_studio_base_url(session))
    body = {
        "model": payload.model,
        "messages": messages,
        "temperature": payload.temperature,
        "max_tokens": payload.max_tokens
    }
    try:
        data = await client.chat(body)
        # OpenAI-like shape: choices[0].message.content
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return {"content": content, "raw": data}
    except Exception as e:
        raise HTTPException(502, f"LM Studio chat failed: {e}")
