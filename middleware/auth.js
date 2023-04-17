const jwt = require("jsonwebtoken");
const {BlacklistModel} = require("../model/blacklist.model")
require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const auth = async (req, res, next) => {
        const { evalAccessToken } = req.cookies;
        const isTokenBlacklisted = await BlacklistModel.findOne({token:evalAccessToken})
        if(isTokenBlacklisted){
           return res.send(400).send({msg:"User logged out! Please Login Again!"})
        }
      jwt.verify(evalAccessToken,process.env.ACCESS_TOKEN_SECRET_KEY,async(err,decoded)=>{
            if(err){
                if(err.message == "jwt expired"){
                    const newAccessToken = await fetch("http://localhost:8080/auth/refresh-token",{
                        headers:{
                            "Content-Type":"application/json",
                            "Authorization":req.cookies.evalAccessToken
                        }
                    }).then((res)=>res.json());
        
        
                    res.cookie("evalAccessToken", newAccessToken, { maxAge: 1000 * 60 })
                    next();
                }else{
                 res.status(400).send({msg:"Session expires"})
                }
            }else{

                console.log(decoded);
                req.body.email = decoded.email;
                next();
            }
        })
    

   
}


module.exports={
    auth
}