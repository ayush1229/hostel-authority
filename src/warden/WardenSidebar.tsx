
import { 
  FileText, 
  Clock, 
  AlertTriangle,
  UserPlus,
  LogOut,
  Building,
  Settings
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: "outpasses" | "lateLogs" | "complaints" | "allotment") => void;
  assignedHostel: string;
  logout: () => void;
  onRoomAllocation: () => void;
  onOutpassSettings: () => void;
  onAppointAttendant: () => void;
}

export default function WardenSidebar({ 
  activeTab, 
  setActiveTab, 
  assignedHostel,
  logout,
  onRoomAllocation,
  onOutpassSettings,
  onAppointAttendant
}: SidebarProps) {
  const tabs = [
    { id: "outpasses", label: "Outpasses", icon: <FileText size={20} /> },
    { id: "lateLogs", label: "Late Logs", icon: <Clock size={20} /> },
    { id: "complaints", label: "Complaints", icon: <AlertTriangle size={20} /> },
    { id: "allotment", label: "Attendants Allotment", icon: <UserPlus size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#5b0e0e] text-white flex flex-col min-h-screen shadow-2xl shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white/20 p-2 rounded-lg">
          <Building size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Warden</h2>
          <p className="text-[10px] uppercase tracking-wider text-gray-300 font-semibold truncate max-w-[140px]" title={assignedHostel}>
            {assignedHostel || "No Hostel"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 space-y-1">
          <h3 className="px-2 text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Dashboard
          </h3>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-[#5b0e0e] shadow-md"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-4 space-y-1 border-t border-white/10 mt-2">
          <h3 className="px-2 text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
            Management
          </h3>
          
          <button
            onClick={onRoomAllocation}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Building size={20} />
            Room Allocation
          </button>
          
          <button
            onClick={onAppointAttendant}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <UserPlus size={20} />
            Appoint Attendant
          </button>
          
          <button
            onClick={onOutpassSettings}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <Settings size={20} />
            Settings
          </button>
        </div>
      </div>

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
