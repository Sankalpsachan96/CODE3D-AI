import { AlgorithmEventType } from '../types.js';

export const queueOpsDetails = {
  id: 'queue-ops',
  name: 'Queue (FIFO)',
  category: 'Data Structures',
  description: 'A linear data structure following the First-In, First-Out (FIFO) principle. Items enter at the rear and exit from the front.',
  howItWorks: 'Items are appended to the rear via enqueue() and removed from the front via dequeue(). The front element is inspected with peek() without removal.',
  example: 'Enqueue 10 -> Enqueue 20 -> Enqueue 30 -> Front is 10, Rear is 30 -> Dequeue() removes 10 -> New front is 20.',
  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
    },
    space: 'O(n)',
    stable: 'Yes',
    inPlace: 'Yes',
  },
  advantages: [
    'Fair scheduling: elements are serviced strictly in arrival sequence.',
    'Essential for CPU task scheduling, print spoolers, Breadth-First Search (BFS), and message queues (RabbitMQ/Kafka).'
  ],
  limitations: [
    'No direct random access to middle elements.',
    'Array implementations require circular indices to prevent space wastage at the front.'
  ],
  code: {
    java: `public class Queue<T> {
    private LinkedList<T> list = new LinkedList<>();
    
    public void enqueue(T item) {
        list.addLast(item); // Enqueue at rear
    }
    
    public T dequeue() {
        return list.removeFirst(); // Dequeue from front
    }
    
    public T peek() {
        return list.getFirst();
    }
}`,
    python: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
        
    def enqueue(self, item):
        self.items.append(item)
        
    def dequeue(self):
        return self.items.popleft()
        
    def peek(self):
        return self.items[0]`,
    cpp: `template<typename T>
class Queue {
    queue<T> q;
public:
    void enqueue(T val) { q.push(val); }
    T dequeue() { T val = q.front(); q.pop(); return val; }
    T peek() { return q.front(); }
};`,
    javascript: `class Queue {
    constructor() { this.items = []; }
    enqueue(item) { this.items.push(item); }
    dequeue() { return this.items.shift(); }
    peek() { return this.items[0]; }
}`
  }
};

export function generateQueueSteps(inputItems) {
  const itemsToAdd = Array.isArray(inputItems) && inputItems.length > 0
    ? [...inputItems]
    : [10, 20, 30, 40];

  const queue = [];
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
      type: 'queue',
      name: 'queue',
      values: [...queue],
      frontIndex: 0,
      rearIndex: queue.length - 1,
      frontValue: queue.length > 0 ? queue[0] : null,
      rearValue: queue.length > 0 ? queue[queue.length - 1] : null,
      pointers: { front: 0, rear: queue.length - 1 },
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, length: queue.length, front: dsState.frontValue, rear: dsState.rearValue },
      changedVariable: 'queue',
      previousValue: null,
      currentValue: [...queue],
      dataStructure: dsState,
      dataStructureState: dsState,
      output: [],
      metadata: { operation, queueSize: queue.length },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { size: 0 },
    explanation: 'Queue initialized empty (Front: null, Rear: null).',
    aiHint: 'FIFO (First-In, First-Out): new elements enter at the rear and exit from the front.',
    operation: 'INIT',
  });

  for (const item of itemsToAdd) {
    queue.push(item);

    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.ENQUEUE,
      variables: { enqueuedItem: item },
      explanation: `Enqueued ${item} to the rear of the queue. Current rear is ${item}.`,
      aiHint: `Front remains at ${queue[0]}, rear is now ${item}.`,
      operation: 'ENQUEUE',
    });
  }

  // Dequeue first element
  const removed = queue.shift();
  createStep({
    lineNumber: 8,
    eventType: AlgorithmEventType.DEQUEUE,
    variables: { dequeuedItem: removed },
    explanation: `Dequeued ${removed} from the front of the queue. New front is ${queue[0]}.`,
    aiHint: `FIFO principle: ${removed} was enqueued first and was hence dequeued first.`,
    operation: 'DEQUEUE',
  });

  createStep({
    lineNumber: 10,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { remaining: [...queue] },
    explanation: `Queue operations complete. Current queue items: [${queue.join(', ')}].`,
    aiHint: 'FIFO queue demonstrated in 3D conveyor visualizer.',
    operation: 'COMPLETE',
  });

  return {
    initialState: itemsToAdd,
    steps,
    finalState: [...queue],
    complexity: queueOpsDetails.complexity,
    details: queueOpsDetails,
  };
}
