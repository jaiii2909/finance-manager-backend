const FinancialRecord = require('../models/FinancialRecord');

// Helper to build date filter
const dateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return Object.keys(filter).length ? filter : undefined;
};

const getSummary = async ({ startDate, endDate } = {}) => {
  const matchStage = {};
  const df = dateFilter(startDate, endDate);
  if (df) matchStage.date = df;

  const result = await FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const income = result.find((r) => r._id === 'income') || { total: 0, count: 0 };
  const expense = result.find((r) => r._id === 'expense') || { total: 0, count: 0 };

  return {
    totalIncome: income.total,
    totalExpenses: expense.total,
    netBalance: income.total - expense.total,
    incomeCount: income.count,
    expenseCount: expense.count,
  };
};

const getCategoryBreakdown = async ({ startDate, endDate, type } = {}) => {
  const matchStage = {};
  if (type) matchStage.type = type;
  const df = dateFilter(startDate, endDate);
  if (df) matchStage.date = df;

  return FinancialRecord.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);
};

const getMonthlyTrends = async ({ year } = {}) => {
  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const startOfYear = new Date(`${targetYear}-01-01`);
  const endOfYear = new Date(`${targetYear}-12-31T23:59:59`);

  return FinancialRecord.aggregate([
    { $match: { date: { $gte: startOfYear, $lte: endOfYear } } },
    {
      $group: {
        _id: { month: { $month: '$date' }, type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);
};

const getWeeklyTrends = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return FinancialRecord.aggregate([
    { $match: { date: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.day': 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id.day',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
  ]);
};

const getRecentActivity = async (limit = 5) => {
  return FinancialRecord.find()
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getWeeklyTrends, getRecentActivity };
