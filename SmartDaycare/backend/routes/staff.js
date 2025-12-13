// backend/routes/staff.js - MODULE 2, FEATURE 1
const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// CREATE Staff - Admin registers staff
router.post('/', async (req, res) => {
    try {
        const { serial, name, email, password, phone, role, experience, joiningDate } = req.body;

        // Validate required fields
        if (!serial || !name || !email || !password || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check for existing staff with same serial or email
        const existingStaff = await Staff.findOne({
            $or: [{ serial }, { email }]
        });

        if (existingStaff) {
            return res.status(409).json({
                success: false,
                message: 'Staff with this ID or email already exists'
            });
        }

        // Create new staff
        const staff = new Staff({
            serial,
            name,
            email,
            password: password || 'default123',
            phone,
            role,
            experience: experience ? parseInt(experience) : 0,
                                joiningDate: joiningDate || new Date()
        });

        await staff.save();

        // Remove password from response
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.status(201).json({
            success: true,
            message: 'Staff created successfully',
            data: staffResponse
        });

    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create staff',
            error: error.message
        });
    }
});

// READ All Staff - Admin views staff list
router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find({})
        .select('-password')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: staff.length,
            data: staff
        });

    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff'
        });
    }
});

// READ Single Staff
router.get('/:id', async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id).select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        res.json({
            success: true,
            data: staff
        });

    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff'
        });
    }
});

// UPDATE Staff
router.put('/:id', async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow password update through this route
        if (updates.password) {
            delete updates.password;
        }

        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff updated successfully',
            data: staff
        });

    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update staff'
        });
    }
});

// DELETE Staff
router.delete('/:id', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        res.json({
            success: true,
            message: 'Staff deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete staff'
        });
    }
});

// Staff Login - For future authentication
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find staff by email
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isValidPassword = await staff.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Remove password from response
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        res.json({
            success: true,
            message: 'Login successful',
            data: staffResponse
        });

    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login'
        });
    }
});

module.exports = router;
