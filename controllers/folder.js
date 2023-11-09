require("dotenv").config()
const shortid = require("shortid")
const Project = require("../models/project.model")
const { userManagementDatabase } = require("../config/foreignDb")
const handleError = require("../utils/errorHandler")
const Folder = require("../models/folder.model")



const createFolder = async (request, response) => {

    const id = request.user._id

    let { folderName, folderUniqueName, folderDescription,type } = request.body
    

    try {

        if (!folderName) {
            return response.status(400).json(handleError(400, "Folder Name Required", "the client did not sent folderName in the request body"))
        }
        if (!type) {
            return response.status(400).json(handleError(400, "Folder Type Missing", "the client did not send type in the request body"))
        }

        if (type !== "private" && type !== "public") {
            return response.status(400).json(handleError(400, "Invalid Folder Type", "Folder type from the client should be either 'public' or 'private' " ))
        }


        if (!folderUniqueName) {
            return response.status(400).json(handleError(400, "Folder Unique Name Missing", "the client did not send folderUniqueName in the request body"))
        }
        if (!folderUniqueName.split(" ").length > 1) {
            return response.status(400).json(handleError(400, "Folder Unique Name Contains Spaces", "the folder Uniqe Name sent from the Client Contains Spaces"))
        }

        let regExp = /\p{P}/gu;

        if (regExp.test(folderUniqueName)) {
            return response.status(400).json(handleError(400, "Folder Unique Has an Invalid Character", "the folder Uniqe Name sent from the Client Contains an Invalid Character  "))
        }

        folderUniqueName = folderUniqueName.toLowerCase()

        // console.log(id.toString())

        const folderExists = await Folder.findOne({ owner: id.toString(), folderUniqueName })

        
        if (folderExists) {
            return response.status(400).json(handleError(400, "Folder Exists", "their is already a folder with this folderUniqueName Associated to this Particular User"))
        }
        
        const publicId = shortid.generate().toLowerCase()
        const owner = id

        await Folder.create({ folderName, folderUniqueName, folderDescription, private: type === "private", public: type === "public", owner, public_id: publicId })
        
        response.status(201).json({ status: true, message: "Folder Created Successfully" })


    } catch (error) {
        console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
    }
    
}

const publicGetFolder = async (request, response) => {
    
    const username = request.params.username
    const folderUniqueName = request.params.folder

    
    try {
    
        const user = await (await userManagementDatabase()).findOne({ username:username.toLowerCase() })
        
        if (!user) {
            return response.status(400).json(handleError(400, "User Not Found", "The User attached to the folder does not exis, the username appears to be invalid"))
        }

        if (user.blocked) {
            return response.status(400).json(handleError(400, "User Not Found", "The User attached to the folder has been blocked"))
        }

        const folder = await Folder.findOne({ owner: user._id, folderUniqueName: folderUniqueName.toLowerCase() }, { private: 0, public: 0, owner: 0, __v:0,updatedAt:0 })
        .populate("projects", "owner_picture projectTitle projectDescription public_id likesCount commentCount projectSnapShot", { private: false, deleted: false })
        

        if (!folder) {
            return response.status(404).json(handleError(400, "Folder Not Found", "the Request folder does not exist"))
        }

        if (folder.private) {
            return response.status(404).json(handleError(400, "Folder Not Found", "the Request folder is a private folder"))
        }

        response.status(200).json({ status: true, folder })


    }catch(error){

         console.log(error)
        if (error.kind === "ObjectId") {
            return response.status(400).json(handleError(400, "Invalid User Id", "Ther User Id Provided by the client is Invalid"))
        }
        response.status(500).json(handleError(500, "Internal Server Error", "am Error Ocured on the Server Side"))
        
    }
}

module.exports = { createFolder, publicGetFolder }