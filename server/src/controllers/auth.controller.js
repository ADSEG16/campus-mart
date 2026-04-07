const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { comparePassword } = require('../utils/hashPassword');
const { uploadSingleProfileImage, uploadStudentIdDocument } = require('../services/product.service');
const { sendSuccess, sendError } = require('../utils/response');

const JWT_EXPIRES_IN = '24h';
const SCHOOL_EMAIL_DOMAIN = '@st.ug.edu.gh';
const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 1 * 60 * 60 * 1000; // 1 hour
const DEFAULT_SMTP_FROM = 'CampusMart <no-reply@st.ug.edu.gh>';

const parseBooleanEnv = (value, fallback = false) => {
	if (typeof value !== 'string') {
		return fallback;
	}

	const normalized = value.trim().toLowerCase();
	if (['1', 'true', 'yes', 'on'].includes(normalized)) {
		return true;
	}

	if (['0', 'false', 'no', 'off'].includes(normalized)) {
		return false;
	}

	return fallback;
};

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

const getPasswordResetTokenHash = token => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

const createPasswordResetToken = () => {
	const token = crypto.randomBytes(32).toString('hex');

	return {
		token,
		tokenHash: getPasswordResetTokenHash(token),
		expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
	};
};

const createSmtpTransport = () => {
	const host = process.env.SMTP_HOST;
	const port = Number.parseInt(process.env.SMTP_PORT, 10);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;

	if (!host || Number.isNaN(port) || !user || !pass) {
		const error = new Error('SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
		error.statusCode = 500;
		throw error;
	}

	let nodemailer;
	try {
		nodemailer = require('nodemailer');
	} catch (error) {
		const moduleError = new Error('Nodemailer is not available. Install dependencies and restart the server.');
		moduleError.statusCode = 500;
		throw moduleError;
	}

	const secure = parseBooleanEnv(process.env.SMTP_SECURE, port === 465);
	const rejectUnauthorized = parseBooleanEnv(process.env.SMTP_REJECT_UNAUTHORIZED, true);
	const requireTLS = parseBooleanEnv(process.env.SMTP_REQUIRE_TLS, port === 587);

	return nodemailer.createTransport({
		host,
		port,
		secure,
		requireTLS,
		auth: {
			user,
			pass,
		},
		...(rejectUnauthorized ? {} : { tls: { rejectUnauthorized: false } }),
	});
};

const resolveSmtpFrom = () => {
	const configuredFrom = (process.env.SMTP_FROM || '').trim();
	const smtpUser = (process.env.SMTP_USER || '').trim();

	const fallbackSender = smtpUser ? `CampusMart <${smtpUser}>` : DEFAULT_SMTP_FROM;

	if (!configuredFrom) {
		return fallbackSender;
	}

	if (configuredFrom.includes('<') && configuredFrom.includes('>')) {
		return configuredFrom;
	}

	const emailMatch = configuredFrom.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
	if (!emailMatch) {
		return fallbackSender;
	}

	const email = String(emailMatch[0]).trim();
	if ((email.match(/@/g) || []).length !== 1) {
		return fallbackSender;
	}

	const displayName = configuredFrom
		.replace(email, '')
		.replace(/[<>\"]/g, '')
		.replace(/[:;,]+$/g, '')
		.trim();

	return displayName ? `${displayName} <${email}>` : `CampusMart <${email}>`;
};

const sendEmailVerificationMessage = async ({ recipientEmail, recipientFullName, token }) => {
	const transport = createSmtpTransport();

	if (typeof transport.verify === 'function') {
		try {
			await transport.verify();
		} catch (error) {
			const smtpError = new Error(`SMTP verification failed: ${error.message}`);
			smtpError.statusCode = 500;
			throw smtpError;
		}
	}

	const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
	const verifyUrl = `${baseUrl.replace(/\/$/, '')}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
	const safeName = typeof recipientFullName === 'string' && recipientFullName.trim()
		? recipientFullName.trim()
		: 'there';

	try {
		const info = await transport.sendMail({
			from: resolveSmtpFrom(),
			to: recipientEmail,
			subject: 'Welcome to Campus Mart! Confirm your email',
			text: `Hi ${safeName}!

Let's get you started by verifying your email. Just click the link below to confirm your account:
${verifyUrl}

This link expires in 24 hours.

Questions? We're here to help!`,
			html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #137FEC; margin-bottom: 10px; }
    .content { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; }
    .message { color: #555; margin-bottom: 20px; }
    .cta-button { display: inline-block; background-color: #137FEC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .cta-button:hover { background-color: #0d5bb8; }
    .link-fallback { color: #137FEC; word-break: break-all; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
    .expiry { background-color: #fffbeb; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; color: #92400e; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
			<div class="logo">CampusMart</div>
    </div>
    
    <div class="content">
			<p class="greeting">Hi ${safeName},</p>
      
      <p class="message">
        Let's get you started by verifying your email. Just click the button below to confirm your account:
      </p>
      
      <center>
        <a href="${verifyUrl}" class="cta-button">Verify My Email</a>
      </center>
      
      <p class="message" style="text-align: center; color: #999; font-size: 14px;">
        Or copy and paste this link in your browser:
      </p>
      <p style="text-align: center; color: #137FEC; word-break: break-all; font-size: 12px;">
        ${verifyUrl}
      </p>
      
      <div class="expiry">
        ⏱️ <strong>This link expires in 24 hours.</strong> If you need a new verification link, you can request one from the login page.
      </div>
      
      <p class="message">
        Questions? We're here to help! If you didn't create this account, you can ignore this email.
      </p>
    </div>
    
    <div class="footer">
      <p>© 2026 Campus Mart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
		});

		const acceptedRecipients = Array.isArray(info?.accepted)
			? info.accepted.map(value => String(value).toLowerCase())
			: [];
		const recipientAccepted = acceptedRecipients.includes(String(recipientEmail).toLowerCase());

		if (!recipientAccepted) {
			const rejectedRecipients = Array.isArray(info?.rejected)
				? info.rejected.map(value => String(value)).join(', ')
				: 'unknown';
			const partialFailure = new Error(`SMTP did not accept recipient ${recipientEmail}. Rejected: ${rejectedRecipients}`);
			partialFailure.statusCode = 500;
			throw partialFailure;
		}

		return {
			messageId: info?.messageId || null,
			accepted: Array.isArray(info?.accepted) ? info.accepted : [],
			rejected: Array.isArray(info?.rejected) ? info.rejected : [],
			response: info?.response || null,
		};
	} catch (error) {
		const sendError = new Error(`Failed to send verification email: ${error.message}`);
		sendError.statusCode = 500;
		throw sendError;
	}
};

const sendPasswordResetEmail = async ({ recipientEmail, token }) => {
	const transport = createSmtpTransport();

	if (typeof transport.verify === 'function') {
		try {
			await transport.verify();
		} catch (error) {
			const smtpError = new Error(`SMTP verification failed: ${error.message}`);
			smtpError.statusCode = 500;
			throw smtpError;
		}
	}

	const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
	const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

	try {
		const info = await transport.sendMail({
			from: resolveSmtpFrom(),
			to: recipientEmail,
			subject: 'Reset your Campus Mart password',
			text: `Hi there! 🔐

We received a request to reset your Campus Mart password. Click the link below to set a new password:
${resetUrl}

This link expires in 1 hour. For security, we never share passwords via email.

If you didn't request this reset, you can ignore this email and your password will remain unchanged. No action needed!

Have questions? We're here to help!`,
			html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #137FEC; margin-bottom: 10px; }
    .content { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; }
    .message { color: #555; margin-bottom: 20px; }
    .cta-button { display: inline-block; background-color: #137FEC; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .cta-button:hover { background-color: #0d5bb8; }
    .link-fallback { color: #137FEC; word-break: break-all; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
    .expiry { background-color: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; color: #7f1d1d; font-size: 14px; }
    .security-note { background-color: #dbeafe; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0; color: #0c2d6b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎓 Campus Mart</div>
    </div>
    
    <div class="content">
      <p class="greeting">Hi there! 🔐</p>
      
      <p class="message">
        We received a request to reset your Campus Mart password. Click the button below to set a new password:
      </p>
      
      <center>
        <a href="${resetUrl}" class="cta-button">Reset My Password</a>
      </center>
      
      <p class="message" style="text-align: center; color: #999; font-size: 14px;">
        Or copy and paste this link in your browser:
      </p>
      <p style="text-align: center; color: #137FEC; word-break: break-all; font-size: 12px;">
        ${resetUrl}
      </p>
      
      <div class="expiry">
        ⏱️ <strong>This link expires in 1 hour.</strong> If it expires, you can request a new password reset link from the login page.
      </div>
      
      <div class="security-note">
        🔒 <strong>Security Note:</strong> We never share passwords via email. You'll create your new password on our secure page.
      </div>
      
      <p class="message">
        <strong>Didn't request this?</strong> No worries! You can ignore this email and your password will remain unchanged. No action needed on your part.
      </p>
      
      <p class="message">
        Questions? We're here to help!
      </p>
    </div>
    
    <div class="footer">
      <p>© 2026 Campus Mart. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`,
		});

		const acceptedRecipients = Array.isArray(info?.accepted)
			? info.accepted.map(value => String(value).toLowerCase())
			: [];
		const recipientAccepted = acceptedRecipients.includes(String(recipientEmail).toLowerCase());

		if (!recipientAccepted) {
			const rejectedRecipients = Array.isArray(info?.rejected)
				? info.rejected.map(value => String(value)).join(', ')
				: 'unknown';
			const partialFailure = new Error(`SMTP did not accept recipient ${recipientEmail}. Rejected: ${rejectedRecipients}`);
			partialFailure.statusCode = 500;
			throw partialFailure;
		}

		return {
			messageId: info?.messageId || null,
			accepted: Array.isArray(info?.accepted) ? info.accepted : [],
			rejected: Array.isArray(info?.rejected) ? info.rejected : [],
			response: info?.response || null,
		};
	} catch (error) {
		const sendError = new Error(`Failed to send password reset email: ${error.message}`);
		sendError.statusCode = 500;
		throw sendError;
	}
};

const ensureEmailVerified = user => {
	return Boolean(user && user.emailVerified);
};

const hasDigit = (value) => /\d/.test(String(value || ''));

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

		if (hasDigit(fullName)) {
			return sendError(res, {
				statusCode: 400,
				message: 'fullName must contain text only (no numbers)',
			});
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

		const emailDelivery = await sendEmailVerificationMessage({
			recipientEmail: user.email,
			recipientFullName: user.fullName,
			token: verificationToken,
		});

		const token = signAuthToken(user._id);

		return sendSuccess(res, {
			statusCode: 201,
			message: 'Signup successful',
			data: serializeUser(user),
			extras: {
				token,
				...(process.env.NODE_ENV !== 'production' && { emailDelivery }),
			},
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
		user.profileImagePublicId = uploaded.publicId;

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

const forgotPassword = async (req, res, next) => {
	try {
		const { email } = req.body;

		if (!email || typeof email !== 'string') {
			return sendError(res, { statusCode: 400, message: 'Email is required' });
		}

		if (!isSchoolEmail(email)) {
			return sendError(res, { statusCode: 400, message: 'Email must end with @st.ug.edu.gh' });
		}

		const user = await User.findOne({ email: email.toLowerCase() });

		if (!user) {
			// Don't leak whether email exists; return success anyway for security
			return sendSuccess(res, {
				message: 'If an account exists with that email, a password reset link has been sent.',
			});
		}

		const { token: resetToken, tokenHash, expiresAt } = createPasswordResetToken();
		user.passwordResetTokenHash = tokenHash;
		user.passwordResetTokenExpiresAt = expiresAt;
		await user.save();

		await sendPasswordResetEmail({
			recipientEmail: user.email,
			token: resetToken,
		});

		return sendSuccess(res, {
			message: 'Password reset link sent to your email (valid for 1 hour)',
		});
	} catch (error) {
		return next(error);
	}
};

const resetPassword = async (req, res, next) => {
	try {
		const { token, newPassword, confirmPassword } = req.body;

		if (!token || typeof token !== 'string') {
			return sendError(res, { statusCode: 400, message: 'Reset token is required' });
		}

		if (!newPassword || !confirmPassword) {
			return sendError(res, { statusCode: 400, message: 'New password and confirmation are required' });
		}

		if (newPassword !== confirmPassword) {
			return sendError(res, { statusCode: 400, message: 'Passwords do not match' });
		}

		if (newPassword.length < 6) {
			return sendError(res, { statusCode: 400, message: 'Password must be at least 6 characters' });
		}

		const tokenHash = getPasswordResetTokenHash(token.trim());
		const user = await User.findOne({
			passwordResetTokenHash: tokenHash,
			passwordResetTokenExpiresAt: { $gt: new Date() },
		});

		if (!user) {
			return sendError(res, { statusCode: 400, message: 'Password reset token is invalid or expired' });
		}

		user.password = newPassword;
		user.passwordResetTokenHash = null;
		user.passwordResetTokenExpiresAt = null;
		await user.save();

		return sendSuccess(res, {
			message: 'Password reset successfully',
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
	forgotPassword,
	resetPassword,
};

