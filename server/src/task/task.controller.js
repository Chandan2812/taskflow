const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("./task.service");

const { getIO } = require("../socket");

async function create(req, res) {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
    } = req.body;

    const task = await createTask({
      title,
      description,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId: Number(projectId),
      assignedTo: assignedTo ? Number(assignedTo) : null,
      ownerId: req.user.userId,
    });

    getIO().emit("task:created", {
      task,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAll(req, res) {
  try {
    const projectId = Number(req.query.projectId);

    const tasks = await getTasks(projectId, req.user.userId);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getOne(req, res) {
  try {
    const taskId = Number(req.params.id);

    const task = await getTaskById(taskId, req.user.userId);

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const taskId = Number(req.params.id);

    const { title, description, status, priority, dueDate, assignedTo } =
      req.body;

    const updateData = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate === null ? null : new Date(dueDate);
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo === null ? null : Number(assignedTo);
    }

    const task = await updateTask(taskId, req.user.userId, updateData);

    getIO().emit("task:updated", {
      task,
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const taskId = Number(req.params.id);

    const deletedTask = await deleteTask(taskId, req.user.userId);

    getIO().emit("task:deleted", {
      task: deletedTask,
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
};
