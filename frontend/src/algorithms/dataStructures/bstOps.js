import { AlgorithmEventType } from '../types.js';

export const bstOpsDetails = {
  id: 'bst-ops',
  name: 'Binary Search Tree (BST)',
  category: 'Data Structures',
  description: 'A rooted binary tree with the BST invariant: every node in the left subtree is less than the root, and every node in the right subtree is greater.',
  howItWorks: 'Insertions and searches start at the root node. Compare target with current node. If target < current, traverse left. If target > current, traverse right. If equal, node is found. Insert new nodes at the first vacant leaf position.',
  example: 'Insert 50 -> Insert 30 (left of 50) -> Insert 70 (right of 50) -> Insert 20 (left of 30) -> Insert 40 (right of 30) -> In-order gives: 20, 30, 40, 50, 70.',
  complexity: {
    time: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n) [Skewed]',
    },
    space: 'O(n)',
    stable: 'Not Applicable',
    inPlace: 'Yes',
  },
  advantages: [
    'O(log n) average time for dynamic lookup, insertion, and deletion.',
    'Maintains sorted order naturally: an in-order traversal yields values in non-decreasing order.',
    'Provides efficient range queries, predecessor, and successor searches.'
  ],
  limitations: [
    'Can degenerate into an O(n) linked list if elements are inserted in already sorted sequence (requires self-balancing like AVL or Red-Black).',
    'Higher memory consumption per element due to two child pointers.'
  ],
  code: {
    java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public class BST {
    TreeNode root;

    public TreeNode insert(TreeNode node, int val) {
        if (node == null) return new TreeNode(val);
        if (val < node.val) node.left = insert(node.left, val);
        else if (val > node.val) node.right = insert(node.right, val);
        return node;
    }
}`,
    python: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, root, val):
        if not root:
            return TreeNode(val)
        if val < root.val:
            root.left = self.insert(root.left, val)
        else:
            root.right = self.insert(root.right, val)
        return root`,
    cpp: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v): val(v), left(nullptr), right(nullptr) {}
};

TreeNode* insert(TreeNode* node, int val) {
    if (!node) return new TreeNode(val);
    if (val < node->val) node->left = insert(node->left, val);
    else if (val > node->val) node->right = insert(node->right, val);
    return node;
};`,
    javascript: `class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

function insert(node, val) {
    if (!node) return new TreeNode(val);
    if (val < node.val) node.left = insert(node.left, val);
    else if (val > node.val) node.right = insert(node.right, val);
    return node;
}`
  }
};

export function generateBstSteps(inputValues) {
  const valuesToInsert = Array.isArray(inputValues) && inputValues.length > 0
    ? [...inputValues]
    : [50, 30, 70, 20, 40, 60, 80];

  const steps = [];
  let stepNumber = 1;
  const currentValues = [];

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
      type: 'tree',
      name: 'root',
      values: [...currentValues],
      activeIndex,
      pointers,
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, nodeCount: currentValues.length },
      changedVariable: 'tree',
      previousValue: null,
      currentValue: [...currentValues],
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
    variables: { totalNodes: valuesToInsert.length },
    explanation: 'Binary Search Tree initialization: root = null.',
    aiHint: 'BST Property: Left Subtree < Root < Right Subtree.',
    operation: 'INIT',
  });

  for (let i = 0; i < valuesToInsert.length; i++) {
    const val = valuesToInsert[i];
    currentValues.push(val);

    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.INSERT,
      variables: { insertedValue: val, index: i },
      activeIndex: i,
      pointers: { current: i, inserted: val },
      explanation: i === 0
        ? `Inserted root node with value ${val}.`
        : `Inserted node ${val} into BST maintaining the invariant: Left < Parent < Right.`,
      aiHint: `Current tree contains ${currentValues.length} nodes.`,
      operation: 'INSERT',
    });
  }

  // Search example in the BST
  const searchTarget = valuesToInsert[Math.floor(valuesToInsert.length / 2)] || 40;
  createStep({
    lineNumber: 10,
    eventType: AlgorithmEventType.SELECT,
    variables: { searchTarget },
    pointers: { target: searchTarget },
    explanation: `Searching for target ${searchTarget} in BST starting from root.`,
    aiHint: 'Comparison: navigate left if target < node, right if target > node.',
    operation: 'SEARCH',
  });

  createStep({
    lineNumber: 12,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { treeNodes: [...currentValues] },
    explanation: `BST operations finished. In-order traversal yields sorted order.`,
    aiHint: 'Full 3D holographic tree branches rendered.',
    operation: 'COMPLETE',
  });

  return {
    initialState: valuesToInsert,
    steps,
    finalState: [...currentValues],
    complexity: bstOpsDetails.complexity,
    details: bstOpsDetails,
  };
}
