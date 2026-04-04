const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { comparePassword } = require('../utils/hashPassword');
const { uploadSingleProfileImage, uploadStudentIdDocument } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

const JWT_EXPIRES_IN = '7d';
const SCHOOL_EMAIL_DOMAIN = '@st.ug.edu.gh';

const isSchoolEmail = (email) => {
	if (!email || typeof email !== 'string') {
		return false;
	}

	return email.trim().toLowerCase().endsWith(SCHOOL_EMAIL_DOMAIN);
};

const signAuthToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const serializeUser = (userDoc) => {
	if (typeof User.sanitizeUser === 'function') {
		const sanitized = User.sanitizeUser(userDoc);
		if (sanitized) {
			return sanitized;
		}
	}

	return userDoc;
};

const signup = async (req, res, next) => {
	try {
		const {
			fullName,
			department,
			email,
			graduationYear,
			password,
			confirmPassword,
		} = req.body;

		if (!fullName || !department || !email || !graduationYear || !password || !confirmPassword) {
			return sendError(res, { statusCode: 400, message: 'All signup fields are required' });
		}

		if (!isSchoolEmail(email)) {
			return sendError(res, { statusCode: 400, message: 'Email must end with @st.ug.edu.gh' });
		}

		if (password !== confirmPassword) {
			return sendError(res, { statusCode: 400, message: 'Passwords do not match' });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return sendError(res, { statusCode: 409, message: 'Email already in use' });
		}

		const user = await User.create({
			fullName,
			department,
			email: email.toLowerCase(),
			graduationYear,
			password,
		});

		const token = signAuthToken(user._id);

		return sendSuccess(res, {
			statusCode: 201,
			message: 'Signup successful',
			data: serializeUser(user),
			extras: { token },
		});
	} catch (error) {
		return next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return sendError(res, { statusCode: 400, message: 'Email and password are required' });
		}

		if (!isSchoolEmail(email)) {
			return sendError(res, { statusCode: 400, message: 'Email must end with @st.ug.edu.gh' });
		}

		const userQuery = User.findOne({ email: email.toLowerCase() });
		const user = typeof userQuery?.select === 'function'
			? await userQuery.select('+password')
			: await userQuery;

		if (!user) {
			return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
		}

		if (!user.password) {
			return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
		}

		const isValid = await comparePassword(password, user.password);
		if (!isValid) {
			return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
		}

		const token = signAuthToken(user._id);

		return sendSuccess(res, {
			message: 'Login successful',
			data: serializeUser(user),
			extras: { token },
		});
	} catch (error) {
		return next(error);
	}
};

const getMe = async (req, res, next) => {
	try {
		return sendSuccess(res, {
			message: 'Current user fetched successfully',
			data: serializeUser(req.user),
		});
	} catch (error) {
		return next(error);
	}
};

const uploadStudentId = async (req, res, next) => {
	try {
		if (!req.file) {
			return sendError(res, { statusCode: 400, message: 'Student ID file is required' });
		}

		const uploaded = await uploadStudentIdDocument(req.file);
		req.user.studentIdUrl = uploaded.secureUrl;
		req.user.verificationStatus = 'pending';
		await req.user.save();

		return sendSuccess(res, {
			message: 'Student ID uploaded successfully',
			data: {
				studentIdUrl: req.user.studentIdUrl,
				verificationStatus: req.user.verificationStatus,
			},
		});
	} catch (error) {
		return next(error);
	}
};

const uploadProfileImage = async (req, res, next) => {
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
			message: 'Profile image uploaded successfully',
      data: {
        profileImageUrl: user.profileImageUrl,
      },
    });

  } catch (error) {
		return next(error);
  }
};


const completeProfile = async (req, res, next) => {
	try {
		const { bio } = req.body;

		if (bio !== undefined) {
			req.user.bio = bio;
		}

		await req.user.save();

		return sendSuccess(res, {
			message: 'Profile updated successfully',
			data: serializeUser(req.user),
		});
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	signup,
	login,
	getMe,
	uploadStudentId,
	uploadProfileImage,
	completeProfile,
};

