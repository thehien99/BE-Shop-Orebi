const jwt = require("jsonwebtoken")
const db = require("../models")

const checkAdmin = async (req, res, next) => {
  const id = req.user
  console.log(id)
  try {
    const response = await db.User.findOne({
      where: { id }
    })
    if (response.role === "Admin") {
      return res.status(200).json({
        msg: 'Bạn có quyền truy cập'
      })
    } else {
      return res?.status(500).json({
        msg: 'Bạn không có quyền truy cập'
      })
    }
  } catch (error) {

  }
}

module.exports = {
  checkAdmin
}