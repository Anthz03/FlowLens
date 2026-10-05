export const STEP_TYPES = [
  { value: 'start', label: 'Start' },
  { value: 'task', label: 'Task / Activity' },
  { value: 'decision', label: 'Decision point' },
  { value: 'end', label: 'End' },
];
export const STATUSES = ['draft', 'active', 'archived'];
export const DEPARTMENTS = ['Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Warehouse', 'Purchasing', 'IT', 'Customer Service', 'Management'];

export const uid = () => Math.random().toString(36).slice(2, 10);
export const newStep = (over = {}) => ({
  key: uid(), name: '', description: '', role: '', department: '', type: 'task', tool: '',
  inputs: '', outputs: '', estimatedTime: 10, isManual: true, ...over,
});

export const scoreColor = (s) => (s >= 75 ? '#16a34a' : s >= 50 ? '#d97706' : '#dc2626');
export const scoreLabel = (s) => (s >= 75 ? 'Healthy' : s >= 50 ? 'Needs attention' : 'At risk');
export const fmtTime = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ''}`.trim() : `${m} min`);
