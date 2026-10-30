import React, { useMemo } from 'react';
import { Billboard, Text } from '@react-three/drei';
import { useTheme } from '../context/ThemeContext';

function normalizeTrie(data) {
  const rawNodes = Array.isArray(data?.nodes) ? data.nodes : [];
  const rawEdges = Array.isArray(data?.edges) ? data.edges : [];
  const nodes = rawNodes.map((node, index) => ({ id: String(node?.id ?? index), label: String(node?.char ?? node?.character ?? node?.label ?? node?.value ?? node?.val ?? ''), terminal: Boolean(node?.isEnd ?? node?.terminal ?? node?.isWordEnd ?? node?.end) }));
  const ids = new Set(nodes.map(node => node.id));
  const edges = rawEdges.map(edge => ({ from: String(Array.isArray(edge) ? edge[0] : (edge.from ?? edge.source ?? edge.parent ?? '')), to: String(Array.isArray(edge) ? edge[1] : (edge.to ?? edge.target ?? edge.child ?? '')), label: String(Array.isArray(edge) ? '' : (edge.char ?? edge.label ?? edge.character ?? '')) })).filter(edge => ids.has(edge.from) && ids.has(edge.to));
  rawNodes.forEach((node, index) => {
    const from = String(node?.id ?? index), children = node?.children;
    if (Array.isArray(children)) children.forEach(child => { const to = String(child?.id ?? child?.nodeId ?? ''); if (ids.has(to) && !edges.some(edge => edge.from === from && edge.to === to)) edges.push({ from, to, label: String(child?.char ?? child?.label ?? '') }); });
    else if (children && typeof children === 'object') Object.entries(children).forEach(([char, child]) => { const to = String(child?.id ?? child?.nodeId ?? child); if (ids.has(to) && !edges.some(edge => edge.from === from && edge.to === to)) edges.push({ from, to, label: char }); });
  });
  return { nodes, edges };
}

export default function TrieVisualizer3D({ dataStructureState }) {
  const { isBright } = useTheme();
  const { nodes, edges } = useMemo(() => normalizeTrie(dataStructureState || {}), [dataStructureState]);
  const layout = useMemo(() => {
    if (!nodes.length) return { positioned: [], links: [] };
    const children = new Map(nodes.map(node => [node.id, []]));
    const parent = new Map();
    edges.forEach(edge => { children.get(edge.from)?.push(edge.to); parent.set(edge.to, edge.from); });
    const roots = nodes.filter(node => !parent.has(node.id));
    const positions = new Map(); let leafIndex = 0;
    const visit = (id, depth, seen = new Set()) => {
      if (seen.has(id)) return null;
      seen.add(id);
      const childIds = children.get(id) || [];
      const childX = childIds.map(child => visit(child, depth + 1, seen)).filter(Number.isFinite);
      const x = childX.length ? childX.reduce((sum, value) => sum + value, 0) / childX.length : leafIndex++;
      positions.set(id, [x * 1.55, -depth * 1.65, 0]); return x;
    };
    (roots.length ? roots.map(node => node.id) : [nodes[0].id]).forEach(id => visit(id, 0, new Set()));
    const positioned = nodes.filter(node => positions.has(node.id)).map(node => ({ ...node, pos: positions.get(node.id) }));
    const pos = new Map(positioned.map(node => [node.id, node.pos]));
    return { positioned, links: edges.filter(edge => pos.has(edge.from) && pos.has(edge.to)).map(edge => ({ ...edge, start: pos.get(edge.from), end: pos.get(edge.to) })) };
  }, [nodes, edges]);
  if (!layout.positioned.length) return <group />;
  return <group>
    {layout.links.map(edge => {
      const start = edge.start, end = edge.end;
      const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, 0];
      const dx = end[0] - start[0], dy = end[1] - start[1];
      const length = Math.sqrt(dx * dx + dy * dy), angle = -Math.atan2(dx, dy);
      return <group key={edge.from + '-' + edge.to}>
        <mesh position={mid} rotation={[0, 0, angle]}><cylinderGeometry args={[0.025, 0.025, length, 8]} /><meshStandardMaterial color="#64748b" /></mesh>
        {edge.label && <Billboard position={[mid[0], mid[1] + 0.12, 0]}><Text fontSize={0.18} color="#f59e0b">{edge.label}</Text></Billboard>}
      </group>;
    })}
    {layout.positioned.map(node => <group key={node.id} position={node.pos}>
      <mesh><sphereGeometry args={[0.34, 24, 24]} /><meshStandardMaterial color={node.terminal ? '#10b981' : '#0ea5e9'} emissive={node.terminal ? '#047857' : '#0369a1'} emissiveIntensity={0.5} /></mesh>
      <Billboard position={[0, 0, 0.42]}><Text fontSize={0.25} color={isBright ? '#0f172a' : '#fff'}>{node.label || '∅'}</Text></Billboard>
      {node.terminal && <Billboard position={[0, -0.5, 0]}><Text fontSize={0.13} color="#10b981">END</Text></Billboard>}
    </group>)}
  </group>;
}
