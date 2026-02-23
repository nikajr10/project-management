export interface User {
    id: number;
    username: string;
    role: 'Admin' | 'User';
    token: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    position: number;
    startDate?: string;
    dueDate?: string;
    columnId: number;
    assignedUserId?: number;
}

export interface Column {
    id: number;
    name: string;
    orderIndex: number;
    tasks: Task[];
}

export interface Project {
    id: number;
    name: string;
    description: string;
    columns: Column[];
}