"use client";

import { useEffect, useState } from "react";
import {
  taskApi,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../store/taskApi";
import { useGetUsersQuery } from "../store/userApi";
import { useAppDispatch } from "../store/hooks";
import socket from "../lib/socket";
import {
  CalendarDays,
  Check,
  CircleDot,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import type { Task } from "../store/task.types";

interface ProjectTasksProps {
  projectId: number;
}

type StatusFilter = "ALL" | "TODO" | "IN_PROGRESS" | "DONE";

type PriorityFilter = "ALL" | "LOW" | "MEDIUM" | "HIGH";

type SortOption = "NEWEST" | "OLDEST" | "DUE_DATE" | "PRIORITY";

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const dispatch = useAppDispatch();

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState<number | null>(null);
  const [editDueDate, setEditDueDate] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("ALL");

  const [assigneeFilter, setAssigneeFilter] = useState<number | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Sorting
  const [sortOption, setSortOption] = useState<SortOption>("NEWEST");

  const { data, isLoading, isError } = useGetTasksQuery(projectId);

  const { data: usersData, isLoading: isUsersLoading } = useGetUsersQuery();

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  // Socket.IO realtime events
  useEffect(() => {
    socket.connect();

    const handleTaskCreated = (payload: { task: Task }) => {
      if (payload.task.projectId !== projectId) {
        return;
      }

      dispatch(
        taskApi.util.updateQueryData("getTasks", projectId, (draft) => {
          const alreadyExists = draft.data.some(
            (task) => task.id === payload.task.id,
          );

          if (!alreadyExists) {
            draft.data.unshift(payload.task);
          }
        }),
      );
    };

    const handleTaskUpdated = (payload: { task: Task }) => {
      if (payload.task.projectId !== projectId) {
        return;
      }

      dispatch(
        taskApi.util.updateQueryData("getTasks", projectId, (draft) => {
          const index = draft.data.findIndex(
            (task) => task.id === payload.task.id,
          );

          if (index !== -1) {
            draft.data[index] = payload.task;
          }
        }),
      );
    };

    const handleTaskDeleted = (payload: { task: Task }) => {
      if (payload.task.projectId !== projectId) {
        return;
      }

      dispatch(
        taskApi.util.updateQueryData("getTasks", projectId, (draft) => {
          draft.data = draft.data.filter((task) => task.id !== payload.task.id);
        }),
      );
    };

    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);

    return () => {
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);

      socket.disconnect();
    };
  }, [dispatch, projectId]);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createTask({
        title: taskTitle,
        description: taskDescription,
        projectId,
        assignedTo: assignedTo ?? undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      }).unwrap();

      setTaskTitle("");
      setTaskDescription("");
      setAssignedTo(null);
      setDueDate("");

      console.log("Task created successfully");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleEditClick = (
    taskId: number,
    title: string,
    description: string | null,
    assignedTo: number | null,
    dueDate: string | null,
  ) => {
    setEditingTaskId(taskId);
    setEditTaskTitle(title);
    setEditTaskDescription(description || "");
    setEditAssignedTo(assignedTo);

    if (dueDate) {
      const date = new Date(dueDate);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      setEditDueDate(`${year}-${month}-${day}`);
    } else {
      setEditDueDate("");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskTitle("");
    setEditTaskDescription("");
    setEditAssignedTo(null);
    setEditDueDate("");
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingTaskId === null) {
      return;
    }

    try {
      await updateTask({
        id: editingTaskId,
        projectId,
        data: {
          title: editTaskTitle,
          description: editTaskDescription,
          assignedTo: editAssignedTo,
          dueDate: editDueDate
            ? new Date(editDueDate).toISOString()
            : undefined,
        },
      }).unwrap();

      console.log("Task updated successfully");

      handleCancelEdit();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleStatusChange = async (
    taskId: number,
    status: "TODO" | "IN_PROGRESS" | "DONE",
  ) => {
    try {
      await updateTask({
        id: taskId,
        projectId,
        data: {
          status,
        },
      }).unwrap();

      console.log("Task status updated successfully");
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const handlePriorityChange = async (
    taskId: number,
    priority: "LOW" | "MEDIUM" | "HIGH",
  ) => {
    try {
      await updateTask({
        id: taskId,
        projectId,
        data: {
          priority,
        },
      }).unwrap();

      console.log("Task priority updated successfully");
    } catch (error) {
      console.error("Failed to update task priority:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask({
        id: taskId,
        projectId,
      }).unwrap();

      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  /*
   * Apply Search + Status + Priority + Assignee filters
   */
  const filteredTasks =
    data?.data.filter((task) => {
      const search = searchQuery.trim().toLowerCase();

      const matchesSearch =
        search === "" ||
        task.title.toLowerCase().includes(search) ||
        (task.description || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || task.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === null || task.assignedTo === assigneeFilter;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      );
    }) ?? [];

  /*
   * Sort filtered tasks
   */
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOption === "NEWEST") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    if (sortOption === "OLDEST") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    if (sortOption === "DUE_DATE") {
      // Tasks without due dates go to the end.
      if (!a.dueDate && !b.dueDate) {
        return 0;
      }

      if (!a.dueDate) {
        return 1;
      }

      if (!b.dueDate) {
        return -1;
      }

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    if (sortOption === "PRIORITY") {
      const priorityOrder = {
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };

      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    return 0;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setAssigneeFilter(null);
    setSortOption("NEWEST");
  };

  if (isLoading) {
    return <p className="mt-3 text-sm text-gray-500">Loading tasks...</p>;
  }

  if (isError) {
    return <p className="mt-3 text-sm text-red-600">Failed to load tasks</p>;
  }

  return (
    <div className="task-workspace">
      <div className="task-toolbar">
        <div className="task-count">
          <span className="count-pill">{data?.data.length ?? 0}</span> Tasks{" "}
          <span className="task-summary">
            {sortedTasks.length !== (data?.data.length ?? 0)
              ? `${sortedTasks.length} visible`
              : "All on track"}
          </span>
        </div>
        <ListFilter size={16} color="#a0a6b5" />
      </div>
      <form onSubmit={handleCreateTask} className="task-create">
        <input
          type="text"
          placeholder="Add a task..."
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="field-control"
          required
        />
        <select
          value={assignedTo ?? ""}
          onChange={(e) =>
            setAssignedTo(e.target.value === "" ? null : Number(e.target.value))
          }
          disabled={isUsersLoading}
          className="field-control"
        >
          <option value="">Assign to...</option>
          {usersData?.data.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="field-control"
          aria-label="Due date"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="add-task-button"
          title="Add task"
          aria-label="Add task"
        >
          {isCreating ? <CircleDot size={17} /> : <Plus size={18} />}
        </button>
      </form>
      <div className="filter-row">
        <div className="search-wrap">
          <Search size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks"
            className="field-control"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="field-control"
        >
          <option value="ALL">All status</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className="field-control"
        >
          <option value="ALL">All priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <select
          value={assigneeFilter ?? ""}
          onChange={(e) =>
            setAssigneeFilter(
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
          disabled={isUsersLoading}
          className="field-control"
        >
          <option value="">All people</option>
          {usersData?.data.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="field-control"
        >
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
          <option value="DUE_DATE">Due date</option>
          <option value="PRIORITY">Priority</option>
        </select>
      </div>
      {(searchQuery ||
        statusFilter !== "ALL" ||
        priorityFilter !== "ALL" ||
        assigneeFilter !== null ||
        sortOption !== "NEWEST") && (
        <button
          type="button"
          onClick={clearFilters}
          className="secondary-button"
          style={{ marginBottom: 12 }}
        >
          <X size={13} /> Clear filters
        </button>
      )}
      {data?.data.length === 0 ? (
        <div className="empty-state">
          <Check size={23} />
          <p>No tasks yet. Add the first step above.</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="empty-state">
          <Search size={23} />
          <p>No tasks match these filters.</p>
        </div>
      ) : (
        <div className="task-list">
          {sortedTasks.map((task) => {
            const assignee = task.assignedTo
              ? usersData?.data.find((user) => user.id === task.assignedTo)
                  ?.name || "Unknown user"
              : "Unassigned";
            return (
              <div key={task.id} className="task-item">
                {editingTaskId === task.id ? (
                  <form onSubmit={handleUpdateTask} className="task-edit">
                    <input
                      type="text"
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      className="field-control"
                      required
                    />
                    <textarea
                      value={editTaskDescription}
                      onChange={(e) => setEditTaskDescription(e.target.value)}
                      className="field-control"
                      rows={2}
                    />
                    <div className="task-create" style={{ marginBottom: 0 }}>
                      <select
                        value={editAssignedTo ?? ""}
                        onChange={(e) =>
                          setEditAssignedTo(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                        className="field-control"
                      >
                        <option value="">Unassigned</option>
                        {usersData?.data.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={editDueDate}
                        onChange={(e) => setEditDueDate(e.target.value)}
                        className="field-control"
                      />
                    </div>
                    <div className="task-edit-actions">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="primary-button"
                        style={{ width: "auto" }}
                      >
                        {isUpdating ? "Saving..." : "Save task"}
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
                    <div className="task-title-row">
                      <div className="task-content">
                        <h5 className="task-title">{task.title}</h5>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                        <div className="task-meta">
                          <span className="meta-chip">
                            <UserRound size={12} /> {assignee}
                          </span>
                          <span className="meta-chip">
                            <CalendarDays size={12} />{" "}
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No due date"}
                          </span>
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              handlePriorityChange(
                                task.id,
                                e.target.value as "LOW" | "MEDIUM" | "HIGH",
                              )
                            }
                            className="priority-select"
                          >
                            <option value="LOW">Low priority</option>
                            <option value="MEDIUM">Medium priority</option>
                            <option value="HIGH">High priority</option>
                          </select>
                        </div>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(
                            task.id,
                            e.target.value as "TODO" | "IN_PROGRESS" | "DONE",
                          )
                        }
                        className={`status-select ${task.status === "TODO" ? "todo" : task.status === "DONE" ? "done" : ""}`}
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() =>
                          handleEditClick(
                            task.id,
                            task.title,
                            task.description,
                            task.assignedTo,
                            task.dueDate,
                          )
                        }
                        className="icon-button"
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={isDeleting}
                        className="icon-button danger"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
