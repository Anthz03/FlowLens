// Removes the public demo account (demo@flowlens.app) and, if nobody else belongs to it, its company and all its data.
//   npm run remove-demo            shows what WOULD be deleted (nothing changes)
//   npm run remove-demo -- --yes   actually deletes it
import 'dotenv/config';
import mongoose from 'mongoose';
import { User, Business, Process, ProcessStep, ProcessAnalysis, AuditLog } from '../src/models/index.js';

const DEMO_EMAIL = 'demo@flowlens.app';
const go = process.argv.includes('--yes');
const uri = process.env.MONGODB_URI;
if (!uri) { console.error('MONGODB_URI is not set.'); process.exit(1); }

await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
const host = uri.replace(/\/\/.*@/, '//***@').split('?')[0];
console.log(`Database: ${host}`);

const demo = await User.findOne({ email: DEMO_EMAIL });
if (!demo) { console.log('No demo account found. Nothing to do.'); await mongoose.disconnect(); process.exit(0); }

const others = await User.countDocuments({ business: demo.business, _id: { $ne: demo._id } });
const business = await Business.findById(demo.business);
const removeCompany = others === 0 && business;
const processIds = removeCompany ? await Process.find({ business: demo.business }).distinct('_id') : [];
const plan = {
  user: DEMO_EMAIL,
  company: removeCompany ? business.name : `(kept: ${others} other person/people belong to it)`,
  processes: processIds.length,
  steps: removeCompany ? await ProcessStep.countDocuments({ process: { $in: processIds } }) : 0,
};
console.log('Will delete:', JSON.stringify(plan));

if (!go) { console.log('\nDry run. Add --yes to delete.'); await mongoose.disconnect(); process.exit(0); }

if (removeCompany) {
  await ProcessStep.deleteMany({ process: { $in: processIds } });
  await ProcessAnalysis.deleteMany({ process: { $in: processIds } });
  await Process.deleteMany({ business: demo.business });
  await AuditLog.deleteMany({ business: demo.business });
  await Business.deleteOne({ _id: demo.business });
}
await User.deleteOne({ _id: demo._id });
console.log('Done. The demo account has been removed.');
await mongoose.disconnect();
