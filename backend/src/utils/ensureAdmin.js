import bcrypt from "bcrypt";
import User from "../models/User.js";

/**
 * If ADMIN_EMAIL + ADMIN_PASSWORD are set, ensure an admin user exists (dev / first deploy).
 */
export async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      existing.password = await bcrypt.hash(password, 10);
      await existing.save();
      console.log("[admin] Promoted existing user to admin:", email);
    }
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name: "Admin", email, password: hashed, role: "admin" });
  console.log("[admin] Created admin user:", email);
}
