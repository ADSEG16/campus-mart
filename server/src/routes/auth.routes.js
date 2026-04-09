const express = require('express');
const {
	signup,
	login,
	verifyEmail,
	getMe,
	uploadStudentId,
	uploadProfileImage,
	completeProfile,
	forgotPassword,
	resetPassword,
} = require('../controllers/auth.controller');
const { requireUser } = require('../middleware/auth.middleware');
const { profileImageUpload, studentIdUpload } = require('../config/multer');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', requireUser, verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', requireUser, getMe);
router.post('/upload-student-id', requireUser, studentIdUpload.single('studentId'), uploadStudentId);
router.post('/upload-profile-image', requireUser, profileImageUpload.single('profileImage'), uploadProfileImage);
router.patch('/complete-profile', requireUser, completeProfile);

module.exports = router;

