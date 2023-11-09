const express = require("express")
const router = express()
const authenticateUser = require("../middlewares/authMiddleware")
const { createProject,editProject,commentOnProject } = require("../controllers/project")

const { createFolder,publicGetFolder } = require("../controllers/folder")

/**
 * Routes for interacting with Projects
 */

router.post("/new", authenticateUser, createProject)
router.post("/edit", authenticateUser, editProject)
router.post("/comment/new", authenticateUser,commentOnProject)


/**\
 * Route to interact with folder
 */

router.post("/folder/new", authenticateUser, createFolder)


/**
 * Public Project Interactions without authentication
 */

router.get("/get/:username/:folder",publicGetFolder)



module.exports = router