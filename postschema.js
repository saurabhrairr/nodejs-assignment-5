const mongoose=require("mongoose");
const userschema=new mongoose.Schema({
       name:String,
       email:{
              type:String,
              require:true,
              unique:true
       },
       password:String

});
const postschema=new mongoose.Schema({
       name:String,
       title:String,
       body:String,
       image:String,
       user:String
})
const userModel=mongoose.model("user",userschema)
const postModel=mongoose.model("post",postschema)
module.exports={userModel,postModel};
