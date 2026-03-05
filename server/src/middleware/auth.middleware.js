const User = require('../models/user.model');

const requireUser = async (req, res, next) => {
	try {
		const userId = req.header('x-user-id');

		if (!userId) {
			return res.status(401).json({ message: 'Authentication required' });
		}

		const user = await User.findById(userId).select('_id role flagged');

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

