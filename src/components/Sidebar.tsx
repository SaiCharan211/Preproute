import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Activity, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/create-test", icon: ClipboardList, label: "Test Creation" },
  { to: "/tracking", icon: Activity, label: "Test Tracking" },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({to,icon:Icon,label})=>(
                <NavLink 
                key={to}
                to={to}
                className={({isActive})=>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive? "bg-blue-50 text-blue-600":"text-gray-600 hover:bg-gray-50"
                }`
                }
                >
                    <Icon size={18}/>
                    {label}
                </NavLink>
            ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-200">
            <button 
                onClick={()=>{logout(); navigate('/login')}}
                className='flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full'
                >
                <LogOut size={18}/>
                Logout
            </button>
        </div>
    </aside>
  );
}