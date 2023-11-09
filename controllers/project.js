require("dotenv").config()
const shortid = require("shortid")
const Project = require("../models/project.model")
const { userManagementDatabase } = require("../config/foreignDb")
const handleError = require("../utils/errorHandler")
const Folder = require("../models/folder.model")

const createProject = async (request, response) => {
    const user = request.user
    const { projectTitle, projectDescription, html, css, javascript,type,projectSnapShot,folderId} = request.body

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
        if (html.includes("<script") || html.includes("<Script")) {
            return response.status(400).json(handleError(400, "Bad Request", "the Html Code Received from the client Contains a Script Tag"))
        }

        if (javascript && javascript.includes("document.cookie")) {
            return response.status(400).json(handleError(400, "Bad Request", "the javascript code sent by the client is trying to access users cookies"))
        }

        if (!type) {
            return response.status(400).json(handleError(400, "Project Type Missing", "the client did not send type in the request body"))
        }

        if (type !== "private" && type !== "public") {
            return response.status(400).json(handleError(400, "Invalid Project Type", "Project type from the client should be either 'public' or 'private' " ))
        }

        const publicId = shortid.generate().toLowerCase()

       const newProject = await Project.create({ owner_username: user.username, owner_id: user._id, owner_picture: user.profilePicture, public_id: publicId, projectTitle,projectSnapShot, projectDescription, code:{html, css, javascript,}, private: type === "private", public: type === "public", folder:folderId})
        
        if (type === "public") {
            const projectsCount = parseInt(user.projectsCount += 1)
            await (await userManagementDatabase()).findOneAndUpdate({ _id: user._id }, { $set: { projectsCount: projectsCount } })
        } else {
            
            await (await userManagementDatabase())
                .findOneAndUpdate({ _id: request.user._id },
                    { $set: {privateProjectsCount: parseInt(request.user.privateProjectsCount += 1) } })
        }

        if (folderId) {
            
            const folder = await Folder.findById(folderId)

            if (folder && folder.owner !== user._id.toString()) {
                return response.status(400).json(handleError(400, "Folder Not Found", "The User Does not Own the Folder"))
            }
             
            if (folder) {
                folder.projects.push(newProject._id)
                await folder.save()
            }
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
    
    const { html, css, javascript, publicId, projectSnapShot} = request.body
    
    try {
        
        if (!html) {
            return response.status(400).json(handleError(400, "HTML code Required", "the client did not send any html code"))
        }

        if (!publicId) {
            return response.status(400).json(handleError(400, "Public Id Missing", "the client did not send publicId in the request body"))
        }

        const project = await Project.findOne({ owner_id: request.user._id, public_id: publicId.toLowerCase(), deleted: false})
        
        if (!project) {
            return response.status(400).json(handleError(400, "Project Not Found", "Project Was not Found, either the public id is incorrect or the logged in user does not own the project"))
        }


        project.code.html = html
        project.code.css = css
        project.code.javascript = javascript
        project.projectSnapShot = projectSnapShot

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
    
    let { projectPublicId, comment } = request.body

    projectPublicId = projectPublicId.toLowerCase()
    
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
            public_id: shortid.generate().toLowerCase(),
            date: new Date()

            }
        
        const project = await Project.findOne({ public_id: projectPublicId, deleted: false, private: false })

        if (!project) {
            return response.status(400).json(handleError(400, "Project Not Found", "Project Was not Found, the public id is incorrect or project is private or deleted"))
        }

        
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


const changeProjectType = async (request, response) => {
    
    const type = request.body.type
    const projectPublicId = request.query.project

    try{

        if (!projectPublicId) {
            return response.status(400).json(handleError(400, "Project Public Id Missing", "the client did not send project in the request query, which was meant to hold the project public id"))
        }

         if (!type) {
            return response.status(400).json(handleError(400, "Project Type Missing", "the client did not send type in the request body"))
        }

        if (type !== "private" && type !== "public") {
            return response.status(400).json(handleError(400, "Invalid Project Type", "Project type from the client should be either 'public' or 'private' " ))
        }

        const project = await Project.findOne({ owner_id: request.user._id, public_id: projectPublicId, deleted: false})

        if (!project) {
            return response.status(404).json(handleError(404, "Project Not Found", "The Requested Project to Fork was not Found"))
        }  
        
        if (type === "private" && project.private === false) {

            const projectsCount = parseInt(request.user.projectsCount -= 1)
            
            project.private = true
            project.public = false
            await project.save()

            
            await (await userManagementDatabase())
                .findOneAndUpdate({ _id: request.user._id },
                    { $set: { projectsCount: projectsCount, privateProjectsCount: parseInt(request.user.privateProjectsCount += 1) } })


            return response.status(200).json({ status: true, message: "Project Type Updated" })
        }

        if (type === "public" && project.public === false) {
            
            const projectsCount = parseInt(request.user.projectsCount += 1)
            
            project.public = true
            project.private = false
            await project.save()

            
            await (await userManagementDatabase())
                .findOneAndUpdate({ _id: request.user._id },
                    { $set: { projectsCount: projectsCount, privateProjectsCount: parseInt(request.user.privateProjectsCount -= 1) } })


            return response.status(200).json({ status: true, message: "Project Type Updated" })

        }

        response.status(400).json(handleError(400, "an Error Occured", "Seems like you are trying to convert a public project to public again or a private project to private again"))

    } catch (error) {

        console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
    
    }


}

const forkProject = async (request, response) => {
    
    const user = request.user
    const projectPublicId = request.query.project

    try{

        if (!projectPublicId) {
        return response.status(400).json(handleError(400, "Public Id Missing", "the 'project' query which was meant to hold Project Public Id was not sent in the request query"))
        }

        const project = await Project.findOne({ public_id: projectPublicId, deleted: false, private: false })
        
        if (!project) {
            return response.status(404).json(handleError(404, "Project Not Found", "The Requested Project to Fork was not Found"))
        }

        if (project.owner_id === user._id.toString()) {
            return response.status(400).json(handleError(400, "Cant Fork Your Own Project", "the project is created by the logged in user"))
        }
        
        const newPublicId = shortid.generate().toLowerCase()

        const newClone = await Project.create({
            owner_username: user.username, owner_id: user._id, public_id: newPublicId,
            owner_picture: user.profilePicture, projectTitle: project.projectTitle, code: project.code,
            projectDescription: project.projectDescription,
            projectSnapShot: project.projectSnapShot,
            forked: true, originalOwner: project.owner_username, public:true
        })
        
        project.forks.push(newClone._id)

        await project.save()
  
        const projectsCount = parseInt(user.projectsCount += 1)

        await (await userManagementDatabase()).findOneAndUpdate({ _id: user._id }, { $set: { projectsCount: projectsCount } })


        response.status(200).json({status:true, message:"Project Fork Completed"})



    } catch (error) {
        console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
    
    }

}


module.exports = { createProject, editProject, commentOnProject, changeProjectType, forkProject }