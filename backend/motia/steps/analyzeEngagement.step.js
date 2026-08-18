import StudentProfile from '../../models/StudentProfile.js';
import EngagementEvent from '../../models/EngagementEvent.js';

export default async function analyzeEngagement({ input }) {
  const { student, eventType, eventData } = input;

  // Get or create student profile
  let profile = await StudentProfile.findOne({ userId: student._id });
  
  if (!profile) {
    profile = await StudentProfile.create({
      userId: student._id,
      statistics: {
        totalAttendance: 0,
        presentCount: 0,
        absentCount: 0,
        consecutiveAbsences: 0,
        assignmentsSubmitted: 0,
        assignmentsMissed: 0,
        averagePerformance: 0,
        performanceScores: [],
      },
    });
  }

  // Update statistics based on event type
  switch (eventType) {
    case 'attendance':
      profile.statistics.totalAttendance += 1;
      
      if (eventData.status === 'present') {
        profile.statistics.presentCount += 1;
        profile.statistics.consecutiveAbsences = 0;
      } else {
        profile.statistics.absentCount += 1;
        profile.statistics.consecutiveAbsences += 1;
      }
      break;
    
    case 'assignment':
      if (eventData.submitted) {
        profile.statistics.assignmentsSubmitted += 1;
      } else {
        profile.statistics.assignmentsMissed += 1;
      }
      break;
    
    case 'performance':
      profile.statistics.performanceScores.push(eventData.score);
      
      // Calculate average performance
      const scores = profile.statistics.performanceScores;
      profile.statistics.averagePerformance = 
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      break;
  }

  await profile.save();


  return {
    ...input,
    profile,
  };
}







