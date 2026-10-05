import { OAuth2Client } from 'google-auth-library';
import { User, Business } from '../models/index.js';

let client;
export const googleClientId = () => (process.env.GOOGLE_CLIENT_ID || '').trim();

const fail = (status, message) => Object.assign(new Error(message), { status });

// Verifies the ID token Google gave the browser (signature, expiry and that it was issued for OUR client id).
export async function verifyGoogleCredential(credential) {
  const id = googleClientId();
  if (!id) throw fail(503, 'Google sign-in is not configured on the server.');
  if (!credential) throw fail(400, 'Missing Google credential.');
  client ||= new OAuth2Client(id);
  const ticket = await client.verifyIdToken({ idToken: credential, audience: id });
  return ticket.getPayload();
}

// Finds the user with this Google email, or creates a new account + business for first-time users.
// An existing email/password account with the same (verified) email is linked automatically.
export async function findOrCreateGoogleUser(profile) {
  if (!profile.email || !profile.email_verified) throw fail(401, 'Your Google email address is not verified.');
  const email = profile.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    const business = await Business.create({
      name: `${profile.given_name || profile.name || 'My'}'s Business`,
      departments: ['Sales', 'Finance', 'HR', 'Operations', 'IT'],
    });
    user = await User.create({ name: profile.name || email.split('@')[0], email, role: 'Owner', business: business._id, googleId: profile.sub, picture: profile.picture });
  } else if (!user.googleId) {
    user.googleId = profile.sub;
    user.picture ||= profile.picture;
    await user.save();
  }
  return user;
}
