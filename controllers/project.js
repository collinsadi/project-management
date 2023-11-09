require("dotenv").config()
const shortid = require("shortid")
const Project = require("../models/project.model")
const { userManagementDatabase } = require("../config/foreignDb")
const handleError = require("../utils/errorHandler")

const createProject = async (request, response) => {
    const user = request.user
    const { projectTitle, projectDescription, html, css, javascript,type} = request.body

    try{

        if (!projectTitle) {
        return response.status(400).json(handleError(400, "Project Title Required", "the Client did not send projectTitle in the request Body"))
        }

        if (!projectDescription) {
            return response.status(400).json(handleError(400, "Project Description Required", "the client did not send projectDescription in the request Body"))
        }

        if (!html) {
            return response.status(400).json(handleError(400, "HTML code Required", "the client did not send any html code"))
        }

        if (!type) {
            return response.status(400).json(handleError(400, "Project Type Missing", "the client did not send type in the request body"))
        }

        if (type !== "private" && type !== "public") {
            return response.status(400).json(handleError(400, "Invalid Project Type", "Project type from the client should be either 'public' or 'private' " ))
        }

        const publicId = shortid.generate().toLowerCase()

        await Project.create({ owner_username: user.username, owner_id: user._id, owner_picture: user.profilePicture, public_id: publicId, projectTitle, projectDescription, code:{html, css, javascript,}, private: type === "private", public: type === "public" })
        
        if (type === "public") {
            const projectsCount = parseInt(user.projectsCount += 1)
            await (await userManagementDatabase()).findOneAndUpdate({ _id: user._id }, { $set: { projectsCount: projectsCount } })
        }
        
        response.status(201).json({ status: true, message: "Project Created Successfully", publicId })


    } catch (error) {
        console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
    }
    

}

const editProject = async (request, response) => {
    
    const { html, css, javascript, publicId} = request.body
    
    try {
        
        if (!html) {
            return response.status(400).json(handleError(400, "HTML code Required", "the client did not send any html code"))
        }

        if (!publicId) {
            return response.status(400).json(handleError(400, "Public Id Missing", "the client did not send publicId in the request body"))
        }

        const project = await Project.findOne({ owner_id: request.user._id, public_id: publicId })
        
        if (!project) {
            return response.status(400).json(handleError(400, "Project Not Found", "Project Was not Found, either the public id is incorrect or the logged in user does not own the project"))
        }

        project.code.html = html
        project.code.css = css
        project.code.javascript = javascript

        await project.save()

        response.status(200).json({ status: true, message: "Project Updated Sucessfully" })




    } catch (error) {
        console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
    
    }
}

const commentOnProject = async (request, response) => {
    
    const { projectPublicId, comment } = request.body
    
    try {
    
        if (!projectPublicId) {
            return response.status(400).json(handleError(400, "Project Public Id Not Found", "the client did not sent the projectPublicId in the request body"))
        }

        if (!comment) {
            return response.status(400).json(handleError(400, "Comment Message Required", "the client did not send comment in the request body"))
        }

            const Newcomment = {

            user_id: request.user._id,
            user_picture: request.user.profilePicture,
            user_username: request.user.username,
            comment,
            public_id: shortid.generate().toLowerCase()

            }
        
        const project = await Project.findOne({ public_id: projectPublicId })
        
        project.comments.push(Newcomment)
        project.commentCount += 1

        await project.save()

    response.status(200).json({status:true, message:"Comment Added"})

    } catch (error) {

        console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
    
    }

}



module.exports = { createProject,editProject,commentOnProject }