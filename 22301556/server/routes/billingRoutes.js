const express = require('express');
const router = express.Router();
const { Child, Attendance, Invoice } = require('../models');

// Helper to calculate month range
const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1); // next month
  return { start, end };
};

// Member-1: Generate monthly invoices
router.post('/generate/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);
    const { start, end } = getMonthRange(year, month);

    const children = await Child.find({});
    const invoices = [];

    for (const child of children) {
      const attendanceRecords = await Attendance.find({
        child: child._id,
        date: { $gte: start, $lt: end }
      });

      const daysPresent = attendanceRecords.length;
      const baseRatePerDay = child.baseDailyFee || 0;
      const baseAmount = daysPresent * baseRatePerDay;
      const extraCharges = attendanceRecords.reduce(
        (sum, rec) => sum + (rec.extraServiceCharge || 0),
        0
      );
      const totalAmount = baseAmount + extraCharges;

      // Skip children with no attendance
      if (daysPresent === 0 && extraCharges === 0) continue;

      // Upsert invoice for (child, year, month)
      const invoice = await Invoice.findOneAndUpdate(
        { child: child._id, year, month },
        {
          child: child._id,
          year,
          month,
          daysPresent,
          baseRatePerDay,
          extraCharges,
          totalAmount
        },
        { new: true, upsert: true }
      ).populate('child');

      invoices.push(invoice);
    }

    res.json({
      message: 'Monthly invoices generated',
      invoices
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Invoice generation failed' });
  }
});

// List all invoices (you can filter by month/year using query params)
router.get('/invoices', async (req, res) => {
  try {
    const { year, month, status } = req.query;
    const filter = {};
    if (year) filter.year = parseInt(year, 10);
    if (month) filter.month = parseInt(month, 10);
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter).populate('child').sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch invoices' });
  }
});

// Member-2: Mark invoice as paid
router.patch('/invoices/:id/pay', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    ).populate('child');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({
      message: 'Payment status updated',
      invoice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment update failed' });
  }
});

// Member-2: Get a single invoice "receipt"
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('child');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch invoice' });
  }
});

module.exports = router;
