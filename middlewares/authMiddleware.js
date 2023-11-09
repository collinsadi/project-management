const jwt = require("jsonwebtoken")
require("dotenv").config()
const jwtsecret = process.env.JWT_SECRET
const handleError = require("../utils/errorHandler");
const { userManagementDatabase } = require("../config/foreignDb");
const { ObjectId } = require("mongodb");


const authenticateUser = async (request, response, next) => {
    
    if (request.headers.authorization && request.headers.authorization.startsWith("Bearer")) {
        
        const token = request.headers.authorization.split(" ")[1]

        try {
            
            const decoded = jwt.verify(token, jwtsecret)
            const id = decoded.user
            console.log(id)
            const user = await (await userManagementDatabase()).findOne({ _id: new ObjectId(id) })
            console.log(user)
            if (!user) {
            return  response.status(401).json(handleError(401, "Unauthorized", "The Client is Trying to Access an Authorized Endpoint with an Invalid Token"))
            }
            if (user.blocked) {
            return  response.status(401).json(handleError(401, "Account Disabled", "The Client is Trying to Access an Authorized Endpoint with a Disabled Account"))
            }


            request.user = user

            next()
        } catch (error) {

            response.status(401).json(handleError(401, "Unauthorized", "The Client is Trying to Access an Authorized Endpoint with an Invalid Token"))
            console.log(error)
        }

    } else {
        response.status(401).json(handleError(401, "Unauthorized", "Authorization Header with Bearer Token Required"))
        
    }

}

module.exports = authenticateUser;