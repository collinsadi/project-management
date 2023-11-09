require("dotenv").config()
const { MongoClient } = require("mongodb")
const url = process.env.FOREIGN_URI
const colors = require("colors")

const connectDatabase = async () => {
    try{
    const client = new MongoClient(url, { monitorCommands: true })
        
    await client.connect()
    
    console.log("Connected To MongoDB".green)
        
    return client
    
        
    } catch (error) {
        console.log("Error Connectiong to MongoDB"+ error)
    }
}

const userManagementDatabase = async () => {

    const client = await connectDatabase()
    const db = client.db("editor")
    const User = db.collection("users")
    return User
}


module.exports = {userManagementDatabase};