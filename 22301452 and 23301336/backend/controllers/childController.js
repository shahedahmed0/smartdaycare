const Child = require("../models/Child");

// @desc    Register a new child
// @route   POST /api/children
// @access  Private (Parent)
exports.registerChild = async (req, res) => {
  try {
    const childData = {
      ...req.body,
      parent: req.user._id,
    };

    const child = await Child.create(childData);

    res.status(201).json({
      success: true,
      message: "Child registered successfully",
      data: child,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all children for logged-in parent
// @route   GET /api/children
// @access  Private (Parent)
exports.getMyChildren = async (req, res) => {
  try {
    const children = await Child.find({ parent: req.user._id });

    res.status(200).json({
      success: true,
      count: children.length,
      data: children,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single child by ID
// @route   GET /api/children/:id
// @access  Private (Parent)
exports.getChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (child.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this child profile",
      });
    }

    res.status(200).json({
      success: true,
      data: child,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update child profile
// @route   PUT /api/children/:id
// @access  Private (Parent)
exports.updateChild = async (req, res) => {
  try {
    let child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (child.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this child profile",
      });
    }

    child = await Child.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Child profile updated successfully",
      data: child,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete child profile
// @route   DELETE /api/children/:id
// @access  Private (Parent)
exports.deleteChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (child.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this child profile",
      });
    }

    await child.deleteOne();

    res.status(200).json({
      success: true,
      message: "Child profile deleted successfully",
      data: {},
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add emergency contact
// @route   POST /api/children/:id/emergency-contacts
// @access  Private (Parent)
exports.addEmergencyContact = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (child.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    child.emergencyContacts.push(req.body);
    await child.save();

    res.status(200).json({
      success: true,
      message: "Emergency contact added successfully",
      data: child,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete emergency contact
// @route   DELETE /api/children/:id/emergency-contacts/:contactId
// @access  Private (Parent)
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);

    if (!child) {
      return res.status(404).json({
        success: false,
        message: "Child not found",
      });
    }

    if (child.parent.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    child.emergencyContacts.pull(req.params.contactId);
    await child.save();

    res.status(200).json({
      success: true,
      message: "Emergency contact deleted successfully",
      data: child,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//getallchild for admin
