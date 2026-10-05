import mongoose from 'mongoose';
const { Schema } = mongoose;
const opts = { timestamps: true };

export const User = mongoose.model('User', new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'Process Owner' },
  passwordHash: { type: String, select: false },
  googleId: String,
  picture: String,
  onboarding: {
    completed: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false },
    source: String,
    jobRole: String,
    goals: [String],
    documentation: [String],
    challenge: String,
    completedAt: Date,
  },
  business: { type: Schema.Types.ObjectId, ref: 'Business' },
}, opts));

export const Business = mongoose.model('Business', new Schema({
  name: { type: String, required: true },
  industry: String,
  size: { type: String, default: 'Small' },
  departments: [String],
}, opts));

const stepSchema = new Schema({
  process: { type: Schema.Types.ObjectId, ref: 'Process', required: true, index: true },
  key: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  role: { type: String, default: '' },
  department: { type: String, default: '' },
  type: { type: String, enum: ['start', 'task', 'decision', 'end'], default: 'task' },
  tool: { type: String, default: '' },
  inputs: { type: String, default: '' },
  outputs: { type: String, default: '' },
  estimatedTime: { type: Number, default: 0 }, // minutes
  isManual: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  position: { x: Number, y: Number },
}, opts);
export const ProcessStep = mongoose.model('ProcessStep', stepSchema);

export const Process = mongoose.model('Process', new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  department: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  version: { type: String, enum: ['as-is', 'to-be'], default: 'as-is' },
  baseProcess: { type: Schema.Types.ObjectId, ref: 'Process', default: null },
  improvements: [String],
  steps: [{ type: Schema.Types.ObjectId, ref: 'ProcessStep' }],
  edges: [{ _id: false, key: String, source: String, target: String, label: { type: String, default: '' } }],
  business: { type: Schema.Types.ObjectId, ref: 'Business' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, opts));

export const ProcessAnalysis = mongoose.model('ProcessAnalysis', new Schema({
  process: { type: Schema.Types.ObjectId, ref: 'Process', required: true, unique: true },
  score: Number,
  categories: Schema.Types.Mixed,
  metrics: Schema.Types.Mixed,
  findings: [Schema.Types.Mixed],
  recommendations: [String],
  notes: { type: String, default: '' },
}, opts));
