const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({

    owner_username: String,
    owner_id: String,
    public_id: String,
    owner_picture: String,
    projectTitle: String,
    projectDescription: String,
    code: {
        html: String,
        css: String,
        javascript: String
    },
    projectSnapShot: String,
    likesCount: {
        type: Number,
        default:0
    },
    commentCount: {
        type: Number,
        default:0
    },
    forks: [{ type: mongoose.Schema.Types.ObjectId, ref: "project" }],
    likes: [String],
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "folder" },
    comments: [
        {
            user_id: String,
            user_picture: String,
            user_username: String,
            comment: String,
            public_id: String,
            date: Date
        }
    ],
    teamMembers: [String],
    private: {
        type: Boolean,
        default: false
    },
    public: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    forked: Boolean,
    originalOwner:String

}, { timestamps: true });


const Project = mongoose.model("project", projectSchema);

module.exports = Project;