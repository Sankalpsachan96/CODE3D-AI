import { AlgorithmEventType } from '../types.js';

export const stackOpsDetails = {
  id: 'stack-ops',
  name: 'Stack (LIFO)',
  category: 'Data Structures',
  description: 'A linear data structure following the Last-In, First-Out (LIFO) principle. Elements can only be pushed and popped from the top.',
  howItWorks: 'Elements are added to the top via push() and removed from the top via pop(). The element currently at the top is inspected via peek() without removal.',
  example: 'Push 10 -> Push 20 -> Push 30 -> Top is 30 -> Pop() returns 30 -> Top is now 20.',
  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    space: 'O(n)',
    stable: 'Not Applicable',
    inPlace: 'Yes',
  },
  advantages: [
    'O(1) constant time insertion (push) and deletion (pop) operations.',
    'Essential for function call stacks, recursion emulation, undo mechanisms, and syntax parsing (bracket matching).'
  ],
  limitations: [
    'No random access: elements below the top cannot be directly accessed without popping all preceding elements.',
    'Fixed size if backed by static arrays without dynamic reallocation (Stack Overflow).'
  ],
  code: {
    java: `public class Stack<T> {
    private List<T> elements = new ArrayList<>();
    
    public void push(T item) {
        elements.add(item);
    }
    
    public T pop() {
        if (isEmpty()) throw new EmptyStackException();
        return elements.remove(elements.size() - 1);
    }
    
    public T peek() {
        return elements.get(elements.size() - 1);
    }
}`,
    python: `class Stack:
    def __init__(self):
        self.items = []
        
    def push(self, item):
        self.items.append(item)
        
    def pop(self):
        return self.items.pop()
        
    def peek(self):
        return self.items[-1]`,
    cpp: `template<typename T>
class Stack {
    vector<T> items;
public:
    void push(T val) { items.push_back(val); }
    T pop() { T val = items.back(); items.pop_back(); return val; }
    T peek() { return items.back(); }
};`,
    javascript: `class Stack {
    constructor() { this.items = []; }
    push(item) { this.items.push(item); }
    pop() { return this.items.pop(); }
    peek() { return this.items[this.items.length - 1]; }
}`
  }
};

export function generateStackSteps(inputItems) {
  const itemsToAdd = Array.isArray(inputItems) && inputItems.length > 0
    ? [...inputItems]
    : [15, 28, 42, 60];

  const stack = [];
  const steps = [];
  let stepNumber = 1;

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    explanation,
    aiHint,
    operation,
  }) => {
    const dsState = {
      type: 'stack',
      name: 'stack',
      values: [...stack],
      topIndex: stack.length - 1,
      topValue: stack.length > 0 ? stack[stack.length - 1] : null,
      pointers: { top: stack.length - 1 },
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, size: stack.length, top: dsState.topValue },
      changedVariable: 'stack',
      previousValue: null,
      currentValue: [...stack],
      dataStructure: dsState,
      dataStructureState: dsState,
      output: [],
      metadata: { operation, stackSize: stack.length },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { size: 0 },
    explanation: 'Stack initialized empty (Size: 0).',
    aiHint: 'LIFO (Last-In, First-Out): new items are placed on the top of the stack.',
    operation: 'INIT',
  });

  // Push operations
  for (const item of itemsToAdd) {
    stack.push(item);

    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.PUSH,
      variables: { pushedItem: item },
      explanation: `Pushed value ${item} onto the stack. Top is now ${item}.`,
      aiHint: `Current stack height: ${stack.length}.`,
      operation: 'PUSH',
    });
  }

  // Peek
  const topVal = stack[stack.length - 1];
  createStep({
    lineNumber: 8,
    eventType: AlgorithmEventType.SELECT,
    variables: { peekedItem: topVal },
    explanation: `Peeked at stack top: value is ${topVal} (no removal).`,
    aiHint: 'Peek returns the top element without altering stack contents.',
    operation: 'PEEK',
  });

  // Pop
  const popped = stack.pop();
  createStep({
    lineNumber: 10,
    eventType: AlgorithmEventType.POP,
    variables: { poppedItem: popped },
    explanation: `Popped top value ${popped} from the stack. New top is ${stack[stack.length - 1]}.`,
    aiHint: `LIFO principle: the most recently pushed item (${popped}) was the first to be popped.`,
    operation: 'POP',
  });

  createStep({
    lineNumber: 12,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { remaining: [...stack] },
    explanation: `Stack sequence completed. Remaining items: [${stack.join(', ')}].`,
    aiHint: 'All stack operations demonstrated successfully in 3D WebGL.',
    operation: 'COMPLETE',
  });

  return {
    initialState: itemsToAdd,
    steps,
    finalState: [...stack],
    complexity: stackOpsDetails.complexity,
    details: stackOpsDetails,
  };
}
