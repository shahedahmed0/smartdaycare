const mongoose = require('mongoose');
const { Schema } = mongoose;

// Child (basic info + base fee per day)
const childSchema = new Schema(
  {
    name: { type: String, required: true },
    age: Number,
    guardianName: String,
    baseDailyFee: { type: Number, default: 500 } // you can change this
  },
  { timestamps: true }
);

// Attendance – used for billing & analytics
const attendanceSchema = new Schema(
  {
    child: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
    date: { type: Date, required: true },
    checkInTime: Date,
    checkOutTime: Date,
    extraServiceCharge: { type: Number, default: 0 }, // extra services
    meals: [{ type: String }] // e.g. ["breakfast","lunch"]
  },
  { timestamps: true }
);

// Invoice – monthly billing statement
const invoiceSchema = new Schema(
  {
    child: { type: Schema.Types.ObjectId, ref: 'Child', required: true },
    month: { type: Number, required: true }, // 1–12
    year: { type: Number, required: true },
    daysPresent: { type: Number, default: 0 },
    baseRatePerDay: { type: Number, default: 0 },
    extraCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid'
    },
    generatedAt: { type: Date, default: Date.now },
    paidAt: Date
  },
  { timestamps: true }
);

// Staff – for workload analytics
const staffSchema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ['caregiver', 'teacher', 'cook'], required: true },
    childrenAssignedCount: { type: Number, default: 0 },
    weeklyHours: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Child = mongoose.model('Child', childSchema);
const Attendance = mongoose.model('Attendance', attendanceSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const Staff = mongoose.model('Staff', staffSchema);

module.exports = {
  Child,
  Attendance,
  Invoice,
  Staff
};
