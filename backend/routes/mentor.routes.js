import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import EngagementEvent from '../models/EngagementEvent.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /mentor/dashboard - Get mentor dashboard with all students
router.get('/dashboard', async (req, res) => {
  try {
    // Verify user is a mentor
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can access mentor dashboard',
      });
    }

    // Get all students
    const students = await User.find({ role: 'student' })
      .select('name email course year createdAt')
      .lean();

    // Get profiles for all students
    const studentProfiles = await StudentProfile.find({
      userId: { $in: students.map(s => s._id) }
    }).lean();

    // Create a map for quick lookup
    const profileMap = {};
    studentProfiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Combine student data with profiles
    const studentsWithProfiles = students.map(student => ({
      ...student,
      profile: profileMap[student._id.toString()] || {
        riskLevel: 'Low',
        riskReason: 'No activity yet',
        statistics: {
          totalAttendance: 0,
          presentCount: 0,
          absentCount: 0,
          assignmentsSubmitted: 0,
          assignmentsMissed: 0,
          averagePerformance: 0,
        },
      },
    }));

    // Sort by risk level (High → Medium → Low)
    const riskOrder = { High: 0, Medium: 1, Low: 2 };
    studentsWithProfiles.sort((a, b) => {
      return riskOrder[a.profile.riskLevel] - riskOrder[b.profile.riskLevel];
    });

    // Calculate summary statistics
    const summary = {
      totalStudents: students.length,
      highRisk: studentsWithProfiles.filter(s => s.profile.riskLevel === 'High').length,
      mediumRisk: studentsWithProfiles.filter(s => s.profile.riskLevel === 'Medium').length,
      lowRisk: studentsWithProfiles.filter(s => s.profile.riskLevel === 'Low').length,
    };

    res.json({
      success: true,
      data: {
        students: studentsWithProfiles,
        summary,
      },
    });
  } catch (error) {
    console.error('Mentor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load mentor dashboard',
    });
  }
});

// GET /mentor/student/:studentId - Get detailed student information
router.get('/student/:studentId', async (req, res) => {
  try {
    // Verify user is a mentor
    if (req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'Only mentors can access student details',
      });
    }

    const { studentId } = req.params;

    // Get student info
    const student = await User.findById(studentId).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get student profile
    const profile = await StudentProfile.findOne({ userId: studentId });

    // Get all events for this student
    const events = await EngagementEvent.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        student,
        profile,
        events,
      },
    });
  } catch (error) {
    console.error('Student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load student details',
    });
  }
});

export default router;







