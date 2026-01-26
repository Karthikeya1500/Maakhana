import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genarateToken from "../utils/token"

export const signUp = async (req,res) => {
    try {
        const {fullName,email,password,mobile,role}=req.body
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json("User Already exist.")
        }
        if(password.length<8){
            return res.status(400).json("password must be at least 8 characters.")
        }
        if(mobile.length<10){
            return res.status(400).json("mobile number  must be at least 10 digits.")
        }
     
        const hashedPassword=await bcrypt.hash(password,10)
        user = await User.create({
            fullName,
            email,
            role,
            mobile,
            password:hashedPassword
        })

        const token = await genarateToken(user._id)
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:9*24*60*60*1000,
            httpOnly:true
        })
  
        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json(`sign up error ${error}`)
    }
}

export const signIn = async (req,res) => {
    try {
        const {email,password}=req.body
        let user = await User.findOne({email})
        if(!user){
            return res.status(400).json("User does not exist.")
        }
     
        const match = await bcrypt.compare(password,user.password)
        if(!match){
            return res.status(400).json({message:"Wrong Password"})
        }

        const token = await genarateToken(user._id)
        res.cookie("token",token,{
            secure:false,
            sameSite:"strict",
            maxAge:9*24*60*60*1000,
            httpOnly:true
        })
  
        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json(`sign In error ${error}`)
    }
}

export const signOut = async (req,res) =>{
    try{
        res.clearCookie("token")
        return res.status(200).json({message:"log out successfully"})

    }
    catch{
         return res.status(500).json(`sign Out error ${error}`)

    }
} 
