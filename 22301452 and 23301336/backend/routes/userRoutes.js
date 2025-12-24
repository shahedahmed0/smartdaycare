const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { createStaff, getStaff, deleteUser } = require('../controllers/userController');

// Staff management (admin only)
router.get('/staff', protect, authorize('admin'), getStaff);
router.post('/staff', protect, authorize('admin'), createStaff);

// Generic user delete (admin only)
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
