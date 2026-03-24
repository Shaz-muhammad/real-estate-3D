import React, { useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import {
  createProperty,
  getMyProperties,
  getSellerStatsMe,
  updateProperty,
  deleteProperty,
  patchPropertyStatus,
} from "../services/propertyApi.js";

const allowedImage = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedModelExt = new Set(["glb", "gltf", "usdz"]);

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    loading: true,
    error: "",
    propertyCount: 0,
  });
  const [mine, setMine] = useState({ loading: true, error: "", props: [] });

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    areaSqm: "",
  });
  const [images, setImages] = useState([]);
  const [model3d, setModel3d] = useState(null);
  const [submit, setSubmit] = useState({ loading: false, error: "", ok: "" });

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editImages, setEditImages] = useState([]);
  const [editModel, setEditModel] = useState(null);
  const [editSubmit, setEditSubmit] = useState({ loading: false, error: "" });

  const modelType = useMemo(() => {
    if (!model3d) return "";
    const parts = model3d.name.split(".");
    return (parts[parts.length - 1] || "").toLowerCase();
  }, [model3d]);

  async function refresh() {
    setStats((s) => ({ ...s, loading: true, error: "" }));
    setMine((m) => ({ ...m, loading: true, error: "" }));
    try {
      const s = await getSellerStatsMe();
      setStats({ loading: false, error: "", propertyCount: s.propertyCount });
    } catch (e) {
      setStats({
        loading: false,
        error: e?.response?.data?.message || "Failed to load stats",
        propertyCount: 0,
      });
    }
    try {
      const props = await getMyProperties();
      setMine({ loading: false, error: "", props });
    } catch (e) {
      setMine({
        loading: false,
        error: e?.response?.data?.message || "Failed to load properties",
        props: [],
      });
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(p) {
    setEditing(p);
    setEditForm({
      title: p.title || "",
      description: p.description || "",
      location: p.location || "",
      price: String(p.details?.price ?? ""),
      bedrooms: String(p.details?.bedrooms ?? ""),
      bathrooms: String(p.details?.bathrooms ?? ""),
      areaSqm: String(p.details?.areaSqm ?? ""),
      status: p.status || "available",
    });
    setEditImages([]);
    setEditModel(null);
    setEditSubmit({ loading: false, error: "" });
  }

  function closeEdit() {
    setEditing(null);
    setEditForm({});
    setEditImages([]);
    setEditModel(null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    if (!editForm.title?.trim()) {
      setEditSubmit({ loading: false, error: "Title is required" });
      return;
    }
    for (const f of editImages) {
      if (!allowedImage.has(f.type)) {
        setEditSubmit({ loading: false, error: "Only .jpg/.png/.webp images" });
        return;
      }
    }
    if (editModel) {
      const ext = editModel.name.split(".").pop()?.toLowerCase() || "";
      if (!allowedModelExt.has(ext)) {
        setEditSubmit({
          loading: false,
          error: "Only .glb/.gltf/.usdz for 3D",
        });
        return;
      }
    }

    setEditSubmit({ loading: true, error: "" });
    const fd = new FormData();
    fd.append("title", editForm.title);
    fd.append("description", editForm.description || "");
    fd.append("location", editForm.location || "");
    fd.append("price", editForm.price || "0");
    fd.append("bedrooms", editForm.bedrooms || "0");
    fd.append("bathrooms", editForm.bathrooms || "0");
    fd.append("areaSqm", editForm.areaSqm || "0");
    fd.append("status", editForm.status || "available");
    editImages.forEach((f) => fd.append("images", f));
    if (editModel) fd.append("model3d", editModel);

    try {
      await updateProperty(editing._id, fd);
      closeEdit();
      await refresh();
    } catch (err) {
      setEditSubmit({
        loading: false,
        error: err?.response?.data?.message || "Update failed",
      });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await deleteProperty(id);
      await refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  }

  async function toggleSold(p) {
    const next = p.status === "sold" ? "available" : "sold";
    try {
      await patchPropertyStatus(p._id, next);
      await refresh();
    } catch (err) {
      alert(err?.response?.data?.message || "Could not update status");
    }
  }

  function validateUploads() {
    if (!form.title.trim()) return "Title is required";
    for (const f of images) {
      if (!allowedImage.has(f.type))
        return "Only .jpg/.png/.webp images are allowed";
    }
    if (model3d) {
      const ext = modelType;
      if (!allowedModelExt.has(ext))
        return "Only .glb/.gltf/.usdz model files are allowed";
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmit({ loading: false, error: "", ok: "" });
    const err = validateUploads();
    if (err) return setSubmit({ loading: false, error: err, ok: "" });

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach((f) => fd.append("images", f));
    if (model3d) fd.append("model3d", model3d);

    setSubmit({ loading: true, error: "", ok: "" });
    try {
      await createProperty(fd);
      setSubmit({ loading: false, error: "", ok: "Uploaded successfully" });
      setForm({
        title: "",
        description: "",
        location: "",
        price: "",
        bedrooms: "",
        bathrooms: "",
        areaSqm: "",
      });
      setImages([]);
      setModel3d(null);
      await refresh();
    } catch (e2) {
      setSubmit({
        loading: false,
        error: e2?.response?.data?.message || "Upload failed",
        ok: "",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 shadow-glow2">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Seller Dashboard</h2>
            <p className="mt-1 text-sm muted">
              Upload, edit, mark sold, or delete your listings.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 text-sm dark:border-white/10 dark:bg-white/5">
            {stats.loading ? (
              <Loading label="Loading stats..." />
            ) : stats.error ? (
              <div className="text-red-600 dark:text-red-200">
                {stats.error}
              </div>
            ) : (
              <div>
                <div className="muted">Properties uploaded</div>
                <div className="text-2xl font-semibold text-neon-cyan">
                  {stats.propertyCount}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6 shadow-glow">
          <h3 className="text-lg font-semibold">Upload a property</h3>
          <p className="mt-1 text-sm muted">
            Images (.jpg/.png/.webp) and 3D (.glb/.gltf/.usdz). New listings
            start as <strong>Available</strong>.
          </p>
          {submit.error ? (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200">
              {submit.error}
            </div>
          ) : null}
          {submit.ok ? (
            <div className="mt-4 rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 p-3 text-sm text-neon-cyan">
              {submit.ok}
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <input
              className="input-neo"
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
            <textarea
              className="input-neo min-h-[110px]"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <input
              className="input-neo"
              placeholder="Location (optional)"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="input-neo"
                placeholder="Price (optional)"
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
              <input
                className="input-neo"
                placeholder="Area (m²) (optional)"
                type="number"
                value={form.areaSqm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, areaSqm: e.target.value }))
                }
              />
              <input
                className="input-neo"
                placeholder="Bedrooms (optional)"
                type="number"
                value={form.bedrooms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bedrooms: e.target.value }))
                }
              />
              <input
                className="input-neo"
                placeholder="Bathrooms (optional)"
                type="number"
                value={form.bathrooms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bathrooms: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm muted">Images</div>
              <input
                className="input-neo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []).filter(
                    (file) => file && file.size > 0,
                  );
                  setImages(files);
                }}
              />
              <div className="text-xs muted">
                {images.length ? `${images.length} file(s)` : "Optional"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm muted">3D model (optional)</div>
              <input
                className="input-neo"
                type="file"
                accept=".glb,.gltf,.usdz"
                onChange={(e) => setModel3d((e.target.files || [])[0] || null)}
              />
              <div className="text-xs muted">
                {model3d
                  ? `${model3d.name} (${modelType})`
                  : "GLB/GLTF recommended"}
              </div>
            </div>
            <button
              className="btn-neon w-full justify-center text-black"
              disabled={submit.loading}
            >
              {submit.loading ? "Uploading..." : "Upload property"}
            </button>
          </form>
        </div>

        <div className="glass rounded-3xl p-6 shadow-glow2">
          <h3 className="text-lg font-semibold">3D capture apps</h3>
          <p className="mt-1 text-sm muted">
            Export GLB/GLTF for the best in-browser preview.
          </p>
          <div className="mt-4 grid gap-3">
            <a
              className="glass rounded-2xl p-4 transition hover:shadow-glow"
              href="https://poly.cam/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-semibold">Polycam</div>
              <div className="text-sm muted">LiDAR / photogrammetry → GLB</div>
            </a>
            <a
              className="glass rounded-2xl p-4 transition hover:shadow-glow"
              href="https://www.qlone.pro/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-semibold">Qlone</div>
              <div className="text-sm muted">Guided capture</div>
            </a>
            <a
              className="glass rounded-2xl p-4 transition hover:shadow-glow"
              href="https://kiri3d.com/"
              target="_blank"
              rel="noreferrer"
            >
              <div className="font-semibold">KIRI Engine</div>
              <div className="text-sm muted">Photogrammetry</div>
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your listings</h3>
        {mine.loading ? (
          <Loading label="Loading your properties..." />
        ) : mine.error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-200">
            {mine.error}
          </div>
        ) : mine.props.length === 0 ? (
          <div className="glass rounded-2xl p-5 muted">No properties yet.</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {mine.props.map((p) => (
              <div key={p._id} className="space-y-3">
                <PropertyCard p={p} />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold dark:border-white/15 dark:bg-white/10"
                    onClick={() => openEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200"
                    onClick={() => toggleSold(p)}
                  >
                    {p.status === "sold" ? "Mark available" : "Mark sold"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300"
                    onClick={() => handleDelete(p._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 shadow-glow2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">Edit listing</h3>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-sm muted hover:bg-white/10"
                onClick={closeEdit}
              >
                ✕
              </button>
            </div>
            {editSubmit.error ? (
              <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-700 dark:text-red-200">
                {editSubmit.error}
              </div>
            ) : null}
            <form onSubmit={saveEdit} className="mt-4 space-y-3">
              <input
                className="input-neo"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Title"
                required
              />
              <textarea
                className="input-neo min-h-[80px]"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
              />
              <input
                className="input-neo"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Location"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="input-neo"
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="Price"
                />
                <input
                  className="input-neo"
                  type="number"
                  value={editForm.areaSqm}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, areaSqm: e.target.value }))
                  }
                  placeholder="Area m²"
                />
                <input
                  className="input-neo"
                  type="number"
                  value={editForm.bedrooms}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, bedrooms: e.target.value }))
                  }
                  placeholder="Bedrooms"
                />
                <input
                  className="input-neo"
                  type="number"
                  value={editForm.bathrooms}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, bathrooms: e.target.value }))
                  }
                  placeholder="Bathrooms"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="muted">Status</span>
                <select
                  className="input-neo flex-1"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </label>
              <div>
                <div className="text-sm muted">Add images (appends)</div>
                <input
                  className="input-neo mt-1"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).filter(
                      (file) => file && file.size > 0,
                    );
                    setEditImages(files);
                  }}
                />
              </div>
              <div>
                <div className="text-sm muted">Replace 3D model (optional)</div>
                <input
                  className="input-neo mt-1"
                  type="file"
                  accept=".glb,.gltf,.usdz"
                  onChange={(e) =>
                    setEditModel((e.target.files || [])[0] || null)
                  }
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-slate-300 py-2 dark:border-white/20"
                  onClick={closeEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-neon flex-1 justify-center text-black"
                  disabled={editSubmit.loading}
                >
                  {editSubmit.loading ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
