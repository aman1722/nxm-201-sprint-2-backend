const express = require("express");
const jwt = require("jsonwebtoken");
const {BlogModel} = require("../model/blog.model")


const userRouter = express.Router();

userRouter.get("/blogs",async(req,res)=>{
    const evalAccessToken=req.cookies.evalRefreshToken||req?.headers?.authorization;
    const decoded = jwt.verify(evalAccessToken,ACCESS_TOKEN_SECRET_KEY);
    try {
        if(decoded){
            const blog = await BlogModel.find({email:decoded.email});
            res.status(200).send(blog);
        }
    } catch (error) {
        res.status(400).send({msg:error.message})
    }
})

userRouter.post("/add",async(req,res)=>{
    try {
        const blog = new BlogModel(req.body);
        await blog.save();
        res.status(200).send({msg:"New blog created!"});
    } catch (error) {
        res.status(400).send({msg:error.message}) 
    }
})

userRouter.patch("/update/:id",async(req,res)=>{
    const {id} = req.params;
    const payload = req.body;
    try {
        await BlogModel.findByIdAndUpdate({_id:id},payload)
        res.status(200).send({msg:"blog updated!"});
    } catch (error) {
        res.status(400).send({msg:error.message}) 
    }
})

userRouter.delete("/delete/:id",async(req,res)=>{
    const {id} = req.params;
    try {
        await BlogModel.findByIdAndDelete({_id:id})
        res.status(200).send({msg:"blog deleted!"});
    } catch (error) {
        res.status(400).send({msg:error.message}) 
    }
})
module.exports={
    userRouter
}