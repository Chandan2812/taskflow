import { api } from "./api";
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectsResponse,
  ProjectResponse,
} from "./project.types";

export const projectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<ProjectsResponse, void>({
      query: () => ({
        url: "/projects",
        method: "GET",
      }),
      providesTags: ["Project"],
    }),

    getProject: builder.query<ProjectResponse, number>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Project", id }],
    }),

    createProject: builder.mutation<ProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Project"],
    }),

    updateProject: builder.mutation<
      ProjectResponse,
      { id: number; data: UpdateProjectRequest }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Project",
        { type: "Project", id },
      ],
    }),

    deleteProject: builder.mutation<
      { success: boolean; message: string },
      number
    >({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
