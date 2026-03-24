const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const requireUser = async (req, res, next) => {
	try {
		const authHeader = req.header('Authorization');
		const fallbackUserId = req.header('x-user-id');
		let userId = fallbackUserId;

		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.replace('Bearer ', '').trim();
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			userId = decoded.id;
		}

		if (!userId) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(401).json({ message: 'Invalid user' });
		}

		req.user = user;
		return next();
	} catch (error) {
		return next(error);
	}
};

const requireAdmin = (req, res, next) => {
	if (!req.user || req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Admin access required' });
	}

	return next();
};

module.exports = {
	requireUser,
	requireAdmin,
};

