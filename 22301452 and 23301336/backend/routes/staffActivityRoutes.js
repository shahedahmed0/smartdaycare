const express = require("express");
const router = express.Router();

const {
  cooking,
  caregivingActivity,
  teacherActivity,
} = require("../controllers/staffActivityController");

router.post("/cooking", cooking);
router.post("/caregiving", caregivingActivity);
router.post("/teaching", teacherActivity);

module.exports = router;
