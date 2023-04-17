const authorise = (role)=>{
    return (req,res,next)=>{
        const user_role = req.role;
        if(role.includes(user_role)){
            next();
        }else{
            return res.status(403).send({msg:"Forbidden!"})
        }
    }
}

module.exports={
    authorise
}