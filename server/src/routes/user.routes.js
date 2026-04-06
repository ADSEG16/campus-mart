const express = require('express');
const User = require('../models/user.model');
const { requireUser } = require('../middleware/auth.middleware');
const { profileImageUpload } = require('../config/multer');
const { uploadSingleProfileImage } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
const hasDigit = (value) => /\d/.test(String(value || ''));

const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, { statusCode: 400, message: 'Profile image is required' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        if (user.profileImageUrl) {
            return sendError(res, {
                statusCode: 409,
                message: 'Profile image already exists. Use PATCH /api/users/avatar to replace it or DELETE /api/users/avatar to remove it.',
            });
        }

        const uploaded = await uploadSingleProfileImage(req.file);

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

const replaceAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendError(res, { statusCode: 400, message: 'Profile image is required' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        if (!user.profileImageUrl) {
            return sendError(res, {
                statusCode: 400,
                message: 'No existing profile image found. Use POST /api/users/avatar first.',
            });
        }

        const uploaded = await uploadSingleProfileImage(req.file);
        user.profileImageUrl = uploaded.secureUrl;
        await user.save();

        return sendSuccess(res, {
            message: 'Avatar replaced successfully',
            data: {
                profileImageUrl: user.profileImageUrl,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const deleteAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        if (!user.profileImageUrl) {
            return sendError(res, { statusCode: 400, message: 'No profile image to delete' });
        }

        user.profileImageUrl = null;
        await user.save();

        return sendSuccess(res, {
            message: 'Avatar deleted successfully',
            data: {
                profileImageUrl: user.profileImageUrl,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const getCurrentUserProfile = async (req, res, next) => {
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
};

const updateCurrentUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        const userUpdatableFields = ['fullName', 'department', 'graduationYear', 'bio'];
        const adminOnlyFields = [
            'role',
            'flagged',
            'trustScore',
            'verificationStatus',
            'isVerified',
            'emailVerified',
            'emailVerifiedAt',
        ];
        const allowedFields = req.user.role === 'admin'
            ? [...userUpdatableFields, ...adminOnlyFields]
            : userUpdatableFields;
        const attemptedFields = Object.keys(req.body || {});
        const unauthorizedFields = attemptedFields.filter((field) => !allowedFields.includes(field));

        if (unauthorizedFields.length > 0) {
            return sendError(res, {
                statusCode: 403,
                message: 'Unauthorized profile fields in patch request',
                extras: {
                    unauthorizedFields,
                    allowedFields,
                },
            });
        }

        if (
            (req.body.fullName !== undefined && hasDigit(req.body.fullName)) ||
            (req.body.department !== undefined && hasDigit(req.body.department))
        ) {
            return sendError(res, {
                statusCode: 400,
                message: 'fullName and department must contain text only (no numbers)',
            });
        }

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        return sendSuccess(res, {
            message: 'User profile updated successfully',
            data: User.sanitizeUser(user),
        });
    } catch (error) {
        return next(error);
    }
};

router.post('/avatar', requireUser, profileImageUpload.single('profileImage'), uploadAvatar);
router.patch('/avatar', requireUser, profileImageUpload.single('profileImage'), replaceAvatar);
router.delete('/avatar', requireUser, deleteAvatar);
router.get('/profile', requireUser, getCurrentUserProfile);
router.get('/me', requireUser, getCurrentUserProfile);
router.patch('/profile', requireUser, updateCurrentUserProfile);

module.exports = router;
