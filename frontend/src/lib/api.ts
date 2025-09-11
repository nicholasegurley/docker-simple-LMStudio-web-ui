import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

export const api = axios.create({ baseURL: API_BASE });

// settings
export async function getSettings() {
  return (await api.get("/settings")).data;
}

export async function putSettings(lm_studio_base_url: string) {
  return (await api.put("/settings", { lm_studio_base_url })).data;
}

// models
export async function fetchModels() {
  return (await api.get("/models")).data;
}

export async function refreshModels() {
  return (await api.post("/models/refresh")).data;
}

// personas
export async function listPersonas() {
  return (await api.get("/personas")).data;
}

export async function createPersona(payload: { name: string; system_prompt: string }) {
  return (await api.post("/personas", payload)).data;
}

export async function updatePersona(id: number, payload: { name: string; system_prompt: string }) {
  return (await api.put(`/personas/${id}`, payload)).data;
}

export async function deletePersona(id: number) {
  return (await api.delete(`/personas/${id}`)).data;
}

// chat
export async function chat(payload: {
  model: string;
  persona_id?: number;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
}) {
  return (await api.post("/chat", payload)).data as { content: string; raw: any };
}


