const express = require('express');
const {
  getSummary,
  getCategoryBreakdown,
  getMonthlyTrends,
  getWeeklyTrends,
  getRecentActivity,
} = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes — viewer and above (analyst + admin too)
router.use(protect, requireRole('viewer'));

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/trends/monthly', getMonthlyTrends);
router.get('/trends/weekly', getWeeklyTrends);
router.get('/recent', getRecentActivity);

module.exports = router;
