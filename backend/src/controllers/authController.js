import bcrypt from "bcrypt";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password, role are required" });
    }
    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "role must be buyer or seller" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function sellerLogin(req, res) {
  return roleLogin("seller", req, res);
}

export async function buyerLogin(req, res) {
  return roleLogin("buyer", req, res);
}

export async function adminLogin(req, res) {
  return roleLogin("admin", req, res);
}

async function roleLogin(role, req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.role !== role) return res.status(403).json({ message: `Not a ${role} account` });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

