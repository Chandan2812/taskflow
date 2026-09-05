"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./store/useAuth";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectsQuery,
  useUpdateProjectMutation,
} from "./store/projectApi";
import ProjectTasks from "./components/ProjectTasks";

export default function DashboardPage() {
  const router = useRouter();

  const { user, clearAuth, isAuthLoading } = useAuth();

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");

  const { data, isLoading, isError } = useGetProjectsQuery(undefined, {
    skip: isAuthLoading || !user,
  });

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login");
    }
  }, [isAuthLoading, user, router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createProject({
        name: projectName,
        description: projectDescription,
      }).unwrap();

      setProjectName("");
      setProjectDescription("");

      console.log("Project created successfully");
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleEditClick = (
    projectId: number,
    name: string,
    description: string | null,
  ) => {
    setEditingProjectId(projectId);
    setEditProjectName(name);
    setEditProjectDescription(description || "");
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditProjectName("");
    setEditProjectDescription("");
  };

  const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingProjectId === null) {
      return;
    }

    try {
      await updateProject({
        id: editingProjectId,
        data: {
          name: editProjectName,
          description: editProjectDescription,
        },
      }).unwrap();

      console.log("Project updated successfully");

      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(projectId).unwrap();

      console.log("Project deleted successfully");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <p className="mt-2 text-gray-600">Welcome, {user.name}!</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border px-4 py-2"
          >
            Logout
          </button>
        </div>

        {/* Create Project */}
        <div className="mt-8 border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Project</h2>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              required
            />

            <textarea
              placeholder="Project description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full border rounded-lg px-4 py-3"
              rows={4}
            />

            <button
              type="submit"
              disabled={isCreating}
              className="rounded-lg bg-black text-white px-5 py-3 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>

        {/* Projects */}
        {isLoading && <p className="mt-6">Loading projects...</p>}

        {isError && (
          <p className="mt-6 text-red-600">Failed to load projects</p>
        )}

        {data?.data && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">My Projects</h2>

            <div className="space-y-4">
              {data.data.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  {editingProjectId === project.id ? (
                    /* Edit Project */
                    <form onSubmit={handleUpdateProject} className="space-y-4">
                      <input
                        type="text"
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                        className="w-full border rounded-lg px-4 py-3"
                        required
                      />

                      <textarea
                        value={editProjectDescription}
                        onChange={(e) =>
                          setEditProjectDescription(e.target.value)
                        }
                        className="w-full border rounded-lg px-4 py-3"
                        rows={3}
                      />

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </button>

                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-lg border px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Project Card */
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {project.name}
                          </h3>

                          <p className="text-gray-600 mt-1">
                            {project.description || "No description"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleEditClick(
                                project.id,
                                project.name,
                                project.description,
                              )
                            }
                            className="rounded-lg border px-4 py-2"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 text-white px-4 py-2 disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>

                      {/* Tasks */}
                      <ProjectTasks projectId={project.id} />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
