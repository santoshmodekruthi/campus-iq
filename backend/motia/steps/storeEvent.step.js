import EngagementEvent from '../../models/EngagementEvent.js';

export default async function storeEvent({ input }) {
  const { student, eventType, eventData } = input;

  // Create engagement event
  const event = await EngagementEvent.create({
    studentId: student._id,
    eventType,
    eventData,
    processed: false,
  });


  return {
    ...input,
    event,
    eventId: event._id,
  };
}







