const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryBreakdown(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.query);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getWeeklyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getWeeklyTrends();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const data = await dashboardService.getRecentActivity(limit);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends, getRecentActivity };
