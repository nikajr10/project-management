import { useState } from 'react';
import { X, Layout } from 'lucide-react';
import client from '../../api/client';

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

export default function ProjectModal({ isOpen, onClose, onProjectCreated }: ProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // We also generate default columns for new projects here automatically
            const res = await client.post('/projects', { name, description });
            
            // Note: If your backend doesn't auto-create columns, you would add an API call here 
            // to create "Todo", "In Progress", "Done" columns for the new project ID.

            onProjectCreated();
            onClose();
            setName('');
            setDescription('');
        } catch (error) {
            console.error("Failed to create project", error);
            alert("Failed to create project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col transform transition-all">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Layout size={18} className="text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Create New Project</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition bg-gray-100 hover:bg-gray-200 p-1.5 rounded-lg"><X size={18}/></button>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Project Name <span className="text-red-500">*</span></label>
                            <input 
                                required 
                                autoFocus
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm" 
                                placeholder="e.g. SmartBiz Mobile App" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                            <textarea 
                                rows={3} 
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm resize-none" 
                                placeholder="What is this project about?" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        form="project-form" 
                        type="submit" 
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </div>
    );
}