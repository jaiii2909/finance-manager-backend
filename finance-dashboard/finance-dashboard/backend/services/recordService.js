const FinancialRecord = require('../models/FinancialRecord');

const buildFilter = ({ type, category, startDate, endDate, search }) => {
  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  if (search) {
    filter.description = { $regex: search, $options: 'i' };
  }
  return filter;
};

const getAllRecords = async (query) => {
  const { page = 1, limit = 10, sortBy = 'date', order = 'desc', ...rest } = query;
  const filter = buildFilter(rest);
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [records, total] = await Promise.all([
    FinancialRecord.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    FinancialRecord.countDocuments(filter),
  ]);

  return { records, total, page: Number(page), pages: Math.ceil(total / limit) };
};

const getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email');
  if (!record) {
    const err = new Error('Record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

const createRecord = async (data, userId) => {
  return FinancialRecord.create({ ...data, createdBy: userId });
};

const updateRecord = async (id, data) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!record) {
    const err = new Error('Record not found.');
    err.statusCode = 404;
    throw err;
  }
  return record;
};

// Soft delete
const deleteRecord = async (id) => {
  const record = await FinancialRecord.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!record) {
    const err = new Error('Record not found.');
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAllRecords, getRecordById, createRecord, updateRecord, deleteRecord };
