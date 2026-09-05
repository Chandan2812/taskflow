const { getUsers } = require("./user.service");

async function getAll(req, res) {
  try {
    const users = await getUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getAll,
};
