import api from "./api.js";

export async function getAllProperties(params = {}) {
  const res = await api.get("/properties/get-all", { params });
  return res.data;
}

export async function getPropertyById(id) {
  const res = await api.get(`/properties/${id}`);
  return res.data;
}

export async function createProperty(formData) {
  const res = await api.post("/properties/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateProperty(id, formData) {
  const res = await api.patch(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function patchPropertyStatus(id, status) {
  const res = await api.patch(`/properties/${id}/status`, { status });
  return res.data;
}

export async function deleteProperty(id) {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
}

export async function getSellerStatsMe() {
  const res = await api.get("/properties/seller/stats/me");
  return res.data;
}

export async function getMyProperties() {
  const res = await api.get("/properties/seller/mine");
  return res.data;
}

export async function getLikedIds() {
  const res = await api.get("/properties/buyer/liked-ids");
  return res.data;
}

export async function getLikedProperties() {
  const res = await api.get("/properties/buyer/liked");
  return res.data;
}

export async function likeProperty(id) {
  const res = await api.post(`/properties/${id}/like`);
  return res.data;
}

export async function unlikeProperty(id) {
  const res = await api.delete(`/properties/${id}/like`);
  return res.data;
}
