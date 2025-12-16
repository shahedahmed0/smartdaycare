// server/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const { Child, Staff, Attendance, Invoice } = require('./models');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_daycare';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected for seeding');

  // পুরনো demo ডাটা মুছে দিচ্ছি
  await Promise.all([
    Child.deleteMany({}),
    Staff.deleteMany({}),
    Attendance.deleteMany({}),
    Invoice.deleteMany({}),
  ]);
  console.log('Old data cleared');

  // ৮ জন শিশু
  const children = await Child.insertMany([
    {
      name: 'Jayed',
      age: 4,
      allergies: 'Milk',
      guardianName: 'Mr. Karim',
      emergencyContact: '01711-000001',
    },
    {
      name: 'Mim',
      age: 5,
      allergies: 'Egg',
      guardianName: 'Mrs. Laila',
      emergencyContact: '01711-000002',
    },
    {
      name: 'Rahim',
      age: 3,
      allergies: 'None',
      guardianName: 'Mr. Rahman',
      emergencyContact: '01711-000003',
    },
    {
      name: 'Sadia',
      age: 4,
      allergies: 'Peanut',
      guardianName: 'Mrs. Nargis',
      emergencyContact: '01711-000004',
    },
    {
      name: 'Rafi',
      age: 5,
      allergies: 'Dust',
      guardianName: 'Mr. Alam',
      emergencyContact: '01711-000005',
    },
    {
      name: 'Nusrat',
      age: 3,
      allergies: 'None',
      guardianName: 'Mr. Hasan',
      emergencyContact: '01711-000006',
    },
    {
      name: 'Niloy',
      age: 4,
      allergies: 'None',
      guardianName: 'Mr. Kabir',
      emergencyContact: '01711-000007',
    },
    {
      name: 'Toma',
      age: 5,
      allergies: 'Fish',
      guardianName: 'Mrs. Rupa',
      emergencyContact: '01711-000008',
    },
  ]);

  // Staff ডাটা
  await Staff.insertMany([
    { name: 'Sadia', role: 'caregiver', weeklyHours: 40, childrenAssignedCount: 6 },
    { name: 'Imran', role: 'teacher', weeklyHours: 38, childrenAssignedCount: 10 },
    { name: 'Lima', role: 'cook', weeklyHours: 35, childrenAssignedCount: 0 },
  ]);

  // শেষ ১০ দিনের attendance
  const today = new Date();
  const days = 10;
  const attendanceDocs = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    for (const child of children) {
      attendanceDocs.push({
        child: child._id,
        date,
        present: true,
        checkIn: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          9,
          0
        ),
        checkOut: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          17,
          0
        ),
        // এখানে মূল ফিক্স: meals এখন string array
        meals: ['breakfast', 'lunch'],
      });
    }
  }

  await Attendance.insertMany(attendanceDocs);
  console.log('Inserted demo children, staff & attendance');

  await mongoose.disconnect();
  console.log('Seeding finished');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
