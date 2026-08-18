import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { triggerMotiaEvent } from '../config/motia.js';
import StudentProfile from '../models/StudentProfile.js';
import EngagementEvent from '../models/EngagementEvent.js';

const router = express.Router();

/* =========================
   AUTH MIDDLEWARE
========================= */
router.use(authenticate);

/* =========================
   GET /student/dashboard
========================= */
router.get('/dashboard', async (req, res) => {
  try {
    // Only students allowed
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const studentId = req.user._id;

    // Fetch profile
    const profile = await StudentProfile.findOne({ userId: studentId });

    // Fetch recent engagement events
    const events = await EngagementEvent.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        student: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        profile,
        recentEvents: events,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard',
    });
  }
});

/* =========================
   POST /student/event
========================= */
router.post('/event', async (req, res) => {
  try {
    const { eventType, eventData } = req.body;
    const studentId = req.user._id;

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can submit engagement events',
      });
    }

    // 1️⃣ Save engagement event
    const engagementEvent = await EngagementEvent.create({
      studentId,
      eventType,
      eventData,
    });

    // 2️⃣ Trigger Motia workflow
    const motiaResult = await triggerMotiaEvent('STUDENT_EVENT', {
      studentId,
      eventType,
      eventData,
      eventId: engagementEvent._id,
    });

    res.json({
      success: true,
      message: 'Event submitted & Motia workflow triggered',
      data: {
        eventId: engagementEvent._id,
        motiaResult,
      },
    });
  } catch (error) {
    console.error('Event submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit event',
    });
  }
});

export default router;




