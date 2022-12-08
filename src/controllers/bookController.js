const bookModel = require("../models/bookModel")
const Validation = require("../validators/validator")
const reviewModel = require("../models/reviewModel")
const { isValidObjectId } = require("mongoose")


//__________________________ Post Api : Create Book  ___________________________________________//

const createBook = async function (req, res) {

    try {
        const data = req.body
        if (Object.keys(data) == 0) return res.status(400).send({ status: false, message: "No input provided" });
        const { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = data

        if (!userId) return res.status(400).send({ status: false, message: "Please enter userId" })
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "user Id is not valide" })
        if (userId != req.decodedToken.userId) return res.status(403).send({ status: false, msg: "you do not have authorization to this " });

        //  -------------------------------Title Validation-----------------------
        if (!title) return res.status(400).send({ status: false, message: "Please Enter Title" })
        if (!Validation.isValid(title)) return res.status(400).send({ status: false, message: "please inter valid title" })
        let findTitle = await bookModel.findOne({ title: title })
        if (findTitle) return res.status(400).send({ status: false, message: "Book allrady exist for this title " })

        if (!excerpt) return res.status(400).send({ status: false, message: "Please enter excerpt" })
        if (!Validation.isValid(excerpt)) return res.status(400).send({ status: false, message: "please inter valid excerpt" })

        //  -------------------------------SIBN Validation-----------------------
        if (!ISBN) return res.status(400).send({ status: false, message: "Please enter ISBN" })
        if (!Validation.isValidISBN(ISBN.trim())) return res.status(400).send({ status: false, message: "please inter valid ISBN" })
        let sibnBook = await bookModel.findOne({ ISBN: ISBN })
        if (sibnBook) return res.status(400).send({ status: false, message: "Book allrady exist for this ISBN " })

        // -----------------------------------------

        if (!category) return res.status(400).send({ status: false, message: "Please enter category" })
        if (!Validation.isValidStr(category.trim())) return res.status(400).send({ status: false, message: "please inter valid category" })


        if (!subcategory) return res.status(400).send({ status: false, message: "Please enter subcategory" })
        if (!Validation.isValidStr(subcategory.trim())) return res.status(400).send({ status: false, message: "please inter valid subcategory" })

        if (!releasedAt) return res.status(400).send({ status: false, message: "Please enter releasedAt" })
        if (!Validation.IsValidDate(releasedAt)) return res.status(400).send({ status: false, message: "please inter valid releasedAt in format: YYYY-MM-DD" })

        const bookData = await bookModel.create(data)
        res.status(201).send({ status: true, data: bookData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//------------------get books-----------------------/

const getBooks = async function (req, res) {
    try {
        if (req.query) {
            let { userId, category, subcategory } = req.query
            let obj = {}

            if (userId) {
                obj.userId = userId
            }
            if (category) {
                obj.category = category
            }
            if (subcategory) {
                obj.subcategory = subcategory
            }


            obj.isDeleted = false
            const bookDetails = await bookModel.find(obj).select({ title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, reviews: 1, releasedAt: 1 })
            if (bookDetails.length == 0) {
                return res.status(404).send({ status: false, msg: "No book found for given data" })
            }
            else {
                function alphaOrder(obj1, obj2) {
                    if (obj1.title < obj2.title) return -1
                    if (obj1.title > obj2.title) return 1
                    return 0
                }
                bookDetails.sort(alphaOrder)
                return res.status(200).send({ status: true, message: 'Success', data: bookDetails })
            }
        } else {
            const allBooks = await bookModel.find({ isDeleted: false })
            allBooks.sort(alfaOrder)
            return res.status(200).send({ status: true, message: 'Success', data: allBooks })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}



// ----------------------------------getBookbyParam----------------------------------

const getBookbyParam = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if (!bookId) return res.status(400).send({ status: false, error: "please inter bookid" })
        if (!isValidObjectId(bookId)) return res.status(400).send({ status: false, msg: "Enter a valid bookId" })

        const books = await bookModel.findById({ _id: bookId })
        if (books.isDeleted) return res.status(404).send({ status: false, msg: "Book is already been deleted" })
        if (!books) return res.status(400).send({ status: false, error: "there is no such book exist" })

        const bookWithReview = await reviewModel.find({ bookId: bookId, isDeleted: false })

        console.log(bookWithReview)
        let string = JSON.stringify(books);
        let book1 = JSON.parse(string)

        book1.allreviews = bookWithReview

        console.log(book1)
        return res.status(200).send({ status: true, message: 'Books list', data: book1 })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}




//------------------update API-----------------------//

const updateBooks = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Add fields to update" });
        const { title, excerpt, releasedAt, ISBN } = req.body

        if (title) {
            if (!Validation.isValid(title)) return res.status(400).send({ status: false, message: "please inter valid title" })
            let findTitle = await bookModel.findOne({ title: title })
            if (findTitle) return res.status(400).send({ status: false, message: "Book allrady exist for this title " })
        }
        if (ISBN) {
            if (!Validation.isValidISBN(ISBN)) return res.status(400).send({ status: false, message: "please inter valid ISBN" })
            let sibnBook = await bookModel.findOne({ ISBN: ISBN })
            if (sibnBook) return res.status(400).send({ status: false, message: "Book allrady exist for this SIBN " })
        }

        let updatedData = await bookModel.findOneAndUpdate({ _id: bookId }, {
            $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN }
        }, { new: true, upsert: true })

        return res.status(200).send({ status: true, msg: "Book updated successfuly", data: updatedData })

    }
    catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}


//------------------Delete Blog by path param-----------------------//

const deleteBook = async (req, res) => {
    try {
        let bookId = req.params.bookId
        const delatedbookId = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date(Date.now()) }, }, { new: true });

        if (delatedbookId) {
            await reviewModel.updateMany({ bookId: delatedbookId._id }, { $set: { isDeleted: true } });
            return res.status(200).send({ status: true, msg: "Book is deleated successfuly with its reviews", data: delatedbookId })
        } else {
            return res.status(404).send({ status: false, msg: "No Book found for this id" })
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message });
    }
};



module.exports = { createBook, getBooks, updateBooks, deleteBook, getBookbyParam }


