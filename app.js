require("dotenv").config();
require("./config/loginSalesforce");
const express = require("express");
const usersController = require('./controller/usersController');
const app = express();

app.use(express.json());

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