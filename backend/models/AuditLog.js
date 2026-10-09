import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorUsername: { type: String, required: true },
  action: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetId: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
