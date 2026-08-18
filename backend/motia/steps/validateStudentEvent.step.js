import User from '../../models/User.js';
import EngagementEvent from '../../models/EngagementEvent.js';

export default async function validateStudentEvent({ input }) {
  const { studentId, eventType, eventData } = input;

  // Validate student exists
  const student = await User.findById(studentId);
  if (!student) {
    throw new Error('Student not found');
  }

  if (student.role !== 'student') {
    throw new Error('User is not a student');
  }

  // Validate event type
  const validEventTypes = ['attendance', 'assignment', 'performance'];
  if (!validEventTypes.includes(eventType)) {
    throw new Error(`Invalid event type. Must be one of: ${validEventTypes.join(', ')}`);
  }

  // Validate event data based on type
  switch (eventType) {
    case 'attendance':
      if (!eventData.status || !['present', 'absent'].includes(eventData.status)) {
        throw new Error('Attendance status must be "present" or "absent"');
      }
      break;
    
    case 'assignment':
      if (typeof eventData.submitted !== 'boolean') {
        throw new Error('Assignment submitted field must be a boolean');
      }
      if (!eventData.assignmentName) {
        throw new Error('Assignment name is required');
      }
      break;
    
    case 'performance':
      if (typeof eventData.score !== 'number' || eventData.score < 0 || eventData.score > 100) {
        throw new Error('Performance score must be a number between 0 and 100');
      }
      if (!eventData.testName) {
        throw new Error('Test name is required');
      }
      break;
  }


  return {
    validated: true,
    student,
    eventType,
    eventData,
  };
}







