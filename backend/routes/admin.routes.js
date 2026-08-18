import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import EngagementEvent from '../models/EngagementEvent.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /admin/overview - Get institution-wide statistics
router.get('/overview', async (req, res) => {
  try {
    // Verify user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can access overview',
      });
    }

    // Get all users count
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get risk level distribution
    const highRiskCount = await StudentProfile.countDocuments({ riskLevel: 'High' });
    const mediumRiskCount = await StudentProfile.countDocuments({ riskLevel: 'Medium' });
    const lowRiskCount = await StudentProfile.countDocuments({ riskLevel: 'Low' });

    // Get total events
    const totalEvents = await EngagementEvent.countDocuments();
    const attendanceEvents = await EngagementEvent.countDocuments({ eventType: 'attendance' });
    const assignmentEvents = await EngagementEvent.countDocuments({ eventType: 'assignment' });
    const performanceEvents = await EngagementEvent.countDocuments({ eventType: 'performance' });

    // Get recent high-risk students
    const highRiskStudents = await StudentProfile.find({ riskLevel: 'High' })
      .populate('userId', 'name email course year')
      .sort({ lastUpdated: -1 })
      .limit(10)
      .lean();

    // Calculate average statistics across all students
    const allProfiles = await StudentProfile.find().lean();
    const avgStats = {
      attendanceRate: 0,
      assignmentCompletionRate: 0,
      averagePerformance: 0,
    };

    if (allProfiles.length > 0) {
      let totalAttendanceRate = 0;
      let totalCompletionRate = 0;
      let totalPerformance = 0;
      let studentsWithAttendance = 0;
      let studentsWithAssignments = 0;
      let studentsWithPerformance = 0;

      allProfiles.forEach(profile => {
        if (profile.statistics.totalAttendance > 0) {
          totalAttendanceRate += (profile.statistics.presentCount / profile.statistics.totalAttendance) * 100;
          studentsWithAttendance++;
        }
        
        const totalAssignments = profile.statistics.assignmentsSubmitted + profile.statistics.assignmentsMissed;
        if (totalAssignments > 0) {
          totalCompletionRate += (profile.statistics.assignmentsSubmitted / totalAssignments) * 100;
          studentsWithAssignments++;
        }
        
        if (profile.statistics.performanceScores.length > 0) {
          totalPerformance += profile.statistics.averagePerformance;
          studentsWithPerformance++;
        }
      });

      avgStats.attendanceRate = studentsWithAttendance > 0 
        ? (totalAttendanceRate / studentsWithAttendance).toFixed(1) 
        : 0;
      avgStats.assignmentCompletionRate = studentsWithAssignments > 0 
        ? (totalCompletionRate / studentsWithAssignments).toFixed(1) 
        : 0;
      avgStats.averagePerformance = studentsWithPerformance > 0 
        ? (totalPerformance / studentsWithPerformance).toFixed(1) 
        : 0;
    }

    res.json({
      success: true,
      data: {
        userCounts: {
          totalStudents,
          totalMentors,
          totalAdmins,
        },
        riskDistribution: {
          highRisk: highRiskCount,
          mediumRisk: mediumRiskCount,
          lowRisk: lowRiskCount,
        },
        eventCounts: {
          total: totalEvents,
          attendance: attendanceEvents,
          assignment: assignmentEvents,
          performance: performanceEvents,
        },
        averageStatistics: avgStats,
        highRiskStudents: highRiskStudents.map(profile => ({
          student: profile.userId,
          riskLevel: profile.riskLevel,
          riskReason: profile.riskReason,
          lastUpdated: profile.lastUpdated,
          statistics: profile.statistics,
        })),
      },
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load overview',
    });
  }
});

export default router;







