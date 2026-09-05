export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  projectId: number;
  assignedTo: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  projectId: number;
  assignedTo?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  assignedTo?: number | null;
}

export interface TasksResponse {
  success: boolean;
  data: Task[];
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: Task;
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}
