import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { User, Business, Process } from './models/index.js';
import { hashPassword } from './services/auth.js';
import { replaceSteps, loadProcess } from './services/processService.js';
import { optimizeProcess } from './services/optimizer.js';

// [key, name, type, role, department, tool, minutes, manual, description, inputs, outputs]
const mk = (rows) => rows.map(([key, name, type, role, department, tool, estimatedTime, isManual, description = '', inputs = '', outputs = '']) =>
  ({ key, name, type, role, department, tool, estimatedTime, isManual, description, inputs, outputs }));
const seq = (steps) => steps.slice(1).map((s, i) => ({ source: steps[i].key, target: s.key, label: '' }));

// Databases seeded before login existed have a demo user without a password; give it one.
export async function ensureDemoLogin() {
  const old = await User.findOne({ email: 'alex@brighttrading.example' }).select('+passwordHash');
  if (old && !old.passwordHash) {
    old.email = 'demo@flowlens.app';
    old.passwordHash = await hashPassword('demo1234');
    await old.save();
    console.log('Demo login enabled: demo@flowlens.app / demo1234');
  }
}

export async function seedIfEmpty() {
  if (await Process.countDocuments()) return;
  const business = await Business.create({ name: 'Bright Trading Co.', industry: 'Wholesale & Distribution', size: 'Small', departments: ['Sales', 'Warehouse', 'Finance', 'Purchasing', 'HR', 'IT'] });
  const user = await User.create({ name: 'Alex Rivera', email: 'demo@flowlens.app', passwordHash: await hashPassword('demo1234'), permission: 'owner', role: 'Operations Manager', business: business._id });
  const base = { business: business._id, createdBy: user._id };

  // 1. Messy order fulfillment (AS-IS)
  const orderSteps = mk([
    ['s1', 'Order received', 'start', '', 'Sales', '', 0, false],
    ['s2', 'Receive order by email or chat', 'task', 'Sales Rep', 'Sales', 'Email / Messenger', 10, true, 'Customer orders arrive in several channels.', 'Customer message', 'Order details'],
    ['s3', 'Enter order details into spreadsheet', 'task', 'Sales Rep', 'Sales', 'Excel', 15, true, 'Order is copied into the shared order sheet.', 'Order details', 'Order row'],
    ['s4', 'Check stock availability', 'task', 'Warehouse Clerk', 'Warehouse', 'Excel', 20, true, '', 'Order row', 'Stock status'],
    ['s5', 'In stock?', 'decision', 'Warehouse Clerk', 'Warehouse', '', 2, true],
    ['s6', 'Contact supplier for restock', 'task', 'Purchasing Officer', 'Purchasing', 'Phone', 45, true, 'Call or text the supplier and wait for confirmation.'],
    ['s7', 'Get manager approval', 'task', 'Sales Manager', 'Sales', 'Email', 60, true, 'Manager approves discounts and credit terms.'],
    ['s8', 'Re-enter order details into accounting', 'task', 'Accountant', 'Finance', 'QuickBooks', 20, true],
    ['s9', 'Pack items', 'task', 'Warehouse Clerk', 'Warehouse', '', 25, true, 'Pick and pack items for shipping.'],
    ['s10', 'Send shipping notification to customer', 'task', 'Sales Rep', 'Sales', 'Email', 10, true],
    ['s11', 'Issue invoice', 'task', 'Accountant', 'Finance', 'QuickBooks', 15, true, '', 'Order details', 'Invoice'],
    ['s12', 'Order completed', 'end', '', 'Finance', '', 0, false],
  ]);
  const orderEdges = [...seq(orderSteps.slice(0, 5)),
    { source: 's5', target: 's6', label: 'No' }, { source: 's5', target: 's7', label: 'Yes' }, { source: 's6', target: 's7', label: '' },
    ...seq(orderSteps.slice(6))];
  const order = await Process.create({ ...base, name: 'Customer Order Fulfillment', description: 'From receiving a customer order to invoicing. Currently run through email, spreadsheets and phone calls.', department: 'Sales', status: 'active' });
  await replaceSteps(order._id, orderSteps, orderEdges);

  // 2. Employee onboarding (healthier)
  const onb = mk([
    ['o1', 'New hire accepted offer', 'start', '', 'HR', '', 0, false],
    ['o2', 'Create employee record', 'task', 'HR Officer', 'HR', 'HR System', 10, false, 'Enter personal and contract data in the HRIS.', 'Signed contract', 'Employee record'],
    ['o3', 'Set up accounts and laptop', 'task', 'IT Support', 'IT', 'Ticketing System', 40, false, 'Email, laptop and software licences.', 'Employee record', 'Ready workstation'],
    ['o4', 'Welcome session and policy review', 'task', 'HR Officer', 'HR', '', 60, true, 'Walk through policies and benefits.', 'Handbook', 'Signed acknowledgement'],
    ['o5', 'Assign buddy and first-week plan', 'task', 'Team Lead', 'Operations', 'Shared Docs', 15, true, 'Plan of tasks and introductions.', 'Role description', 'Onboarding plan'],
    ['o6', 'Onboarding complete', 'end', '', 'HR', '', 0, false],
  ]);
  const o = await Process.create({ ...base, name: 'Employee Onboarding', description: 'Steps to get a new hire productive in their first week.', department: 'HR', status: 'active' });
  await replaceSteps(o._id, onb, seq(onb));

  // 3. Invoice approval (draft, poorly documented)
  const inv = mk([
    ['i1', 'Invoice received', 'start', '', 'Finance', '', 0, false],
    ['i2', 'Check invoice against purchase order', 'task', 'Accountant', 'Finance', 'QuickBooks', 25, true],
    ['i3', 'Amount above limit?', 'decision', '', 'Finance', '', 3, true],
    ['i4', 'Get director signature', 'task', 'Director', 'Management', 'Paper', 50, true, 'Printed and signed.'],
    ['i5', 'Schedule payment', 'task', '', 'Finance', 'Online Banking', 10, true],
    ['i6', 'Payment sent', 'end', '', 'Finance', '', 0, false],
  ]);
  const iv = await Process.create({ ...base, name: 'Supplier Invoice Approval', description: 'How supplier invoices are verified and paid.', department: 'Finance', status: 'draft' });
  await replaceSteps(iv._id, inv, [
    { source: 'i1', target: 'i2', label: '' }, { source: 'i2', target: 'i3', label: '' },
    { source: 'i3', target: 'i4', label: 'Yes' }, { source: 'i3', target: 'i5', label: 'No' },
    { source: 'i4', target: 'i5', label: '' }, { source: 'i5', target: 'i6', label: '' }]);

  // TO-BE version of the order process, generated by the optimizer
  const src = await loadProcess(order._id);
  const { steps, edges, improvements } = optimizeProcess(src);
  const tobe = await Process.create({ ...base, name: 'Customer Order Fulfillment (TO-BE)', description: src.description, department: 'Sales', status: 'draft', version: 'to-be', baseProcess: order._id, improvements });
  await replaceSteps(tobe._id, steps, edges);
  console.log('Demo data seeded. Login: demo@flowlens.app / demo1234');
}

// `npm run seed` executes this file directly against the configured DB.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { connectDB } = await import('./db.js');
  await connectDB();
  await seedIfEmpty();
  process.exit(0);
}
