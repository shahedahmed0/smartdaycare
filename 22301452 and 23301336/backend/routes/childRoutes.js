const express = require('express');
const router = express.Router();
const {
  registerChild,
  getMyChildren,
  getChild,
  updateChild,
  deleteChild,
  addEmergencyContact,
  deleteEmergencyContact
} = require('../controllers/childController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(registerChild)
  .get(getMyChildren);

router.route('/:id')
  .get(getChild)
  .put(updateChild)
  .delete(deleteChild);

router.route('/:id/emergency-contacts')
  .post(addEmergencyContact);

router.route('/:id/emergency-contacts/:contactId')
  .delete(deleteEmergencyContact);

module.exports = router;