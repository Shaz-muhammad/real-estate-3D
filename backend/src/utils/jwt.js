import jwt from "jsonwebtoken";

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in backend/.env");

  return jwt.sign(
    { id: user._id.toString(), role: user.role, email: user.email, name: user.name },
    secret,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in backend/.env");
  return jwt.verify(token, secret);
}

