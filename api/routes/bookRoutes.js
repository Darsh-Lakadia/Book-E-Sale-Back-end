const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Book = require("../models/bookModel");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false)
    }
}
const upload = multer(
    {
        storage: storage,
        limits: { filesize: 1024 * 1024 * 5 },
        fileFilter: fileFilter
    },
);

router.get('/', (req, res, next) => {

    Book.find()
        .select('-__v -count')
        .exec()
        .then(docs => {

            res.status(200).json({
                message: " Fetched books",
                results: docs
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', upload.single('bookImage'), (req, res, next) => {

    console.log(req.file);

    const book = new Book({
        title: req.body.title,
        authorName: req.body.authorName,
        description: req.body.description,
        price: req.body.price,
        bookImage: req.file.path
    });
    book.save()                                          //store this in the DB
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Created book successfully",
                createdBook: result
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.get('/:bookId', (req, res, next) => {
    const id = req.params.bookId;
    Book.findById(id)
        .select("-__v -count")
        .exec()
        .then(doc => {
            console.log("From database" + doc);
            if (doc) {
                res.status(200).json({
                    message: "Fetched book for given bookId",
                    doc,
                });
            } else {
                res.status(404).json({ message: "No valid entry found for provided Id" });
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        });
});


module.exports = router;