const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const bodyparser = require("body-parser");
const morgan = require("morgan");

const  {CreateTokens, validateToken}= require("./JWT")

const { Users } = require("./models");

const app = express();

const db = require("./models");

// app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  //   console.log(username,password);
  //   res.json("sent")
  bcrypt.hash(password, 10).then((hash) => {
    Users.create({
      username: username,
      password: hash,
    })
      .then(() => {
        res.json("USER REGISTERED");
      })
      .catch((err) => {
        if (err) {
          res.status(400).json({ error: err });
        }
      });
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ where: { username: username } });
  if (!user) res.status(400).json({ message: "User not found " });
  const dbPassword = user.password;
  bcrypt.compare(password, dbPassword).then((match) => {
    if (!match) {
      res
        .status(400)
        .json({ message: "wrong password and username combination" });
    } else {
      const accessToken = CreateTokens(user)
      //create a cookie and store it in the browser
      res.cookie("access-token",accessToken,{
        maxAge:60*60*24*30*1000,httpOnly:true
      })

      res.status(200).json({ message: "logged in " });
    }
  });
});

app.get("/profile", validateToken, (req, res) => {
  res.json("profile");
});

db.sequelize.sync().then(() => {
  app.listen(5000, () => {
    console.log("SERVER RUNNING ON PORT 5000");
  });
});
