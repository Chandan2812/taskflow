import { api } from "./api";
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  TasksResponse,
  TaskResponse,
  DeleteTaskResponse,
} from "./task.types";

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TasksResponse, number>({
      query: (projectId) => ({
        url: `/tasks?projectId=${projectId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, projectId) => [
        { type: "Task", id: `PROJECT-${projectId}` },
      ],
    }),

    getTask: builder.query<TaskResponse, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),

    createTask: builder.mutation<TaskResponse, CreateTaskRequest>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { projectId }) => [
        { type: "Task", id: `PROJECT-${projectId}` },
      ],
    }),

    updateTask: builder.mutation<
      TaskResponse,
      { id: number; projectId: number; data: UpdateTaskRequest }
    >({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        { type: "Task", id },
        { type: "Task", id: `PROJECT-${projectId}` },
      ],
    }),

    deleteTask: builder.mutation<
      DeleteTaskResponse,
      { id: number; projectId: number }
    >({
      query: ({ id }) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { id, projectId }) => [
        { type: "Task", id },
        { type: "Task", id: `PROJECT-${projectId}` },
      ],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
