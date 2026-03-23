const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			trim: true,
			required: true,
		},
		department: {
			type: String,
			trim: true,
			required: true,
		},
		email: {
			type: String,
			trim: true,
			lowercase: true,
			required: [true, 'Email is required'],
			unique: true,
			// Keeping the specific UG email validation from Cloudinary branch
			match: [/^[^\s@]+@st\.ug\.edu\.gh$/i, 'Email must be a valid UG address'],
		},
		graduationYear: {
			type: Number,
			required: true,
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: 6,
			select: false, // Ensures password isn't returned in queries by default
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		// Integrated verificationStatus from Cloudinary branch
		verificationStatus: {
			type: String,
			enum: ['pending', 'verified', 'rejected'],
			default: 'pending',
		},
		// Added isVerified boolean from dev branch for quick logic checks
		isVerified: {
			type: Boolean,
			default: false,
		},
		studentIdUrl: {
			type: String,
			default: null,
			trim: true,
		},
		flagged: {
			type: Boolean,
			default: false,
		},
		bio: {
			type: String,
			default: '',
			maxlength: 200,
			trim: true,
		},
		profileImageUrl: {
			type: String, // Cloudinary URL will be stored here
			default: null,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

// --- Security Middleware from Dev Branch ---

// Hash password before saving
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);