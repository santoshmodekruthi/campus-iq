import express from 'express';
import { authenticate, requireRole, requirePasswordChangeComplete } from '../middleware/auth.js';
import { triggerMotiaEvent } from '../config/motia.js';
import StudentProfile from '../models/StudentProfile.js';
import EngagementEvent from '../models/EngagementEvent.js';
import User from '../models/User.js';

const router = express.Router();
router.use(authenticate, requireRole('student'), requirePasswordChangeComplete);

router.get('/dashboard', async (req, res) => {
  try {
    const [profile, recentEvents] = await Promise.all([
      StudentProfile.findOne({ userId: req.user._id }).lean(),
      EngagementEvent.find({ studentId: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    ]);
    const student = req.user.toJSON();
    const stats = profile?.statistics || {};
    res.json({
      success: true,
      data: {
        student,
        profile: {
          riskLevel: student.riskLevel,
          riskReason: student.riskReasons.join(', '),
          riskReasons: student.riskReasons,
          recommendations: student.recommendations,
          statistics: {
            ...stats,
            averagePerformance: student.academicMarks.length
              ? student.academicMarks.reduce((sum, mark) => sum + mark, 0) / student.academicMarks.length
              : 0,
            performanceScores: student.academicMarks,
          },
        },
        recentEvents,
        metrics: {
          attendancePercentage: student.attendancePercentage,
          assignmentCompletionRate: student.assignmentCompletion,
          gpa: student.gpa,
          riskLevel: student.riskLevel,
        },
      },
    });
  } catch (error) {
    console.error('Student dashboard error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
});

router.patch('/profile', async (req, res) => {
  try {
    const allowed = ['name', 'email', 'mobileNumber'];
    const keys = Object.keys(req.body || {});
    if (keys.length === 0 || keys.some((key) => !allowed.includes(key))) {
      return res.status(400).json({ success: false, message: 'Only name, email, and mobile number can be updated' });
    }
    if (req.body.name !== undefined) {
      if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2 || req.body.name.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters' });
      }
      req.user.name = req.body.name.trim();
    }
    if (req.body.email !== undefined) {
      const email = String(req.body.email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing) return res.status(409).json({ success: false, message: 'Email address is already in use' });
      req.user.email = email;
    }
    if (req.body.mobileNumber !== undefined) {
      if (!/^\+?[0-9]{10,15}$/.test(String(req.body.mobileNumber))) return res.status(400).json({ success: false, message: 'Enter a valid mobile number' });
      req.user.mobileNumber = String(req.body.mobileNumber);
    }
    await req.user.save();
    res.json({ success: true, data: { user: req.user.toJSON() } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Email address is already in use' });
    console.error('Student profile update error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.post('/event', async (req, res) => {
  try {
    const { eventType, eventData = {} } = req.body || {};
    const isValid =
      (eventType === 'attendance' && ['present', 'absent'].includes(eventData.status)) ||
      (eventType === 'assignment' && typeof eventData.submitted === 'boolean' && typeof eventData.assignmentName === 'string' && eventData.assignmentName.trim()) ||
      (eventType === 'performance' && typeof eventData.score === 'number' && eventData.score >= 0 && eventData.score <= 100 && typeof eventData.testName === 'string' && eventData.testName.trim());
    if (!isValid) return res.status(400).json({ success: false, message: 'Provide valid attendance, assignment, or performance event details' });

    const event = await EngagementEvent.create({ studentId: req.user._id, eventType, eventData });
    let workflow = { status: 'not-configured' };
    if (process.env.MOTIA_WEBHOOK_URL) {
      try {
        await triggerMotiaEvent('STUDENT_EVENT', {
          studentId: req.user._id,
          eventType,
          eventData,
          eventId: event._id,
        });
        workflow = { status: 'sent' };
      } catch (error) {
        workflow = { status: 'failed', message: error.message };
        console.error('Motia workflow error:', error.message);
      }
    }
    res.status(201).json({
      success: true,
      message: 'Student-reported activity saved. Official academic records are unchanged.',
      data: { eventId: event._id, workflow },
    });
  } catch (error) {
    console.error('Student event submission error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to save engagement event' });
  }
});

export default router;
