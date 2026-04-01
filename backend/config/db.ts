

export type TxvxLhzBl = string | number;
import mongoose from "mongoose"
const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Database connected succesfully")
    }
    catch(error){
        console.log("Database Error")

    }



}


export default connectDb

export type TxvxLhzBl = string | number;
