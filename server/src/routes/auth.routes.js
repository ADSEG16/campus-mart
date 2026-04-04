const express = require('express');
const {
	signup,
	login,
	verifyEmail,
	getMe,
	uploadStudentId,
	uploadProfileImage,
	completeProfile,
} = require('../controllers/auth.controller');
const { requireUser } = require('../middleware/auth.middleware');
const { profileImageUpload, studentIdUpload } = require('../config/multer');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/verify-email', verifyEmail);

router.get('/me', requireUser, getMe);
router.post('/upload-student-id', requireUser, studentIdUpload.single('studentId'), uploadStudentId);
router.post('/upload-profile-image', requireUser, profileImageUpload.single('profileImage'), uploadProfileImage);
router.patch('/complete-profile', requireUser, completeProfile);

module.exports = router;

