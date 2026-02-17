import { useEffect, useState } from 'react';
import client from '../api/client';
import type { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

export default function Dashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const { isAdmin } = useAuth(); // Hook to check role

  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const res = await client.get<Project[]>('/projects');
            setProjects(res.data);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        }
    };

    fetchProjects();
}, []);


    const handleDelete = async (id: number) => {
        if(!confirm("Are you sure?")) return;
        try {
            await client.delete(`/projects/${id}`); // This API endpoint requires Admin Policy
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            alert("Access Denied: Only Admins can delete projects.");
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">
                {isAdmin ? "Admin Dashboard (All Projects)" : "My Projects"}
            </h1>

            <div className="grid grid-cols-3 gap-6">
                {projects.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded shadow border relative">
                        <h3 className="font-bold text-xl">{p.name}</h3>
                        <p className="text-gray-500">{p.description}</p>
                        
                        {/* Only show Delete button if Admin */}
                        {isAdmin && (
                            <button 
                                onClick={() => handleDelete(p.id)}
                                className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-2 rounded"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}