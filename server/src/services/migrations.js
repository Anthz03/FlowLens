import { User } from '../models/index.js';

// Accounts created before roles existed have no explicit permission. Make sure every business has an owner
// by promoting its oldest user, so nobody is locked out of managing their own team.
export async function ensureOwners() {
  const withOwner = new Set((await User.find({ permission: 'owner' }).select('business')).map((u) => String(u.business)));
  const oldestPerBusiness = await User.aggregate([{ $sort: { createdAt: 1 } }, { $group: { _id: '$business', id: { $first: '$_id' } } }]);
  let promoted = 0;
  for (const { _id: business, id } of oldestPerBusiness) {
    if (!business || withOwner.has(String(business))) continue;
    await User.updateOne({ _id: id }, { $set: { permission: 'owner' } });
    promoted++;
  }
  if (promoted) console.log(`Migration: promoted ${promoted} user(s) to owner.`);
}
