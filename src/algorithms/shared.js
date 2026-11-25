export function codeLine(id, text, indent = 0) {
  return { id, text, indent };
}

export function parseNumbers(text, { min = 1, max = 12, name = '序列' } = {}) {
  const parts = String(text ?? '')
    .trim()
    .split(/[\s,，、]+/)
    .filter(Boolean);
  if (!parts.length) throw new Error(`${name}不能为空`);
  if (parts.length < min) throw new Error(`${name}至少需要 ${min} 个整数`);
  if (parts.length > max) throw new Error(`${name}最多 ${max} 个整数，否则步骤会挤在一起`);
  return parts.map((part) => {
    if (!/^-?\d+$/.test(part)) throw new Error(`「${part}」不是整数`);
    const value = Number(part);
    if (Math.abs(value) > 999) throw new Error('请使用三位以内的整数，柱状图才看得清');
    return value;
  });
}

export function parsePositiveInt(text, { min = 1, max = 6, name = 'n' } = {}) {
  const value = String(text ?? '').trim();
  if (!/^\d+$/.test(value)) throw new Error(`${name} 需要一个正整数`);
  const number = Number(value);
  if (number < min || number > max) throw new Error(`${name} 的范围是 ${min} 到 ${max}`);
  return number;
}

export function barSnapshot(values, states = {}, tags = {}, caption = '') {
  return {
    view: 'bars',
    caption,
    items: values.map((value, index) => ({
      value,
      state: states[index] || 'idle',
      tag: tags[index] || '',
    })),
  };
}

export function withSorted(states, sorted) {
  const next = { ...states };
  for (const index of sorted) {
    if (!next[index]) next[index] = 'sorted';
  }
  return next;
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function answerMatches(answer, expected) {
  const norm = (value) => String(value).trim().split(/[\s,，、]+/).filter(Boolean).join(' ');
  return { ok: norm(answer) === norm(expected), expected: norm(expected) };
}

export function parseEdgeList(text, { maxVertices = 8, maxEdges = 16, directed = false } = {}) {
  const lines = String(text ?? '')
    .trim()
    .split(/[\n;；]+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) throw new Error('请至少写一条边，格式如 0 1 4');
  if (lines.length > maxEdges) throw new Error(`边数请控制在 ${maxEdges} 条以内`);
  const edges = [];
  let maxId = -1;
  for (const line of lines) {
    const parts = line.split(/[\s,，]+/).filter(Boolean);
    if (parts.length < 2 || parts.length > 3) throw new Error(`无法识别边「${line}」`);
    const source = Number(parts[0]);
    const target = Number(parts[1]);
    const weight = parts.length === 3 ? Number(parts[2]) : 1;
    if (![source, target, weight].every((item) => Number.isInteger(item))) {
      throw new Error(`边「${line}」需要整数`);
    }
    if (source === target) throw new Error('演示图不使用自环');
    if (weight <= 0 || weight > 99) throw new Error('边权请使用 1 到 99 的整数');
    maxId = Math.max(maxId, source, target);
    edges.push({ source, target, weight });
  }
  if (maxId < 0) throw new Error('图是空的');
  if (maxId + 1 > maxVertices) throw new Error(`顶点编号从 0 开始，最多 ${maxVertices} 个顶点`);
  const nodes = Array.from({ length: maxId + 1 }, (_, id) => ({ id: String(id), label: String(id) }));
  const normalized = edges.map((edge, index) => ({
    id: `e${index}`,
    source: String(edge.source),
    target: String(edge.target),
    weight: edge.weight,
  }));
  if (!directed) {
    const seen = new Set();
    for (const edge of normalized) {
      const key = [edge.source, edge.target].sort().join('-');
      if (seen.has(key)) throw new Error('无向图里同一对顶点只保留一条边');
      seen.add(key);
    }
  }
  return { nodes, edges: normalized, directed };
}

export function graphSnapshot(graph, nodeStates, edgeStates, caption, tape = []) {
  return {
    view: 'graph',
    directed: graph.directed,
    caption,
    tape,
    nodes: graph.nodes.map((node) => ({
      ...node,
      state: nodeStates[node.id] || 'idle',
    })),
    edges: graph.edges.map((edge) => ({
      ...edge,
      state: edgeStates[edge.id] || 'idle',
    })),
  };
}

export function adjacency(graph) {
  const lists = new Map(graph.nodes.map((node) => [node.id, []]));
  for (const edge of graph.edges) {
    lists.get(edge.source).push({ to: edge.target, weight: edge.weight, id: edge.id });
    if (!graph.directed) {
      lists.get(edge.target).push({ to: edge.source, weight: edge.weight, id: edge.id });
    }
  }
  for (const list of lists.values()) list.sort((a, b) => Number(a.to) - Number(b.to));
  return lists;
}

/** ops 模式（边操作边记步）里把一步追加到步骤数组。 */
export function emitStep(steps, partial) {
  steps.push({
    id: steps.length,
    lineId: partial.lineId,
    action: partial.action,
    explanation: partial.explanation,
    snapshot: partial.snapshot,
    metrics: partial.metrics ?? null,
  });
}
