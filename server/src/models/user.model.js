const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			trim: true,
			lowercase: true,
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		flagged: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('User', userSchema);
