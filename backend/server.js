import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config(); // this must come before the connection to database so it doest come up as undefined
connectDB();
const app = express();

//middleware code that runs on every request before it reaches a route
app.use(cors()); //allows requets from frontend
app.use(express.json()); //parse incoming JSON bodies into req.body

//test route to prove the server works
app.get("/", (req, res) => {
  res.send("ExpenseFlow API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); // starts the server listening ot this port
