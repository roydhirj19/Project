const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js")

let mongoose_url = "mongodb://127.0.0.1:27017/wanderlust";
main().then((res) => {
  console.log("connection Succesfully installed");
})
.catch((err)=>{
  console.log(err);
  
})

async function main() { 
  await mongoose.connect(mongoose_url);
}

const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
      ...obj,
      owner:"67b780bd8152b5fd6aa8a0a8"}))
    await Listing.insertMany(initData.data);
    console.log("Data was initilized")
}
initDB()