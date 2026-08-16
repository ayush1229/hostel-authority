import React, { useEffect, useState } from "react";
import { Smartphone, Search, Trash2, X, Plus } from "lucide-react";
import { apiFetch } from "../utils/api";

interface GuardDevice {
  id: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function GuardDevices() {
  const [devices, setDevices] = useState<GuardDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    try {
      setLoading(true);
      const res = await apiFetch("/api/management/devices");
      if (res.success) {
        setDevices(res.devices || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      setAdding(true);
      await apiFetch("/api/management/devices", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setModalOpen(false);
      setPhone("");
      fetchDevices();
    } catch (err: any) {
      alert(err.message || "Failed to add device");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this device?")) return;
    try {
      await apiFetch(`/api/management/devices/${id}`, { method: "DELETE" });
      fetchDevices();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  }

  const filtered = devices.filter(d => 
    d.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#6d0f16]">Guard Devices</h2>
          <p className="text-sm text-gray-500">Manage registered guard devices</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#6d0f16] hover:bg-[#5b0e0e] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
        >
          <Plus size={18} />
          Register Device
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 space-y-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Phone Number</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Registered On</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="py-8 text-center text-red-500 text-sm">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">No devices found.</td></tr>
              ) : (
                filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Smartphone size={16} className="text-gray-400" />
                      {d.phone}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${d.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {d.status || "Offline"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-[#6d0f16] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold">Register Guard Device</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                <input required type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d0f16]" placeholder="e.g. 9876543210" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={adding} className="px-4 py-2 rounded-xl bg-[#6d0f16] text-white text-sm font-semibold hover:bg-[#5b0e0e] disabled:opacity-50">{adding ? "Adding..." : "Add Device"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
