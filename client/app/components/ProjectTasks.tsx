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

    const handleTaskCreated = (payload: { task: any }) => {
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

    const handleTaskUpdated = (payload: { task: any }) => {
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

    const handleTaskDeleted = (payload: { task: any }) => {
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
    <div className="mt-4">
      <h4 className="font-medium">Tasks</h4>

      {/* Create Task */}
      <form onSubmit={handleCreateTask} className="mt-3 space-y-3">
        <input
          type="text"
          placeholder="Task title"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        <textarea
          placeholder="Task description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          rows={2}
        />

        {/* Assign To */}
        <select
          value={assignedTo ?? ""}
          onChange={(e) =>
            setAssignedTo(e.target.value === "" ? null : Number(e.target.value))
          }
          disabled={isUsersLoading}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">
            {isUsersLoading ? "Loading users..." : "Assign To"}
          </option>

          {usersData?.data.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>

        {/* Due Date */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          type="submit"
          disabled={isCreating}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          {isCreating ? "Creating..." : "Add Task"}
        </button>
      </form>

      {/* Search + Filters + Sorting */}
      <div className="mt-5 rounded-lg border bg-white p-3">
        <div className="space-y-3">
          {/* Search */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Search Tasks
            </label>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Status Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Filter by Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Filter by Priority
              </label>

              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as PriorityFilter)
                }
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Filter by Assignee
              </label>

              <select
                value={assigneeFilter ?? ""}
                onChange={(e) =>
                  setAssigneeFilter(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                disabled={isUsersLoading}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">
                  {isUsersLoading ? "Loading users..." : "All Assignees"}
                </option>

                {usersData?.data.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sort Tasks
              </label>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="NEWEST">Newest First</option>

                <option value="OLDEST">Oldest First</option>

                <option value="DUE_DATE">Due Date</option>

                <option value="PRIORITY">Priority</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border px-4 py-2"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      {data?.data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No tasks yet.</p>
      ) : sortedTasks.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No tasks match the current search or filters.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {sortedTasks.map((task) => (
            <div key={task.id} className="rounded-lg bg-gray-50 border p-3">
              {editingTaskId === task.id ? (
                <form onSubmit={handleUpdateTask} className="space-y-3">
                  <input
                    type="text"
                    value={editTaskTitle}
                    onChange={(e) => setEditTaskTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />

                  <textarea
                    value={editTaskDescription}
                    onChange={(e) => setEditTaskDescription(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                  />

                  {/* Edit Assign To */}
                  <select
                    value={editAssignedTo ?? ""}
                    onChange={(e) =>
                      setEditAssignedTo(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    disabled={isUsersLoading}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">
                      {isUsersLoading ? "Loading users..." : "Unassigned"}
                    </option>

                    {usersData?.data.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>

                  {/* Edit Due Date */}
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
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
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="font-medium">{task.title}</h5>

                      <p className="mt-1 text-sm text-gray-600">
                        {task.description || "No description"}
                      </p>

                      {/* Assigned User */}
                      <p className="mt-2 text-sm text-gray-500">
                        Assigned to:{" "}
                        {task.assignedTo
                          ? usersData?.data.find(
                              (user) => user.id === task.assignedTo,
                            )?.name || "Unknown user"
                          : "Unassigned"}
                      </p>

                      {/* Due Date */}
                      <p className="mt-1 text-sm text-gray-500">
                        Due date:{" "}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : "No due date"}
                      </p>

                      {/* Priority */}
                      <select
                        value={task.priority}
                        onChange={(e) =>
                          handlePriorityChange(
                            task.id,
                            e.target.value as "LOW" | "MEDIUM" | "HIGH",
                          )
                        }
                        className="mt-2 border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                      </select>
                    </div>

                    {/* Status */}
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(
                          task.id,
                          e.target.value as "TODO" | "IN_PROGRESS" | "DONE",
                        )
                      }
                      className="border rounded-lg px-2 py-1 text-sm"
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="DONE">DONE</option>
                    </select>
                  </div>

                  <div className="flex gap-2 mt-3">
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
                      className="rounded-lg border px-3 py-1.5 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isDeleting}
                      className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
