//______________________ Import or Require Modules ________________________________

const CollegeModel = require("../models/collegeModel")
const internshipModel = require("../models/internModel")
const Validations = require("../Validation/Validation")

//__________________________ Post Api : CreateCollege  ___________________________________________

const createCollege = async function (req, res) {
  try {
    const data = req.body
    if (Object.keys(data) == 0) {
      return res
        .status(400)
        .send({ status: false, message: "No input provided" });
    }
    const { name, fullName, logoLink } = data
    if (!name) {
      return res.status(400).send({ status: false, message: "please enter the name" })
    }
    if (!Validations.isValidShortname(name)) {
      return res.status(400).send({ status: false, message: "Invalid Abbreviated Name" })
    }

    if (name) {
      const NameValidation = await CollegeModel.findOne({ name: name })
      if (Validations.isValid(NameValidation)) {
        return res.status(400).send({ status: false, message: "this name is already register" })
      }
    }

    if (!fullName) {
      return res.status(400).send({ status: false, message: "please enter the fullName" })
    }
    if (!Validations.isValidFullName(fullName)) {
      return res.status(400).send({ status: false, message: "Invalid fullname" })
    }
    if (fullName) {
      const fullNameValidation = await CollegeModel.findOne({ fullName: fullName })
      if (Validations.isValid(fullNameValidation)) {
        return res.status(400).send({ status: false, message: "this college is already register" })
      }
    }
    if (!logoLink) {
      return res.status(400).send({ status: false, message: "Please Provide Logolink" })
    }
    if (!Validations.isValidLink(logoLink)) {
      return res.status(400).send({ status: false, message: "Invalid Link" })
    }

    const logoLinkValidation = await CollegeModel.findOne({ logoLink: logoLink })
    if (logoLinkValidation != null) {
      return res.status(400).send({ status: false, message: "this logoLink is already register" })
    }

    const createCollege = await CollegeModel.create(data);
    return res.status(201).send({ status: true, data: createCollege })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}
//__________________________ Get Api : Getcollegedata  ___________________________________________

const Getcollegedata = async function (req, res) {
 // res.setHeader('Access-Control-Allow-Origin','*')
  try {
    const collegeName = req.query.collegeName
    if (!collegeName) {
      return res.status(400).send({ status: false, message: "please enter college Name" })

    }

    const isValidName = await CollegeModel.findOne({ name: collegeName })
    if (isValidName == null) {
      return res.status(400).send({ status: false, message: "Invalid college name" })
    }

    const collegeData = await CollegeModel.findOne({ name: collegeName , isDeleted : false })
    const collegeId = collegeData["_id"]
    const internData = await internshipModel.find({ collegeId: collegeId }).select({ _id : 1 ,name : 1 , email : 1,mobile : 1})
    if (internData.length == 0) {
      return res.status(404).send({ status: false, message: "there is no intern from this college" })
    }    
    let data = {
      name: collegeData.name,
      fullName: collegeData.fullName,
      logoLink: collegeData.logoLink,
      interns: internData
    }

    return res.status(200).send({ status: true, data: data })
  }
  catch (err) {
    return res.status(500).send({ status: false, message: err.message })
  }
}
//______________________ Export the Modules ________________________________

module.exports = { createCollege, Getcollegedata }