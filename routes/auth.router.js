const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { UserModel } = require("../model/user.model")
const { BlacklistModel } = require("../model/blacklist.model")
require("dotenv").config();

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const isUserAlreadyExists = await UserModel.findOne({ email });
        if (isUserAlreadyExists) {
            return res.status(400).send({ msg: "User already exists! Please login" })
        }
        const hashedPassword = bcrypt.hashSync(password, 5);
        const newUser = new UserModel({ ...req.body, password: hashedPassword });
        await newUser.save();
        res.status(200).send({ msg: "Signup Sucess!", user: newUser })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const isUserAlreadyExists = await UserModel.findOne({ email });
        if (!isUserAlreadyExists) {
            return res.status(400).send({ msg: "Not a user! Please signup" })
        }
        const isPasswordCorrect = bcrypt.compareSync(password, isUserAlreadyExists.password);
        if (!isPasswordCorrect) {
            return res.status(400).send({ msg: "Wrong Credentials!" })
        }
        //tokens genrating
        const accessToken = jwt.sign({ email, role: isUserAlreadyExists.role }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: "1m" })
        const refreshToken = jwt.sign({ email, role: isUserAlreadyExists.role }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "3m" })

        //storing the token in cookies
        res.cookie("evalAccessToken", accessToken, { maxAge: 1000 * 60 })
        res.cookie("evalRefreshToken", refreshToken, { maxAge: 1000 * 60 * 5 })
        res.status(200).send({ msg: "Login Sucess!" })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

authRouter.post("/logout", async (req, res) => {
    try {
        const { evalAccessToken, evalRefreshToken } = req.cookies;
        const blacklistAccessToken = new BlacklistModel(evalAccessToken)
        const blacklistRefreshToken = new BlacklistModel(evalRefreshToken)
        await blacklistAccessToken.save()
        await blacklistRefreshToken.save()
        res.status(200).send({ msg: "Logout Sucessful!" })
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})

authRouter.post("/refresh-token", async (req, res) => {
    try {
     const evalRefreshToken=req.cookies.evalRefreshToken||req?.headers?.authorization;
     const isTokenBlacklisted = await BlacklistModel.findOne({token:evalRefreshToken})
     if(isTokenBlacklisted){
        return res.send(400).send({msg:"User loggedout! Please Login Again!"})
     }
     const isTokenValid = jwt.verify(evalRefreshToken,process.env.REFRESH_TOKEN_SECRET_KEY);
     if(!isTokenValid){
       return res.status(400).send({msg:"Please login again!"})
     }
     const newAccessToken = jwt.sign({email:isTokenValid.email,role:isTokenValid.role},process.env.ACCESS_TOKEN_SECRET_KEY,{expiresIn:"1m"})
     res.cookie("evalAccessToken", newAccessToken, { maxAge: 1000 * 60 })
     res.status(200).send({msg:"Token genrated!"})
    } catch (error) {
        res.status(500).send({ msg: error.message })
    }
})


module.exports = {
    authRouter
}