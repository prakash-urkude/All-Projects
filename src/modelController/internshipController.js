//______________________ Import or Require Modules ________________________________

const internshipModel = require("../models/internModel")
const CollegeModel = require("../models/collegeModel")
const Validation = require("../Validation/Validation")
//__________________________ Post Api : Create Intern  ___________________________________________

const createIntern = async function (req, res) {
  //res.setHeader('Access-Control-Allow-Origin','*')
  try {
    const data = req.body
    if (Object.keys(data) == 0) {
      return res
        .status(400)
        .send({ status: false, message: "No input provided" });
    }
    const { name, mobile, email, collegeName } = data
    if (!name) {
      return res.status(400).send({ status: false, message: "Please Enter Name" })
    }
    if (!Validation.isValidName(name)) {
      return res.status(400).send({ status: false, message: "Invalid Name" })
    }
    if (!mobile) {
      return res.status(400).send({ status: false, message: "Please enter Mobile Number" })
    }
    if (!Validation.isValidMobileNumber(mobile)) {
      return res.status(400).send({ status: false, message: "Invalid Mobile Number" })
    }
    if (mobile) {
      const validMobile = await internshipModel.findOne({ mobile: mobile })
      if (Validation.isValid(validMobile)) {
        return res.status(400).send({ status: false, message: "This Mobile Number is already register" })
      }
    }
    if (!email) {
      return res.status(400).send({ status: false, message: "Please enter email" })
    }
    if (!Validation.isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Invalid Email" })
    }
    if (email) {
      const validEmail = await internshipModel.findOne({ email: email })
      if (Validation.isValid(validEmail)) {
        return res.status(400).send({ status: false, message: "This Email is already register" })
      }
    }
    const college = await CollegeModel.findOne({ name : collegeName , isDeleted : false})
    if (college == null) {
      return res.status(404).send({ message: "there is no such college" })
    }
    const collegeId = college["_id"]
    const college1 = { name: name, mobile: mobile, email: email, collegeId: collegeId }
    const internShipData = await internshipModel.create(college1)
    res.status(201).send({ status: true, data: internShipData })
  }
  catch (err) {
    res.status(500).send({ status: false, message: err.message })
  }
}
//______________________ Export the Modules ________________________________

module.exports = { createIntern }