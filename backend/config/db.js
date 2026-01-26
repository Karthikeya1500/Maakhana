import mongoose from "mongoose"
const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database succesfully connected")
    }
    catch(error){
        console.log("Database Error")

    }

    

}


export default connectDb