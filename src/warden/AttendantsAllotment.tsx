import React, { useEffect, useState } from "react";
import { UserPlus, Search, Trash2, X } from "lucide-react";
import { apiFetch } from "../utils/api";

interface Attendant {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostel: string;
  hostel_id: string;
  status: string;
  approved_by: boolean;
  created_at: string;
}

export default function AttendantsAllotment({ assignedHostel }: { assignedHostel: string }) {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    hostel: assignedHostel,
    hostel_id: "H01", // Default mock or extract from user profile
  });

  useEffect(() => {
    fetchAttendants();
  }, [assignedHostel]);

  async function fetchAttendants() {
    try {
      setLoading(true);
      const res = await apiFetch("/api/management/attendants");
      if (res.success) {
        setAttendants(res.attendants || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load attendants");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      setAdding(true);
      await apiFetch("/api/management/attendants", {
        method: "POST",
        body: JSON.stringify({ ...formData, hostel: assignedHostel }),
      });
      setModalOpen(false);
      setFormData({ name: "", email: "", password: "", phone: "", hostel: assignedHostel, hostel_id: "H01" });
      fetchAttendants();
    } catch (err: any) {
      alert(err.message || "Failed to add attendant");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to revoke this attendant's access?")) return;
    try {
      await apiFetch(`/api/management/attendants/${id}`, { method: "DELETE" });
      fetchAttendants();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  }

  async function handleToggleApproval(id: string, currentStatus: boolean) {
    try {
      await apiFetch(`/api/management/attendants/${id}/toggle-approval`, {
        method: "PATCH",
        body: JSON.stringify({ approved_by: !currentStatus })
      });
      fetchAttendants();
    } catch (err: any) {
      alert(err.message || "Failed to update approval status");
    }
  }

  const filtered = attendants.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#6d0f16]">Attendants Allotment</h2>
          <p className="text-sm text-gray-500">Manage attendants for {assignedHostel}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#6d0f16] hover:bg-[#5b0e0e] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
        >
          <UserPlus size={18} />
          Add Attendant
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 space-y-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name or phone..."
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
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Added On</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="py-8 text-center text-red-500 text-sm">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No attendants found.</td></tr>
              ) : (
                filtered.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        a.approved_by ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {a.approved_by ? 'Approved' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggleApproval(a.id, a.approved_by)} 
                        className={`text-sm px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                          a.approved_by 
                            ? "bg-amber-50 text-amber-600 hover:bg-amber-100" 
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {a.approved_by ? "Block" : "Approve"}
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition cursor-pointer">
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#6d0f16] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold">Allot New Attendant</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer"><X size={20}/></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d0f16]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d0f16]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d0f16]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#6d0f16]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assigned Hostel</label>
                <input type="text" disabled value={assignedHostel} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
                <button type="submit" disabled={adding} className="px-4 py-2 rounded-xl bg-[#6d0f16] text-white text-sm font-semibold hover:bg-[#5b0e0e] disabled:opacity-50 cursor-pointer">{adding ? "Adding..." : "Add Attendant"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
