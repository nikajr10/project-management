export interface User {
    id: number;
    username: string;
    token?: string;
}

export interface User {
    id: number;
    username: string;
    role: 'Admin' | 'User'; // Added Role
    token?: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    position: number;
    columnId: number;
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