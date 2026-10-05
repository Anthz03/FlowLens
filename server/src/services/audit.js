import { AuditLog } from '../models/index.js';
import { getConfig } from '../config.js';

// Records a security-relevant event: one structured log line (never contains passwords or tokens) and, when a business is known, a database record.
export async function audit(req, action, { user, business, meta } = {}) {
  const entry = {
    action,
    ip: req?.ip,
    userAgent: String(req?.headers?.['user-agent'] || '').slice(0, 200),
    business: business || user?.business,
    user: user?._id,
    meta,
  };
  if (!getConfig().isTest) console.log(JSON.stringify({ ts: new Date().toISOString(), level: 'audit', requestId: req?.id, ...entry, business: entry.business && String(entry.business), user: entry.user && String(entry.user) }));
  if (entry.business) {
    try { await AuditLog.create(entry); } catch (err) { console.error('audit write failed:', err.message); }
  }
}
