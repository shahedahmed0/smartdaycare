const User = require("../models/User");
const Child = require("../models/Child");
const Activity = require("../models/Activity");
const StaffActivity = require("../models/StaffActivity");

// @desc    Admin stats summary
// @route   GET /api/admin/stats
// @access  Private (admin)
exports.getStats = async (req, res) => {
  try {
    const [children, staff, activities] = await Promise.all([
      Child.countDocuments({}),
      User.countDocuments({ role: "staff" }),
      Activity.countDocuments({}),
    ]);

    res.status(200).json({
      success: true,
      data: { children, staff, activities },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch stats",
    });
  }
};

exports.getAllChildren = async (req, res) => {
  try {
    const children = await Child.find({});
    res.status(200).json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch children",
    });
  }
};

exports.assignCaregiver = async (req, res) => {
  const { childId, caregiverId } = req.body;

  try {
    // Find child
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: "Child not found",
      });
    }

    // Find caregiver
    const caregiver = await User.findById(caregiverId);
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        error: "Caregiver not found",
      });
    }

    // Ensure user is actually a caregiver
    if (caregiver.role !== "staff" || caregiver.staffRole !== "caregiver") {
      return res.status(400).json({
        success: false,
        error: "Selected user is not a caregiver",
      });
    }

    // Assign caregiver to child
    child.caregiver = caregiver._id;
    await child.save();

    // Add child to caregiver's childList if not already added
    if (!caregiver.childList.includes(child._id)) {
      caregiver.childList.push(child._id);
      await caregiver.save();
    }

    res.status(200).json({
      success: true,
      message: "Caregiver assigned successfully",
      data: {
        childId: child._id,
        caregiverId: caregiver._id,
      },
    });
  } catch (error) {
    console.error("Error assigning caregiver:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign caregiver",
    });
  }
};
exports.updateChildCaregiver = async (req, res) => {
  const { childId } = req.params;
  const { caregiverId } = req.body; // can be a valid ID or null/empty to unassign

  try {
    // Find child
    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({
        success: false,
        error: "Child not found",
      });
    }

    // If caregiverId is provided and not empty, validate it
    let newCaregiver = null;
    if (caregiverId && caregiverId !== "null" && caregiverId !== "") {
      const caregiver = await User.findById(caregiverId);
      if (!caregiver) {
        return res.status(404).json({
          success: false,
          error: "Caregiver not found",
        });
      }
      if (caregiver.role !== "staff" || caregiver.staffRole !== "caregiver") {
        return res.status(400).json({
          success: false,
          error: "Selected user is not a caregiver",
        });
      }
      newCaregiver = caregiver;
    }

    // Remove child from previous caregiver's childList (if any)
    if (child.caregiver) {
      await User.findByIdAndUpdate(child.caregiver, {
        $pull: { childList: child._id },
      });
    }

    // Assign new caregiver (or null to unassign)
    child.caregiver = newCaregiver ? newCaregiver._id : null;
    await child.save();

    // Add child to new caregiver's childList (if assigned)
    if (newCaregiver) {
      await User.findByIdAndUpdate(newCaregiver._id, {
        $addToSet: { childList: child._id },
      });
    }

    res.status(200).json({
      success: true,
      message: newCaregiver
        ? "Caregiver updated successfully"
        : "Caregiver removed successfully",
      data: {
        childId: child._id,
        caregiverId: newCaregiver ? newCaregiver._id : null,
      },
    });
  } catch (error) {
    console.error("Error updating caregiver:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update caregiver",
    });
  }
};

exports.getStaffRecord = async (req, res) => {
  try {
    const staffRecords = await StaffActivity.find({});
    res.status(200).json({
      success: true,
      data: staffRecords,
    });
  } catch (error) {
    console.error("Error fetching staff records:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch staff records",
    });
  }
};
