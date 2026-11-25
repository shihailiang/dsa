import { describe, expect, it } from 'vitest';
import { generateTrace } from '../../src/engine/TraceGenerator.js';
import { algorithm as singlyLinkedList } from '../../src/algorithms/linear/singly-linked-list.js';
import { algorithm as stack } from '../../src/algorithms/linear/stack.js';
import { algorithm as circularQueue } from '../../src/algorithms/linear/circular-queue.js';
import { algorithm as expressionEval } from '../../src/algorithms/linear/expression-eval.js';

describe('singly-linked-list', () => {
  it('插入后结点序列正确', () => {
    const model = singlyLinkedList.createModel({ values: '12 25 36 48' });
    const { model: after } = singlyLinkedList.apply(model, 'insert', { index: '2', value: '20' });
    expect(after.nodes).toEqual([12, 20, 25, 36, 48]);
  });

  it('表头插入与删除正确', () => {
    const model = singlyLinkedList.createModel({ values: '12 25 36' });
    const { model: afterInsert } = singlyLinkedList.apply(model, 'insert', { index: '1', value: '7' });
    expect(afterInsert.nodes).toEqual([7, 12, 25, 36]);
    const { model: afterDelete } = singlyLinkedList.apply(afterInsert, 'remove', { index: '1' });
    expect(afterDelete.nodes).toEqual([12, 25, 36]);
  });

  it('删除位序非法时报错', () => {
    const model = singlyLinkedList.createModel({ values: '12 25' });
    expect(() => singlyLinkedList.apply(model, 'remove', { index: '5' })).toThrow();
  });

  it('练习判题正确', () => {
    expect(singlyLinkedList.grade('12 20 25 36 48').ok).toBe(true);
  });
});

describe('stack', () => {
  it('入栈后序列正确', () => {
    const model = stack.createModel({ values: '12 25 36' });
    const { model: after } = stack.apply(model, 'push', { value: '48' });
    expect(after.items).toEqual([12, 25, 36, 48]);
  });

  it('出栈弹出栈顶', () => {
    const model = stack.createModel({ values: '12 25 36' });
    const { model: after } = stack.apply(model, 'pop', {});
    expect(after.items).toEqual([12, 25]);
  });

  it('栈空出栈报错', () => {
    const model = stack.createModel({ values: '' });
    expect(() => stack.apply(model, 'pop', {})).toThrow(/空/);
  });

  it('练习判题正确', () => {
    expect(stack.grade('12 25 36 48').ok).toBe(true);
  });
});

describe('circular-queue', () => {
  it('入队后元素正确', () => {
    const model = circularQueue.createModel({ values: '12 25 36' });
    const { model: after } = circularQueue.apply(model, 'enqueue', { value: '48' });
    expect(after.slots.filter((v) => v !== null)).toEqual([12, 25, 36, 48]);
  });

  it('出队移除队头', () => {
    const model = circularQueue.createModel({ values: '12 25 36' });
    const { model: after } = circularQueue.apply(model, 'dequeue', {});
    expect(after.slots.filter((v) => v !== null)).toEqual([25, 36]);
    expect(after.front).toBe(1);
  });

  it('队空出队报错', () => {
    const model = circularQueue.createModel({ values: '' });
    expect(() => circularQueue.apply(model, 'dequeue', {})).toThrow(/空/);
  });

  it('练习判题正确', () => {
    expect(circularQueue.grade('12 25 36 48').ok).toBe(true);
  });
});

describe('expression-eval', () => {
  it('3+4*5 = 23', () => {
    const trace = generateTrace(expressionEval.execute, { expression: '3+4*5' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.snapshot.result).toBe(23);
  });

  it('(3+4)*5 = 35', () => {
    const trace = generateTrace(expressionEval.execute, { expression: '(3+4)*5' });
    const last = trace.steps[trace.steps.length - 1];
    expect(last.snapshot.result).toBe(35);
  });

  it('每个 lineId 都在代码模型里', () => {
    const trace = generateTrace(expressionEval.execute, { expression: '3+4*5' });
    const codeIds = new Set(expressionEval.code.map((line) => line.id));
    for (const step of trace.steps) expect(codeIds.has(step.lineId)).toBe(true);
  });

  it('练习判题正确', () => {
    expect(expressionEval.grade('23').ok).toBe(true);
    expect(expressionEval.grade('24').ok).toBe(false);
  });
});
