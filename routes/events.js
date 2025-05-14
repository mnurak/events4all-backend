const express = require("express");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../midleware/fetchuser");
const Events = require("../Schemas/Events");
const Colleges = require("../Schemas/Colleges");
const router = express.Router();

const removeUndefined = (obj) => {
  for (let key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
};

// api for event details from college side
router.post(
  "/event/create",
  fetchuser,
  [
    body("title", "title is required").notEmpty(),
    body("date", "date is required").notEmpty(),
    body("registrationEndDate", "registrationEndDate is required").notEmpty(),
    body("maxParticipants", "maxParticipants is required").notEmpty(),
    body("description", "description is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    let success = false;
    const {
      title,
      date,
      registrationEndDate,
      description,
      maxParticipantsPerTeam,
      currentParticipants,
      maxParticipants,
      status,
    } = req.body;
    console.log(req.user);
    const collegeID = req.user.id;
    if (!collegeID || !title) {
      return res
        .status(400)
        .send({ success, error: "Invalid college or title" });
    }
    let event = await Events.findOne({ title, collegeID });
    console.log("evnets are " + event);
    if (event)
      return res
        .status(400)
        .send({ success, error: "event with the title already exist" });

    try {
      const input = removeUndefined({
        title,
        date,
        registrationEndDate,
        maxParticipantsPerTeam,
        description,
        currentParticipants,
        maxParticipants,
        status,
        collegeID,
      });
      console.log(input);
      event = await Events.create(input);
      success = true;
      res.json({ success, event });
    } catch (error) {
      console.log(error);
      res.status(400).send({ success, error });
    }
  }
);

//edit events
router.patch(
  "/event/update/:id",
  fetchuser,
  [
    body("title", "Title cannot be empty").optional().notEmpty(),
    body("date", "Date must be a valid ISO8601 date").optional().isISO8601(),
    body("registrationEndDate", "Registration end date must be valid")
      .optional()
      .isISO8601(),
    body("maxParticipants", "Max participants must be a positive number")
      .optional()
      .isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    let success = false;
    const {
      title,
      date,
      registrationEndDate,
      description,
      maxParticipantsPerTeam,
      currentParticipants,
      maxParticipants,
      status,
    } = req.body;

    const collegeID = req.user.id;

    let event = await Events.findById(req.params.id);
    if (!event)
      return res
        .status(400)
        .send({ success, error: "no records found of the specific event" });
    if (event && collegeID.toString() !== event.collegeID.toString())
      return res.status(400).send({ success, error: "Authentication denied" });

    if (title && title !== event.title) {
      const duplicate = await Events.findOne({ title, collegeID });

      if (duplicate)
        return res.status(400).send({
          success,
          error: "Another event with this title already exists",
        });
    }
    try {
      const input = removeUndefined({
        title,
        date,
        registrationEndDate,
        description,
        maxParticipantsPerTeam,
        currentParticipants,
        maxParticipants,
        status,
        collegeID,
      });
      event = await Events.findByIdAndUpdate(
        req.params.id,
        { $set: input },
        { new: true }
      );
      success = true;
      res.json({ success, event });
    } catch (error) {
      res.status(500).send({ success, error });
    }
  }
);

//get events
router.get("/event/events/get", async (req, res) => {
  let success = false;
  try {
    const events = await Events.find();
    res.send({ success: true, events });
  } catch (error) {
    res.status(500).send({ success, error });
  }
});

//get events for college
router.get("/event/college/get", fetchuser, async (req, res) => {
  let success = false;
  try {
    const collegeID = req.user.id;
    const college = await Colleges.findById(collegeID);
    if (!college)
      return res.status(403).send({ success, error: "authorization denied" });
    const events = await Events.find({ collegeID });
    res.send({ success: true, events });
  } catch (error) {
    res.status(500).send({ success, error });
  }
});

//delete an event

router.delete("/event/delete/:id", fetchuser, async (req, res) => {
  let success = false;
  try {
    let event = await Events.findById(req.params.id);
    const collegeID = req.user.id;

    if (!event)
      return res
        .status(404)
        .send({ success, error: "no records found of the specific event" });
    if (event && collegeID.toString() !== event.collegeID.toString())
      return res.status(403).send({ success, error: "Authentication denied" });

    event = await Events.findByIdAndDelete(req.params.id);
    success = true;
    res.send({ success, event });
  } catch (error) {
    res.status(500).send({ sucess, error });
  }
});

module.exports = router;
