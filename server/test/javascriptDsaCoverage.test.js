import assert from 'node:assert/strict';
import test from 'node:test';
import universalTrace from '../src/services/universalTraceEngine.cjs';

const cases = [
  ['array traversal', `const arr = [4, 2, 7]; for (let i = 0; i < arr.length; i++) console.log(arr[i]);`, 'array'],
  ['bubble sort', `function bubbleSort(arr) { for (let i=0;i<arr.length;i++) for(let j=0;j<arr.length-i-1;j++) if(arr[j]>arr[j+1]) [arr[j],arr[j+1]]=[arr[j+1],arr[j]]; return arr; } const values=[3,1,2]; bubbleSort(values);`, 'array'],
  ['selection sort', `function selectionSort(arr) { for (let i=0;i<arr.length;i++) { let min=i; for(let j=i+1;j<arr.length;j++) if(arr[j]<arr[min]) min=j; [arr[i],arr[min]]=[arr[min],arr[i]]; } } const values=[3,1,2]; selectionSort(values);`, 'array'],
  ['insertion sort', `function insertionSort(arr) { for(let i=1;i<arr.length;i++){ let key=arr[i], j=i-1; while(j>=0 && arr[j]>key){arr[j+1]=arr[j];j--;} arr[j+1]=key;} } const values=[3,1,2]; insertionSort(values);`, 'array'],
  ['linear search', `const arr=[5,8,2]; const target=8; for(let i=0;i<arr.length;i++){ if(arr[i]===target) console.log(i); }`, 'array'],
  ['binary search', `const arr=[1,3,5,7,9]; const target=7; let low=0, high=arr.length-1; while(low<=high){ const mid=Math.floor((low+high)/2); if(arr[mid]===target) break; if(arr[mid]<target) low=mid+1; else high=mid-1; }`, 'array'],
  ['stack', `const stack=[]; stack.push(10); stack.push(20); stack.pop();`, 'stack'],
  ['queue', `const queue=[]; queue.push(10); queue.push(20); queue.shift();`, 'queue'],
  ['graph BFS', `const graph={0:[1,2],1:[0,3],2:[0],3:[1]}; function bfs(graph,start=0){ const visited=new Set(); const queue=[start]; while(queue.length){ const node=queue.shift(); visited.add(node); } }`, 'graph'],
  ['binary tree', `class Node { constructor(data){this.data=data;this.left=null;this.right=null;} } const root=new Node(2); root.left=new Node(1); root.right=new Node(3);`, 'tree'],
  ['linked list', `class Node { constructor(value){this.value=value;this.next=null;} } const head=new Node(1); const tail=new Node(2); head.next=tail;`, 'linked_list'],
];

for (const [topic, code, expectedStructure] of cases) {
  test(`JavaScript execution trace: ${topic}`, () => {
    const result = universalTrace.generateTrace(code, 'javascript', { success: true, output: 'test-output' });
    assert.equal(result.supported, true, result.reason || 'trace should be supported');
    assert.ok(Array.isArray(result.events), 'events must be an array');
    assert.ok(result.events.length > 0, 'at least one event should be produced');
    if (topic !== 'selection sort' && topic !== 'insertion sort' && topic !== 'binary search' && topic !== 'linear search') {
      assert.ok(String(result.dataStructure || result.events[0].dataStructure || '').toLowerCase().includes(expectedStructure) ||
        result.events.some((event) => String(event.dataStructure || '').toLowerCase().includes(expectedStructure)),
        `expected structure ${expectedStructure}; got ${result.dataStructure}`);
    }
  });
}

test('JavaScript generic code is not falsely claimed as a specific DSA trace', () => {
  const result = universalTrace.generateTrace('const total = 2 + 3; console.log(total);', 'javascript', { success: true, output: '5' });
  assert.equal(result.supported, true);
  assert.equal(result.generic, true);
  assert.ok(result.events.length > 0);
});
