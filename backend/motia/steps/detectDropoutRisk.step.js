import StudentProfile from '../../models/StudentProfile.js';

export default async function detectDropoutRisk({ input }) {
  const { student, profile } = input;

  let riskLevel = 'Low';
  const riskReasons = [];

  // Rule 1: 3 consecutive absences → Medium Risk
  if (profile.statistics.consecutiveAbsences >= 3) {
    riskLevel = 'Medium';
    riskReasons.push(`${profile.statistics.consecutiveAbsences} consecutive absences`);
  }

  // Rule 2: Missed 2 assignments → High Risk
  if (profile.statistics.assignmentsMissed >= 2) {
    riskLevel = 'High';
    riskReasons.push(`${profile.statistics.assignmentsMissed} missed assignments`);
  }

  // Rule 3: Average performance < 40% → High Risk
  if (profile.statistics.performanceScores.length > 0 && 
      profile.statistics.averagePerformance < 40) {
    riskLevel = 'High';
    riskReasons.push(`low performance (${profile.statistics.averagePerformance.toFixed(1)}%)`);
  }

  // Update profile with risk assessment
  profile.riskLevel = riskLevel;
  profile.riskReason = riskReasons.join(', ') || 'No risk detected';
  await profile.save();

  const riskChanged = profile.riskLevel !== input.profile?.riskLevel;

  if (riskReasons.length > 0) {
  }

  return {
    ...input,
    riskLevel,
    riskReasons,
    riskChanged,
    profile,
  };
}







