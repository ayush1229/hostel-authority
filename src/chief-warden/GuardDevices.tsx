import React, { useEffect, useState } from "react";
import { Smartphone, Search, Trash2, X, Plus, KeyRound, RotateCcw, ShieldCheck, ShieldAlert, Copy, Check, Laptop, History } from "lucide-react";
import { apiFetch } from "../utils/api";

interface DeviceInfo {
  os?: string;
  browser?: string;
  gpu?: string;
  cores?: number;
  ram?: string;
  screen?: string;
  summary?: string;
}

interface GuardDevice {
  id: string;
  device_name: string;
  phone: string;
  gate: string;
  activation_code: string;
  fingerprint_hash?: string;
  device_info?: DeviceInfo | string;
  status: "ACTIVE" | "PENDING_ACTIVATION" | "REVOKED" | "BLOCKED";
  approved_by_name?: string;
  approved_at?: string;
  last_active_at?: string;
  last_ip?: string;
  created_at: string;
}

interface DeviceLog {
  id: string;
  event_type: string;
  ip_address: string;
  details: string;
  created_at: string;
}

export default function GuardDevices() {
  const [devices, setDevices] = useState<GuardDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Registration Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");
  const [deviceName, setDeviceName] = useState("Main Gate Terminal");
  const [gate, setGate] = useState("Main Gate");
  const [createdCode, setCreatedCode] = useState<{ code: string; phone: string } | null>(null);

  // Logs Modal
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [currentDeviceForLogs, setCurrentDeviceForLogs] = useState<GuardDevice | null>(null);
  const [deviceLogs, setDeviceLogs] = useState<DeviceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

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
      const res = await apiFetch("/api/management/devices", {
        method: "POST",
        body: JSON.stringify({ 
          phone: phone.trim(),
          device_name: deviceName.trim(),
          gate: gate.trim()
        }),
      });
      if (res.success && res.activation_code) {
        setCreatedCode({ code: res.activation_code, phone });
        setPhone("");
        setDeviceName("Main Gate Terminal");
        setGate("Main Gate");
        fetchDevices();
      }
    } catch (err: any) {
      alert(err.message || "Failed to register device");
    } finally {
      setAdding(false);
    }
  }

  async function handleReset(id: string, phone: string) {
    if (!confirm(`Reset device binding for guard (${phone})? This will disconnect the current phone and generate a new Activation Code.`)) {
      return;
    }
    try {
      const res = await apiFetch(`/api/management/devices/${id}/reset`, { method: "POST" });
      if (res.success) {
        alert(`Device binding reset successfully!\n\nNew Activation Code: ${res.activation_code}\n\nProvide this code to the guard.`);
        fetchDevices();
      }
    } catch (err: any) {
      alert(err.message || "Failed to reset device binding");
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "REVOKED" : "ACTIVE";
    if (!confirm(`Change device status to ${nextStatus}?`)) return;

    try {
      await apiFetch(`/api/management/devices/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      fetchDevices();
    } catch (err: any) {
      alert(err.message || "Failed to update device status");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this guard device permanently?")) return;
    try {
      await apiFetch(`/api/management/devices/${id}`, { method: "DELETE" });
      fetchDevices();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  }

  async function handleViewLogs(device: GuardDevice) {
    setCurrentDeviceForLogs(device);
    setLogsModalOpen(true);
    setLogsLoading(true);
    try {
      const res = await apiFetch(`/api/management/devices/${device.id}/logs`);
      setDeviceLogs(res.logs || []);
    } catch (err: any) {
      alert("Failed to load device logs: " + err.message);
    } finally {
      setLogsLoading(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function parseDeviceInfo(info: any): DeviceInfo {
    if (!info) return {};
    if (typeof info === "string") {
      try {
        return JSON.parse(info);
      } catch {
        return {};
      }
    }
    return info;
  }

  const filtered = devices.filter(d => 
    (d.phone || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.device_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.gate || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.activation_code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#6d0f16]">Authorized Guard Terminals</h2>
          <p className="text-sm text-gray-500">Hardware-bound device management &amp; browser fingerprinting</p>
        </div>
        <button
          onClick={() => { setCreatedCode(null); setModalOpen(true); }}
          className="bg-[#6d0f16] hover:bg-[#5b0e0e] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <Plus size={18} />
          Register Guard Terminal
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 p-5 space-y-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by phone, terminal name, gate, or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Terminal &amp; Gate</th>
                <th className="px-4 py-3">Phone &amp; Activation Code</th>
                <th className="px-4 py-3">Hardware Profile</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">Loading guard devices...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-8 text-center text-red-500 text-sm">{error}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No guard devices found.</td></tr>
              ) : (
                filtered.map(d => {
                  const specs = parseDeviceInfo(d.device_info);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition">
                      
                      {/* Terminal & Gate */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          <Laptop size={16} className="text-[#6d0f16] shrink-0" />
                          {d.device_name || "Main Gate Terminal"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 font-medium">
                          Gate: <span className="text-gray-700 font-semibold">{d.gate || "Main Gate"}</span>
                        </div>
                      </td>

                      {/* Phone & Activation Code */}
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          <Smartphone size={14} className="text-gray-400" />
                          {d.phone}
                        </div>
                        {d.activation_code && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="font-mono text-xs bg-red-50 text-[#6d0f16] border border-red-200/80 px-2 py-0.5 rounded-lg font-bold tracking-wider">
                              {d.activation_code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(d.activation_code, d.id)}
                              className="text-gray-400 hover:text-gray-700 transition p-1"
                              title="Copy Activation Code"
                            >
                              {copiedId === d.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Hardware Profile */}
                      <td className="px-4 py-3 max-w-xs">
                        {d.fingerprint_hash ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-gray-800 truncate" title={specs.summary || "Device Bound"}>
                              {specs.summary || `${specs.os || "Device"} (${specs.browser || "Browser"})`}
                            </p>
                            <p className="text-[11px] font-mono text-gray-400 truncate">
                              GPU: {specs.gpu || "Hardware Rendered"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              Hash: {d.fingerprint_hash.substring(0, 10)}...
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 italic bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            Awaiting initial login
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {d.status === "ACTIVE" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <ShieldCheck size={13} /> Active Bound
                          </span>
                        )}
                        {d.status === "PENDING_ACTIVATION" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <KeyRound size={13} /> Pending Code
                          </span>
                        )}
                        {d.status === "REVOKED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            <ShieldAlert size={13} /> Revoked
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {d.last_active_at ? (
                          <div>
                            <p className="font-semibold text-gray-800">{new Date(d.last_active_at).toLocaleDateString()}</p>
                            <p className="text-[10px] text-gray-400">{new Date(d.last_active_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* View Logs */}
                          <button
                            onClick={() => handleViewLogs(d)}
                            className="text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition"
                            title="View Security & Event Logs"
                          >
                            <History size={15} />
                          </button>

                          {/* Reset Hardware Binding */}
                          <button
                            onClick={() => handleReset(d.id, d.phone)}
                            className="text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg transition"
                            title="Reset Hardware Binding (Guard Changed Phone)"
                          >
                            <RotateCcw size={15} />
                          </button>

                          {/* Revoke / Restore Access */}
                          <button
                            onClick={() => handleToggleStatus(d.id, d.status)}
                            className={`p-2 rounded-lg transition ${
                              d.status === "REVOKED" 
                                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100" 
                                : "text-orange-700 bg-orange-50 hover:bg-orange-100"
                            }`}
                            title={d.status === "REVOKED" ? "Restore Access" : "Revoke Access"}
                          >
                            {d.status === "REVOKED" ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                            title="Delete Terminal"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#6d0f16] px-6 py-5 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-base">Register New Guard Terminal</h3>
                <p className="text-xs text-white/80 mt-0.5">Authorizes a guard device slot with pairing code</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white p-1">
                <X size={20}/>
              </button>
            </div>

            {createdCode ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                  <Check size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Terminal Registered!</h4>
                  <p className="text-xs text-gray-500 mt-1">Provide this 6-digit Activation Code to the guard:</p>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-[#6d0f16]/40 p-4 rounded-2xl flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black text-[#6d0f16] tracking-widest">
                    {createdCode.code}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCode.code, 'created')}
                    className="p-2 rounded-xl bg-[#6d0f16] text-white hover:bg-[#5b0e0e] transition"
                    title="Copy Code"
                  >
                    {copiedId === 'created' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <p className="text-[11px] text-gray-500">
                  When the guard opens the Guard Terminal, they enter their phone <span className="font-semibold text-gray-700">({createdCode.phone})</span> and this code to permanently bind their device hardware.
                </p>

                <button
                  type="button"
                  onClick={() => { setCreatedCode(null); setModalOpen(false); }}
                  className="w-full bg-[#6d0f16] text-white font-semibold py-3 rounded-xl hover:bg-[#5b0e0e] transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Guard Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Terminal / Device Label</label>
                  <input
                    type="text"
                    value={deviceName}
                    onChange={e => setDeviceName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
                    placeholder="e.g. Main Gate Tablet 1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Assigned Gate Location</label>
                  <select
                    value={gate}
                    onChange={e => setGate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:bg-white focus:border-[#6d0f16] transition"
                  >
                    <option value="Main Gate">Main Gate</option>
                    <option value="North Gate">North Gate</option>
                    <option value="South Gate">South Gate</option>
                    <option value="Hostel Gate">Hostel Gate</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-5 py-2.5 rounded-xl bg-[#6d0f16] text-white text-sm font-semibold hover:bg-[#5b0e0e] disabled:opacity-50 transition shadow-sm cursor-pointer"
                  >
                    {adding ? "Generating Code..." : "Generate Activation Code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SECURITY LOGS MODAL */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-base">Security &amp; Device Activity Log</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentDeviceForLogs?.device_name} ({currentDeviceForLogs?.phone})
                </p>
              </div>
              <button onClick={() => setLogsModalOpen(false)} className="text-white/80 hover:text-white p-1">
                <X size={20}/>
              </button>
            </div>

            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
              {logsLoading ? (
                <p className="text-center py-6 text-sm text-gray-400">Loading audit trail...</p>
              ) : deviceLogs.length === 0 ? (
                <p className="text-center py-6 text-sm text-gray-400">No events recorded for this device yet.</p>
              ) : (
                deviceLogs.map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold px-2 py-0.5 rounded-md ${
                        log.event_type === "DEVICE_ACTIVATED" ? "bg-emerald-100 text-emerald-800" :
                        log.event_type === "FINGERPRINT_MISMATCH" ? "bg-red-100 text-red-800" :
                        "bg-gray-200 text-gray-800"
                      }`}>
                        {log.event_type}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{log.details || "No additional info"}</p>
                    {log.ip_address && (
                      <p className="text-gray-400 font-mono text-[10px]">IP: {log.ip_address}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setLogsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
