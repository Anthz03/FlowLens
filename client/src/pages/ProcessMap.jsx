import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap, MarkerType,
  useNodesState, useEdgesState, addEdge, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, GitBranch, LayoutTemplate, Save, Trash2, Activity, Pencil } from 'lucide-react';
import { api } from '../lib/api.js';
import { Button, Loading, ErrorBox, Badge, Field, TextInput } from '../components/ui.jsx';
import StepFields from '../components/StepFields.jsx';
import ProcessPicker from '../components/ProcessPicker.jsx';
import { nodeTypes } from '../components/FlowNodes.jsx';
import { newStep, uid } from '../lib/constants.js';

const edgeDefaults = {
  type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed },
  labelBgPadding: [6, 3], labelBgBorderRadius: 4, labelStyle: { fontSize: 12, fontWeight: 600 },
};

// Keep diagrams readable: never zoom out past 50% on first view (long processes can be panned).
const FIT = { padding: 0.08, minZoom: 0.5, maxZoom: 1 };

function autoLayout(nodes, edges) {
  const depth = Object.fromEntries(nodes.map((n) => [n.id, 0]));
  for (let i = 0; i < nodes.length; i++) {
    let changed = false;
    edges.forEach((e) => { if (depth[e.target] < depth[e.source] + 1 && depth[e.source] + 1 < nodes.length) { depth[e.target] = depth[e.source] + 1; changed = true; } });
    if (!changed) break;
  }
  const levels = {};
  nodes.forEach((n) => (levels[depth[n.id]] ||= []).push(n));
  const pos = {};
  Object.entries(levels).forEach(([d, list]) => list.forEach((n, i) => { pos[n.id] = { x: 300 + (i - (list.length - 1) / 2) * 280, y: Number(d) * 125 }; }));
  return nodes.map((n) => ({ ...n, position: pos[n.id] }));
}

function Editor({ id }) {
  const [process, setProcess] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selNode, setSelNode] = useState(null);
  const [selEdge, setSelEdge] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const flow = useReactFlow();
  const bottlenecks = useRef(new Set());

  const styleEdge = (e) => ({ ...edgeDefaults, ...e, label: e.label || undefined, labelBgStyle: { fill: '#fff' } });

  useEffect(() => {
    Promise.all([api.process(id), api.analysis(id)]).then(([p, a]) => {
      bottlenecks.current = new Set(a.findings.filter((f) => f.type === 'bottleneck').flatMap((f) => f.steps));
      let ns = p.steps.map((s) => ({ id: s.key, type: s.type, position: s.position?.x != null ? { x: s.position.x, y: s.position.y } : { x: 0, y: 0 }, data: { ...s } }));
      let es = p.edges?.length ? p.edges.map((e) => ({ id: e.key || uid(), source: e.source, target: e.target, label: e.label })) : p.steps.slice(1).map((s, i) => ({ id: uid(), source: p.steps[i].key, target: s.key, label: '' }));
      if (!p.steps.some((s) => s.position?.x != null)) ns = autoLayout(ns, es);
      setProcess(p); setNodes(ns); setEdges(es.map(styleEdge));
      setTimeout(() => flow.fitView(FIT), 50);
    }).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const markDirty = () => setDirty(true);
  const displayNodes = useMemo(() => nodes.map((n) => ({ ...n, data: { ...n.data, flags: bottlenecks.current.has(n.data.name) ? ['bottleneck'] : [] } })), [nodes]);

  const onConnect = useCallback((c) => {
    const src = nodes.find((n) => n.id === c.source);
    const outgoing = edges.filter((e) => e.source === c.source).length;
    const label = src?.type === 'decision' ? (outgoing === 0 ? 'Yes' : outgoing === 1 ? 'No' : '') : '';
    setEdges((es) => addEdge(styleEdge({ ...c, id: uid(), label }), es));
    markDirty();
  }, [nodes, edges, setEdges]);

  const addNode = (type) => {
    const s = newStep(type === 'decision' ? { type, name: 'New decision?', estimatedTime: 2 } : { type, name: type === 'end' ? 'End' : 'New step' });
    const center = flow.screenToFlowPosition({ x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 });
    setNodes((ns) => [...ns, { id: s.key, type: s.type, position: center, data: s }]);
    setSelNode(s.key); markDirty();
  };

  const patchNode = (step) => {
    setNodes((ns) => ns.map((n) => (n.id === step.key ? { ...n, type: step.type, data: step } : n)));
    markDirty();
  };

  const patchEdgeLabel = (label) => { setEdges((es) => es.map((e) => (e.id === selEdge ? styleEdge({ ...e, label }) : e))); markDirty(); };

  const removeSelected = () => {
    if (selNode) { setNodes((ns) => ns.filter((n) => n.id !== selNode)); setEdges((es) => es.filter((e) => e.source !== selNode && e.target !== selNode)); setSelNode(null); }
    else if (selEdge) { setEdges((es) => es.filter((e) => e.id !== selEdge)); setSelEdge(null); }
    markDirty();
  };

  const layout = () => { setNodes((ns) => autoLayout(ns, edges)); markDirty(); setTimeout(() => flow.fitView(FIT), 50); };

  const save = async () => {
    setSaving(true); setError('');
    try {
      const ordered = [...nodes].sort((a, b) => a.position.y - b.position.y || a.position.x - b.position.x);
      const steps = ordered.map((n) => { const { flags, _id, process: _p, order, createdAt, updatedAt, __v, ...s } = n.data; return { ...s, position: { x: Math.round(n.position.x), y: Math.round(n.position.y) } }; });
      const p = await api.updateProcess(id, { steps, edges: edges.map((e) => ({ key: e.id, source: e.source, target: e.target, label: e.label || '' })) });
      setProcess(p); setDirty(false);
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  if (error && !process) return <ErrorBox error={error} />;
  if (!process) return <Loading />;
  const selected = nodes.find((n) => n.id === selNode);
  const selectedEdge = edges.find((e) => e.id === selEdge);

  return (
    <div className="flex h-[calc(100vh-7rem)] lg:h-[calc(100vh-9.5rem)] flex-col">
      <div data-tour="map-toolbar" className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-slate-900">{process.name}<Badge tone={process.version === 'to-be' ? 'brand' : 'blue'}>{process.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge></h1>
          <p className="text-xs text-slate-500">Drag to arrange · drag from a node's bottom dot to another node to connect · select and press Delete to remove</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => addNode('task')}><Plus size={14} />Step</Button>
          <Button size="sm" variant="secondary" onClick={() => addNode('decision')}><GitBranch size={14} />Decision</Button>
          <Button size="sm" variant="secondary" onClick={layout}><LayoutTemplate size={14} />Auto-layout</Button>
          <Button size="sm" variant="secondary" to={`/processes/${id}/edit`}><Pencil size={14} />Table view</Button>
          <Button size="sm" variant="secondary" to={`/processes/${id}/analysis`}><Activity size={14} />Analyze</Button>
          <Button size="sm" onClick={save} disabled={saving || !dirty}><Save size={14} />{saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</Button>
        </div>
      </div>
      <ErrorBox error={error} />
      <div className="flex min-h-0 flex-1 gap-4">
        <div data-tour="map-canvas" className="min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <ReactFlow nodes={displayNodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={(c) => { onNodesChange(c); if (c.some((x) => x.type === 'position' || x.type === 'remove')) markDirty(); }}
            onEdgesChange={(c) => { onEdgesChange(c); if (c.some((x) => x.type === 'remove')) markDirty(); }} onConnect={onConnect}
            onSelectionChange={({ nodes: n, edges: e }) => { setSelNode(n[0]?.id ?? null); setSelEdge(!n.length ? e[0]?.id ?? null : null); }}
            deleteKeyCode={['Backspace', 'Delete']} fitView minZoom={0.3}>
            <Background gap={20} color="#e2e8f0" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable className="!hidden md:!block" nodeColor={(n) => (n.type === 'decision' ? '#38bdf8' : n.type === 'start' ? '#34d399' : '#cbd5e1')} />
          </ReactFlow>
        </div>
        <aside data-tour="map-panel" className="hidden w-80 shrink-0 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 lg:block">
          {selected ? (
            <>
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">Edit step</h2>
                <button onClick={removeSelected} className="flex items-center gap-1 text-xs text-red-600 hover:underline"><Trash2 size={13} />Delete</button></div>
              <StepFields compact step={selected.data} onChange={patchNode} />
            </>
          ) : selectedEdge ? (
            <>
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-slate-800">Edit connection</h2>
                <button onClick={removeSelected} className="flex items-center gap-1 text-xs text-red-600 hover:underline"><Trash2 size={13} />Delete</button></div>
              <Field label="Label" hint="e.g. Yes / No for decision branches"><TextInput value={selectedEdge.label || ''} onChange={(e) => patchEdgeLabel(e.target.value)} /></Field>
            </>
          ) : (
            <div className="text-sm text-slate-500">
              <h2 className="mb-2 font-semibold text-slate-800">Legend</h2>
              <ul className="space-y-1.5 text-xs">
                <li>🟢 Start / ⚪ End</li><li>⬜ Task — <span className="text-amber-500">hand</span> = manual, <span className="text-emerald-500">bolt</span> = automated</li>
                <li>🔷 Decision point</li><li><span className="text-red-500">Red border</span> = possible bottleneck</li>
              </ul>
              <p className="mt-4 text-xs">Select a step or connection to edit its details. <Link to={`/processes/${id}`} className="text-brand-600 hover:underline">Process details</Link></p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function ProcessMap() {
  const { id } = useParams();
  if (!id) return <ProcessPicker title="Process Map" suffix="map" />;
  return <ReactFlowProvider><Editor key={id} id={id} /></ReactFlowProvider>;
}
