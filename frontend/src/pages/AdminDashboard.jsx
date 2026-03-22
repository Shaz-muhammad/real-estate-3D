import React, { useCallback, useEffect, useState } from "react";
import Loading from "../components/Loading.jsx";
import { listUsers, deleteUser, listAllProperties, adminDeleteProperty } from "../services/adminApi.js";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState({ loading: true, error: "", list: [] });
  const [props, setProps] = useState({ loading: true, error: "", list: [] });

  const loadUsers = useCallback(async () => {
    setUsers((u) => ({ ...u, loading: true, error: "" }));
    try {
      const list = await listUsers();
      setUsers({ loading: false, error: "", list });
    } catch (e) {
      setUsers({ loading: false, error: e?.response?.data?.message || "Failed to load users", list: [] });
    }
  }, []);

  const loadProps = useCallback(async () => {
    setProps((p) => ({ ...p, loading: true, error: "" }));
    try {
      const list = await listAllProperties();
      setProps({ loading: false, error: "", list });
    } catch (e) {
      setProps({ loading: false, error: e?.response?.data?.message || "Failed to load properties", list: [] });
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadProps();
  }, [loadUsers, loadProps]);

  async function onDeleteUser(id) {
    if (!window.confirm("Delete this user and their seller listings / buyer likes?")) return;
    try {
      await deleteUser(id);
      await loadUsers();
      await loadProps();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  }

  async function onDeleteProperty(id) {
    if (!window.confirm("Delete this property?")) return;
    try {
      await adminDeleteProperty(id);
      await loadProps();
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6 shadow-glow">
        <h2 className="text-2xl font-semibold">Admin dashboard</h2>
        <p className="mt-1 text-sm muted">Users and all properties across the platform.</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "users"
                ? "bg-neon-cyan/20 text-neon-cyan"
                : "border border-slate-300 dark:border-white/15"
            }`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
          <button
            type="button"
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              tab === "properties"
                ? "bg-neon-magenta/20 text-neon-magenta"
                : "border border-slate-300 dark:border-white/15"
            }`}
            onClick={() => setTab("properties")}
          >
            Properties
          </button>
        </div>
      </div>

      {tab === "users" ? (
        <div className="glass overflow-hidden rounded-3xl shadow-glow">
          {users.loading ? (
            <div className="p-6">
              <Loading label="Loading users..." />
            </div>
          ) : users.error ? (
            <div className="p-6 text-red-700 dark:text-red-200">{users.error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100/80 dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.list.map((u) => (
                    <tr key={u._id} className="border-b border-slate-200/80 dark:border-white/5">
                      <td className="p-3">{u.name}</td>
                      <td className="p-3 muted">{u.email}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-white/10">{u.role}</span>
                      </td>
                      <td className="p-3">
                        {u.role !== "admin" ? (
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:underline dark:text-red-300"
                            onClick={() => onDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="text-xs muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-3xl shadow-glow">
          {props.loading ? (
            <div className="p-6">
              <Loading label="Loading properties..." />
            </div>
          ) : props.error ? (
            <div className="p-6 text-red-700 dark:text-red-200">{props.error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-100/80 dark:border-white/10 dark:bg-white/5">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Seller</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {props.list.map((p) => (
                    <tr key={p._id} className="border-b border-slate-200/80 dark:border-white/5">
                      <td className="p-3 font-medium">{p.title}</td>
                      <td className="p-3 muted">{p.sellerId?.email || "—"}</td>
                      <td className="p-3">{p.status === "sold" ? "Sold" : "Available"}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:underline dark:text-red-300"
                          onClick={() => onDeleteProperty(p._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
