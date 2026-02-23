import { useState } from 'react';
import { Menu, X, Layout, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { isAdmin, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const userInitial = user?.username ? user.username[0].toUpperCase() : 'U';
    
    // Helper to determine active state
    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* The new, professional, borderless menu icon */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="fixed top-8 left-8 z-50 p-1.5 text-slate-800 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all focus:outline-none active:scale-95"
                >
                    <Menu size={28} strokeWidth={2.5} />
                </button>
            )}
            
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center border-b border-slate-800">
                    <span className="font-semibold text-lg text-white tracking-tight">SmartBiz</span>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors focus:outline-none">
                        <X size={20}/>
                    </button>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button 
                        onClick={() => { navigate('/'); setIsOpen(false); }} 
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Layout size={18}/> Projects
                    </button>
                    
                    {isAdmin && (
                        <button 
                            onClick={() => { navigate('/users'); setIsOpen(false); }} 
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive('/users') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Users size={18}/> Users
                        </button>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 bg-slate-800 text-slate-200 rounded-md flex items-center justify-center text-sm font-semibold border border-slate-700">
                            {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.username || 'Loading...'}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.role || 'User'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors text-sm font-medium focus:outline-none"
                    >
                        <LogOut size={18}/> Sign out
                    </button>
                </div>
            </div>
            
            {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"></div>}
        </>
    );
}