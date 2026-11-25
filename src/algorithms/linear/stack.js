import { answerMatches, codeLine, emitStep, parseNumbers } from '../shared.js';

const code = [
  codeLine('sig', 'bool Push(SqStack *&S, ElemType e)'),
  codeLine('full', 'if (S->top == MaxSize - 1) return false;   // 栈满'),
  codeLine('push', 'S->data[++S->top] = e; return true;        // 入栈'),
  codeLine('pop', 'bool Pop(SqStack *&S, ElemType &e)'),
  codeLine('empty', 'if (S->top == -1) return false;           // 栈空'),
  codeLine('popv', 'e = S->data[S->top--]; return true;        // 出栈'),
];

function snapshot(model, states = {}, caption = '') {
  return {
    view: 'stack',
    caption,
    capacity: model.capacity,
    items: model.items.map((value, index) => ({
      value,
      state: states[index] || 'idle',
    })),
  };
}

export const algorithm = {
  id: 'stack',
  mode: 'ops',
  view: 'stack',
  capacity: 8,
  fields: [{ name: 'values', label: '初始栈（自底向上）', type: 'text', default: '12 25 36' }],
  operations: [
    {
      id: 'push',
      label: '入栈',
      fields: [{ name: 'value', label: '元素 e', default: '48' }],
    },
    {
      id: 'pop',
      label: '出栈',
      fields: [],
    },
  ],
  code,

  createModel(form) {
    const text = String(form.values ?? '').trim();
    const items = text ? parseNumbers(text, { min: 1, max: this.capacity, name: '初始栈' }) : [];
    if (items.length > this.capacity) throw new Error(`栈容量为 ${this.capacity}`);
    return { items, capacity: this.capacity };
  },

  describe(model, emit) {
    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `顺序栈就绪，top = ${model.items.length - 1}，容量 ${model.capacity}。`,
      snapshot: snapshot(model, {}, '顺序栈（后进先出）'),
    });
  },

  apply(model, op, form) {
    const next = { items: model.items.slice(), capacity: model.capacity };
    const steps = [];

    if (op === 'push') {
      const value = parseNumbers(form.value, { min: 1, max: 1, name: '元素' })[0];
      if (next.items.length >= next.capacity) throw new Error('栈已满，无法入栈');
      next.items.push(value);
      emitStep(steps, {
        lineId: 'push',
        action: 'push',
        explanation: `${value} 入栈，成为新栈顶，top = ${next.items.length - 1}。`,
        snapshot: snapshot(next, { [next.items.length - 1]: 'insert' }, `${value} 入栈`),
      });
      return { model: next, steps };
    }

    if (!next.items.length) throw new Error('栈已空，无法出栈');
    const top = next.items.length - 1;
    const value = next.items[top];
    emitStep(steps, {
      lineId: 'popv',
      action: 'pop',
      explanation: `弹出栈顶元素 ${value}，top 由 ${top} 变为 ${top - 1}。`,
      snapshot: snapshot(next, { [top]: 'delete' }, `弹出 ${value}`),
    });
    next.items.pop();
    return { model: next, steps };
  },

  grade(answer) {
    const model = this.createModel({ values: '12 25 36' });
    const applied = this.apply(model, 'push', { value: '48' });
    return answerMatches(answer, applied.model.items.join(' '));
  },

  exercise: {
    prompt: '初始栈自底向上为 12 25 36，执行入栈 48 后，自底向上的栈序列是什么？',
    placeholder: '12 25 36 48',
  },
};
