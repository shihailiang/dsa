---
title: 单链表
module: linear
order: 2
algorithm: singly-linked-list
summary: 结点用指针串联，插入删除只需修改指针，无需移动元素。
timeComplexity: 按位序查找 O(n)；已知前驱时插入、删除 O(1)
spaceComplexity: O(1)（原地操作，不含结点本身）
tags: [单链表, 链式存储, 指针]
popular: false
---

## 算法原理

单链表用一组**任意**的存储单元存放元素，每个结点包含数据域 `data` 和指针域 `next`，指针指向后继结点。头指针 `L` 指向首结点，最后一个结点的 `next` 为空。

与顺序表最大的区别是：插入、删除**不需要移动元素**，只需修改相关结点的指针。

### 插入运算

在位序 $i$ 插入元素 $e$：先找到第 $i-1$ 个结点 $p$，然后

$$
\begin{aligned}
s&\text{ 新建结点，} s.\text{data} = e \\
s.\text{next} &= p.\text{next} \\
p.\text{next} &= s
\end{aligned}
$$

### 删除运算

删除位序 $i$ 的结点 $q$：找到其前驱 $p$，令 `p->next = q->next` 即可绕过 $q$。

## 动手观察

输入初始链表，执行「插入」或「删除」。对比顺序表，你会看到链表只改变两条指针，结点本身不搬动。
