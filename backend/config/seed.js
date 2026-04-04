require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const FinancialRecord = require('../models/FinancialRecord');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for seeding...');
};

const users = [
  { name: 'Alice Admin', email: 'admin@finance.com', password: 'password123', role: 'admin' },
  { name: 'Ana Analyst', email: 'analyst@finance.com', password: 'password123', role: 'analyst' },
  { name: 'Victor Viewer', email: 'viewer@finance.com', password: 'password123', role: 'viewer' },
];

const generateRecords = (userId) => {
  const categories = ['salary', 'freelance', 'rent', 'food', 'utilities', 'entertainment', 'travel', 'shopping'];
  const records = [];

  for (let i = 0; i < 30; i++) {
    const isIncome = i % 3 === 0;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    records.push({
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      type: isIncome ? 'income' : 'expense',
      category: isIncome
        ? ['salary', 'freelance', 'investment'][i % 3]
        : categories[Math.floor(Math.random() * categories.length)],
      date,
      description: isIncome ? `Income entry #${i + 1}` : `Expense entry #${i + 1}`,
      createdBy: userId,
    });
  }
  return records;
};

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await FinancialRecord.deleteMany({});
    console.log('Cleared existing data.');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users.`);

    // Create records linked to admin user
    const adminUser = createdUsers.find((u) => u.role === 'admin');
    const records = generateRecords(adminUser._id);
    await FinancialRecord.create(records);
    console.log(`Created ${records.length} financial records.`);

    console.log('\nSeed complete! Test credentials:');
    console.log('  Admin:    admin@finance.com    / password123');
    console.log('  Analyst:  analyst@finance.com  / password123');
    console.log('  Viewer:   viewer@finance.com   / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
