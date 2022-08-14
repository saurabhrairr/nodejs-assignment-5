const express = require("express");
const mongoose = require("mongoose");
const { userModel, postModel } = require("./postschema");
const app = express();
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const salt = 10;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(3010, (err) => {
    if (!err) {
        console.log("server started at port 3010")
    } else {
        console.log(err)
    }
});  

mongoose.connect("mongodb://localhost/assignment_5", (err) => {
    if (!err) {
        console.log("connected to Database")
    } else {
        console.log(err);
    }
});

app.post("/register", (req, res) => {
    bcrypt.genSalt(salt, (err, hashSalt) => {
        bcrypt.hash(req.body.password, hashSalt, (err, passwordHash) => {
            userModel.create({
                name: req.body.name,
                email: req.body.email,
                password: passwordHash
            }).then((data) => {
                res.status(200).send("user update  successfully" );
            }).catch((err) => {
                res.status(400).send(err);
            })
        })
    })
});

app.post("/login", (req, res) => {
    userModel.find({ email: req.body.email }).then((user) => {
        if (user.length) {
            bcrypt.compare(req.body.password, user[0].password).then((match) => {
                if (match) {
                    const authToken = jwt.sign(req.body.email, process.env.SECRET_KEY);
                    res.status(200).send({authToken});
                } else {
                    res.status(400).send("Invalid password")
                }
            });
        } else {
            res.status(400).send("User Not Exist")
        }
    })
});

app.post("/post", (req, res) => {
    if (req.headers.authorization) {
        try {
            const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
            postModel.create({
                body: req.body.body,
                image: req.body.image,
                title: req.body.title,
                user: email
            }).then((data) => {
                res.status(200).send({ "Status": "Post Created", data })
            });
        } catch (err) {
            res.status(403).send("User Not Authorized")
        }
    } else {
        res.status(400).send("MIssing Autborization Token")
    }
});

app.get("/post", (req, res) => {
    if (req.headers.authorization) {
        try {
            const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
            postModel.find({ user: email }).then((posts) => {
                res.status(200).send(posts);
            })
        } catch (err) {
            res.status(403).send("User Not Authorized")
        }
    } else {
        res.status(400).send("Missing Authorization token")
    }
});

app.put("/post/:postId", (req, res) => {
    if (req.headers.authorization) {
        postModel.find( { _id: req.params.postId}).then((post) => {
            try {
                const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
                if (post[0].user === email) {
                    postModel.updateOne({_id: req.params.postId }, req.body).then((posts) => {
                        res.status(200).send("user update  successfully");
                    });
                }
            
                else {
                    res.status(403).send("UnAuthorized user")
                }

            } catch (err) {
                res.status(403).send("User Not Authorized")
            }
        })

    } else {
        res.status(400).send("Missing Authorization token")
    }
})

app.delete("/post/:postId", (req, res) => {
    if (req.headers.authorization) {
        postModel.find({ _id: req.params.postId }).then((post) => {
            try {
                const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
                if (post[0].user === email) {
                    postModel.deleteOne({ _id: req.params.postId }, req.body).then((posts) => {
                        res.status(200).send("user delete  successfully");
                    });
                } else {
                    res.status(403).send("UnAuthorized user cant update the post")
                }

            } catch (err) {
                res.status(403).send("User Not Authorized")
            }
        })

    } else {
        res.status(400).send("Missing Authorization token")
    }
})