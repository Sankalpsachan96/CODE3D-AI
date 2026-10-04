import { AlgorithmEventType } from '../types.js';

export const linkedListOpsDetails = {
  id: 'linked-list-ops',
  name: 'Singly Linked List',
  category: 'Data Structures',
  description: 'A linear collection of data nodes where each node points to the subsequent node via a memory reference pointer rather than contiguous memory addresses.',
  howItWorks: 'Each node contains a data payload and a next pointer reference. Traversal starts from the head pointer and follows next references sequentially until reaching null.',
  example: 'Head -> [10] -> [20] -> [30] -> [40] -> null. Insert 5 at Head -> Head -> [5] -> [10] -> [20] -> [30] -> [40].',
  complexity: {
    time: {
      best: 'O(1) [Insert Head]',
      average: 'O(n) [Search/Access]',
      worst: 'O(n)',
    },
    space: 'O(n)',
    stable: 'Yes',
    inPlace: 'Yes',
  },
  advantages: [
    'Dynamic sizing: expands and contracts in O(1) time without contiguous reallocation.',
    'O(1) insertion and deletion at head without shifting elements.'
  ],
  limitations: [
    'No O(1) random indexing: accessing the k-th node requires O(k) pointer dereferences.',
    'Memory overhead: every node must store extra pointer references.'
  ],
  code: {
    java: `class Node {
    int val;
    Node next;
    Node(int val) { this.val = val; }
}

public class LinkedList {
    Node head;
    
    public void insertAtHead(int val) {
        Node newNode = new Node(val);
        newNode.next = head;
        head = newNode;
    }
    
    public void traverse() {
        Node curr = head;
        while (curr != null) {
            System.out.print(curr.val + " -> ");
            curr = curr.next;
        }
    }
}`,
    python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
        
    def insert_at_head(self, val):
        new_node = Node(val)
        new_node.next = self.head
        self.head = new_node`,
    cpp: `struct Node {
    int val;
    Node* next;
    Node(int v): val(v), next(nullptr) {}
};

class LinkedList {
public:
    Node* head = nullptr;
    void insertAtHead(int val) {
        Node* node = new Node(val);
        node->next = head;
        head = node;
    }
};`,
    javascript: `class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }
    insertAtHead(val) {
        const node = new Node(val);
        node.next = this.head;
        this.head = node;
    }
}`
  }
};

export function generateLinkedListSteps(inputValues) {
  const initialVals = Array.isArray(inputValues) && inputValues.length > 0
    ? [...inputValues]
    : [10, 20, 30, 40];

  const nodes = initialVals.map((val, idx) => ({ id: idx, val }));
  const steps = [];
  let stepNumber = 1;

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    activeIndex = null,
    pointers = {},
    explanation,
    aiHint,
    operation,
  }) => {
    const dsState = {
      type: 'linked-list',
      name: 'head',
      nodes: [...nodes],
      values: nodes.map((n) => n.val),
      activeIndex,
      pointers,
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, length: nodes.length, ...pointers },
      changedVariable: 'head',
      previousValue: null,
      currentValue: nodes.map((n) => n.val),
      dataStructure: dsState,
      dataStructureState: dsState,
      output: [],
      metadata: { operation, pointers },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { head: nodes[0]?.val },
    pointers: { HEAD: 0, CURR: 0 },
    activeIndex: 0,
    explanation: `Linked List initialized with ${nodes.length} nodes: Head -> [${nodes.map(n => n.val).join('] -> [')}].`,
    aiHint: 'Pointer references link each node to the next in sequence.',
    operation: 'INIT',
  });

  // Traverse through each node
  for (let i = 0; i < nodes.length; i++) {
    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.TRAVERSE,
      variables: { currNode: nodes[i].val, nodeIndex: i },
      activeIndex: i,
      pointers: { HEAD: 0, CURR: i },
      explanation: `Traversing node ${i}: current node value = ${nodes[i].val}. Following next pointer.`,
      aiHint: `Current pointer points to node [${nodes[i].val}].`,
      operation: 'TRAVERSE',
    });
  }

  // Insert a new node at head
  const newNodeVal = 5;
  nodes.unshift({ id: 99, val: newNodeVal });

  createStep({
    lineNumber: 9,
    eventType: AlgorithmEventType.INSERT,
    variables: { newNode: newNodeVal, head: newNodeVal },
    activeIndex: 0,
    pointers: { HEAD: 0, NEW_NODE: 0 },
    explanation: `Inserted new node [${newNodeVal}] at Head. New list starts at ${newNodeVal}.`,
    aiHint: `O(1) time complexity: simply pointed newNode.next to old head.`,
    operation: 'INSERT_HEAD',
  });

  createStep({
    lineNumber: 12,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { list: nodes.map(n => n.val) },
    pointers: { HEAD: 0 },
    activeIndex: 0,
    explanation: `Linked List operations complete: [${nodes.map(n => n.val).join(' -> ')} -> null].`,
    aiHint: 'Pointer structure successfully simulated in 3D WebGL.',
    operation: 'COMPLETE',
  });

  return {
    initialState: initialVals,
    steps,
    finalState: nodes.map((n) => n.val),
    complexity: linkedListOpsDetails.complexity,
    details: linkedListOpsDetails,
  };
}
