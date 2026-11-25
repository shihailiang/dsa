import { answerMatches, codeLine } from '../shared.js';

const code = [
  codeLine('sig', 'void Eval(char expr[])'),
  codeLine('loop', 'while 还有字符未处理:'),
  codeLine('operand', '若是数字: 读完整数，压入操作数栈'),
  codeLine('lparen', "若是 '(': 压入运算符栈"),
  codeLine('rparen', "若是 ')': 弹出运算符计算，直到 '('"),
  codeLine('op', '若是运算符: 按优先级弹出并计算，再压栈'),
  codeLine('calc', '弹出 op 与两个操作数，结果压回操作数栈'),
  codeLine('done', '表达式结束，操作数栈顶即结果'),
];

function precedence(op) {
  return op === '+' || op === '-' ? 1 : 2;
}

function compute(a, op, b) {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  if (op === '/') {
    if (b === 0) throw new Error('除数为 0');
    return Math.trunc(a / b);
  }
  throw new Error(`未知运算符 ${op}`);
}

export const algorithm = {
  id: 'expression-eval',
  mode: 'trace',
  view: 'twins',
  fields: [{ name: 'expression', label: '中缀表达式', type: 'text', default: '3+4*5' }],
  code,

  execute(form, emit) {
    const expr = String(form.expression ?? '').trim().replace(/\s+/g, '');
    if (!expr) throw new Error('请输入表达式');

    const opnd = [];
    const optr = [];

    const snap = (focus, caption) => ({
      view: 'twins',
      leftTitle: '操作数栈',
      rightTitle: '运算符栈',
      focus,
      caption,
      left: opnd.map((value) => ({ value, state: 'idle' })),
      right: optr.map((value) => ({ value, state: 'idle' })),
    });

    emit({
      lineId: 'sig',
      action: 'start',
      explanation: `读入中缀表达式 ${expr}，用两个栈求值。`,
      snapshot: snap('', '准备求值'),
      metrics: null,
    });

    function popAndCompute() {
      const b = opnd[opnd.length - 1];
      const a = opnd[opnd.length - 2];
      const op = optr[optr.length - 1];
      opnd.pop();
      opnd.pop();
      optr.pop();
      const result = compute(a, op, b);
      opnd.push(result);
      emit({
        lineId: 'calc',
        action: 'calc',
        explanation: `弹出 ${a}、${b} 与运算符 ${op}，计算 ${a} ${op} ${b} = ${result}，结果入操作数栈。`,
        snapshot: snap(`${a} ${op} ${b} = ${result}`, '弹出并计算'),
        metrics: null,
      });
    }

    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (/\d/.test(ch)) {
        let num = 0;
        while (i < expr.length && /\d/.test(expr[i])) {
          num = num * 10 + (expr.charCodeAt(i) - 48);
          i += 1;
        }
        opnd.push(num);
        emit({
          lineId: 'operand',
          action: 'push',
          explanation: `读到操作数 ${num}，压入操作数栈。`,
          snapshot: snap(`${num}`, `操作数 ${num} 入栈`),
          metrics: null,
        });
        continue;
      }
      if (ch === '(') {
        optr.push('(');
        emit({
          lineId: 'lparen',
          action: 'push',
          explanation: `遇到 '('，压入运算符栈作为分界。`,
          snapshot: snap('(', " '(' 入栈"),
          metrics: null,
        });
        i += 1;
        continue;
      }
      if (ch === ')') {
        while (optr.length && optr[optr.length - 1] !== '(') popAndCompute();
        if (!optr.length) throw new Error('括号不匹配');
        optr.pop();
        emit({
          lineId: 'rparen',
          action: 'pop',
          explanation: `遇到 ')'，弹出 '(' 分界。`,
          snapshot: snap(')', "弹出 '('"),
          metrics: null,
        });
        i += 1;
        continue;
      }
      if (!'+-*/'.includes(ch)) throw new Error(`无法识别的字符「${ch}」`);
      while (optr.length && optr[optr.length - 1] !== '(' && precedence(optr[optr.length - 1]) >= precedence(ch)) {
        popAndCompute();
      }
      optr.push(ch);
      emit({
        lineId: 'op',
        action: 'push',
        explanation: `运算符 ${ch} 入栈。`,
        snapshot: snap(`${ch}`, `运算符 ${ch} 入栈`),
        metrics: null,
      });
      i += 1;
    }

    while (optr.length) popAndCompute();

    const result = opnd[opnd.length - 1];
    emit({
      lineId: 'done',
      action: 'done',
      explanation: `求值完成，${expr} = ${result}。`,
      snapshot: { ...snap(`${result}`, '求值完成'), result },
      metrics: null,
    });
  },

  grade(answer) {
    let result;
    this.execute({ expression: '3+4*5' }, (partial) => {
      if (partial.action === 'done') result = partial.snapshot.result;
    });
    return answerMatches(answer, String(result));
  },

  exercise: {
    prompt: '中缀表达式 3+4*5 的值是多少？',
    placeholder: '23',
  },
};
