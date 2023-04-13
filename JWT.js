const {sign, verify} =require('jsonwebtoken')


const CreateTokens =(user)=>{
    const accessToken= sign({username:user.username, id:user.id},"jwtsecret",)

    return accessToken

}


const validateToken =(req,res,next)=>{
    const accessToken = req.cookies["access-token"]
    if(!accessToken) return res.status(400).json({
        message:"user not authenticated"
    })

    try{
     const validToken = verify(accessToken,"jwtsecret");
     if(validToken){
         req.authenticated = true; 
         return next()
     }
    }
    catch(err){
        res.status(400).json({message:err})

    }
}


module.exports = {CreateTokens , validateToken}


