import { answerMatches, codeLine, emitStep, parseNumbers } from '../shared.js';

const code = [
  codeLine('sig', 'bool EnQueue(SqQueue *&Q, ElemType e)'),
  codeLine('full', 'if ((Q->rear + 1) % MaxSize == Q->front) return false; // 队满'),
  codeLine('enq', 'Q->data[Q->rear] = e; Q->rear = (Q->rear + 1) % MaxSize;'),
  codeLine('deq', 'bool DeQueue(SqQueue *&Q, ElemType &e)'),
  codeLine('empty', 'if (Q->front == Q->rear) return false;               // 队空'),
  codeLine('deqv', 'e = Q->data[Q->front]; Q->front = (Q->front + 1) % MaxSize;'),
];

function snapshot(model, states = {}, caption = '') {
  return {
    view: 'queue',
    caption,
    front: model.front,
    rear: model.rear,
    slots: model.slots.map((value, index) => ({
      value: value === null ? null : value,
      state: states[index] || (value === null ? 'empty' : 'filled'),
    })),
  };
}

export const algorithm = {
  id: 'circular-queue',
  mode: 'ops',
  view: 'queue',
  capacity: 6,
  fields: [{ name: 'values', label: '初始队列（自队头到队尾）', type: 'text', default: '12 25 36' }],
  operations: [
    {
      id: 'enqueue',
      label: '入队',
      fields: [{ name: 'value', label: '元素 e', default: '48' }],
    },
    {
      id: 'dequeue',
      label: '出队',
      fields: [],
    },
  ],
  code,

  createModel(form) {
    const text = String(form.values ?? '').trim();
    const values = text ? parseNumbers(text, { min: 1, max: this.capacity, name: '初始队列' }) : [];
    if (values.length > this.capacity) throw new Error(`队列容量为 ${this.capacity}`);
    const slots = Array(this.capacity).fill(null);
    let front = 0;
    let rear = 0;
    let count = 0;
    for (const value of values) {
      slots[rear] = value;
      rear = (rear + 1) % this.capacity;
      count += 1;
    }
    return { slots, front, rear, count, capacity: this.capacity };
  },

  describe(model, emit) {
    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `循环队列就绪，front = ${model.front}，rear = ${model.rear}，容量 ${model.capacity}。`,
      snapshot: snapshot(model, {}, '循环队列（先进先出）'),
    });
  },

  apply(model, op, form) {
    const next = {
      slots: model.slots.slice(),
      front: model.front,
      rear: model.rear,
      count: model.count,
      capacity: model.capacity,
    };
    const steps = [];

    if (op === 'enqueue') {
      const value = parseNumbers(form.value, { min: 1, max: 1, name: '元素' })[0];
      if (next.count >= next.capacity) throw new Error('队列已满，无法入队');
      const oldRear = next.rear;
      next.slots[oldRear] = value;
      next.rear = (next.rear + 1) % next.capacity;
      next.count += 1;
      emitStep(steps, {
        lineId: 'enq',
        action: 'enqueue',
        explanation: `${value} 入队到下标 ${oldRear}，rear 由 ${oldRear} 变为 ${next.rear}。`,
        snapshot: snapshot(next, { [oldRear]: 'insert' }, `${value} 入队`),
      });
      return { model: next, steps };
    }

    if (!next.count) throw new Error('队列已空，无法出队');
    const oldFront = next.front;
    const value = next.slots[oldFront];
    emitStep(steps, {
      lineId: 'deqv',
      action: 'dequeue',
      explanation: `队头元素 ${value} 出队，front 由 ${oldFront} 变为 ${(oldFront + 1) % next.capacity}。`,
      snapshot: snapshot(next, { [oldFront]: 'delete' }, `${value} 出队`),
    });
    next.slots[oldFront] = null;
    next.front = (next.front + 1) % next.capacity;
    next.count -= 1;
    return { model: next, steps };
  },

  grade(answer) {
    const model = this.createModel({ values: '12 25 36' });
    const applied = this.apply(model, 'enqueue', { value: '48' });
    return answerMatches(answer, applied.model.slots.filter((v) => v !== null).join(' '));
  },

  exercise: {
    prompt: '初始循环队列为 12 25 36，执行入队 48 后，队列中的元素（自队头）是什么？',
    placeholder: '12 25 36 48',
  },
};
