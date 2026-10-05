import { z } from 'zod';

// ---- helpers ----
const str = (max, min = 0) => z.string().trim().min(min).max(max);
// Optional text that is stored as '' when missing (used for full-replacement payloads like steps)
const text = (max) => z.string().max(max).nullish().transform((v) => (v ?? '').trim());
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const email = z.string().trim().toLowerCase().max(254).email('Enter a valid email address');

// ---- passwords ----
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123', 'qwertyuiop', 'iloveyou', 'admin123',
  'welcome1', 'welcome123', 'letmein123', 'abc12345', 'flowlens', 'flowlens123', 'changeme', 'passw0rd', '11111111', 'demo1234x',
]);
export function passwordProblem(pw) {
  if (typeof pw !== 'string') return 'Password is required.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (pw.length > 128) return 'Password must be 128 characters or fewer.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must include at least one letter and one number.';
  if (/^(.)\1+$/.test(pw) || COMMON_PASSWORDS.has(pw.toLowerCase())) return 'That password is too easy to guess. Choose another.';
  return null;
}
const newPassword = z.string().superRefine((v, ctx) => { const p = passwordProblem(v); if (p) ctx.addIssue({ code: 'custom', message: p }); });

// ---- auth ----
export const registerSchema = z.object({ name: str(80, 1), email, password: newPassword, businessName: str(120, 1) });
export const loginSchema = z.object({ email: z.string().trim().toLowerCase().max(254), password: z.string().min(1).max(128) });
export const googleSchema = z.object({ credential: z.string().min(10).max(4096) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword });

const list = (max, items = 80) => z.array(str(items)).max(max).optional();
export const onboardingSchema = z.union([
  z.object({ skip: z.literal(true) }),
  z.object({
    businessName: str(120).optional(), industry: str(80).optional(), size: str(40).optional(), departments: list(20, 60),
    jobRole: str(80).optional(), source: str(120).optional(), goals: list(12), documentation: list(12), challenge: str(500).optional(),
  }),
]);

// ---- processes ----
const STEP_TYPES = ['start', 'task', 'decision', 'end'];
const stepFields = {
  key: z.string().trim().max(40).optional(),
  name: str(200, 1),
  description: text(2000), role: text(100), department: text(100), tool: text(100), inputs: text(500), outputs: text(500),
  type: z.enum(STEP_TYPES).default('task'),
  estimatedTime: z.coerce.number().min(0).max(100000).default(0),
  isManual: z.boolean().default(true),
  position: z.object({ x: z.number().finite(), y: z.number().finite() }).nullish(),
};
export const stepSchema = z.object(stepFields);
export const stepUpdateSchema = z.object({
  name: str(200, 1), description: z.string().max(2000), role: z.string().max(100), department: z.string().max(100), tool: z.string().max(100),
  inputs: z.string().max(500), outputs: z.string().max(500), type: z.enum(STEP_TYPES),
  estimatedTime: z.coerce.number().min(0).max(100000), isManual: z.boolean(), position: z.object({ x: z.number().finite(), y: z.number().finite() }).nullable(),
}).partial().refine((o) => Object.keys(o).length > 0, 'Nothing to update');

const edgeSchema = z.object({ key: z.string().trim().max(40).optional(), source: str(40, 1), target: str(40, 1), label: text(60) });

const processFields = {
  name: str(200, 1), description: z.string().trim().max(5000), department: z.string().trim().max(100),
  status: z.enum(['draft', 'active', 'archived']), version: z.enum(['as-is', 'to-be']),
  baseProcess: objectId.nullish(),
  improvements: z.array(str(500)).max(50),
  steps: z.array(stepSchema).max(300), edges: z.array(edgeSchema).max(800),
};
export const processCreateSchema = z.object(processFields).partial().required({ name: true });
export const processUpdateSchema = z.object(processFields).partial();
export const duplicateSchema = z.object({ optimize: z.boolean().optional(), version: z.enum(['as-is', 'to-be']).optional() });
export const processQuerySchema = z.object({
  department: z.string().max(100).optional(), status: z.enum(['draft', 'active', 'archived']).optional(), version: z.enum(['as-is', 'to-be']).optional(),
}).strict();
export const analysisNotesSchema = z.object({ notes: z.string().max(5000) });

// ---- team & business ----
export const userCreateSchema = z.object({ name: str(80, 1), email, role: str(80).optional(), permission: z.enum(['admin', 'member']).default('member') });
export const userUpdateSchema = z.object({ name: str(80, 1), role: str(80), permission: z.enum(['owner', 'admin', 'member']) }).partial()
  .refine((o) => Object.keys(o).length > 0, 'Nothing to update');
export const businessUpdateSchema = z.object({ name: str(120, 1), industry: str(80), size: str(40), departments: z.array(str(60)).max(20) }).partial()
  .refine((o) => Object.keys(o).length > 0, 'Nothing to update');
