const express = require('express');
const User = require('../models/user.model');
const { requireUser } = require('../middleware/auth.middleware');
const { profileImageUpload } = require('../config/multer');
const { uploadSingleProfileImage } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();

const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, { statusCode: 400, message: 'Profile image is required' });
        }

        const uploaded = await uploadSingleProfileImage(req.file);
        const user = await User.findById(req.user._id);

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        user.profileImageUrl = uploaded.secureUrl;
        await user.save();

        return sendSuccess(res, {
            message: 'Avatar uploaded successfully',
            data: {
                profileImageUrl: user.profileImageUrl,
            },
        });
    } catch (error) {
        return next(error);
    }
};

router.post('/avatar', requireUser, profileImageUpload.single('profileImage'), uploadAvatar);

router.get('/profile', requireUser, async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        return sendSuccess(res, {
            message: 'User profile fetched successfully',
            data: User.sanitizeUser(user),
        });
    } catch (error) {
        return next(error);
    }
});

module.exports = router;
