const express = require('express');
const router = express.Router();
const { Child, Attendance, Staff, Invoice } = require('../models');

// Helper for week number (simple)
const getWeekOfYear = (date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDay) / 86400000; // ms in a day
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

// Dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const totalChildren = await Child.countDocuments();
    const totalStaff = await Staff.countDocuments();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    const attendance = await Attendance.find({
      date: { $gte: startOfMonth, $lt: endOfMonth }
    }).populate('child');

    const invoicesThisMonth = await Invoice.find({ year, month });

    // Occupancy rates per day
    const occupancyByDay = {}; // { '2025-12-01': { present: 5, occupancyRate: 0.5 }, ... }
    attendance.forEach((rec) => {
      const d = new Date(rec.date);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      if (!occupancyByDay[key]) {
        occupancyByDay[key] = { present: 0 };
      }
      occupancyByDay[key].present += 1;
    });

    const occupancyArray = Object.keys(occupancyByDay).map((date) => ({
      date,
      present: occupancyByDay[date].present,
      occupancyRate:
        totalChildren > 0 ? occupancyByDay[date].present / totalChildren : 0
    }));

    // Staff workload (simple: from Staff model)
    const staffDocs = await Staff.find({});
    const staffWorkload = staffDocs.map((s) => ({
      name: s.name,
      role: s.role,
      childrenAssignedCount: s.childrenAssignedCount,
      weeklyHours: s.weeklyHours
    }));

    // Resource usage: meals consumption
    const mealCounts = {}; // { lunch: 10, snack: 5, ... }
    attendance.forEach((rec) => {
      (rec.meals || []).forEach((meal) => {
        if (!mealCounts[meal]) mealCounts[meal] = 0;
        mealCounts[meal] += 1;
      });
    });

    const mealConsumptionStats = Object.keys(mealCounts).map((meal) => ({
      meal,
      count: mealCounts[meal]
    }));

    // Busiest hours – based on checkInTime
    const hourCounts = {}; // { '8': 10, '9': 7, ... }
    attendance.forEach((rec) => {
      if (!rec.checkInTime) return;
      const hour = new Date(rec.checkInTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let busiestHour = null;
    let maxCount = 0;
    Object.keys(hourCounts).forEach((hourStr) => {
      const count = hourCounts[hourStr];
      if (count > maxCount) {
        maxCount = count;
        busiestHour = parseInt(hourStr, 10);
      }
    });

    // Average attendance per week
    const attendanceByWeek = {}; // { '2025-45': count }
    attendance.forEach((rec) => {
      const d = new Date(rec.date);
      const week = getWeekOfYear(d);
      const key = `${d.getFullYear()}-${week}`;
      attendanceByWeek[key] = (attendanceByWeek[key] || 0) + 1;
    });

    const weeks = Object.keys(attendanceByWeek);
    const totalAttendanceCount = weeks.reduce(
      (sum, k) => sum + attendanceByWeek[k],
      0
    );
    const averageAttendancePerWeek =
      weeks.length > 0 ? totalAttendanceCount / weeks.length : 0;

    // Revenue summary
    const totalRevenueThisMonth = invoicesThisMonth.reduce(
      (sum, inv) => sum + inv.totalAmount,
      0
    );
    const paidInvoices = invoicesThisMonth.filter((inv) => inv.status === 'paid');
    const unpaidInvoices = invoicesThisMonth.filter((inv) => inv.status === 'unpaid');

    res.json({
      totalChildren,
      totalStaff,
      revenue: {
        totalRevenueThisMonth,
        invoiceCount: invoicesThisMonth.length,
        paidCount: paidInvoices.length,
        unpaidCount: unpaidInvoices.length
      },
      occupancy: occupancyArray,
      staffWorkload,
      mealConsumptionStats,
      busiestHour,
      averageAttendancePerWeek
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Analytics summary failed' });
  }
});

module.exports = router;
