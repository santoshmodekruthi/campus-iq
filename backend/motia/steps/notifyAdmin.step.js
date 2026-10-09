import User from '../../models/User.js';

export default async function notifyAdmin({ input }) {
  const { student, riskLevel, riskReasons, riskChanged } = input;
  if ((riskLevel !== 'Medium' && riskLevel !== 'High') || !riskChanged) {
    return { ...input, adminAlert: null, adminRecipients: [] };
  }

  const admins = await User.find({ role: 'admin' }).select('_id').lean();
  return {
    ...input,
    adminAlert: {
      studentId: student._id,
      studentName: student.name,
      registrationNumber: student.registrationNumber,
      college: student.college,
      type: 'academic_risk_alert',
      riskLevel,
      reasons: riskReasons,
      recommendations: input.recommendations || [],
      actionRequired: true,
      timestamp: new Date(),
    },
    adminRecipients: admins.map((admin) => admin._id),
  };
}
