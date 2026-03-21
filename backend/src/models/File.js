import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'Untitled',
    trim: true,
    maxlength: 100
  },
  language: {
    type: String,
    enum: ['cpp', 'java', 'python', 'javascript'],
    required: true
  },
  code: {
    type: String,
    default: ''
  },
  // future use — collaborators (max 5)
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastOpenedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });  // adds createdAt and updatedAt automatically

export default mongoose.model('File', fileSchema);