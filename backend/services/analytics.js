export function assessAcademicRisk(student) {
  const attendance = Number(student.attendancePercentage || 0);
  const assignments = Number(student.assignmentCompletion || 0);
  const gpa = Number(student.gpa || 0);
  const marks = Array.isArray(student.academicMarks) ? student.academicMarks : [];
  const history = Array.isArray(student.performanceHistory) ? student.performanceHistory : [];
  const previous = history.length > 1 ? Number(history[history.length - 2].value) : null;
  const declining = previous !== null && gpa < previous - 0.2;
  const reasons = [];

  const hasAttendanceData = student.isSeeded || student.attendanceHistory?.length > 0 || attendance > 0;
  const hasAssignmentData = student.isSeeded || Number(student.assignmentsTotal || 0) > 0;
  const hasPerformanceData = marks.length > 0 || history.length > 0;
  if (hasAttendanceData && attendance < 75) reasons.push('Attendance is below 75%');
  if (hasAssignmentData && assignments < 70) reasons.push('Assignment completion is below 70%');
  if (hasPerformanceData && gpa < 6) reasons.push('GPA is below 6.0');
  if (marks.length > 0 && Math.min(...marks) < 50) reasons.push('At least one mark is below 50%');
  if (declining) reasons.push('GPA is declining');

  const critical = (hasAttendanceData && attendance < 60) ||
    (hasPerformanceData && gpa < 5) ||
    (marks.length > 0 && Math.min(...marks) < 40);
  const riskLevel = critical || reasons.length >= 3 ? 'High' : reasons.length > 0 ? 'Medium' : 'Low';
  const recommendations = [];

  if (hasAttendanceData && attendance < 75) recommendations.push('Contact the student about consistently low attendance and agree on an attendance support plan.');
  if (hasPerformanceData && (declining || gpa < 6)) recommendations.push('Recommend academic support and review recent assessments with the student.');
  if (hasAssignmentData && assignments < 70) recommendations.push('Identify incomplete assignments and make a catch-up plan with course staff.');
  if (reasons.length >= 2 || riskLevel === 'High') recommendations.push('Prioritize this student for an advisor check-in because multiple warning indicators are present.');
  if (recommendations.length === 0) recommendations.push('Maintain current study habits and review progress at the next check-in.');

  return {
    riskLevel,
    riskReasons: reasons.length ? reasons : ['No current warning indicators'],
    recommendations,
    isDeclining: declining,
    requiresIntervention: riskLevel === 'High' || reasons.length >= 2,
  };
}

export function applyAcademicRisk(student) {
  const assessment = assessAcademicRisk(student);
  student.riskLevel = assessment.riskLevel;
  student.riskReasons = assessment.riskReasons;
  student.recommendations = assessment.recommendations;
  student.isDeclining = assessment.isDeclining;
  student.requiresIntervention = assessment.requiresIntervention;
  return assessment;
}
