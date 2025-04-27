import mongoose from "mongoose";

const DBconnection = () => {
  mongoose.connect(
    `mongodb://localhost:27017/minor-project`,
    console.log("DB connected")
  );
};


export default DBconnection;
