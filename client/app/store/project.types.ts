export interface Project {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export interface ProjectResponse {
  success: boolean;
  message?: string;
  data: Project;
}
