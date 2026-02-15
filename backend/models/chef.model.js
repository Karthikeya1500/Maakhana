import mongoose from "mongoose";

const chefSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    homechef:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Customer",
        required:true
    },
    city:{
         type:String,
        required:true
    },
    state:{
         type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    items:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Item"
    }]

},{timestamps:true})

const chef=mongoose.model("HomeCook",chefSchema)
export default chef