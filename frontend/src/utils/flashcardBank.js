/** Offline fallback deck used when the AI service is unavailable. */
export const FLASHCARDS = [
  { id: 'fc-bubble-1', topic: 'Sorting', conceptId: 'bubble-sort', front: 'What is the worst-case time complexity of Bubble Sort?', back: 'O(n²)', explain: 'In the worst case, adjacent elements are compared across roughly n passes.' },
  { id: 'fc-binary-1', topic: 'Searching', conceptId: 'binary-search', front: 'What condition must hold before Binary Search is used?', back: 'The collection must be sorted', explain: 'Each comparison discards half of the remaining search range, giving O(log n) time.' },
  { id: 'fc-stack-1', topic: 'Stack', conceptId: 'stack', front: 'Does a Stack follow FIFO or LIFO?', back: 'LIFO — Last In, First Out', explain: 'The most recently pushed item is the first one popped, like a stack of plates.' },
  { id: 'fc-bst-1', topic: 'Trees', conceptId: 'bst', front: 'In a Binary Search Tree, where do smaller values go?', back: 'Into the left subtree', explain: 'For the standard BST rule, values smaller than a node are stored to its left.' },
  { id: 'fc-recursion-1', topic: 'Recursion', conceptId: 'recursion', front: 'What two parts does a recursive function need?', back: 'A base case and a recursive case', explain: 'The base case stops recursion; the recursive case reduces the problem toward it.' },
];