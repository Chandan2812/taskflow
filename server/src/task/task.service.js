const prisma = require("../prisma");

async function createTask({
  title,
  description,
  status,
  priority,
  dueDate,
  projectId,
  assignedTo,
  ownerId,
}) {
  // Check project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Check assigned user
  if (assignedTo) {
    const user = await prisma.user.findUnique({
      where: {
        id: assignedTo,
      },
    });

    if (!user) {
      throw new Error("Assigned user not found");
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedTo,
    },
  });

  return task;
}

async function getTasks(projectId, ownerId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return prisma.task.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getTaskById(taskId, ownerId) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        ownerId,
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
}

async function updateTask(taskId, ownerId, data) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        ownerId,
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (data.assignedTo) {
    const user = await prisma.user.findUnique({
      where: {
        id: data.assignedTo,
      },
    });

    if (!user) {
      throw new Error("Assigned user not found");
    }
  }

  return prisma.task.update({
    where: {
      id: taskId,
    },
    data,
  });
}

async function deleteTask(taskId, ownerId) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        ownerId,
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

  return task;
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
