---
title: 循环队列
module: linear
order: 4
algorithm: circular-queue
summary: 先进先出（FIFO），把数组首尾相接成环，避免假溢出。
timeComplexity: 入队、出队均为 O(1)
spaceComplexity: O(1)（操作本身，不含队列存储）
tags: [队列, 先进先出, 循环队列]
popular: false
---

## 算法原理

队列是只允许在**队尾**入队、在**队头**出队的线性表，遵循**先进先出**（FIFO）原则。普通顺序队列在出队后数组前端会空出但无法复用，造成「假溢出」。

循环队列把数组看成一个环，用取模运算让 `front` 和 `rear` 指针首尾相接：

$$
\text{入队：} data[rear]=e,\quad rear=(rear+1)\bmod MaxSize
$$

$$
\text{出队：} e=data[front],\quad front=(front+1)\bmod MaxSize
$$

## 复杂度

入队、出队均为 $O(1)$。

## 动手观察

初始队列 `12 25 36`。执行入队、出队，观察 `front` 和 `rear` 指针如何绕到数组开头，空出的位置能被重新利用。
