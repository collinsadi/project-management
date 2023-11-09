const express = require("express")
const router = express()
const authenticateUser = require("../middlewares/authMiddleware")
const { createProject } = require("../controllers/project")

/**
 * Route for creating Project
 */

router.post("/new", authenticateUser, createProject)





module.exports = router