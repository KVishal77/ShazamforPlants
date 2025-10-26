// frontend/src/api/plantAPI.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 20000,
});

// 0) AI suggest (text + maybe image) — return FLAT object only
export async function suggest(q) {
  const res = await API.post("/api/suggest", { plantName: q });
  // backend: { suggestions: {...} }
  return res.data?.suggestions || {};
}

// 1) AI image generate + cache (backend returns { name, imageUrl, source })
export async function searchPlantByName(name) {
  const res = await API.get("/api/plant", { params: { name } });
  return res.data; // { name, imageUrl, source }
}

// 2) List all saved plants
export async function getPlants() {
  const res = await API.get("/api/plants");
  return res.data.plants || [];
}

// 3) Get single plant by id
export async function getPlantById(id) {
  const res = await API.get(`/api/plant/${id}`);
  return res.data;
}

// 4) Create/save a plant
export async function createPlant(payload) {
  const res = await API.post("/api/plants", payload);
  return res.data; // { success: true, id }
}

// 5) Delete plant
export async function deletePlant(id) {
  const res = await API.delete(`/api/plant/${id}`);
  return res.data;
}

// Backward-compat alias
export const savePlant = createPlant;