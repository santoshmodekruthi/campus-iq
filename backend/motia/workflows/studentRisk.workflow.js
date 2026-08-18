export default {
  name: 'StudentDropoutRiskWorkflow',
  trigger: 'STUDENT_EVENT',
  steps: [
    'validateStudentEvent',
    'storeEvent',
    'analyzeEngagement',
    'detectDropoutRisk',
    'notifyStudent',
    'notifyMentor',
  ],
};







