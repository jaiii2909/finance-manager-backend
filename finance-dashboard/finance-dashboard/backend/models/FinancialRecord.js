const mongoose = require('mongoose');

const CATEGORIES = [
  'salary', 'freelance', 'investment', 'rent', 'food',
  'utilities', 'healthcare', 'entertainment', 'travel',
  'education', 'shopping', 'taxes', 'other',
];

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type (income/expense) is required'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Soft delete: exclude deleted records by default
financialRecordSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

// Indexes for common query patterns
financialRecordSchema.index({ type: 1, date: -1 });
financialRecordSchema.index({ category: 1 });
financialRecordSchema.index({ date: -1 });

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
module.exports.CATEGORIES = CATEGORIES;
