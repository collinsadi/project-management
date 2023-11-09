const mongoose = require("mongoose")


const folderSchema = new mongoose.Schema({

    folderName: String,
    public_id: String,
    folderUniqueName: String,
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "project" }],
    folderDescription: String,
    private: {
        type: Boolean,
        default: false
    },
    public: {
        type: Boolean,
        default: false
    },
    owner:String

}, { timestamps: true })

const Folder = mongoose.model("folder", folderSchema)

module.exports = Folder