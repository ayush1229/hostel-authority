import React from "react";
import { 
  FileText, 
  Clock, 
  AlertTriangle, 
  LogOut,
  ShieldCheck,
  UserPlus,
  Smartphone
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  logout: () => void;
}

export default function ChiefWardenSidebar({ activeTab, setActiveTab, logout }: SidebarProps) {
  const tabs = [
    { id: "outpasses", label: "Outpasses", icon: <FileText size={20} /> },
    { id: "lateLogs", label: "Late Logs", icon: <Clock size={20} /> },
    { id: "complaints", label: "Complaints", icon: <AlertTriangle size={20} /> },
    { id: "escalated", label: "Escalated", icon: <ShieldCheck size={20} /> },
    { id: "allotment", label: "Wardens Allotment", icon: <UserPlus size={20} /> },
    { id: "devices", label: "Guard Devices", icon: <Smartphone size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#5b0e0e] text-white flex flex-col min-h-screen shadow-2xl">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white/20 p-2 rounded-lg">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Chief Warden</h2>
          <p className="text-xs text-gray-300">Hostel Authority</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold cursor-pointer ${
              activeTab === tab.id
                ? "bg-white text-[#5b0e0e] shadow-md"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold text-red-200 hover:bg-red-500/20 hover:text-white cursor-pointer"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
