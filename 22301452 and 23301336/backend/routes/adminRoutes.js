const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const {
  getStats,
  getAllChildren,
  assignCaregiver,
  updateChildCaregiver,
  getStaffRecord,
} = require("../controllers/adminController");

router.get("/stats", protect, authorize("admin"), getStats);
router.get("/getallchildren", protect, authorize("admin"), getAllChildren);
router.post("/assign-caregiver", protect, authorize("admin"), assignCaregiver);
router.put(
  "/assign-caregiver/:childId",
  protect,
  authorize("admin"),
  updateChildCaregiver
);
router.get("/staff-record", protect, authorize("admin"), getStaffRecord);
module.exports = router;
