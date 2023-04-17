const mongoose = require("mongoose");

const blogSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true 
    },
    email:{
        type:String, 
    }
},{
    versionKey:false
})

const BlogModel = mongoose.model("blog",blogSchema);


module.exports={
    BlogModel
}