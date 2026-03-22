import api from "./api.js";

export async function register({ name, email, password, role }) {
  const res = await api.post("/auth/register", { name, email, password, role });
  return res.data;
}

export async function buyerLogin({ email, password }) {
  const res = await api.post("/auth/buyer-login", { email, password });
  return res.data;
}

export async function sellerLogin({ email, password }) {
  const res = await api.post("/auth/seller-login", { email, password });
  return res.data;
}

export async function adminLogin({ email, password }) {
  const res = await api.post("/auth/admin-login", { email, password });
  return res.data;
}


