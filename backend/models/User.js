import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { COLLEGE_SET } from '../../shared/colleges.mjs';
import { applyAcademicRisk } from '../services/analytics.js';

const historyEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, required: true, min: 0, max: 10 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, sparse: true, trim: true },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    required: function () { return this.role === 'admin'; },
    minlength: 3,
    maxlength: 64,
  },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ['student', 'admin'], required: true, default: 'student' },
  college: {
    type: String,
    enum: [...COLLEGE_SET],
    required: function () { return this.role === 'student'; },
  },
  registrationNumber: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    required: function () { return this.role === 'student'; },
  },
  dateOfBirth: { type: Date, required: function () { return this.role === 'student'; } },
  mobileNumber: {
    type: String,
    required: function () { return this.role === 'student'; },
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, 'Enter a valid mobile number'],
  },
  department: { type: String, required: function () { return this.role === 'student'; }, trim: true },
  semester: { type: Number, min: 1, max: 12, default: 1 },
  academicYear: { type: Number, min: 1, max: 8, default: 1 },
  attendancePercentage: { type: Number, min: 0, max: 100, default: 0 },
  attendanceHistory: { type: [{ date: Date, percentage: { type: Number, min: 0, max: 100 } }], default: [] },
  academicMarks: { type: [{ type: Number, min: 0, max: 100 }], default: [] },
  assignmentCompletion: { type: Number, min: 0, max: 100, default: 0 },
  assignmentsTotal: { type: Number, min: 0, default: 0 },
  assignmentsSubmitted: { type: Number, min: 0, default: 0 },
  gpa: { type: Number, min: 0, max: 10, default: 0 },
  performanceHistory: { type: [historyEntrySchema], default: [] },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  riskReasons: { type: [String], default: [] },
  recommendations: { type: [String], default: [] },
  isDeclining: { type: Boolean, default: false },
  requiresIntervention: { type: Boolean, default: false },
  enrollmentStatus: { type: String, enum: ['Active', 'On leave', 'Withdrawn', 'Graduated'], default: 'Active' },
  interventionNotes: { type: [{ note: String, createdAt: Date, createdBy: String }], default: [] },
  isSeeded: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('validate', function () {
  if (this.role === 'student' && this.college && this.registrationNumber) {
    if (!COLLEGE_SET.has(this.college)) this.invalidate('college', 'Select one of the supported colleges');
    if (!this.registrationNumber.startsWith(this.college)) {
      this.invalidate('registrationNumber', 'Registration number must begin with the selected college code');
    }
    if (this.assignmentsSubmitted > this.assignmentsTotal) {
      this.invalidate('assignmentsSubmitted', 'Submitted assignments cannot exceed total assignments');
    }
  }
  if (this.role === 'student') applyAcademicRisk(this);
});

userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.username;
  delete obj.__v;
  return obj;
};

userSchema.index({ role: 1, college: 1, department: 1, semester: 1, riskLevel: 1 });
userSchema.index({ name: 'text', email: 'text', registrationNumber: 'text' });

export default mongoose.model('User', userSchema);
