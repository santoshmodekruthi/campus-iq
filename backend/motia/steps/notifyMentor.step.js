import User from '../../models/User.js';

export default async function notifyMentor({ input }) {
  const { student, riskLevel, riskReasons, riskChanged } = input;

  // Only notify mentors if risk is Medium or High and risk level changed
  if ((riskLevel === 'Medium' || riskLevel === 'High') && riskChanged) {
    // Get all mentors (in production, you might assign specific mentors to students)
    const mentors = await User.find({ role: 'mentor' });

    const notification = {
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email,
      course: student.course,
      year: student.year,
      type: 'mentor_alert',
      riskLevel,
      reasons: riskReasons,
      message: `Student ${student.name} is at ${riskLevel} risk. Immediate intervention recommended.`,
      actionRequired: true,
      timestamp: new Date(),
    };


    return {
      ...input,
      mentorNotification: notification,
      mentorsNotified: mentors.length,
    };
  }


  return {
    ...input,
    mentorNotification: null,
    mentorsNotified: 0,
  };
}







