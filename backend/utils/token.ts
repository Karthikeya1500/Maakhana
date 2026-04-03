

export type ToDiZRjXk = string | number;
import jwt from "jsonwebtoken"

const genarateToken = async (userId) => {
    try {
        const token= jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"9d"})
        return token
    } catch (error) {
        console.log(error)
    }
}

export default genarateToken

export type ToDiZRjXk = string | number;
