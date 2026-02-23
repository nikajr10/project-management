import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import client from '../../api/client';
import type { Task } from '../../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
    columns: { id: number, name: string }[];
    onTaskSaved: () => void;
    taskToEdit?: Task | null;
}

export default function TaskModal({ isOpen, onClose, columns, onTaskSaved, taskToEdit }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('Low');
    const [columnId, setColumnId] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                // Edit Mode: Pre-fill data
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description);
                setPriority(taskToEdit.priority);
                setStartDate(taskToEdit.startDate ? taskToEdit.startDate.split('T')[0] : '');
                setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
                setColumnId(taskToEdit.columnId);
            } else {
                // Create Mode: Reset form
                setTitle(''); 
                setDescription(''); 
                setStartDate(''); 
                setDueDate(''); 
                setPriority('Low');
                setColumnId(columns[0]?.id || 0);
            }
        }
    }, [isOpen, taskToEdit, columns]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title, 
                description, 
                priority, 
                startDate: startDate ? new Date(startDate).toISOString() : null, 
                dueDate: dueDate ? new Date(dueDate).toISOString() : null, 
                columnId
            };

            if (taskToEdit) {
                await client.put(`/tasks/${taskToEdit.id}`, payload);
            } else {
                await client.post('/tasks', payload);
            }

            onTaskSaved();
            onClose();
        } catch (error) {
            console.error(error);
            alert(`Failed to ${taskToEdit ? 'update' : 'create'} task`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">
                        {taskToEdit ? 'Edit Task' : 'Create New Task'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X size={20}/></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                            <input required className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900" value={title} onChange={e=>setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                            <textarea required rows={3} className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none" value={description} onChange={e=>setDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Starting Date</label>
                                <input type="date" className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-800" value={startDate} onChange={e=>setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                                <input type="date" className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-slate-800" value={dueDate} onChange={e=>setDueDate(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                            <select className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white" value={priority} onChange={e=>setPriority(e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                            <select className="w-full border border-slate-300 rounded-md p-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white" value={columnId} onChange={e=>setColumnId(Number(e.target.value))}>
                                {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </form>
                </div>
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">Cancel</button>
                    <button form="task-form" type="submit" disabled={loading} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-md text-sm font-bold shadow-sm transition active:scale-95 disabled:opacity-70">
                        {loading ? 'Saving...' : (taskToEdit ? 'Save Changes' : 'Create Task')}
                    </button>
                </div>
            </div>
        </div>
    );
}