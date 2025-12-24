const staffActivity = require("../models/StaffActivity");

exports.cooking = async (req, res) => {
  try {
    const { cookingtype, staffId } = req.body;
    const activity = await staffActivity.create({
      staffId,
      activityname: cookingtype,
    });
    res.status(200).json({ success: true, data: activity });
    console.log("Cooking activity started:", activity);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Error starting cooking activity:", error);
  }
};

exports.caregivingActivity = async (req, res) => {
  try {
    const { caregivingtype, staffId } = req.body;
    const activity = await staffActivity.create({
      staffId,
      activityname: caregivingtype,
    });
    res.status(200).json({ success: true, data: activity });
    console.log("Caregiving activity started:", activity);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Error starting caregiving activity:", error);
  }
};

exports.teacherActivity = async (req, res) => {
  try {
    const { teachingtype, staffId } = req.body;
    const activity = await staffActivity.create({
      staffId,
      activityname: teachingtype,
    });
    res.status(200).json({ success: true, data: activity });
    console.log("Teacher activity started:", activity);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.error("Error starting teacher activity:", error);
  }
};
