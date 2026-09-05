const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("./project.service");

async function create(req, res) {
  try {
    const { name, description } = req.body;

    const project = await createProject({
      name,
      description,
      ownerId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getProjects(req, res) {
  try {
    const projects = await getMyProjects(req.user.userId);

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function getProject(req, res) {
  try {
    const projectId = Number(req.params.id);

    const project = await getProjectById(projectId, req.user.userId);

    res.status(200).json({
      success: true,
      data: project,
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
    const projectId = Number(req.params.id);
    const { name, description } = req.body;

    const project = await updateProject(projectId, req.user.userId, {
      name,
      description,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
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
    const projectId = Number(req.params.id);

    await deleteProject(projectId, req.user.userId);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
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
  getProjects,
  getProject,
  update,
  remove,
};
