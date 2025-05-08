require("dotenv").config();
const express = require("express");
const Colleges = require("../Schemas/Colleges");
const Students = require("../Schemas/Students");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const LoginLogs = require("../Schemas/LoginLogs");
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_TIMEOUT = process.env.JWT_EXPIRATION

//route 1: college sign up --> new college db creation
router.post(
  "/college/signup",
  [
    body("email", "enter a valid email").isEmail(),
    body("name", "enter a valid name").isLength({ min: 3 }),
    body("password", "Enter a password of at least 8 characters").isLength({
      min: 8,
    }),
    body(
      "phoneNumber",
      "enter a valid phone number without the country code"
    ).isMobilePhone(),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty)
      return res.status(400).json({ success, error: errors.array() });

    try {
      //assuming the body is structured in the json of required type
      //{name, email, password, phoneNumber, address}
      let user = await Colleges.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "User already exists" });
      }
      const salt = await bcrypt.genSalt(14);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await Colleges.create({ ...req.body, password: secPass });

      const ID = { user: { id: user.id } };
      const authToken = jwt.sign(ID, JWT_SECRET, { expiresIn: JWT_TIMEOUT });
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      res.status(500).send({ success, error: error.message });
    }
  }
);

//route 2: college login
router.post(
  "/college/login",
  [
    body("email", "enter a valid email").isEmail(),
    body("password", "Enter a password of at least 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false;

    const ipAddress =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      const userAgent = req.headers['user-agent'];

    const errors = validationResult(req);
    if (!errors.isEmpty)
      return res.status(400).json({ success, errors: errors.array() });
    const { email, password } = req.body;

    try {
      //assuming the body is structured in the json of required type
      //{name, email}
      let user = await Colleges.findOne({ email });
      if (!user) {
        const loginLog = new LoginLogs({
          type: "college",
          email,
          message: "No user were found",
          ipAddress,
          userAgent
        });
        await loginLog.save();
        return res.status(400).json({ success, error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        const loginLog = new LoginLogs({
          type: "college",
          id: user._id,
          email,
          message: "Entered incorrect password",
          ipAddress,
          userAgent
        });
        await loginLog.save();
        return res.status(400).json({ success, error: "Invalid credentials" });
      }
      // console.log(user);
      const ID = { user: { id: user.id } };
      const authToken = jwt.sign(ID, JWT_SECRET, { expiresIn: JWT_TIMEOUT });
      success = true;
      const loginLog = new LoginLogs({
        type: "college",
        id: user._id,
        email,
        ipAddress,
        userAgent,
        status: "success",
      });
      await loginLog.save();
      res.json({ success, authToken });
    } catch (error) {
      const loginLog = new LoginLogs({
        type: "college",
        id: "",
        email,
        message:error.message.toString(),
        ipAddress,
        userAgent
      });
      await loginLog.save()
      console.error(error.message);
      res.status(500).send("error has occured");
    }
  }
);

//student sign up --> new student db
router.post(
  "/student/signup",
  [
    body("email", "enter a valid email").isEmail(),
    body("name", "enter a valid name").isLength({ min: 3 }),
    body("password", "Enter a password of at least 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty)
      return res.status(400).json({ success, errors: errors.array() });

    try {
      // assuming the body is structured in the json of required type
      const { name, email, password, college } = req.body;
      let user = await Students.findOne({ email: req.body.email });

      if (user)
        return res.status(400).json({ success, error: "User already exists" });

      let collegeRecord = await Colleges.findOne({ name: college });

      if (!collegeRecord)
        return res.status(400).json({
          success,
          error: "No college found, please enter a valid college name",
        });

      let collegeID = collegeRecord._id;

      const salt = await bcrypt.genSalt(14);
      const secPass = await bcrypt.hash(password, salt);

      user = await Students.create({
        name,
        email,
        password: secPass,
        collegeID,
      });
      // console.log(user)
      const ID = { user: { id: user.id } };
      const authToken = jwt.sign(ID, JWT_SECRET, { expiresIn: JWT_TIMEOUT });

      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("An Internal error has occurred");
    }
  }
);

router.post(
  "/student/login",
  [
    body("email", "enter a valid email").isEmail(),
    body("password", "Enter a password of at least 8 characters").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    let success = false;
    const ipAddress =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    const userAgent = req.headers['user-agent'];

    const errors = validationResult(req);
    if (!errors.isEmpty)
      return res.status(400).json({ success, errors: errors.array() });

    try {
      //assuming the body is structured in the json of required type
      //{name, email}
      const { email, password } = req.body;
      let user = await Students.findOne({ email });
      if (!user){
        const loginLog = new LoginLogs({
          type: "student",
          id: "",
          email,
          message:'no user found',
          ipAddress,
          userAgent
        });
        await loginLog.save()
        return res.status(400).json({ success, error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare){
        const loginLog = new LoginLogs({
          type: "student",
          id: user._id,
          email,
          message:'Entered incorrect password',
          ipAddress,
          userAgent
        });
        await loginLog.save()
        return res.status(400).json({ success, error: "Invalid credentials" });
      }
      // console.log(user);
      const ID = { user: { id: user.id } };
      const authToken = jwt.sign(ID, JWT_SECRET, { expiresIn: JWT_TIMEOUT });
      success = true;
      const loginLog = new LoginLogs({
        type: "student",
        id: user._id,
        email,
        ipAddress,
        userAgent,
        status:'success'
      });
      await loginLog.save()
      res.json({ success, authToken });
    } catch (error) {
      const loginLog = new LoginLogs({
        type: "student",
        email,
        message:error.message,
        ipAddress,
        userAgent
      });
      await loginLog.save()
      console.error(error.message);
      res.status(500).send("error has occured");
    }
  }
);

module.exports = router;
