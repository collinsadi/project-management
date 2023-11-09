const express = require("express")
const router = express()
const authenticateUser = require("../middlewares/authMiddleware")
const { createProject,editProject,commentOnProject } = require("../controllers/project")

/**
 * Routes for interacting with Projects
 */

router.post("/new", authenticateUser, createProject)
router.post("/edit", authenticateUser, editProject)
router.post("/comment/new", authenticateUser,commentOnProject)





module.exports = router