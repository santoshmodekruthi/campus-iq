import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low',
  },
  riskReason: {
    type: String,
    default: '',
  },
  statistics: {
    totalAttendance: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    consecutiveAbsences: {
      type: Number,
      default: 0,
    },
    assignmentsSubmitted: {
      type: Number,
      default: 0,
    },
    assignmentsMissed: {
      type: Number,
      default: 0,
    },
    averagePerformance: {
      type: Number,
      default: 0,
    },
    performanceScores: {
      type: [Number],
      default: [],
    },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update lastUpdated on save
studentProfileSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Index for faster querying by risk level
studentProfileSchema.index({ riskLevel: 1 });

export default mongoose.model('StudentProfile', studentProfileSchema);







