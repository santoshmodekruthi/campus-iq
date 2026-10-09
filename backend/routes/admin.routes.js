import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { COLLEGES, COLLEGE_SET } from '../../shared/colleges.mjs';
import { applyAcademicRisk } from '../services/analytics.js';

const router = express.Router();
router.use(authenticate, requireRole('admin'));

const filterKeys = ['college', 'department', 'semester', 'riskLevel'];
function buildFilters(query) {
  const filters = { role: 'student' };
  if (query.search) {
    const safeTerm = String(query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filters.$or = [
      { name: { $regex: safeTerm, $options: 'i' } },
      { email: { $regex: safeTerm, $options: 'i' } },
      { registrationNumber: { $regex: safeTerm, $options: 'i' } },
    ];
  }
  for (const key of filterKeys) {
    if (query[key] !== undefined && query[key] !== '') filters[key] = key === 'semester' ? Number(query[key]) : query[key];
  }
  if (filters.college && !COLLEGE_SET.has(filters.college)) throw new Error('Unsupported college filter');
  if (filters.riskLevel && !['Low', 'Medium', 'High'].includes(filters.riskLevel)) throw new Error('Unsupported risk filter');
  if (filters.semester && (!Number.isInteger(filters.semester) || filters.semester < 1 || filters.semester > 12)) throw new Error('Unsupported semester filter');
  return filters;
}

function csvCell(value) {
  let normalized = Array.isArray(value) ? value.join('; ') : value ?? '';
  if (/^[\s]*[=+\-@\t\r]/.test(String(normalized))) normalized = `'${normalized}`;
  return `"${String(normalized).replace(/"/g, '""')}"`;
}

router.get('/overview', async (req, res) => {
  try {
    const [groups, colleges, trends, highRiskStudents] = await Promise.all([
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageAttendance: { $avg: '$attendancePercentage' },
          averageGpa: { $avg: '$gpa' },
          highRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'High'] }, 1, 0] } },
          mediumRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'Medium'] }, 1, 0] } },
          lowRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'Low'] }, 1, 0] } },
          declining: { $sum: { $cond: ['$isDeclining', 1, 0] } },
          intervention: { $sum: { $cond: ['$requiresIntervention', 1, 0] } },
        } },
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $group: {
          _id: '$college',
          students: { $sum: 1 },
          averageAttendance: { $avg: '$attendancePercentage' },
          averageGpa: { $avg: '$gpa' },
          highRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'High'] }, 1, 0] } },
          mediumRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'Medium'] }, 1, 0] } },
          lowRisk: { $sum: { $cond: [{ $eq: ['$riskLevel', 'Low'] }, 1, 0] } },
        } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        { $unwind: '$performanceHistory' },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$performanceHistory.date' } },
          averageGpa: { $avg: '$performanceHistory.value' },
        } },
        { $sort: { _id: 1 } },
        { $limit: 24 },
      ]),
      User.find({ role: 'student', riskLevel: 'High' })
        .select('-password -username -__v')
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const byCollege = new Map(colleges.map((item) => [item._id, item]));
    res.json({
      success: true,
      data: {
        totals: {
          ...(groups[0] || { totalStudents: 0, averageAttendance: 0, averageGpa: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0, declining: 0, intervention: 0 }),
          totalColleges: COLLEGES.length,
        },
        collegeComparisons: COLLEGES.map((college) => byCollege.get(college) || {
          _id: college, students: 0, averageAttendance: 0, averageGpa: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0,
        }),
        performanceTrends: trends.map((item) => ({ month: item._id, averageGpa: Number(item.averageGpa.toFixed(2)) })),
        highRiskStudents,
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load admin analytics' });
  }
});

router.get('/students/export.csv', async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const students = await User.find(filters).select('-password -username -__v').sort({ college: 1, registrationNumber: 1 }).lean();
    const columns = [
      'studentId', 'name', 'email', 'registrationNumber', 'college', 'department',
      'semester', 'academicYear', 'attendancePercentage', 'academicMarks', 'assignmentCompletion',
      'gpa', 'riskLevel', 'riskReasons', 'enrollmentStatus',
    ];
    const rows = [columns.join(',')];
    for (const student of students) rows.push(columns.map((key) => csvCell(student[key])).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="campus-iq-students.csv"');
    res.send(rows.join('\r\n'));
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/students', async (req, res) => {
  try {
    const filters = buildFilters(req.query);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const sortFields = { gpa: 'gpa', attendance: 'attendancePercentage', risk: 'riskLevel', name: 'name' };
    const sortField = sortFields[req.query.sort] || 'name';
    const direction = req.query.direction === 'desc' ? -1 : 1;
    const [students, total] = await Promise.all([
      User.aggregate([
        { $match: filters },
        { $addFields: { _riskSort: { $switch: {
          branches: [
            { case: { $eq: ['$riskLevel', 'High'] }, then: 2 },
            { case: { $eq: ['$riskLevel', 'Medium'] }, then: 1 },
          ],
          default: 0,
        } } } },
        { $sort: sortField === 'riskLevel' ? { _riskSort: direction, name: 1 } : { [sortField]: direction, _id: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        { $project: { password: 0, username: 0, __v: 0, _riskSort: 0 } },
      ]),
      User.countDocuments(filters),
    ]);
    res.json({ success: true, data: { students, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid student ID' });
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('-password -username -__v').lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const audit = await AuditLog.find({ targetId: student._id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json({ success: true, data: { student, audit } });
  } catch (error) {
    console.error('Admin student detail error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load student details' });
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid student ID' });
    const allowed = [
      'name', 'email', 'dateOfBirth', 'college', 'registrationNumber', 'mobileNumber', 'department',
      'semester', 'academicYear', 'attendancePercentage', 'academicMarks', 'assignmentCompletion',
      'gpa', 'enrollmentStatus', 'interventionNote',
    ];
    const body = req.body || {};
    const keys = Object.keys(body);
    if (!keys.length || keys.some((key) => !allowed.includes(key))) {
      return res.status(400).json({ success: false, message: 'Request includes empty or non-editable fields' });
    }
    if (body.college !== undefined && !COLLEGE_SET.has(body.college)) return res.status(400).json({ success: false, message: 'Select a supported college' });
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select('+password');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const changes = {};
    const editable = allowed.filter((key) => key !== 'interventionNote');
    for (const key of editable) {
      if (body[key] === undefined) continue;
      const previous = student[key];
      student[key] = body[key];
      changes[key] = { from: Array.isArray(previous) ? [...previous] : previous, to: body[key] };
    }
    if (body.registrationNumber !== undefined) student.registrationNumber = String(body.registrationNumber).trim().toUpperCase();
    if (body.interventionNote !== undefined) {
      const note = String(body.interventionNote).trim();
      if (!note || note.length > 1000) return res.status(400).json({ success: false, message: 'Intervention note must be between 1 and 1000 characters' });
      student.interventionNotes.push({ note, createdAt: new Date(), createdBy: req.user.username });
      changes.interventionNote = { to: note };
    }
    if (body.gpa !== undefined && !student.performanceHistory.some((item) => item.value === Number(body.gpa))) {
      student.performanceHistory.push({ date: new Date(), value: Number(body.gpa) });
    }
    if (student.college && student.registrationNumber && !student.registrationNumber.startsWith(student.college)) {
      return res.status(400).json({ success: false, message: 'Registration number must begin with the selected college code' });
    }
    applyAcademicRisk(student);
    await student.save();
    const audit = await AuditLog.create({
      actorId: req.user._id,
      actorUsername: req.user.username,
      action: 'student.update',
      targetId: student._id,
      changes,
    });
    res.json({ success: true, message: 'Student record updated', data: { student: student.toJSON(), audit } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email, registration number, or student ID is already in use' });
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    console.error('Admin student update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update student record' });
  }
});

export default router;
