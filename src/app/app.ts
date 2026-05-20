import { Component, HostListener, computed, signal } from '@angular/core';

type Category = 'sort' | 'pattern';
type Filter = 'all' | Category;

interface Card {
  id: string;
  category: Category;
  name: string;
  tagline: string;
  definition: string;
  code: string;
  hints: string[];
}

const CARDS: Card[] = [
  // ─── Sorting algorithms ─────────────────────────────────────────────
  {
    id: 'bubble',
    category: 'sort',
    name: 'Bubble Sort',
    tagline: 'Swap adjacent pairs; largest floats to the end.',
    definition:
      'Comparison sort that repeatedly swaps adjacent out-of-order elements. After each pass the largest remaining value is fixed at the tail.',
    code: `function bubbleSort(a: number[]): number[] {
  a = [...a];
  for (let end = a.length - 1; end > 0; end--) {
    let swapped = false;
    for (let i = 0; i < end; i++) {
      if (a[i] > a[i + 1]) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return a;
}`,
    hints: [
      'Time: O(n²) avg/worst, O(n) best with early-stop',
      'Space: O(1), stable, in-place',
      'Use only for teaching — never in real code',
    ],
  },
  {
    id: 'selection',
    category: 'sort',
    name: 'Selection Sort',
    tagline: 'Scan, pick the min, swap it to the front.',
    definition:
      'Repeatedly select the minimum from the unsorted suffix and swap it into the next front slot.',
    code: `function selectionSort(a: number[]): number[] {
  a = [...a];
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
  }
  return a;
}`,
    hints: [
      'Time: O(n²) in every case',
      'Space: O(1), in-place, NOT stable',
      'Minimises number of swaps — useful when writes are expensive',
    ],
  },
  {
    id: 'insertion',
    category: 'sort',
    name: 'Insertion Sort',
    tagline: 'Grow a sorted hand one card at a time.',
    definition:
      'Build a sorted prefix. For each new element, shift larger values right and insert into the gap. Like sorting playing cards in your hand.',
    code: `function insertionSort(a: number[]): number[] {
  a = [...a];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,
    hints: [
      'Time: O(n²) avg/worst, O(n) on nearly sorted',
      'Space: O(1), stable, in-place',
      'Great for small arrays — used inside Timsort & introsort',
    ],
  },
  {
    id: 'merge',
    category: 'sort',
    name: 'Merge Sort',
    tagline: 'Divide, sort halves, merge.',
    definition:
      'Divide-and-conquer: recursively split the array, then merge sorted halves in linear time per level.',
    code: `function mergeSort(a: number[]): number[] {
  if (a.length <= 1) return a;
  const mid = a.length >> 1;
  const L = mergeSort(a.slice(0, mid));
  const R = mergeSort(a.slice(mid));
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < L.length && j < R.length) {
    out.push(L[i] <= R[j] ? L[i++] : R[j++]);
  }
  return out.concat(L.slice(i), R.slice(j));
}`,
    hints: [
      'Time: O(n log n) in every case',
      'Space: O(n) — not in-place',
      'Stable. Good for linked lists & external sorting',
    ],
  },
  {
    id: 'quick',
    category: 'sort',
    name: 'Quick Sort',
    tagline: 'Partition around a pivot, recurse both sides.',
    definition:
      'Pick a pivot, partition so smaller values go left, larger right, then recursively sort each side.',
    code: `function quickSort(a: number[], lo = 0, hi = a.length - 1): number[] {
  if (lo >= hi) return a;
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (a[j] <= pivot) {
      [a[i], a[j]] = [a[j], a[i]];
      i++;
    }
  }
  [a[i], a[hi]] = [a[hi], a[i]];
  quickSort(a, lo, i - 1);
  quickSort(a, i + 1, hi);
  return a;
}`,
    hints: [
      'Time: O(n log n) avg, O(n²) worst (bad pivots)',
      'Space: O(log n) recursion, in-place, NOT stable',
      'Randomise or use median-of-three to avoid worst case',
    ],
  },
  {
    id: 'radix',
    category: 'sort',
    name: 'Radix Sort',
    tagline: 'Stable bucket pass per digit.',
    definition:
      'Non-comparison sort. Stably bucket by each digit place from least to most significant.',
    code: `function radixSort(a: number[]): number[] {
  a = [...a];
  const max = Math.max(...a, 0);
  for (let place = 1; Math.floor(max / place) > 0; place *= 10) {
    const count = new Array(10).fill(0);
    const out = new Array(a.length);
    for (const n of a) count[Math.floor(n / place) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = a.length - 1; i >= 0; i--) {
      const d = Math.floor(a[i] / place) % 10;
      out[--count[d]] = a[i];
    }
    a = out;
  }
  return a;
}`,
    hints: [
      'Time: O(d·(n+b)) where d = digits, b = base',
      'Space: O(n+b), stable but NOT in-place',
      'Only for fixed-width keys (ints, strings)',
    ],
  },

  // ─── LeetCode patterns ──────────────────────────────────────────────
  {
    id: 'two-pointers',
    category: 'pattern',
    name: 'Two Pointers',
    tagline: 'Walk a sorted array from both ends.',
    definition:
      'Use two indices moving toward each other (or in the same direction) to reduce O(n²) brute force to O(n). Classic for pair-sum, palindromes, dedup.',
    code: `// Pair-sum in a sorted array
function twoSum(a: number[], target: number): [number, number] | null {
  let l = 0, r = a.length - 1;
  while (l < r) {
    const s = a[l] + a[r];
    if (s === target) return [l, r];
    s < target ? l++ : r--;
  }
  return null;
}`,
    hints: [
      'Trigger: sorted input, "pair / triplet / subarray" question',
      'Variants: opposite ends, same-direction (fast/slow), 3-sum (fix one + 2-ptr)',
      'Time: O(n) after the O(n log n) sort if needed',
    ],
  },
  {
    id: 'sliding-window',
    category: 'pattern',
    name: 'Sliding Window',
    tagline: 'Maintain a moving range with O(1) update.',
    definition:
      'Slide a contiguous window through the array, adding the new element and removing the old one in O(1). Use for "longest/shortest/best subarray with property X".',
    code: `// Max sum of any subarray of size k
function maxSum(a: number[], k: number): number {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum;
  for (let i = k; i < a.length; i++) {
    sum += a[i] - a[i - k];
    best = Math.max(best, sum);
  }
  return best;
}`,
    hints: [
      'Trigger: "subarray / substring of length k" or "longest with constraint"',
      'Fixed window = simple loop. Variable window = shrink while invalid.',
      'Time: O(n)',
    ],
  },
  {
    id: 'fast-slow',
    category: 'pattern',
    name: 'Fast & Slow Pointers',
    tagline: "Tortoise & Hare: detect cycles, find midpoints.",
    definition:
      "Two pointers moving at different speeds. They meet inside a cycle, or the slow one lands on the midpoint when the fast one hits the end. Floyd's algorithm.",
    code: `// Cycle detection in a linked list
function hasCycle(head: ListNode | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}`,
    hints: [
      'Uses: cycle detection, find middle node, happy number, duplicate in 1..n',
      'To find cycle start: reset one ptr to head, advance both 1 step',
      'Space: O(1) vs O(n) hash-set approach',
    ],
  },
  {
    id: 'binary-search',
    category: 'pattern',
    name: 'Binary Search',
    tagline: 'Halve the search space each step.',
    definition:
      'Repeatedly compare with the middle of a sorted (or monotonic) range and discard the half that cannot contain the answer.',
    code: `function binarySearch(a: number[], target: number): number {
  let l = 0, r = a.length - 1;
  while (l <= r) {
    const m = (l + r) >> 1;
    if (a[m] === target) return m;
    if (a[m] < target) l = m + 1;
    else r = m - 1;
  }
  return -1;
}`,
    hints: [
      'Generalises to "binary search on the answer" — search a monotonic predicate',
      'Watch off-by-one: l<=r with r=len-1, or l<r with r=len',
      'Time: O(log n)',
    ],
  },
  {
    id: 'bfs',
    category: 'pattern',
    name: 'BFS',
    tagline: 'Queue. Explore by distance from source.',
    definition:
      'Breadth-first search. Visit all nodes at distance d before any at d+1. Finds the shortest path in an unweighted graph.',
    code: `function bfs(start: Node): void {
  const queue: Node[] = [start];
  const seen = new Set<Node>([start]);
  while (queue.length) {
    const node = queue.shift()!;
    for (const n of node.neighbors) {
      if (!seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
}`,
    hints: [
      'Use for: shortest path in unweighted graph, level-order tree traversal',
      'Track level by processing the queue in size-batches',
      'Time: O(V + E), space: O(V)',
    ],
  },
  {
    id: 'dfs',
    category: 'pattern',
    name: 'DFS',
    tagline: 'Recurse / stack. Explore deeply first.',
    definition:
      'Depth-first search. Recurse into a neighbour before backtracking. Use for connectivity, cycles, topological order, tree path problems.',
    code: `function dfs(node: Node, seen = new Set<Node>()): void {
  if (seen.has(node)) return;
  seen.add(node);
  for (const n of node.neighbors) {
    dfs(n, seen);
  }
}`,
    hints: [
      'Use for: cycle detection, connected components, path existence, topo sort',
      'Iterative version uses an explicit stack',
      'Time: O(V + E), space: O(V) including recursion',
    ],
  },
  {
    id: 'backtracking',
    category: 'pattern',
    name: 'Backtracking',
    tagline: 'Choose / explore / unchoose.',
    definition:
      'Build a candidate solution incrementally. When a choice fails or is complete, undo it and try the next. The exhaustive-search workhorse.',
    code: `// Permutations
function permute(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const used = new Array(nums.length).fill(false);
  const bt = () => {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;
      used[i] = true; path.push(nums[i]);
      bt();
      path.pop(); used[i] = false;
    }
  };
  bt();
  return res;
}`,
    hints: [
      'Use for: permutations, combinations, subsets, N-queens, Sudoku',
      'Prune early — skip branches that cannot beat the best known',
      'Time: exponential, but pruning matters in practice',
    ],
  },
  {
    id: 'dp',
    category: 'pattern',
    name: 'Dynamic Programming',
    tagline: 'Memoise overlapping subproblems.',
    definition:
      'Decompose a problem into overlapping subproblems with optimal substructure. Solve each once and cache. Top-down (memo) or bottom-up (tabulation).',
    code: `// Fibonacci with memoisation
function fib(n: number, memo: number[] = []): number {
  if (n < 2) return n;
  if (memo[n] != null) return memo[n];
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
}

// Bottom-up: 0/1 knapsack
function knapsack(w: number[], v: number[], cap: number): number {
  const dp = new Array(cap + 1).fill(0);
  for (let i = 0; i < w.length; i++) {
    for (let c = cap; c >= w[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i]);
    }
  }
  return dp[cap];
}`,
    hints: [
      'Spot it: recursion with repeated calls on same args',
      'State design = the crux. Ask: what params uniquely define a subproblem?',
      'Common families: knapsack, LIS, LCS, edit distance, grid paths',
    ],
  },
  {
    id: 'monotonic-stack',
    category: 'pattern',
    name: 'Monotonic Stack',
    tagline: 'Stack that stays sorted — pop on violation.',
    definition:
      'A stack whose elements are kept monotonically increasing or decreasing. Pop until the property holds, then push. Resolves "next greater / smaller" questions in O(n).',
    code: `// Next greater element to the right
function nextGreater(a: number[]): number[] {
  const res = new Array(a.length).fill(-1);
  const stack: number[] = []; // stores indices
  for (let i = 0; i < a.length; i++) {
    while (stack.length && a[stack[stack.length - 1]] < a[i]) {
      res[stack.pop()!] = a[i];
    }
    stack.push(i);
  }
  return res;
}`,
    hints: [
      'Trigger: "next greater / smaller", "largest rectangle in histogram"',
      'Each element pushed & popped at most once → O(n)',
      'Decide direction (left/right) by loop direction',
    ],
  },
  {
    id: 'prefix-sum',
    category: 'pattern',
    name: 'Prefix Sum',
    tagline: 'Precompute cumulative sums for O(1) ranges.',
    definition:
      'Store p[i] = sum of a[0..i-1]. Then any range sum a[l..r] = p[r+1] - p[l]. Extends to 2-D and to counting via hash map.',
    code: `class PrefixSum {
  p: number[] = [0];
  constructor(a: number[]) {
    for (const n of a) this.p.push(this.p[this.p.length - 1] + n);
  }
  range(l: number, r: number): number {
    return this.p[r + 1] - this.p[l];
  }
}

// Count subarrays with sum k
function subarraySum(a: number[], k: number): number {
  const seen = new Map<number, number>([[0, 1]]);
  let sum = 0, count = 0;
  for (const n of a) {
    sum += n;
    count += seen.get(sum - k) ?? 0;
    seen.set(sum, (seen.get(sum) ?? 0) + 1);
  }
  return count;
}`,
    hints: [
      'Use for: many range-sum queries, subarray sum / count with k',
      'Pair with hash map to count subarrays meeting a condition',
      'Build: O(n). Query: O(1)',
    ],
  },
  {
    id: 'top-k-heap',
    category: 'pattern',
    name: 'Top-K (Heap)',
    tagline: 'Min-heap of size k for k largest.',
    definition:
      'Maintain a heap of size k. For "k largest" use a min-heap (kick the smallest); for "k smallest" use a max-heap. Avoids sorting the whole array.',
    code: `// k largest using a min-heap of size k
function topK(a: number[], k: number): number[] {
  const heap = new MinHeap<number>();
  for (const n of a) {
    heap.push(n);
    if (heap.size() > k) heap.pop();
  }
  return heap.toArray();
}`,
    hints: [
      'Use for: top-k frequent / closest / largest, median (two heaps)',
      'Time: O(n log k) vs O(n log n) for full sort',
      'Two heaps (max+min) → running median',
    ],
  },
  {
    id: 'merge-intervals',
    category: 'pattern',
    name: 'Merge Intervals',
    tagline: 'Sort by start, sweep, merge overlaps.',
    definition:
      'Sort intervals by start time. Sweep through; if the current overlaps the last in the output, extend; else push it.',
    code: `function merge(intervals: [number, number][]): [number, number][] {
  intervals.sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [];
  for (const [s, e] of intervals) {
    const last = out[out.length - 1];
    if (last && s <= last[1]) {
      last[1] = Math.max(last[1], e);
    } else {
      out.push([s, e]);
    }
  }
  return out;
}`,
    hints: [
      'Use for: merge / insert intervals, meeting rooms, overlap counting',
      'Meeting rooms II: min-heap of end times = rooms in use',
      'Time: O(n log n) for the sort',
    ],
  },
  {
    id: 'union-find',
    category: 'pattern',
    name: 'Union-Find (DSU)',
    tagline: 'Near-O(1) "are these in the same set?"',
    definition:
      'Disjoint Set Union. find(x) returns the root of x. union(a, b) merges their trees. With path compression + union by rank, operations are amortised α(n) ≈ O(1).',
    code: `class DSU {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = [...Array(n).keys()];
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;
    else { this.parent[rb] = ra; this.rank[ra]++; }
    return true;
  }
}`,
    hints: [
      'Use for: connected components, Kruskal MST, redundant edge, account merge',
      'Path compression + union by rank for amortised α(n)',
      'Cannot un-union efficiently — use offline tricks if needed',
    ],
  },
  {
    id: 'topo-sort',
    category: 'pattern',
    name: 'Topological Sort',
    tagline: "Linearise a DAG (Kahn's algorithm).",
    definition:
      "Order DAG nodes so every edge u→v has u before v. Kahn's: repeatedly remove a node with in-degree 0. DFS post-order also works.",
    code: `function topoSort(n: number, edges: [number, number][]): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) {
    adj[u].push(v);
    indeg[v]++;
  }
  const queue: number[] = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);
  const order: number[] = [];
  while (queue.length) {
    const u = queue.shift()!;
    order.push(u);
    for (const v of adj[u]) if (--indeg[v] === 0) queue.push(v);
  }
  return order.length === n ? order : []; // [] = cycle
}`,
    hints: [
      'Use for: course schedule, build order, dependency resolution',
      "Order shorter than n ⇒ there's a cycle (invalid DAG)",
      'Time: O(V + E)',
    ],
  },
  {
    id: 'trie',
    category: 'pattern',
    name: 'Trie (Prefix Tree)',
    tagline: 'Tree where edges are characters.',
    definition:
      'Each node holds a map of children keyed by character. A word ends at a node flagged "end". Lookup/insert in O(length of word).',
    code: `class Trie {
  children: Record<string, Trie> = {};
  end = false;
  insert(word: string): void {
    let n: Trie = this;
    for (const c of word) n = (n.children[c] ??= new Trie());
    n.end = true;
  }
  has(word: string): boolean {
    let n: Trie | undefined = this;
    for (const c of word) {
      n = n!.children[c];
      if (!n) return false;
    }
    return n!.end;
  }
}`,
    hints: [
      'Use for: autocomplete, prefix queries, word search, longest common prefix',
      'Combine with DFS on a grid for word-search problems',
      'Memory-heavy for sparse alphabets — consider a hash map at each node',
    ],
  },
  {
    id: 'greedy',
    category: 'pattern',
    name: 'Greedy',
    tagline: 'Locally optimal → globally optimal (if it holds).',
    definition:
      'Make the locally best choice at each step. Works only when an exchange argument or matroid property guarantees global optimality.',
    code: `// Activity selection: max non-overlapping intervals
function maxActivities(intervals: [number, number][]): number {
  intervals.sort((a, b) => a[1] - b[1]); // sort by end time
  let count = 0, end = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= end) {
      count++;
      end = e;
    }
  }
  return count;
}`,
    hints: [
      'Examples: interval scheduling, Huffman codes, Dijkstra, Prim, jump game',
      'Always justify: counterexample? Exchange argument?',
      'When greedy fails, fall back to DP',
    ],
  },
  {
    id: 'bit-manip',
    category: 'pattern',
    name: 'Bit Manipulation',
    tagline: 'Treat numbers as flag arrays.',
    definition:
      'Use bitwise ops to set/clear/toggle/test bits. XOR cancels duplicates. Subset enumeration via bitmasks. Brian Kernighan: x &= x-1 clears the lowest set bit.',
    code: `const setBit    = (x: number, i: number) => x | (1 << i);
const clearBit  = (x: number, i: number) => x & ~(1 << i);
const toggleBit = (x: number, i: number) => x ^ (1 << i);
const getBit    = (x: number, i: number) => (x >> i) & 1;

// Count set bits (Kernighan)
function popCount(x: number): number {
  let c = 0;
  while (x) { x &= x - 1; c++; }
  return c;
}

// Single number — every other appears twice
function single(a: number[]): number {
  return a.reduce((acc, n) => acc ^ n, 0);
}`,
    hints: [
      'XOR tricks: a ^ a = 0, a ^ 0 = a → find the unique element',
      'Subset DP: iterate 0..(1<<n) - each int is a subset',
      'JS bitwise ops force 32-bit signed — watch overflow',
    ],
  },
  {
    id: 'cyclic-sort',
    category: 'pattern',
    name: 'Cyclic Sort',
    tagline: 'For arrays of 1..n, place each at index value-1.',
    definition:
      'When inputs are a permutation of 1..n (or 0..n-1), swap each value to its "home" index in O(n). Solves missing/duplicate-in-range problems in O(1) space.',
    code: `function cyclicSort(a: number[]): number[] {
  let i = 0;
  while (i < a.length) {
    const home = a[i] - 1;
    if (a[i] !== a[home]) {
      [a[i], a[home]] = [a[home], a[i]];
    } else {
      i++;
    }
  }
  return a;
}

// Find missing number in [1..n]
function findMissing(a: number[]): number {
  cyclicSort(a);
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== i + 1) return i + 1;
  }
  return a.length + 1;
}`,
    hints: [
      'Trigger: input is a permutation of 1..n (or 0..n-1)',
      'Use for: missing number, duplicate, first missing positive',
      'Time: O(n), space: O(1)',
    ],
  },
  {
    id: 'reverse-ll',
    category: 'pattern',
    name: 'In-place LL Reversal',
    tagline: 'Walk the list flipping next pointers.',
    definition:
      'Reverse a singly linked list by walking it with prev/curr/next pointers, flipping curr.next to prev each step. Foundation for reverse-in-k-groups, palindrome check, etc.',
    code: `function reverse(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`,
    hints: [
      'Always save next BEFORE overwriting curr.next',
      'Reverse-in-groups: count k, reverse, splice; use dummy head',
      'Time: O(n), space: O(1)',
    ],
  },
  {
    id: 'kadane',
    category: 'pattern',
    name: "Kadane's Algorithm",
    tagline: 'Max subarray sum in one pass.',
    definition:
      'At each index keep the best subarray ending here: either extend the previous one or start fresh. Track the global max separately.',
    code: `function maxSubarray(a: number[]): number {
  let best = a[0], curr = a[0];
  for (let i = 1; i < a.length; i++) {
    curr = Math.max(a[i], curr + a[i]);
    best = Math.max(best, curr);
  }
  return best;
}`,
    hints: [
      'Use for: maximum subarray sum, max product (track min too), circular variant',
      "It's a 1-D DP — `curr` is the DP state",
      'Time: O(n), space: O(1)',
    ],
  },
];

const CARDS_BY_ID: Record<string, Card> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly order = signal<string[]>(CARDS.map((c) => c.id));
  protected readonly filter = signal<Filter>('all');
  protected readonly index = signal(0);
  protected readonly flipped = signal<Set<string>>(new Set());

  protected readonly filteredIds = computed(() => {
    const ids = this.order();
    const f = this.filter();
    return f === 'all' ? ids : ids.filter((id) => CARDS_BY_ID[id].category === f);
  });

  protected readonly total = computed(() => this.filteredIds().length);

  protected readonly currentCard = computed<Card | null>(() => {
    const ids = this.filteredIds();
    if (!ids.length) return null;
    const i = Math.min(this.index(), ids.length - 1);
    return CARDS_BY_ID[ids[i]];
  });

  protected readonly isCurrentFlipped = computed(() => {
    const card = this.currentCard();
    return card ? this.flipped().has(card.id) : false;
  });

  private pointerStartX = 0;
  private pointerStartY = 0;
  private didSwipe = false;

  protected setFilter(f: Filter): void {
    if (this.filter() === f) return;
    this.filter.set(f);
    this.index.set(0);
  }

  protected next(): void {
    const n = this.total();
    if (!n) return;
    this.index.update((i) => (i + 1) % n);
  }

  protected prev(): void {
    const n = this.total();
    if (!n) return;
    this.index.update((i) => (i - 1 + n) % n);
  }

  protected toggleFlip(): void {
    const card = this.currentCard();
    if (!card) return;
    this.flipped.update((s) => {
      const next = new Set(s);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }

  protected shuffle(): void {
    const a = [...this.order()];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    this.order.set(a);
    this.index.set(0);
    this.flipped.set(new Set());
  }

  protected onPointerDown(e: PointerEvent): void {
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    this.didSwipe = false;
  }

  protected onPointerUp(e: PointerEvent): void {
    const dx = e.clientX - this.pointerStartX;
    const dy = e.clientY - this.pointerStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      this.didSwipe = true;
      if (dx < 0) this.next();
      else this.prev();
    }
  }

  protected onCardClick(): void {
    if (this.didSwipe) {
      this.didSwipe = false;
      return;
    }
    this.toggleFlip();
  }

  @HostListener('window:keydown', ['$event'])
  protected onKey(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') {
      this.next();
    } else if (e.key === 'ArrowLeft') {
      this.prev();
    } else if (e.key === ' ' || e.key === 'Enter') {
      this.toggleFlip();
      e.preventDefault();
    } else if (e.key === 's' || e.key === 'S') {
      this.shuffle();
    }
  }
}
