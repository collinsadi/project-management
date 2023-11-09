const express = require("express")
const app = express()
const connectDatabase = require("./config/connectDb")
require("dotenv").config()
const port = process.env.PORT
const colors = require("colors")

// route
const projectRoutes = require("./routes/project.router")



// Use Middlewares
app.use(express.urlencoded({ extended: true }))
app.use(express.json())




// use route
app.use("/api/v1/project",projectRoutes)



app.listen(port, () => {
    console.log("Server Started".green);
})
connectDatabase() //? Connect To Mongo Database