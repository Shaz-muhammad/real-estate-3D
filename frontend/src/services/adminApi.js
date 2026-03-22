import api from "./api.js";

export async function listUsers() {
  const res = await api.get("/admin/users");
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}

export async function listAllProperties() {
  const res = await api.get("/admin/properties");
  return res.data;
}

export async function adminDeleteProperty(id) {
  const res = await api.delete(`/admin/properties/${id}`);
  return res.data;
}
