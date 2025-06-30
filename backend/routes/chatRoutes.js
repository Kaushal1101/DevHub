const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // ⬅️ use require here
const {
  accessOrCreateChat,
  fetchMyChats,
} = require('../controller/chatController'); // ⬅️ use require here

router.post('/start', protect, accessOrCreateChat);
router.get('/', protect, fetchMyChats);

module.exports = router;
