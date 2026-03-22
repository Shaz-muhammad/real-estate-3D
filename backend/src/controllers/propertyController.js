import Property from "../models/Property.js";
import User from "../models/User.js";
import Favorite from "../models/Favorite.js";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPublicUrl(req, filename) {
  if (!filename) return "";
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/uploads/${filename}`;
}

export async function createProperty(req, res) {
  try {
    const { title, description, location, price, bedrooms, bathrooms, areaSqm } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const images = (req.files?.images || []).map((f) => toPublicUrl(req, f.filename));
    const modelFile = (req.files?.model3d || [])[0];

    const model3dUrl = modelFile ? toPublicUrl(req, modelFile.filename) : "";
    const model3dType = modelFile ? (modelFile.originalname.split(".").pop() || "").toLowerCase() : "";

    const prop = await Property.create({
      title,
      description: description || "",
      location: location || "",
      images,
      model3dUrl,
      model3dType,
      details: {
        price: Number(price || 0),
        bedrooms: Number(bedrooms || 0),
        bathrooms: Number(bathrooms || 0),
        areaSqm: Number(areaSqm || 0),
      },
      sellerId: req.user.id,
      status: "available",
    });

    return res.status(201).json(prop);
  } catch (e) {
    const msg = e?.message?.includes("Only") ? e.message : "Server error";
    return res.status(500).json({ message: msg });
  }
}

export async function getAllProperties(req, res) {
  try {
    const { q, location, minPrice, maxPrice, bedrooms, hideSold, status } = req.query;

    const filter = {};
    if (status === "available" || status === "sold") {
      filter.status = status;
    } else if (hideSold === "true" || hideSold === "1") {
      filter.status = { $ne: "sold" };
    }
    if (location) filter.location = new RegExp(String(location), "i");
    if (bedrooms) filter["details.bedrooms"] = { $gte: Number(bedrooms) };

    if (minPrice || maxPrice) {
      filter["details.price"] = {};
      if (minPrice) filter["details.price"].$gte = Number(minPrice);
      if (maxPrice) filter["details.price"].$lte = Number(maxPrice);
    }

    if (q) {
      const term = String(q).trim();
      if (term) {
        const rx = new RegExp(escapeRegex(term), "i");
        filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
      }
    }

    const props = await Property.find(filter)
      .sort({ createdAt: -1 })
      .populate("sellerId", "name email role");

    return res.json(props);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPropertyById(req, res) {
  try {
    const prop = await Property.findById(req.params.id).populate("sellerId", "name email role");
    if (!prop) return res.status(404).json({ message: "Property not found" });
    return res.json(prop);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getSellerStats(req, res) {
  try {
    const sellerId = req.user.id;
    const count = await Property.countDocuments({ sellerId });
    const seller = await User.findById(sellerId).select("name email role");
    return res.json({ seller, propertyCount: count });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getMyProperties(req, res) {
  try {
    const props = await Property.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(props);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

function canManageProperty(prop, user) {
  if (!prop || !user) return false;
  if (user.role === "admin") return true;
  return prop.sellerId.toString() === user.id;
}

export async function updateProperty(req, res) {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    if (!canManageProperty(prop, req.user)) return res.status(403).json({ message: "Forbidden" });

    const { title, description, location, price, bedrooms, bathrooms, areaSqm, status } = req.body;
    if (title != null && String(title).trim() !== "") prop.title = title;
    if (description != null) prop.description = description;
    if (location != null) prop.location = location;
    if (price != null && String(price) !== "") prop.details.price = Number(price);
    if (bedrooms != null && String(bedrooms) !== "") prop.details.bedrooms = Number(bedrooms);
    if (bathrooms != null && String(bathrooms) !== "") prop.details.bathrooms = Number(bathrooms);
    if (areaSqm != null && String(areaSqm) !== "") prop.details.areaSqm = Number(areaSqm);
    if (status && ["available", "sold"].includes(status)) prop.status = status;

    const newImages = (req.files?.images || []).map((f) => toPublicUrl(req, f.filename));
    if (newImages.length) prop.images = [...(prop.images || []), ...newImages];

    const modelFile = (req.files?.model3d || [])[0];
    if (modelFile) {
      prop.model3dUrl = toPublicUrl(req, modelFile.filename);
      prop.model3dType = (modelFile.originalname.split(".").pop() || "").toLowerCase();
    }

    await prop.save();
    const updated = await Property.findById(prop._id).populate("sellerId", "name email role");
    return res.json(updated);
  } catch (e) {
    const msg = e?.message?.includes("Only") ? e.message : "Server error";
    return res.status(500).json({ message: msg });
  }
}

export async function patchPropertyStatus(req, res) {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    if (!canManageProperty(prop, req.user)) return res.status(403).json({ message: "Forbidden" });
    const { status } = req.body;
    if (!["available", "sold"].includes(status)) {
      return res.status(400).json({ message: "status must be available or sold" });
    }
    prop.status = status;
    await prop.save();
    return res.json(prop);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function deleteProperty(req, res) {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Property not found" });
    if (!canManageProperty(prop, req.user)) return res.status(403).json({ message: "Forbidden" });
    await Favorite.deleteMany({ propertyId: prop._id });
    await prop.deleteOne();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function likeProperty(req, res) {
  try {
    if (req.user.role !== "buyer") return res.status(403).json({ message: "Buyers only" });
    const propertyId = req.params.id;
    const exists = await Property.findById(propertyId);
    if (!exists) return res.status(404).json({ message: "Property not found" });
    try {
      await Favorite.create({ buyerId: req.user.id, propertyId });
    } catch (e) {
      if (e.code === 11000) return res.json({ liked: true });
      throw e;
    }
    return res.status(201).json({ liked: true });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function unlikeProperty(req, res) {
  try {
    if (req.user.role !== "buyer") return res.status(403).json({ message: "Buyers only" });
    await Favorite.deleteOne({ buyerId: req.user.id, propertyId: req.params.id });
    return res.json({ liked: false });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getLikedIds(req, res) {
  try {
    if (req.user.role !== "buyer") return res.status(403).json({ message: "Buyers only" });
    const favs = await Favorite.find({ buyerId: req.user.id }).select("propertyId");
    return res.json({ ids: favs.map((f) => f.propertyId.toString()) });
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getLikedProperties(req, res) {
  try {
    if (req.user.role !== "buyer") return res.status(403).json({ message: "Buyers only" });
    const favs = await Favorite.find({ buyerId: req.user.id }).populate({
      path: "propertyId",
      populate: { path: "sellerId", select: "name email role" },
    });
    const props = favs.map((f) => f.propertyId).filter(Boolean);
    return res.json(props);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

