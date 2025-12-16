import express from 'express';
import Staff from '../models/Staff.js';

const router = express.Router();

// Get all staff
router.get('/', async (req, res) => {
    try {
        const staff = await Staff.find({}).select('-password');
        res.json({
            success: true,
            staff
        });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch staff'
        });
    }
});

// Create new staff
router.post('/', async (req, res) => {
    try {
        const { serial, name, email, password, phone, role, experience, joiningDate } = req.body;
        
        // Check if staff already exists
        const existingStaff = await Staff.findOne({ $or: [{ serial }, { email }] });
        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'Staff with this serial or email already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const staff = new Staff({
            serial,
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            experience: parseInt(experience) || 0,
            joiningDate: joiningDate || new Date()
        });
        
        await staff.save();
        
        // Remove password from response
        const staffResponse = staff.toObject();
        delete staffResponse.password;
        
        res.status(201).json({
            success: true,
            message: 'Staff created successfully',
            staff: staffResponse
        });
    } catch (error) {
        console.error('Error creating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create staff'
        });
    }
});

// Update staff
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        
        const staff = await Staff.findByIdAndUpdate(
            id,
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
            staff
        });
    } catch (error) {
        console.error('Error updating staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update staff'
        });
    }
});

// Delete staff
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findByIdAndDelete(id);
        
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

// Staff login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const staff = await Staff.findOne({ email });
        if (!staff) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, staff.password);
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
            staff: staffResponse
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login'
        });
    }
});

// Assign children to staff
router.post('/:staffId/assign', async (req, res) => {
    try {
        const { staffId } = req.params;
        const { childIds } = req.body;
        
        const staff = await Staff.findByIdAndUpdate(
            staffId,
            { $addToSet: { assignedChildren: { $each: childIds } } },
            { new: true }
        ).select('-password');
        
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Children assigned successfully',
            staff
        });
    } catch (error) {
        console.error('Error assigning children:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign children'
        });
    }
});

export default router;