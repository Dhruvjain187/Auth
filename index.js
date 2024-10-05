const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const User = require("./models/user");
const session = require('express-session');



main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/authDemo');
}

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'notagoodsecret',
    resave: false,
    saveUninitialized: true,
}))

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect("/login")
    }
    next();
}

app.get("/", (req, res) => {
    res.send("home page")
})

app.get("/secret", requireLogin, (req, res) => {
    // if (!req.session.user_id) {
    //     return res.redirect("/login")
    // }
    res.render("secret")

});

app.get("/topsecret", requireLogin, (req, res, next) => {
    res.send("Top Secret!!")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.post("/register", async (req, res) => {
    const { password, username } = req.body;
    // const hash = await bcrypt.hash(password, 12);
    const user = new User({
        username,
        password
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect("/secret")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/logout", (req, res) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect("/secret");
})

app.post("/login", async (req, res) => {
    const { password, username } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        console.log("session=", req.session)
        res.redirect("/secret")
    } else {
        res.redirect("/login")
    }
})

app.listen(port, () => {
    console.log(`listening at port ${port}`)
});
