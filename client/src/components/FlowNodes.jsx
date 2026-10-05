import { Handle, Position } from '@xyflow/react';
import { Play, Flag, GitBranch, Hand, Zap, User } from 'lucide-react';

const handle = { width: 8, height: 8, background: '#94a3b8' };

function Terminal({ data, selected, kind }) {
  const start = kind === 'start';
  return (
    <div className={`flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium shadow-sm ${start ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-400 bg-slate-100 text-slate-700'} ${selected ? 'ring-2 ring-brand-500' : ''}`}>
      {!start && <Handle type="target" position={Position.Top} style={handle} />}
      {start ? <Play size={14} /> : <Flag size={14} />}{data.name}
      {start && <Handle type="source" position={Position.Bottom} style={handle} />}
    </div>
  );
}
export const StartNode = (p) => <Terminal {...p} kind="start" />;
export const EndNode = (p) => <Terminal {...p} kind="end" />;

export function TaskNode({ data, selected }) {
  const flagged = data.flags || [];
  return (
    <div className={`w-56 rounded-lg border bg-white p-3 shadow-sm ${selected ? 'ring-2 ring-brand-500' : ''} ${flagged.includes('bottleneck') ? 'border-red-400' : 'border-slate-300'}`}>
      <Handle type="target" position={Position.Top} style={handle} />
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="text-sm font-semibold leading-tight text-slate-900">{data.name}</span>
        {data.isManual ? <Hand size={14} className="mt-0.5 shrink-0 text-amber-500" aria-label="Manual" /> : <Zap size={14} className="mt-0.5 shrink-0 text-emerald-500" aria-label="Automated" />}
      </div>
      <p className={`flex items-center gap-1 text-xs ${data.role ? 'text-slate-500' : 'text-red-500'}`}><User size={12} />{data.role || 'No owner assigned'}</p>
      <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
        <span>{data.tool || 'No tool'}</span>
        <span className={flagged.includes('bottleneck') ? 'font-semibold text-red-600' : ''}>{data.estimatedTime} min</span>
      </div>
      <Handle type="source" position={Position.Bottom} style={handle} />
    </div>
  );
}

export function DecisionNode({ data, selected }) {
  return (
    <div className={`flex w-48 flex-col items-center rounded-lg border-2 border-dashed border-sky-400 bg-sky-50 p-3 text-center shadow-sm ${selected ? 'ring-2 ring-brand-500' : ''}`}>
      <Handle type="target" position={Position.Top} style={handle} />
      <GitBranch size={16} className="mb-1 text-sky-600" />
      <span className="text-sm font-semibold text-sky-900">{data.name}</span>
      <span className="text-xs text-sky-700">{data.role || 'No owner assigned'}</span>
      <Handle type="source" position={Position.Bottom} style={handle} />
    </div>
  );
}

export const nodeTypes = { start: StartNode, end: EndNode, task: TaskNode, decision: DecisionNode };
