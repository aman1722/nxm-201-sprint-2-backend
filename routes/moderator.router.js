const express = require("express");
const {BlogModel} = require("../model/blog.model")

const moderatorRouter = express.Router();


moderatorRouter.delete("/delete/:id",async(req,res)=>{
    const {id} = req.params;
    try {
        await BlogModel.findByIdAndDelete({_id:id})
        res.status(200).send({msg:"blog deleted!"});
    } catch (error) {
        res.status(400).send({msg:error.message}) 
    }
})

module.exports={
    moderatorRouter
}