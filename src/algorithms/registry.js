/**
 * 算法登记表：id → 动态 import。
 * 只有「真实实现 + 有内容页」的算法才登记在这里，
 * 未实现的按阶段逐步加入（写一个 JS + 一篇 MD + 在此登记一条）。
 *
 * 规划中的算法（后续阶段实现时，再解除对应登记）：
 *   tree:      tree-traversal
 *   graph:     dfs, bfs, prim, dijkstra
 *   design:    factorial, hanoi
 */
const loaders = {
  'sequence-list': () => import('./linear/sequence-list.js'),
  'singly-linked-list': () => import('./linear/singly-linked-list.js'),
  stack: () => import('./linear/stack.js'),
  'circular-queue': () => import('./linear/circular-queue.js'),
  'expression-eval': () => import('./linear/expression-eval.js'),
  'bubble-sort': () => import('./sorting/bubble-sort.js'),
  'insertion-sort': () => import('./sorting/insertion-sort.js'),
  'selection-sort': () => import('./sorting/selection-sort.js'),
  'quick-sort': () => import('./sorting/quick-sort.js'),
  'merge-sort': () => import('./sorting/merge-sort.js'),
  'sequential-search': () => import('./searching/sequential-search.js'),
  'binary-search': () => import('./searching/binary-search.js'),
  'bst-search': () => import('./searching/bst-search.js'),
};

export function loadAlgorithm(id) {
  const load = loaders[id];
  if (!load) return Promise.reject(new Error(`未登记的算法：${id}`));
  return load().then((mod) => mod.algorithm);
}

export const algorithmIds = Object.keys(loaders);
