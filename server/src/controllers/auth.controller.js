const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { uploadSingleProfileImage, uploadStudentIdDocument } = require('../services/product.service');

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

const sanitizeUser = (user) => {
	return {
		_id: user._id,
		fullName: user.fullName,
		department: user.department,
		email: user.email,
		graduationYear: user.graduationYear,
		role: user.role,
		verificationStatus: user.verificationStatus,
		studentIdUrl: user.studentIdUrl,
		profileImageUrl: user.profileImageUrl,
		bio: user.bio,
		flagged: user.flagged,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
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
			return res.status(400).json({ message: 'All signup fields are required' });
		}

		if (!isSchoolEmail(email)) {
			return res.status(400).json({ message: 'Email must end with @st.ug.edu.gh' });
		}

		if (password !== confirmPassword) {
			return res.status(400).json({ message: 'Passwords do not match' });
		}

		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(409).json({ message: 'Email already in use' });
		}

		const hashedPassword = await hashPassword(password);

		const user = await User.create({
			fullName,
			department,
			email: email.toLowerCase(),
			graduationYear,
			password: hashedPassword,
		});

		const token = signAuthToken(user._id);

		return res.status(201).json({
			success: true,
			message: 'Signup successful',
			token,
			data: sanitizeUser(user),
		});
	} catch (error) {
		return next(error);
	}
};

const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		if (!isSchoolEmail(email)) {
			return res.status(400).json({ message: 'Email must end with @st.ug.edu.gh' });
		}

		const user = await User.findOne({ email: email.toLowerCase() });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isValid = await comparePassword(password, user.password);
		if (!isValid) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = signAuthToken(user._id);

		return res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			data: sanitizeUser(user),
		});
	} catch (error) {
		return next(error);
	}
};

const getMe = async (req, res, next) => {
	try {
		return res.status(200).json({
			success: true,
			data: sanitizeUser(req.user),
		});
	} catch (error) {
		return next(error);
	}
};

const uploadStudentId = async (req, res, next) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'Student ID file is required' });
		}

		const uploaded = await uploadStudentIdDocument(req.file);
		req.user.studentIdUrl = uploaded.secureUrl;
		req.user.verificationStatus = 'pending';
		await req.user.save();

		return res.status(200).json({
			success: true,
			message: 'Student ID uploaded successfully',
			data: {
				studentIdUrl: req.user.studentIdUrl,
				verificationStatus: req.user.verificationStatus,
			},
		});
	} catch (error) {
		return next(error);
	}
};const uploadProfileImage = async (req, res) => {
  try {
    // 1. Check file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    // 2. Upload to Cloudinary
    const uploaded = await uploadSingleProfileImage(req.file);

    // 3. Save ONLY URL in DB
    const user = await User.findById(req.user._id);

    user.profileImageUrl = uploaded.secureUrl;

    await user.save();

    // 4. Return response
    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        profileImageUrl: user.profileImageUrl,
      },
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

// const uploadProfileImage = async (req, res, next) => {
// 	try {
// 		if (!req.file) {
// 			return res.status(400).json({ message: 'Profile image file is required' });
// 		}

// 		const uploaded = await uploadSingleProfileImage(req.file);
// 		req.user.profileImageUrl = uploaded.secureUrl;
// 		await req.user.save();

// 		return res.status(200).json({
// 			success: true,
// 			message: 'Profile image uploaded successfully',
// 			data: {
// 				profileImageUrl: req.user.profileImageUrl,
// 			},
// 		});
// 	} catch (error) {
//   console.error("UPLOAD ERROR:", error); // 👈 logs full error in terminal
//   res.status(500).json({
//     message: "Image upload failed",
//     error: error.message,
//   });
// }
// };

const completeProfile = async (req, res, next) => {
	try {
		const { bio } = req.body;

		if (bio !== undefined) {
			req.user.bio = bio;
		}

		await req.user.save();

		return res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			data: sanitizeUser(req.user),
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

