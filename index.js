import express from "express";
import cookieParser from "cookie-parser";
import { connectDb } from "./db/user_db.js";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/user_routes.js";
dotenv.config();

const app = express();

//Database Connection
connectDb();

//must be included before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

//router

app.use("/api/v1/users", userRouter);

app.use(
  cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
    methods: ["get", "post", "delete", "put"],
  })
);

app.get("/", (req, res) => {
  res.send("working perfectly");
});

app.listen(process.env.PORT, () => {
  console.log(`⚡ server is started at port : ${process.env.PORT}`);
});
