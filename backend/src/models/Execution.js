import mongoose from 'mongoose';

const executionSchema = new mongoose.Schema({
  jobId:     { type: String, required: true, unique: true },
  language:  { type: String, required: true },
  code:      { type: String, required: true },
  stdin:     { type: String, default: '' },
  status:    { 
    type: String, 
    enum: ['queued', 'running', 'completed', 'failed'],
    default: 'queued'
  },
  stdout:    { type: String, default: '' },
  stderr:    { type: String, default: '' },
  exitCode:  { type: Number, default: null },
  executionTime: { type: Number, default: null }, // ms
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

export default mongoose.model('Execution', executionSchema);