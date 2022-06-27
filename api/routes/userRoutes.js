const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(422).json({
            error: "Please Provide all the fields"
        })
    }
    User.findOne({ email: email })
        .then(alreadysaved => {
            if (alreadysaved) {
                return res.status(422).json({
                    error: "User is already signed up"
                })
            }
            bcrypt.hash(password, 10)
                .then((hashed) => {
                    const user = new User({
                        firstName,
                        lastName,
                        email,
                        password: hashed
                    });
                    user.save()
                        .then((user) => {
                            res.json({
                                message: "user created successfully",
                                createdUser: user
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
        })
        .catch(err => {
            res.status(505).json({
                error: err
            });
        });
})

router.post("/login", (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: "Auth Failed"
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {

                if (err) {
                    return res.status(401).json({
                        message: "Auth Failed"
                    })
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            emailId: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_SECRET,
                        {
                            expiresIn: "1h"
                        }
                    )
                    return res.status(200).json({
                        message: "Auth Successfull",
                        token: token
                    })
                }
                return res.status(401).json({
                    message: "Auth Failed"
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;