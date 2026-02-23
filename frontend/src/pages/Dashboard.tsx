import { useEffect, useState } from 'react';
import client from '../api/client';
import type { Project } from '../types'; 
import Sidebar from '../components/layout/Sidebar';
import Board from '../components/kanban/Board'; 
import ProjectModal from '../components/kanban/ProjectModal';
import { useAuth } from '../context/AuthContext';
import { Plus } from 'lucide-react';

export default function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [viewId, setViewId] = useState<number | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const { isAdmin } = useAuth();

    useEffect(() => { loadProjects(); }, []);

    const loadProjects = async () => {
        try { 
            const res = await client.get<Project[]>('/projects'); 
            setProjects(res.data); 
        } catch(e) { console.error(e); }
    };

    if (viewId) return <Board projectId={viewId} onBack={() => setViewId(null)} />;

    return (
        <div className="flex min-h-screen bg-slate-50 antialiased text-slate-900">
            <Sidebar />
            <div className="flex-1 p-8 lg:p-12 pl-24 lg:pl-32">
                <header className="flex justify-between items-center mb-8 border-b border-slate-200 pb-5">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Projects</h1>
                    {isAdmin && (
                        <button 
                            onClick={() => setIsProjectModalOpen(true)} 
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                        >
                            <Plus size={16}/> New Project
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {projects.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => setViewId(p.id)} 
                            className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md cursor-pointer transition-all group flex flex-col h-full"
                        >
                            <h3 className="font-semibold text-base text-slate-900 mb-1.5">{p.name}</h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
                                {p.description || 'No description provided.'}
                            </p>
                            <div className="mt-auto text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
                                OPEN BOARD <span className="translate-x-0 group-hover:translate-x-1 transition-transform">&rarr;</span>
                            </div>
                        </div>
                    ))}
                    
                    {projects.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-300 rounded-lg text-slate-500">
                            <div className="text-sm font-medium text-slate-900 mb-1">No projects found</div>
                            <div className="text-sm">
                                {isAdmin ? "Click 'New Project' in the top right to start." : "Ask your administrator to create a project."}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ProjectModal 
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onProjectCreated={loadProjects}
            />
        </div>
    );
}