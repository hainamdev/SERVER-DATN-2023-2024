require("dotenv").config();
require("./config/loginSalesforce");
const cors = require('cors');
const express = require("express");
const usersController = require('./controller/usersController');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", function (req, res) {
    res.json({ status: "online" });
});

    // Đăng nhập vào ứng dụng
    app.post("/login", usersController.login);
    // đăng kí user
    app.post("/register", usersController.register);

    // lấy tất cả  account
    app.get("/users",usersController.getAllUser);
    // lấy account bằng Id
    app.get("/user/:id",usersController.getUserbyId);


module.exports = app;
