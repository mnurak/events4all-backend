const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../midleware/fetchuser");
const Events = require("../Schemas/Events");
const Registrations = require("../Schemas/Registrations");
const Students = require("../Schemas/Students");
const Colleges = require("../Schemas/Colleges");
const router = express.Router();

// api for event registration from student side
router.post(
  "/registration/create/:id",
  fetchuser,
  [
    body("team_name", "team name is required").isAscii(),
    body("participants", "atleast one participent is required")
      .isArray({ min: 1 })
      .custom((arr) => {
        if (!arr.every((p) => p.name && p.usn)) {
          throw new Error("Each participant must have a name and a USN");
        }
        return true;
      }),
    body(
      "participants.*.name",
      "name must consist of at least 3 letters"
    ).isLength({ min: 3 }),
    body(
      "participants.*.usn",
      "only letters and numbers are vallid no spaces in between"
    ).matches(/^[A-Z0-9]+$/i),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
      const eventID = req.params.id;

      const event = await Events.findById(eventID);
      if (!event)
        return res.status(400).send({ success, error: "no events were found" });
      const student = await Students.findById(req.user.id);
      if (!student)
        return res
          .status(400)
          .send({ success, error: "invalid authentication token" });

      let reg = await Registrations.findOne({
        student_id: req.user.id,
        event_id: req.params.id,
      });

      if (reg)
        return res
          .status(400)
          .send({ success, error: "already registered to the event" });

      const { team_name } = req.body;
      reg = await Registrations.findOne({ team_name });
      if (reg)
        return res
          .status(400)
          .send({ success, error: "Team name already exist" });

      if (req.body.participants.length > event.maxParticipantsPerTeam)
        return res.status(400).send({
          success,
          error: "Number of participants exceeds the allowed limit",
        });
      // const validator = require("validator");

      // req.body.participants = req.body.participants.map((p) => ({
      //   name: validator.escape(p.name.trim()),
      //   usn: validator.escape(p.usn.trim()),
      // }));

      reg = await Registrations.create({
        team_name: req.body.team_name,
        participants: req.body.participants,
        student_id: req.user.id,
        event_id: eventID,
      });
      success = true;
      res.send({ success, reg });
    } catch (error) {
      console.log(error);
      res.status(500).send({ success, error });
    }
  }
);

//get registrations of the student done for diffrent event --> by taking his id
router.get("/registration/student/get", fetchuser, async (req, res) => {
  let success = false;
  try {
    const student = await Students.findById(req.user.id);
    if (!student)
      return res
        .status(400)
        .send({ success, error: "invalid authentication token" });
    const regs = await Registrations.find({ student_id: student._id });
    if (!regs || regs.length === 0)
      return res.status(404).send({ success, error: "no records found " });
    res.send({ success: true, regs });
  } catch (error) {
    res.status(500).send({ success, error: "Internal server error" });
  }
});

//to edit a registratioon form of an student
router.patch("/registration/student/edit/:id", fetchuser, async (req, res) => {
  let success = false;

  try {
    const student = await Students.findById(req.user.id);
    if (!student)
      return res
        .status(400)
        .send({ success, error: "invalid authentication token" });
    let reg = await Registrations.findById(req.params.id);
    if (!reg)
      return res
        .status(400)
        .send({ success, error: "please enter valid details" });
    if (req.user.id !== reg.student_id.toString())
      return res.status(404).send({ success, error: "invalid authentication" });
    const { participants, team_name } = req.body;
    const input = {
      participants,
      team_name,
    };
    reg = await Registrations.findByIdAndUpdate(
      req.params.id,
      { $set: input },
      { new: true }
    );
    success = true;
    res.send({ success, reg });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success, error: "Internal server error" });
  }
});

//get registrations initiated for a specific college --> by taking college id
router.get("/registration/college/get", fetchuser, async (req, res) => {
  let success = false;
  try {
    const college = await Colleges.findById(req.user.id);
    if (!college)
      return res
        .status(400)
        .send({ success, error: "invalid authentication token" });
    const events = await Events.find({ collegeID: college._id });
    if (!events || events.length === 0)
      return res.status(404).send({ success, error: "no records found " });
    const allRegs = await Promise.all(
      events.map((event) => Registrations.find({ event_id: event._id }))
    );

    const regs = allRegs.flat();

    res.send({ success: true, regs });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success, error });
  }
});

//delete the regestration --> by taking in the registration id from the front end
router.delete("/registration/delete/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const student = await Students.findById(req.user.id);
    if (!student)
      return res
        .status(400)
        .send({ success, error: "invalid authentication token" });

    let reg = await Registrations.findById(req.params.id);

    if (!reg)
      return res
        .status(400)
        .send({ success, error: "please enter valid details" });

    if (req.user.id !== reg.student_id.toString())
      return res.status(404).send({ success, error: "invalid authentication" });

    const user = await Registrations.findByIdAndDelete(reg._id);
    success = true;
    res.send({ success, user, message: "Registration successfyl" });
  } catch (error) {
    res.status(500).send({ success, error: "Internal server error" });
  }
});

// to approve or reject the registration from college side
router.patch("/registration/approval/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    const register = await Registrations.findById(req.params.id);
    if (!register)
      return res.status(404).send({ success, error: "No Registration found" });
    const event = await Events.findById(register.event_id);
    console.log("\n\nThese is the event :\n\n");
    console.log(event);
    console.log(req.user.id);
    if (req.user.id !== event.collegeID.toString())
      return res.status(404).send({ success, error: "invalid authentication" });
    if (typeof req.body.approval !== "boolean") {
      return res
        .status(400)
        .send({ success, error: "Approval must be a boolean value" });
    }
    const verification = req.body.approval === true ? "verified" : "rejected";

    console.log(verification);
    reg = await Registrations.findByIdAndUpdate(
      req.params.id,
      { $set: { verification } },
      { new: true }
    );
    console.log(reg);
    res.send({ success: true, reg });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
