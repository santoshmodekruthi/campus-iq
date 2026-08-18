import mongoose from 'mongoose';

const engagementEventSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventType: {
    type: String,
    enum: ['attendance', 'assignment', 'performance'],
    required: true,
  },
  eventData: {
    // For attendance
    status: {
      type: String,
      enum: ['present', 'absent'],
    },
    // For assignment
    submitted: {
      type: Boolean,
    },
    assignmentName: {
      type: String,
    },
    // For performance
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    testName: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
engagementEventSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.model('EngagementEvent', engagementEventSchema);







