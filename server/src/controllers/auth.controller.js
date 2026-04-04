const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { comparePassword } = require('../utils/hashPassword');
const { uploadSingleProfileImage, uploadStudentIdDocument } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

const JWT_EXPIRES_IN = '7d';
const SCHOOL_EMAIL_DOMAIN = '@st.ug.edu.gh';
const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

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

const getEmailVerificationTokenHash = token => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

const createEmailVerificationToken = () => {
	const token = crypto.randomBytes(32).toString('hex');

	return {
		token,
		tokenHash: getEmailVerificationTokenHash(token),
		expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
	};
};

const createSmtpTransport = () => {
	const host = process.env.SMTP_HOST;
	const port = Number.parseInt(process.env.SMTP_PORT, 10);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || Number.isNaN(port) || !user || !pass) {
		return null;
	}

	let nodemailer;
	try {
		nodemailer = require('nodemailer');
	} catch (error) {
		return null;
	}

	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: {
			user,
			pass,
		},
	});
};

const sendEmailVerificationMessage = async ({ recipientEmail, token }) => {
	const transport = createSmtpTransport();

	if (!transport) {
		return { skipped: true };
	}

	const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
	const verifyUrl = `${baseUrl.replace(/\/$/, '')}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

	await transport.sendMail({
		from: process.env.SMTP_FROM || process.env.SMTP_USER,
		to: recipientEmail,
		subject: 'Verify your Campus Mart account',
		text: `Welcome to Campus Mart. Verify your account: ${verifyUrl}`,
		html: `<p>Welcome to Campus Mart.</p><p>Verify your account: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
	});

	return { skipped: false };
};

const ensureEmailVerified = user => {
	return Boolean(user && user.emailVerified);
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

		const { token: verificationToken, tokenHash, expiresAt } = createEmailVerificationToken();
		user.emailVerificationTokenHash = tokenHash;
		user.emailVerificationTokenExpiresAt = expiresAt;

		if (typeof user.save === 'function') {
			await user.save();
		} else {
			await User.findByIdAndUpdate(user._id, {
				emailVerificationTokenHash: tokenHash,
				emailVerificationTokenExpiresAt: expiresAt,
			});
		}

		await sendEmailVerificationMessage({
			recipientEmail: user.email,
			token: verificationToken,
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

		if (!user.emailVerified) {
			return sendError(res, {
				statusCode: 403,
				message: 'Email is not verified. Please verify your email before logging in',
			});
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

const verifyEmail = async (req, res, next) => {
	try {
		const token = req.query.token || req.body.token;

		if (!token || typeof token !== 'string') {
			return sendError(res, { statusCode: 400, message: 'Verification token is required' });
		}

		const tokenHash = getEmailVerificationTokenHash(token.trim());
		const user = await User.findOne({
			emailVerificationTokenHash: tokenHash,
			emailVerificationTokenExpiresAt: { $gt: new Date() },
		});

		if (!user) {
			return sendError(res, { statusCode: 400, message: 'Verification token is invalid or expired' });
		}

		user.emailVerified = true;
		user.emailVerifiedAt = new Date();
		user.emailVerificationTokenHash = null;
		user.emailVerificationTokenExpiresAt = null;
		await user.save();

		return sendSuccess(res, {
			message: 'Email verified successfully',
			data: serializeUser(user),
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
		if (!ensureEmailVerified(req.user)) {
			return sendError(res, {
				statusCode: 403,
				message: 'Verify your email before performing this action',
			});
		}

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
		if (!ensureEmailVerified(req.user)) {
			return sendError(res, {
				statusCode: 403,
				message: 'Verify your email before performing this action',
			});
		}

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
		if (!ensureEmailVerified(req.user)) {
			return sendError(res, {
				statusCode: 403,
				message: 'Verify your email before performing this action',
			});
		}

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
	verifyEmail,
	getMe,
	uploadStudentId,
	uploadProfileImage,
	completeProfile,
};

