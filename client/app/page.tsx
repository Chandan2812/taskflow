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
import {
  FolderKanban,
  Layers3,
  LogOut,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";

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
      <main className="app-shell">
        <div className="dashboard-wrap">
          <p className="loading-line">Preparing your workspace...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const projects = data?.data ?? [];

  return (
    <main className="app-shell">
      <div className="dashboard-wrap">
        <header className="topbar">
          <div className="brand-lockup">
            <Layers3 className="brand-mark" size={22} />
            <span className="brand-name">TaskFlow</span>
          </div>
          <div className="user-chip">
            <span>{user.name}</span>
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
            <button
              className="icon-button"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="hero-row">
          <div>
            <p className="eyebrow">Your command center</p>
            <h1 className="hero-title">Make space for meaningful work.</h1>
            <p className="hero-copy">
              Welcome back, {user.name.split(" ")[0]}. Keep projects clear,
              tasks moving, and the next right thing close at hand.
            </p>
          </div>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">
                <FolderKanban size={13} /> Projects
              </span>
              <strong className="stat-number">{projects.length}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <Sparkles size={13} /> Focus
              </span>
              <strong className="stat-number">Today</strong>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section>
            <div className="section-header">
              <div>
                <h2 className="section-title">Your projects</h2>
                <p className="section-note">
                  Everything important, in one calm view.
                </p>
              </div>
            </div>
            {isLoading && (
              <p className="loading-line">Loading your projects...</p>
            )}
            {isError && (
              <p className="error-line">
                Couldn&apos;t load projects. Please try again.
              </p>
            )}
            {!isLoading && !isError && projects.length === 0 && (
              <div className="empty-state">
                <FolderKanban size={26} />
                <p>Your first project is waiting to be shaped.</p>
              </div>
            )}
            <div className="project-list">
              {projects.map((project) => (
                <article key={project.id} className="project-card">
                  {editingProjectId === project.id ? (
                    <form
                      onSubmit={handleUpdateProject}
                      className="project-top field-stack"
                    >
                      <input
                        type="text"
                        value={editProjectName}
                        onChange={(e) => setEditProjectName(e.target.value)}
                        className="field-control"
                        required
                      />
                      <textarea
                        value={editProjectDescription}
                        onChange={(e) =>
                          setEditProjectDescription(e.target.value)
                        }
                        className="field-control"
                        rows={3}
                      />
                      <div className="task-edit-actions">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="primary-button"
                          style={{ width: "auto" }}
                        >
                          {isUpdating ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="secondary-button"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="project-top">
                        <div className="project-heading">
                          <div className="project-icon">
                            <FolderKanban size={18} />
                          </div>
                          <div>
                            <h3 className="project-name">{project.name}</h3>
                            <p className="project-description">
                              {project.description ||
                                "A fresh space for your next idea."}
                            </p>
                          </div>
                        </div>
                        <div className="project-actions">
                          <button
                            onClick={() =>
                              handleEditClick(
                                project.id,
                                project.name,
                                project.description,
                              )
                            }
                            className="icon-button"
                            title="Edit project"
                            aria-label="Edit project"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            disabled={isDeleting}
                            className="icon-button danger"
                            title="Delete project"
                            aria-label="Delete project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      <ProjectTasks projectId={project.id} />
                    </>
                  )}
                </article>
              ))}
            </div>
          </section>
          <aside className="side-panel">
            <div className="form-heading">
              <Plus size={19} />
              <h2>Start a project</h2>
            </div>
            <form onSubmit={handleCreateProject} className="field-stack">
              <label className="field-label">
                Project name
                <input
                  type="text"
                  placeholder="e.g. Website refresh"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="field-control"
                  required
                />
              </label>
              <label className="field-label">
                Description
                <textarea
                  placeholder="What are you trying to make happen?"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="field-control"
                  rows={4}
                />
              </label>
              <button
                type="submit"
                disabled={isCreating}
                className="primary-button"
              >
                {isCreating ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus size={16} /> Create project
                  </>
                )}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
