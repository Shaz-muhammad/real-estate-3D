import User from "../models/User.js";
import Property from "../models/Property.js";
import Favorite from "../models/Favorite.js";

export async function listUsers(req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ message: "Cannot delete your own admin account" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete another admin" });

    await Property.deleteMany({ sellerId: id });
    await Favorite.deleteMany({ buyerId: id });
    await User.deleteOne({ _id: id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function listAllProperties(req, res) {
  try {
    const props = await Property.find()
      .sort({ createdAt: -1 })
      .populate("sellerId", "name email role");
    return res.json(props);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function adminDeleteProperty(req, res) {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    await Favorite.deleteMany({ propertyId: req.params.id });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}
