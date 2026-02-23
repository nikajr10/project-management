import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Lock, ArrowLeft } from 'lucide-react';
import client from '../../api/client';
import type { Project, Task } from '../../types';
import Sidebar from '../layout/Sidebar';
import { useAuth } from '../../context/AuthContext';
import TaskModal from './TaskModal';

const PriorityBadge = ({ priority }: { priority: string }) => {
  const styles = { 
      High: "bg-red-50 text-red-700", 
      Medium: "bg-amber-50 text-amber-700", 
      Low: "bg-emerald-50 text-emerald-700" 
  };
  return <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${styles[priority as keyof typeof styles]}`}>{priority}</span>;
};

// GLOW EFFECTS & BORDERS
const getPriorityStyles = (priority: string) => {
    switch (priority) {
        case 'High': return 'border-l-4 border-l-red-500 hover:shadow-[0_4px_20px_-4px_rgba(239,68,68,0.3)] border-y-slate-200 border-r-slate-200';
        case 'Medium': return 'border-l-4 border-l-amber-500 hover:shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)] border-y-slate-200 border-r-slate-200';
        case 'Low': return 'border-l-4 border-l-emerald-500 hover:shadow-[0_4px_20px_-4px_rgba(16,185,129,0.3)] border-y-slate-200 border-r-slate-200';
        default: return 'border border-slate-200 hover:shadow-md';
    }
};

interface BoardProps { projectId: number; onBack: () => void; }

export default function Board({ projectId, onBack }: BoardProps) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const { isAdmin } = useAuth();

    useEffect(() => { loadProject(); }, [projectId]);

    const loadProject = async () => {
        try {
            const res = await client.get<Project>(`/projects/${projectId}`);
            setProject(res.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const handleOpenCreateModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (task: Task) => {
        if (!isAdmin) return;
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const onDragEnd = async (result: DropResult) => {
        if (!isAdmin) return;
        const { source, destination, draggableId } = result;
        if (!destination || !project) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const newColumns = [...project.columns];
        const sourceCol = newColumns.find(c => c.id.toString() === source.droppableId);
        const destCol = newColumns.find(c => c.id.toString() === destination.droppableId);
        if (!sourceCol || !destCol) return;

        const [movedTask] = sourceCol.tasks.splice(source.index, 1);
        movedTask.columnId = destCol.id;
        destCol.tasks.splice(destination.index, 0, movedTask);

        setProject({ ...project, columns: newColumns });

        try {
            await client.post('/tasks/move', { taskId: parseInt(draggableId), targetColumnId: parseInt(destination.droppableId), newPosition: destination.index });
        } catch { loadProject(); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
    if (!project) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Project Not Found</div>;

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden antialiased">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                
                <header className="bg-white border-b border-slate-200 px-8 lg:px-12 py-5 flex justify-between items-center pl-24 lg:pl-32 shadow-sm z-10">
                    <div>
                        <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors uppercase tracking-wider">
                            <ArrowLeft size={14} /> Back to Projects
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
                            {!isAdmin && <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1.5"><Lock size={12}/> Read Only</span>}
                        </div>
                    </div>
                    {isAdmin && (
                        <button onClick={handleOpenCreateModal} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                            <Plus size={18} /> Create Task
                        </button>
                    )}
                </header>

                <main className="flex-1 overflow-x-auto p-8 lg:p-12 pl-24 lg:pl-32 custom-scrollbar">
                    <DragDropContext onDragEnd={onDragEnd}>
                        {/* CENTERED KANBAN BOARD */}
                        <div className="flex h-full gap-8 justify-center min-w-max mx-auto">
                            {project.columns.map(column => (
                                <div key={column.id} className="flex flex-col w-80 h-full">
                                    <div className="font-bold text-slate-800 mb-4 flex justify-between text-sm uppercase tracking-wide px-1">
                                        {column.name} <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-md font-semibold">{column.tasks.length}</span>
                                    </div>
                                    <Droppable droppableId={column.id.toString()}>
                                        {(provided, snapshot) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 rounded-xl p-3 overflow-y-auto custom-scrollbar transition-colors ${snapshot.isDraggingOver && isAdmin ? 'bg-slate-200/50 ring-2 ring-slate-300' : 'bg-slate-100/50'}`}>
                                                {column.tasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index} isDragDisabled={!isAdmin}>
                                                        {(provided, snapshot) => (
                                                            <div 
                                                                ref={provided.innerRef} 
                                                                {...provided.draggableProps} 
                                                                {...provided.dragHandleProps} 
                                                                style={provided.draggableProps.style} 
                                                                onClick={() => handleOpenEditModal(task)}
                                                                className={`bg-white p-4 mb-3 rounded-lg border transition-all duration-200 ${isAdmin ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5' : 'cursor-default'} ${snapshot.isDragging ? 'rotate-3 scale-105 shadow-2xl z-50' : ''} ${getPriorityStyles(task.priority)}`}
                                                            >
                                                                <PriorityBadge priority={task.priority} />
                                                                <h3 className="font-bold mt-3 text-sm text-slate-900 leading-snug">{task.title}</h3>
                                                                <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{task.description}</p>
                                                                {(task.startDate || task.dueDate) && (
                                                                    <div className="mt-3 pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400 flex justify-between uppercase tracking-wider">
                                                                        {task.dueDate && <span>DUE: {new Date(task.dueDate).toLocaleDateString()}</span>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            ))}
                        </div>
                    </DragDropContext>
                </main>
            </div>

            <TaskModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                projectId={project.id} 
                columns={project.columns}
                onTaskSaved={loadProject}
                taskToEdit={editingTask}
            />
        </div>
    );
}