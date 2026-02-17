import { useState } from 'react';
import { 
  Menu, X, Settings, Users, Layout, LogOut, 
  ShieldAlert, Trash2, PieChart, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAdmin, logout, user } = useAuth();

    return (
        <>
            {/* 1. Hamburger Trigger - Modern Floating Design */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="fixed top-6 left-6 z-50 p-3 bg-gray-900/80 backdrop-blur-md text-blue-400 border border-white/10 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <Menu size={24} />
                </button>
            )}

            {/* 2. Sidebar Content - High-End Dark UI */}
            <div className={`fixed top-0 left-0 h-full bg-gray-950 text-gray-300 shadow-2xl z-50 w-72 transform transition-transform duration-500 ease-out border-r border-white/5 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Header with Logo */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-gray-900/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                            <Layout size={22} className="text-white" />
                        </div>
                        <span className="font-bold text-xl text-white tracking-tight">SmartBiz</span>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1.5 mt-4 overflow-y-auto h-[calc(100vh-200px)]">
                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">Main Menu</p>
                    
                    <NavItem icon={<PieChart size={18}/>} label="Dashboard" active />
                    <NavItem icon={<Users size={18}/>} label="Team Members" />
                    <NavItem icon={<Settings size={18}/>} label="Project Settings" />

                    {/* ADMIN ONLY SECTION - Modernized */}
                    {isAdmin && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="px-4 text-[10px] font-bold text-red-500/80 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <ShieldAlert size={12} /> Admin Control
                            </p>
                            <NavItem 
                                icon={<Users size={18}/>} 
                                label="User Management" 
                                variant="danger" 
                            />
                            <NavItem 
                                icon={<Trash2 size={18}/>} 
                                label="System Cleanup" 
                                variant="danger" 
                            />
                        </div>
                    )}
                </nav>

                {/* User Profile & Logout at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-gray-900/30">
                    <div className="flex items-center gap-3 p-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center font-bold text-blue-400">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">{user?.username}</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">{user?.role}</span>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="flex items-center justify-between w-full p-3 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} className="group-hover:text-red-500" />
                            <span className="text-sm font-medium">Logout Session</span>
                        </div>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* Glass Background Overlay */}
            {isOpen && (
                <div 
                    onClick={() => setIsOpen(false)} 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500"
                ></div>
            )}
        </>
    );
}

/* Internal Reusable Sub-Component for UI Consistency */
function NavItem({ icon, label, active = false, variant = 'default' }: { icon: any, label: string, active?: boolean, variant?: 'default' | 'danger' }) {
    const baseStyles = "flex items-center justify-between w-full p-3.5 rounded-xl transition-all duration-200 group cursor-pointer";
    const variants = {
        default: active 
            ? "bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
            : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent",
        danger: "text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
    };

    return (
        <div className={`${baseStyles} ${variants[variant]}`}>
            <div className="flex items-center gap-3">
                <span className={active ? "text-blue-400" : "group-hover:scale-110 transition-transform"}>{icon}</span>
                <span className="text-sm font-medium tracking-wide">{label}</span>
            </div>
            {active && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,1)]"></div>}
        </div>
    );
}