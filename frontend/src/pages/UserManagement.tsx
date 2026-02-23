import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import client from '../api/client';
import type { Project } from '../types';

export default function UserManagement() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // State for project assignments
    const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
    const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch available projects on load
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await client.get<Project[]>('/projects');
                setAvailableProjects(res.data);
            } catch (error) {
                console.error("Failed to load projects", error);
            }
        };
        fetchProjects();
    }, []);

    // Handle Checkbox Toggle
    const toggleProject = (projectId: number) => {
        setSelectedProjectIds(prev => 
            prev.includes(projectId) 
                ? prev.filter(id => id !== projectId) 
                : [...prev, projectId]
        );
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/auth/create-user', { 
                username, 
                password,
                projectIds: selectedProjectIds 
            });
            
            alert('Employee created & projects assigned successfully!');
            setUsername(''); 
            setPassword('');
            setSelectedProjectIds([]); // Reset selections
        } catch { 
            alert('Failed to create user. Make sure the username is unique.'); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-slate-900">
            <Sidebar />
            
            <div className="flex-1 p-8 lg:p-12 pl-24 lg:pl-32 flex flex-col items-center justify-center">
                <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg border border-slate-200">
                    
                    <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
                        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                            <UserPlus className="text-slate-700" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Employee</h1>
                            <p className="text-slate-500 text-sm mt-0.5">Add a new user to your organization</p>
                        </div>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Username</label>
                            <input 
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all" 
                                value={username} 
                                onChange={e=>setUsername(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Default Password</label>
                            <input 
                                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-md text-sm outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all" 
                                value={password} 
                                onChange={e=>setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                       
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Assign Projects</label>
                            <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-md p-2 bg-slate-50 custom-scrollbar shadow-inner">
                                {availableProjects.length === 0 ? (
                                    <p className="text-sm text-slate-500 p-2 italic text-center">No projects available.</p>
                                ) : (
                                    availableProjects.map(p => (
                                        <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-slate-200/50 rounded-md cursor-pointer transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedProjectIds.includes(p.id)}
                                                onChange={() => toggleProject(p.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                            />
                                            <span className="text-sm font-medium text-slate-800 line-clamp-1">{p.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white mt-8 py-3 rounded-md text-sm font-bold hover:bg-slate-800 transition-colors shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}