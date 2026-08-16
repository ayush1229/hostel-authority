import { 
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  logout: () => void;
}

export default function AttendantSidebar({ logout }: SidebarProps) {
  const tabs = [
    { to: "/attendant/pending", label: "Pending Outpasses", icon: <Clock size={20} /> },
    { to: "/attendant/approved", label: "Approved Outpasses", icon: <CheckCircle size={20} /> },
    { to: "/attendant/rejected", label: "Rejected Outpasses", icon: <XCircle size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#5b0e0e] text-white flex flex-col min-h-screen shadow-2xl shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white/20 p-2 rounded-lg">
          <UserCheck size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Attendant</h2>
          <p className="text-xs text-gray-300">Exit Management</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold cursor-pointer ${
                isActive
                  ? "bg-white text-[#5b0e0e] shadow-md"
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {tab.icon}
            {tab.label}
          </NavLink>
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
