const express = require('express');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const AuditEvent = require('../models/auditEvent.model');
const mongoose = require('mongoose');
const { requireUser } = require('../middleware/auth.middleware');
const { profileImageUpload } = require('../config/multer');
const { uploadSingleProfileImage } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

const router = express.Router();
const hasDigit = (value) => /\d/.test(String(value || ''));
const DEFAULT_USER_SETTINGS = Object.freeze({
    emailNotifications: true,
    inAppAlerts: true,
    marketing: false,
    twoFactor: true,
});

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

const getPublicUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(String(userId || ''))) {
            return sendError(res, { statusCode: 400, message: 'Invalid userId' });
        }

        const user = await User.findById(userId)
            .select('_id fullName department graduationYear bio trustScore isVerified verificationStatus profileImageUrl createdAt');

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        return sendSuccess(res, {
            message: 'Public user profile fetched successfully',
            data: {
                _id: user._id,
                fullName: user.fullName,
                department: user.department,
                graduationYear: user.graduationYear,
                bio: user.bio,
                trustScore: user.trustScore,
                isVerified: user.isVerified,
                verificationStatus: user.verificationStatus,
                profileImageUrl: user.profileImageUrl,
                createdAt: user.createdAt,
            },
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

        if (req.body.fullName !== undefined && hasDigit(req.body.fullName)) {
            return sendError(res, {
                statusCode: 400,
                message: 'fullName must contain text only (no numbers)',
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

const deleteCurrentUserAccount = async (req, res, next) => {
    try {
        const confirmation = String(req.body?.confirmation || '').trim().toUpperCase();
        if (confirmation !== 'DEACTIVATE') {
            return sendError(res, {
                statusCode: 400,
                message: 'Confirmation must be DEACTIVATE to remove account',
            });
        }

        const deletedUser = await User.findOneAndDelete({ _id: req.user._id });

        if (!deletedUser) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        return sendSuccess(res, {
            message: 'Account deactivated successfully',
            data: {
                userId: String(deletedUser._id),
                fullName: deletedUser.fullName,
                email: deletedUser.email,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const getCurrentUserSettings = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('settings');

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        return sendSuccess(res, {
            message: 'User settings fetched successfully',
            data: {
                ...DEFAULT_USER_SETTINGS,
                ...(user.settings || {}),
            },
        });
    } catch (error) {
        return next(error);
    }
};

const updateCurrentUserSettings = async (req, res, next) => {
    try {
        const allowedFields = ['emailNotifications', 'inAppAlerts', 'marketing', 'twoFactor'];
        const incoming = req.body || {};
        const attemptedFields = Object.keys(incoming);
        const invalidFields = attemptedFields.filter((field) => !allowedFields.includes(field));

        if (invalidFields.length > 0) {
            return sendError(res, {
                statusCode: 400,
                message: 'Invalid settings fields in patch request',
                extras: {
                    invalidFields,
                    allowedFields,
                },
            });
        }

        const user = await User.findById(req.user._id).select('settings');
        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        const nextSettings = {
            ...DEFAULT_USER_SETTINGS,
            ...(user.settings || {}),
        };

        allowedFields.forEach((field) => {
            if (incoming[field] !== undefined) {
                nextSettings[field] = Boolean(incoming[field]);
            }
        });

        user.settings = nextSettings;
        await user.save();

        return sendSuccess(res, {
            message: 'User settings updated successfully',
            data: nextSettings,
        });
    } catch (error) {
        return next(error);
    }
};

const getCurrentUserWatchlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'watchlist',
                populate: {
                    path: 'sellerId',
                    select: '_id fullName email trustScore isVerified verificationStatus emailVerified profileImageUrl',
                },
            });

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        const watchlist = Array.isArray(user.watchlist) ? user.watchlist.filter(Boolean) : [];

        return sendSuccess(res, {
            message: 'Watchlist fetched successfully',
            data: watchlist,
            extras: {
                count: watchlist.length,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const addCurrentUserWatchlistItem = async (req, res, next) => {
    try {
        const { productId } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(String(productId || ''))) {
            return sendError(res, { statusCode: 400, message: 'Valid productId is required' });
        }

        const product = await Product.findById(productId).select('_id');
        if (!product) {
            return sendError(res, { statusCode: 404, message: 'Product not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        const alreadyExists = (user.watchlist || []).some((itemId) => String(itemId) === String(product._id));
        if (!alreadyExists) {
            user.watchlist.push(product._id);
            await user.save();
        }

        const populatedUser = await User.findById(req.user._id).populate({
            path: 'watchlist',
            populate: {
                path: 'sellerId',
                select: '_id fullName email trustScore isVerified verificationStatus emailVerified profileImageUrl',
            },
        });

        return sendSuccess(res, {
            message: 'Item added to watchlist successfully',
            data: populatedUser?.watchlist || [],
            extras: {
                count: populatedUser?.watchlist?.length || 0,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const removeCurrentUserWatchlistItem = async (req, res, next) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(String(productId || ''))) {
            return sendError(res, { statusCode: 400, message: 'Valid productId is required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        user.watchlist = (user.watchlist || []).filter((itemId) => String(itemId) !== String(productId));
        await user.save();

        const populatedUser = await User.findById(req.user._id).populate({
            path: 'watchlist',
            populate: {
                path: 'sellerId',
                select: '_id fullName email trustScore isVerified verificationStatus emailVerified profileImageUrl',
            },
        });

        return sendSuccess(res, {
            message: 'Item removed from watchlist successfully',
            data: populatedUser?.watchlist || [],
            extras: {
                count: populatedUser?.watchlist?.length || 0,
            },
        });
    } catch (error) {
        return next(error);
    }
};

const clearCurrentUserWatchlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        user.watchlist = [];
        await user.save();

        return sendSuccess(res, {
            message: 'Watchlist cleared successfully',
            data: [],
        });
    } catch (error) {
        return next(error);
    }
};

const getCurrentUserTrustAnalytics = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('trustScore');

        if (!user) {
            return sendError(res, { statusCode: 404, message: 'User not found' });
        }

        const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);

        const events = await AuditEvent.find({
            entityType: 'user',
            entityId: user._id,
            eventType: { $in: ['trust.score_changed', 'admin.complaint_penalty_applied'] },
        })
            .populate('actorId', '_id fullName email role')
            .sort({ createdAt: -1 })
            .limit(limit);

        const timeline = events.map((event) => {
            const payload = event.payload || {};
            const fallbackPenalty = Number(payload.penalty || 0);
            const delta = Number.isFinite(payload.delta)
                ? payload.delta
                : fallbackPenalty > 0
                    ? -fallbackPenalty
                    : 0;

            return {
                id: String(event._id),
                eventType: event.eventType,
                timestamp: event.createdAt,
                delta,
                previousScore: payload.previousScore ?? payload.previousTrustScore ?? null,
                trustScore: payload.trustScore ?? payload.newTrustScore ?? null,
                reason: payload.reason || payload.context?.reason || 'Trust score updated',
                actor: event.actorId
                    ? {
                        _id: String(event.actorId._id || ''),
                        fullName: event.actorId.fullName || '',
                        email: event.actorId.email || '',
                        role: event.actorId.role || '',
                    }
                    : null,
            };
        });

        return sendSuccess(res, {
            message: 'Trust analytics fetched successfully',
            data: {
                currentTrustScore: user.trustScore,
                timeline,
            },
            extras: {
                count: timeline.length,
            },
        });
    } catch (error) {
        return next(error);
    }
};

router.post('/avatar', requireUser, profileImageUpload.single('profileImage'), uploadAvatar);
router.patch('/avatar', requireUser, profileImageUpload.single('profileImage'), replaceAvatar);
router.delete('/avatar', requireUser, deleteAvatar);
router.get('/public/:userId', getPublicUserProfile);
router.get('/profile', requireUser, getCurrentUserProfile);
router.get('/me', requireUser, getCurrentUserProfile);
router.patch('/profile', requireUser, updateCurrentUserProfile);
router.get('/settings', requireUser, getCurrentUserSettings);
router.patch('/settings', requireUser, updateCurrentUserSettings);
router.get('/watchlist', requireUser, getCurrentUserWatchlist);
router.post('/watchlist', requireUser, addCurrentUserWatchlistItem);
router.delete('/watchlist/:productId', requireUser, removeCurrentUserWatchlistItem);
router.delete('/watchlist', requireUser, clearCurrentUserWatchlist);
router.get('/trust-analytics', requireUser, getCurrentUserTrustAnalytics);
router.delete('/profile', requireUser, deleteCurrentUserAccount);

module.exports = router;
