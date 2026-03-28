const express = require('express');
const { requireUser } = require('../middleware/auth.middleware');
const { getRecommendations } = require('../controllers/recommendation.controller');

const router = express.Router();

router.get('/', requireUser, getRecommendations);

module.exports = router;