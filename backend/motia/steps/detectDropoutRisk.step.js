import User from '../../models/User.js';
import StudentProfile from '../../models/StudentProfile.js';
import { applyAcademicRisk } from '../../services/analytics.js';

export default async function detectDropoutRisk({ input }) {
  const studentId = input.student?._id || input.student?.id || input.studentId;
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') throw new Error('Student record for risk assessment was not found');

  const previousRisk = student.riskLevel;
  const assessment = applyAcademicRisk(student);
  await student.save();

  const profile = await StudentProfile.findOne({ userId: student._id });
  if (profile) {
    profile.riskLevel = student.riskLevel;
    profile.riskReason = student.riskReasons.join(', ');
    await profile.save();
  }

  return {
    ...input,
    riskLevel: assessment.riskLevel,
    riskReasons: assessment.riskReasons,
    recommendations: assessment.recommendations,
    riskChanged: previousRisk !== assessment.riskLevel,
    profile,
    student: student.toJSON(),
  };
}
