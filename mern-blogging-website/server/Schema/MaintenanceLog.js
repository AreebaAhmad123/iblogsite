import mongoose from 'mongoose';

const MaintenanceLogSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['backup', 'migration', 'cleanup', 'other'],
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure', 'in_progress'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('MaintenanceLog', MaintenanceLogSchema); 