const prisma = require("../prisma");
const { redisClient } = require("../redis");

async function clearProjectCache(ownerId) {
  await redisClient.del(`projects:user:${ownerId}`);
}

async function createProject({ name, description, ownerId }) {
  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId,
    },
  });

  await clearProjectCache(ownerId);

  return project;
}

async function getMyProjects(ownerId) {
  const cacheKey = `projects:user:${ownerId}`;

  const cachedProjects = await redisClient.get(cacheKey);

  if (cachedProjects) {
    return JSON.parse(cachedProjects);
  }

  const projects = await prisma.project.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  await redisClient.set(cacheKey, JSON.stringify(projects), {
    EX: 60,
  });

  return projects;
}

async function getProjectById(projectId, ownerId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}

async function updateProject(projectId, ownerId, data) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const updatedProject = await prisma.project.update({
    where: {
      id: projectId,
    },
    data,
  });

  await clearProjectCache(ownerId);

  return updatedProject;
}

async function deleteProject(projectId, ownerId) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });

  await clearProjectCache(ownerId);

  return project;
}

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
