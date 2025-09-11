from sqlmodel import Session, select
from app.models import Persona
from datetime import datetime
from typing import List, Optional


def list_personas(session: Session) -> List[Persona]:
    return session.exec(select(Persona).order_by(Persona.name)).all()


def create_persona(session: Session, name: str, system_prompt: str) -> Persona:
    try:
        p = Persona(name=name, system_prompt=system_prompt)
        session.add(p)
        session.commit()
        session.refresh(p)
        print(f"Successfully created persona: {name}")
        return p
    except Exception as e:
        print(f"Error creating persona: {e}")
        session.rollback()
        raise


def update_persona(session: Session, pid: int, name: str, system_prompt: str) -> Optional[Persona]:
    p = session.get(Persona, pid)
    if not p:
        return None
    p.name = name
    p.system_prompt = system_prompt
    p.updated_at = datetime.utcnow()
    session.add(p)
    session.commit()
    session.refresh(p)
    return p


def get_persona(session: Session, pid: int) -> Optional[Persona]:
    return session.get(Persona, pid)


def delete_persona(session: Session, pid: int) -> bool:
    p = session.get(Persona, pid)
    if not p:
        return False
    session.delete(p)
    session.commit()
    return True

