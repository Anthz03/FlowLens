import { Business } from '../models/index.js';
import { DEFAULT_RULES } from './analyzer.js';

// The analysis thresholds for a business: its saved overrides on top of the defaults.
export async function getRules(businessId) {
  const saved = (await Business.findById(businessId).select('analysisRules').lean())?.analysisRules || {};
  const rules = { ...DEFAULT_RULES };
  for (const key of Object.keys(DEFAULT_RULES)) if (typeof saved[key] === 'number') rules[key] = saved[key];
  return rules;
}
