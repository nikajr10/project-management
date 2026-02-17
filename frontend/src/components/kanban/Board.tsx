import { useState, useEffect } from 'react';
// @ts-ignore
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import client from '../../api/client';
import type { Project, Task } from '../../types';
import Sidebar from '../layout/Sidebar';

export default function Board() {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            // Fetching Project ID 1 (Hardcoded for demo, normally from URL)
            const res = await client.get<Project>('/projects/1');
            setProject(res.data);
        } catch (error) {
            console.error("Failed to load project", error);
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination || !project) return;

        const { source, destination, draggableId } = result;

        // 1. Optimistic UI Update (Update state immediately)
        const newColumns = [...project.columns];
        const sourceColIndex = newColumns.findIndex(c => c.id.toString() === source.droppableId);
        const destColIndex = newColumns.findIndex(c => c.id.toString() === destination.droppableId);
        
        const sourceCol = newColumns[sourceColIndex];
        const destCol = newColumns[destColIndex];

        const [movedTask] = sourceCol.tasks.splice(source.index, 1);
        movedTask.columnId = destCol.id;
        destCol.tasks.splice(destination.index, 0, movedTask);

        setProject({ ...project, columns: newColumns });

        // 2. Send to Backend
        try {
            await client.post('/tasks/move', {
                taskId: parseInt(draggableId),
                targetColumnId: parseInt(destination.droppableId),
                newPosition: destination.index
            });
        } catch (error) {
            console.error("Failed to save move", error);
            fetchProject(); // Revert on error
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Board...</div>;
    if (!project) return <div className="p-10 text-center">No Project Found. Please Create One in DB.</div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Sidebar />
            
            <header className="bg-white shadow p-4 pl-20">
                <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
                <p className="text-gray-500 text-sm">{project.description}</p>
            </header>

            <main className="flex-1 overflow-x-auto p-6 pl-20">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-6 h-full items-start">
                        {project.columns.map(column => (
                            <Droppable key={column.id} droppableId={column.id.toString()}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`w-80 flex-shrink-0 rounded-lg p-4 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-200'}`}
                                    >
                                        <h3 className="font-bold text-gray-700 mb-4 flex justify-between">
                                            {column.name}
                                            <span className="bg-gray-300 text-xs px-2 py-1 rounded-full text-gray-700">{column.tasks.length}</span>
                                        </h3>
                                        
                                        <div className="flex flex-col gap-3 min-h-[100px]">
                                            {column.tasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition ${snapshot.isDragging ? 'rotate-2 scale-105' : ''}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                                <span className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            </main>
        </div>
    );
}