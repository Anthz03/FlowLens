import { Field, TextInput, TextArea, Select, Toggle } from './ui.jsx';
import { STEP_TYPES, DEPARTMENTS } from '../lib/constants.js';

// Shared editor for one process step (used in the Create/Edit modal and the Process Map side panel).
export default function StepFields({ step, onChange, compact = false }) {
  const set = (k) => (e) => onChange({ ...step, [k]: e.target.value });
  const span = compact ? "" : "sm:col-span-2";
  const isTask = step.type === 'task' || step.type === 'decision';
  return (
    <div className={`grid grid-cols-1 gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
      <Field label="Step name *" className={span}><TextInput value={step.name} onChange={set('name')} placeholder="e.g. Check stock availability" /></Field>
      <Field label="Type"><Select options={STEP_TYPES} value={step.type} onChange={set('type')} /></Field>
      {isTask && (
        <Field label="Estimated time (min)"><TextInput type="number" min="0" value={step.estimatedTime} onChange={(e) => onChange({ ...step, estimatedTime: Number(e.target.value) })} /></Field>
      )}
      {isTask && <>
        <Field label="Employee / role" hint="Who is responsible?"><TextInput value={step.role} onChange={set('role')} placeholder="e.g. Sales Rep" /></Field>
        <Field label="Department"><TextInput list="dept-list" value={step.department} onChange={set('department')} placeholder="e.g. Sales" />
          <datalist id="dept-list">{DEPARTMENTS.map((d) => <option key={d} value={d} />)}</datalist></Field>
        <Field label="Tool / system"><TextInput value={step.tool} onChange={set('tool')} placeholder="e.g. Excel, QuickBooks, Email" /></Field>
        <div className="flex items-end pb-2"><Toggle checked={step.isManual} onChange={(v) => onChange({ ...step, isManual: v })} label="Performed manually" /></div>
        <Field label="Inputs"><TextInput value={step.inputs} onChange={set('inputs')} placeholder="What is needed to start?" /></Field>
        <Field label="Outputs"><TextInput value={step.outputs} onChange={set('outputs')} placeholder="What does it produce?" /></Field>
        <Field label="Description" className={span}><TextArea value={step.description} onChange={set('description')} placeholder="Describe what happens in this step" /></Field>
      </>}
    </div>
  );
}
