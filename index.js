const express = require("express");
const { connection } = require("./connection/db");
const { authRouter } = require("./routes/auth.router");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { userRouter } = require("./routes/user.router");
const { moderatorRouter } = require("./routes/moderator.router");
const { authorise } = require("./middleware/role");
const session = require("express-session");
require("dotenv").config();


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
    session({
      resave: true,
      secret: "eval secret",
      saveUninitialized: true,
    })
  );

app.use("/auth",authRouter)


app.use(auth);
app.use("/user",authorise(["User"]),userRouter)
app.use("/moderator",authorise(["Moderator"]),moderatorRouter)





app.listen(process.env.PORT,async()=>{
    try {
        await connection;
        console.log("Connected to db!");
    } catch (error) {
        console.log("Uable to connect with db!")
        console.log(error.message)
    }
    console.log(`App is running on port ${process.env.PORT}!`)
})