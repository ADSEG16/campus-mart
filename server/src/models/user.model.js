const mongoose = require('mongoose');

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
			required: true,
			unique: true,
			match: [/^[^\s@]+@st\.ug\.edu\.gh$/i, 'Email must be a valid UG address'],
		},
		graduationYear: {
			type: Number,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		verificationStatus: {
			type: String,
			enum: ['pending', 'verified', 'rejected'],
			default: 'pending',
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
			type: String,
			default: null,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('User', userSchema);
