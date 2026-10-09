export default async function notifyStudent({ input }) {
  const { student, riskLevel, riskReasons, recommendations = [] } = input;
  if (riskLevel !== 'Medium' && riskLevel !== 'High') {
    return { ...input, studentNotification: null };
  }

  return {
    ...input,
    studentNotification: {
      studentId: student._id,
      studentName: student.name,
      type: 'academic_risk_alert',
      riskLevel,
      message: `Your academic indicators need attention: ${riskReasons.join('; ')}`,
      recommendations,
      timestamp: new Date(),
    },
  };
}






