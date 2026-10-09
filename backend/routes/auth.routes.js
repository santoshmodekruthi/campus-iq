import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { COLLEGE_SET } from '../../shared/colleges.mjs';

const router = express.Router();
const emailPattern = /^\S+@\S+\.\S+$/;
const phonePattern = /^\+?[0-9]{10,15}$/;
const registrationPattern = /^[A-Z0-9][A-Z0-9-]{2,30}$/;

const issueToken = (user) => jwt.sign(
  { userId: user._id.toString(), role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '12h' },
);

const loginResponse = (res, user) => res.json({
  success: true,
  message: 'Login successful',
  data: { user: user.toJSON(), token: issueToken(user) },
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, dateOfBirth, college, registrationNumber, password, confirmPassword, mobileNumber } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedRegistration = typeof registrationNumber === 'string' ? registrationNumber.trim().toUpperCase() : '';
    const dob = new Date(dateOfBirth);
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Enter a full name between 2 and 100 characters' });
    }
    if (!emailPattern.test(normalizedEmail)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
    if (!COLLEGE_SET.has(college)) return res.status(400).json({ success: false, message: 'Select a supported college' });
    if (!registrationPattern.test(normalizedRegistration) || !normalizedRegistration.startsWith(college)) {
      return res.status(400).json({ success: false, message: 'Registration number must begin with the selected college code' });
    }
    if (!Number.isFinite(dob.getTime()) || age < 12 || age > 100) return res.status(400).json({ success: false, message: 'Enter a valid date of birth' });
    if (!phonePattern.test(String(mobileNumber || ''))) return res.status(400).json({ success: false, message: 'Enter a valid mobile number including country code if needed' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters' });
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match' });

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { registrationNumber: normalizedRegistration }],
    }).select('_id email registrationNumber');
    if (existing) {
      const field = existing.email === normalizedEmail ? 'email address' : 'registration number';
      return res.status(409).json({ success: false, message: `An account with this ${field} already exists. Contact an administrator if this is your seeded account.` });
    }

    const student = await User.create({
      studentId: `${college}-REG-${normalizedRegistration}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'student',
      college,
      registrationNumber: normalizedRegistration,
      dateOfBirth: dob,
      mobileNumber,
      department: 'Undeclared',
      semester: 1,
      academicYear: 1,
    });
    try {
      await StudentProfile.create({ userId: student._id });
    } catch (profileError) {
      await User.deleteOne({ _id: student._id });
      throw profileError;
    }
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user: student.toJSON(), token: issueToken(student) },
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email, registration number, or student ID is already in use' });
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    console.error('Registration error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.message?.includes('buffering timed out')) {
      return res.status(503).json({ success: false, message: 'Registration is temporarily unavailable because the database cannot be reached. Please retry shortly.' });
    }
    return res.status(500).json({ success: false, message: 'We could not complete registration. If this email or registration number is already registered, sign in instead; otherwise retry or contact an administrator.' });
  }
});

router.post('/student-login', async (req, res) => {
  try {
    const { college, registrationNumber, password } = req.body;
    const normalizedRegistration = typeof registrationNumber === 'string' ? registrationNumber.trim().toUpperCase() : '';
    if (!COLLEGE_SET.has(college) || !normalizedRegistration || typeof password !== 'string' || !password || password.length > 128) {
      return res.status(400).json({ success: false, message: 'College, registration number, and password are required' });
    }
    const user = await User.findOne({ role: 'student', college, registrationNumber: normalizedRegistration }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid student credentials' });
    return loginResponse(res, user);
  } catch (error) {
    console.error('Student login error:', error.message);
    return res.status(500).json({ success: false, message: 'Student login failed' });
  }
});

router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Administrator username and password are required' });
    }
    const user = await User.findOne({ role: 'admin', username: username.trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: 'Invalid administrator credentials' });
    return loginResponse(res, user);
  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({ success: false, message: 'Administrator login failed' });
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, data: { user: req.user.toJSON() } });
});

router.post('/change-password', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(String(currentPassword || '')))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({ success: false, message: 'New password must be between 8 and 128 characters' });
    }
    if (newPassword !== confirmPassword) return res.status(400).json({ success: false, message: 'New passwords do not match' });
    if (newPassword === currentPassword) return res.status(400).json({ success: false, message: 'Choose a password different from the current password' });

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();
    return res.json({ success: true, message: 'Password changed successfully', data: { user: user.toJSON() } });
  } catch (error) {
    console.error('Password change error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

export default router;
