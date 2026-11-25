import { answerMatches, codeLine, emitStep, parseNumbers } from '../shared.js';

const code = [
  codeLine('sig', 'void ListInsert(LinkList *&L, int i, ElemType e)'),
  codeLine('find', 'while (j < i - 1 && p) { p = p->next; j++; }  // 找第 i-1 个结点'),
  codeLine('new', 's = new Node; s->data = e;                      // 新建结点'),
  codeLine('link', 's->next = p->next;                              // 新结点接后继'),
  codeLine('place', 'p->next = s;                                    // 前驱接新结点'),
  codeLine('del', 'void ListDelete(LinkList *&L, int i, ElemType &e)'),
  codeLine('dsave', 'q = p->next; e = q->data;                      // 保存被删结点'),
  codeLine('dlink', 'p->next = q->next;                              // 绕过 q'),
  codeLine('free', 'delete q;'),
];

function snapshot(model, states = {}, links = {}, caption = '') {
  return {
    view: 'linked',
    caption,
    nodes: model.nodes.map((value, index) => ({
      value,
      state: states[index] || 'idle',
      link: links[index] || 'idle',
    })),
  };
}

export const algorithm = {
  id: 'singly-linked-list',
  mode: 'ops',
  view: 'linked',
  fields: [{ name: 'values', label: '初始链表（从头到尾）', type: 'text', default: '12 25 36 48' }],
  operations: [
    {
      id: 'insert',
      label: '插入',
      fields: [
        { name: 'index', label: '位序 i', default: '2' },
        { name: 'value', label: '元素 e', default: '20' },
      ],
    },
    {
      id: 'remove',
      label: '删除',
      fields: [{ name: 'index', label: '位序 i', default: '1' }],
    },
  ],
  code,

  createModel(form) {
    const text = String(form.values ?? '').trim();
    const nodes = text ? parseNumbers(text, { min: 1, max: 8, name: '链表' }) : [];
    return { nodes };
  },

  describe(model, emit) {
    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `单链表就绪，共 ${model.nodes.length} 个结点，头指针 L 指向首结点。`,
      snapshot: snapshot(model, {}, {}, '单链表（L 为头指针）'),
    });
  },

  apply(model, op, form) {
    const next = { nodes: model.nodes.slice() };
    const steps = [];
    const length = next.nodes.length;
    const index = Number(String(form.index ?? '').trim());
    if (!Number.isInteger(index)) throw new Error('位序 i 需要整数');

    if (op === 'insert') {
      const value = parseNumbers(form.value, { min: 1, max: 1, name: '元素' })[0];
      if (index < 1 || index > length + 1) throw new Error('插入位序必须在 1 到 length+1 之间');
      const pred = index - 2; // 前驱下标（-1 表示头指针 L）
      emitStep(steps, {
        lineId: 'find',
        action: 'find',
        explanation:
          pred >= 0
            ? `定位第 ${index - 1} 个结点（值为 ${next.nodes[pred]}），它是位序 ${index} 的前驱。`
            : `位序 ${index} 是表头，前驱为头指针 L。`,
        snapshot: snapshot(next, pred >= 0 ? { [pred]: 'active' } : {}, pred >= 0 ? { [pred]: 'consider' } : {}, '找前驱'),
      });
      next.nodes.splice(index - 1, 0, value);
      emitStep(steps, {
        lineId: 'link',
        action: 'insert',
        explanation: `新建结点 s = ${value}，令 s->next 指向原第 ${index} 个结点，再让前驱指向 s。`,
        snapshot: snapshot(
          next,
          { [index - 1]: 'insert', ...(pred >= 0 ? { [pred]: 'active' } : {}) },
          { [index - 1]: 'consider', ...(pred >= 0 ? { [pred]: 'consider' } : {}) },
          '插入结点'
        ),
      });
      return { model: next, steps };
    }

    if (index < 1 || index > length) throw new Error('删除位序必须在 1 到 length 之间');
    const removed = next.nodes[index - 1];
    const pred = index - 2;
    emitStep(steps, {
      lineId: 'del',
      action: 'find',
      explanation:
        pred >= 0
          ? `定位第 ${index - 1} 个结点，它是被删结点 ${removed} 的前驱。`
          : `被删结点 ${removed} 是表头，前驱为头指针 L。`,
      snapshot: snapshot(next, pred >= 0 ? { [pred]: 'active' } : {}, pred >= 0 ? { [pred]: 'consider' } : {}, '找前驱'),
    });
    emitStep(steps, {
      lineId: 'dsave',
      action: 'mark',
      explanation: `标记待删除结点 q = ${removed}，准备让它前驱的 next 绕过它。`,
      snapshot: snapshot(next, { [index - 1]: 'delete', ...(pred >= 0 ? { [pred]: 'active' } : {}) }, { [index - 2]: 'consider' }, '标记被删结点'),
    });
    next.nodes.splice(index - 1, 1);
    emitStep(steps, {
      lineId: 'dlink',
      action: 'delete',
      explanation: `令前驱的 next 指向 q 的后继，结点 ${removed} 已从链上摘除。`,
      snapshot: snapshot(next, pred >= 0 ? { [pred]: 'active' } : {}, pred >= 0 ? { [pred]: 'consider' } : {}, '删除完成'),
    });
    return { model: next, steps };
  },

  grade(answer) {
    const model = this.createModel({ values: '12 25 36 48' });
    const applied = this.apply(model, 'insert', { index: '2', value: '20' });
    return answerMatches(answer, applied.model.nodes.join(' '));
  },

  exercise: {
    prompt: '在单链表 (12, 25, 36, 48) 的位序 2 插入 20。插入后的结点序列是什么？',
    placeholder: '12 20 25 36 48',
  },
};
