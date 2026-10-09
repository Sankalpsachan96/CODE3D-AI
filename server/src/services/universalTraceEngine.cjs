// backend/services/traceEngine.js

/* =========================================================
   CODE3D AI
   DETERMINISTIC TRACE ENGINE + UNIVERSAL CUSTOM CODE FALLBACK

   Execution Engine = runtime truth
   Trace Engine    = deterministic visualization events
   AI              = explanation / interpretation
   Visualizer      = renders events

   IMPORTANT:
   The trace engine never invents stdout, stderr, compiler errors,
   runtime errors or timeout results.
========================================================= */

function createEvent(step, type, data = {}) {
  return {
    step,
    type,
    timestamp: Date.now(),
    ...data,
  };
}

function unsupported(algorithm, dataStructure) {
  return {
    supported: false,
    algorithm,
    dataStructure,
    events: [],
    reason: `A ${dataStructure} was not recognized for the ${algorithm} visualization model.`,
  };
}

function normalizeLanguage(language = "cpp") {
  return String(language || "cpp").trim().toLowerCase();
}

function literalValue(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  if (/^(true|false)$/i.test(value)) {
    return value.toLowerCase() === "true";
  }

  if (/^(null|nullptr|none|nil)$/i.test(value)) {
    return null;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? value : numeric;
}

function cloneArray(values) {
  return Array.isArray(values) ? [...values] : [];
}

/* =========================================================
   ARRAY HELPERS
========================================================= */

function detectArrayFromCode(code) {
  if (!code || typeof code !== "string") return null;

  const patterns = [
    {
      // Java-style declarations put brackets before the variable name.
      // Example: int[] arr = {1, 2, 3};
      regex:
        /(?:int|float|double|char|long|short)\s*(?:\[\s*\]\s*)+(\w+)\s*=\s*\{([^}]+)\}/i,
      type: "java-array",
    },
    {
      // C-style declarations: int arr[] = {1, 2, 3};
      regex:
        /(?:int|float|double|char|long|short)\s+(\w+)\s*\[\s*(\d*)\s*\]\s*=\s*\{([^}]+)\}/i,
      type: "array",
    },
    {
      regex:
        /(?:std\s*::\s*)?vector\s*<[^>]+>\s+(\w+)\s*(?:=)?\s*\{([^}]+)\}/i,
      type: "vector",
    },
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern.regex);
    if (!match) continue;

    let name;
    let rawValues;
    let declaredSize;

    if (pattern.type === "vector" || pattern.type === "java-array") {
      name = match[1];
      rawValues = match[2];
      declaredSize = rawValues
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean).length;
    } else {
      name = match[1];
      rawValues = match[3];
      declaredSize = match[2]
        ? Number(match[2])
        : rawValues
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean).length;
    }

    const values = rawValues
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .map(literalValue);

    return {
      name,
      size: declaredSize,
      values,
      kind: pattern.type,
    };
  }

  return null;
}

function getPrimaryArray(code) {
  return detectArrayFromCode(code);
}

/* =========================================================
   SORT DETECTION + TRACES
========================================================= */

function detectBubbleSort(code) {
  if (!code) return false;

  const lower = code.toLowerCase();

  if (/bubble\s*sort/.test(lower) || /bubblesort/.test(lower)) {
    return true;
  }

  const nested =
    /for\s*\([^)]*i[^)]*\)/i.test(code) &&
    /for\s*\([^)]*j[^)]*\)/i.test(code);

  const comparison =
    /\[\s*j\s*\]\s*>\s*\w+\s*\[\s*j\s*\+\s*1\s*\]/i.test(code) ||
    /\[\s*j\s*\+\s*1\s*\]\s*<\s*\w+\s*\[\s*j\s*\]/i.test(code);

  const swap =
    /swap\s*\(/i.test(code) ||
    (
      /\w+\s*\[\s*j\s*\]\s*=\s*\w+\s*\[\s*j\s*\+\s*1\s*\]/i.test(code) &&
      /\w+\s*\[\s*j\s*\+\s*1\s*\]\s*=/i.test(code)
    );

  return nested && comparison && swap;
}

function generateBubbleSortTrace(code) {
  const info = getPrimaryArray(code);
  if (!info) return unsupported("bubble_sort", "array");

  const arr = [...info.values];
  const events = [];
  let step = 1;

  events.push(createEvent(step++, "initial_state", {
    algorithm: "bubble_sort",
    dataStructure: "array",
    array: [...arr],
    arrayName: info.name,
    message: "Array initialized for bubble sort.",
  }));

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      events.push(createEvent(step++, "compare", {
        algorithm: "bubble_sort",
        dataStructure: "array",
        indices: [j, j + 1],
        values: [arr[j], arr[j + 1]],
        array: [...arr],
        outerIndex: i,
        innerIndex: j,
        message: `Compare index ${j} with index ${j + 1}.`,
      }));

      if (arr[j] > arr[j + 1]) {
        const before = [arr[j], arr[j + 1]];
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];

        events.push(createEvent(step++, "swap", {
          algorithm: "bubble_sort",
          dataStructure: "array",
          indices: [j, j + 1],
          valuesBefore: before,
          valuesAfter: [arr[j], arr[j + 1]],
          array: [...arr],
          outerIndex: i,
          innerIndex: j,
          message: `Swap index ${j} and index ${j + 1}.`,
        }));
      }
    }
  }

  events.push(createEvent(step++, "complete", {
    algorithm: "bubble_sort",
    dataStructure: "array",
    array: [...arr],
    arrayName: info.name,
    message: "Bubble sort completed.",
  }));

  return {
    supported: true,
    algorithm: "bubble_sort",
    dataStructure: "array",
    stoppedAtError: false,
    events,
  };
}

function detectSelectionSort(code) {
  const lower = String(code || "").toLowerCase();

  if (/selection\s*sort|selectionsort|selection_sort/.test(lower)) {
    return true;
  }

  return (
    /for\s*\([^)]*i[^)]*\)/i.test(code) &&
    /for\s*\([^)]*j[^)]*\)/i.test(code) &&
    /\b(min|minindex|minimum)\b/i.test(code) &&
    /\bswap\s*\(/i.test(code)
  );
}

function generateSelectionSortTrace(code) {
  const info = getPrimaryArray(code);
  if (!info) return unsupported("selection_sort", "array");

  const arr = [...info.values];
  const events = [];
  let step = 1;

  events.push(createEvent(step++, "initial_state", {
    algorithm: "selection_sort",
    dataStructure: "array",
    array: [...arr],
    arrayName: info.name,
    message: "Array initialized for selection sort.",
  }));

  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;

    events.push(createEvent(step++, "select", {
      algorithm: "selection_sort",
      dataStructure: "array",
      index: minIndex,
      array: [...arr],
      message: `Current minimum candidate is at index ${minIndex}.`,
    }));

    for (let j = i + 1; j < arr.length; j++) {
      events.push(createEvent(step++, "compare", {
        algorithm: "selection_sort",
        dataStructure: "array",
        indices: [minIndex, j],
        values: [arr[minIndex], arr[j]],
        array: [...arr],
        message: `Compare current minimum with index ${j}.`,
      }));

      if (arr[j] < arr[minIndex]) {
        minIndex = j;

        events.push(createEvent(step++, "select", {
          algorithm: "selection_sort",
          dataStructure: "array",
          index: minIndex,
          array: [...arr],
          message: `New minimum found at index ${minIndex}.`,
        }));
      }
    }

    if (minIndex !== i) {
      const before = [...arr];
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];

      events.push(createEvent(step++, "swap", {
        algorithm: "selection_sort",
        dataStructure: "array",
        indices: [i, minIndex],
        valuesBefore: [before[i], before[minIndex]],
        valuesAfter: [arr[i], arr[minIndex]],
        array: [...arr],
        message: `Swap index ${i} with index ${minIndex}.`,
      }));
    }
  }

  events.push(createEvent(step++, "complete", {
    algorithm: "selection_sort",
    dataStructure: "array",
    array: [...arr],
    arrayName: info.name,
    message: "Selection sort completed.",
  }));

  return {
    supported: true,
    algorithm: "selection_sort",
    dataStructure: "array",
    stoppedAtError: false,
    events,
  };
}

function detectInsertionSort(code) {
  const lower = String(code || "").toLowerCase();

  if (/insertion\s*sort|insertionsort|insertion_sort/.test(lower)) {
    return true;
  }

  return (
    /for\s*\(/i.test(code) &&
    /\[\s*j\s*\+\s*1\s*\]\s*=\s*\w+\s*\[\s*j\s*\]/i.test(code) &&
    /\w+\s*\[\s*j\s*\]\s*>\s*\w+/i.test(code)
  );
}

function generateInsertionSortTrace(code) {
  const info = getPrimaryArray(code);
  if (!info) return unsupported("insertion_sort", "array");

  const arr = [...info.values];
  const events = [];
  let step = 1;

  events.push(createEvent(step++, "initial_state", {
    algorithm: "insertion_sort",
    dataStructure: "array",
    array: [...arr],
    arrayName: info.name,
    message: "Array initialized for insertion sort.",
  }));

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    events.push(createEvent(step++, "select", {
      algorithm: "insertion_sort",
      dataStructure: "array",
      index: i,
      value: key,
      array: [...arr],
      message: `Select ${key} as the key element.`,
    }));

    while (j >= 0 && arr[j] > key) {
      events.push(createEvent(step++, "compare", {
        algorithm: "insertion_sort",
        dataStructure: "array",
        indices: [j, j + 1],
        values: [arr[j], key],
        array: [...arr],
        message: `Compare ${arr[j]} with key ${key}.`,
      }));

      arr[j + 1] = arr[j];

      events.push(createEvent(step++, "shift", {
        algorithm: "insertion_sort",
        dataStructure: "array",
        from: j,
        to: j + 1,
        value: arr[j + 1],
        array: [...arr],
        message: `Shift value to index ${j + 1}.`,
      }));

      j--;
    }

    arr[j + 1] = key;

    events.push(createEvent(step++, "insert", {
      algorithm: "insertion_sort",
      dataStructure: "array",
      index: j + 1,
      value: key,
      array: [...arr],
      message: `Insert key ${key} at index ${j + 1}.`,
    }));
  }

  events.push(createEvent(step++, "complete", {
    algorithm: "insertion_sort",
    dataStructure: "array",
    array: [...arr],
    arrayName: info.name,
    message: "Insertion sort completed.",
  }));

  return {
    supported: true,
    algorithm: "insertion_sort",
    dataStructure: "array",
    stoppedAtError: false,
    events,
  };
}

/* =========================================================
   SEARCH + ARRAY TRAVERSAL
========================================================= */

function extractSearchTarget(code, arrayName) {
  const patterns = [
    new RegExp(
      `${arrayName}\\s*\\[\\s*\\w+\\s*\\]\\s*==\\s*(\\d+)`,
      "i"
    ),
    /target\s*=\s*(\d+)/i,
    /key\s*=\s*(\d+)/i,
    /search\s*\(\s*[^,]+,\s*(\d+)\s*\)/i,
  ];

  for (const pattern of patterns) {
    const match = String(code || "").match(pattern);
    if (match) return literalValue(match[1]);
  }

  return null;
}

function detectLinearSearch(code) {
  const info = getPrimaryArray(code);
  if (!info) return false;

  const lower = code.toLowerCase();

  return (
    /linear\s*search/.test(lower) ||
    (
      /for\s*\(/i.test(code) &&
      /\w+\s*\[\s*\w+\s*\]\s*==/i.test(code)
    )
  );
}

function generateLinearSearchTrace(code) {
  const info = getPrimaryArray(code);
  if (!info) return unsupported("linear_search", "array");

  const arr = [...info.values];
  const target = extractSearchTarget(code, info.name);
  const events = [];
  let step = 1;
  let foundIndex = -1;

  events.push(createEvent(step++, "initial_state", {
    algorithm: "linear_search",
    dataStructure: "array",
    array: [...arr],
    target,
    arrayName: info.name,
    message: "Linear search initialized.",
  }));

  for (let i = 0; i < arr.length; i++) {
    events.push(createEvent(step++, "visit", {
      algorithm: "linear_search",
      dataStructure: "array",
      index: i,
      value: arr[i],
      target,
      array: [...arr],
      message: `Check index ${i}.`,
    }));

    if (target !== null && arr[i] === target) {
      foundIndex = i;

      events.push(createEvent(step++, "found", {
        algorithm: "linear_search",
        dataStructure: "array",
        index: i,
        value: arr[i],
        target,
        array: [...arr],
        message: `Target ${target} found at index ${i}.`,
      }));

      break;
    }
  }

  if (foundIndex === -1) {
    events.push(createEvent(step++, "not_found", {
      algorithm: "linear_search",
      dataStructure: "array",
      target,
      array: [...arr],
      message:
        target === null
          ? "Search completed."
          : `Target ${target} was not found.`,
    }));
  }

  events.push(createEvent(step++, "complete", {
    algorithm: "linear_search",
    dataStructure: "array",
    array: [...arr],
    target,
    foundIndex,
    message: "Linear search completed.",
  }));

  return {
    supported: true,
    algorithm: "linear_search",
    dataStructure: "array",
    stoppedAtError: false,
    events,
  };
}

function detectBinarySearch(code) {
  const lower = String(code || "").toLowerCase();

  return (
    /binary\s*search|binarysearch|binary_search/.test(lower) ||
    (
      /\blow\b/.test(lower) &&
      /\bhigh\b/.test(lower) &&
      /\bmid\b/.test(lower) &&
      getPrimaryArray(code) !== null
    )
  );
}

function generateBinarySearchTrace(code) {
  const info = getPrimaryArray(code);
  if (!info) return unsupported("binary_search", "array");

  const arr = [...info.values];
  const target = extractSearchTarget(code, info.name);
  const events = [];
  let step = 1;
  let low = 0;
  let high = arr.length - 1;
  let found = false;
  let foundIndex = -1;

  events.push(createEvent(step++, "initial_state", {
    algorithm: "binary_search",
    dataStructure: "array",
    array: [...arr],
    target,
    low,
    high,
    mid: arr.length
      ? Math.floor((low + high) / 2)
      : undefined,
    message: "Binary search initialized.",
  }));

  while (low <= high && arr.length) {
    const mid = Math.floor((low + high) / 2);

    events.push(createEvent(step++, "range", {
      algorithm: "binary_search",
      dataStructure: "array",
      array: [...arr],
      target,
      low,
      high,
      mid,
      message:
        `Checking range ${low} to ${high}. Middle index is ${mid}.`,
    }));

    if (target !== null && arr[mid] === target) {
      found = true;
      foundIndex = mid;

      events.push(createEvent(step++, "found", {
        algorithm: "binary_search",
        dataStructure: "array",
        array: [...arr],
        target,
        index: mid,
        mid,
        low,
        high,
        message:
          `Target ${target} found at index ${mid}.`,
      }));

      break;
    }

    if (target !== null && arr[mid] < target) {
      low = mid + 1;

      events.push(createEvent(step++, "move_right", {
        algorithm: "binary_search",
        dataStructure: "array",
        array: [...arr],
        target,
        low,
        high,
        mid,
        message:
          "Target is larger, moving to the right half.",
      }));
    } else {
      high = mid - 1;

      events.push(createEvent(step++, "move_left", {
        algorithm: "binary_search",
        dataStructure: "array",
        array: [...arr],
        target,
        low,
        high,
        mid,
        message:
          "Target is smaller, moving to the left half.",
      }));
    }
  }

  if (!found) {
    events.push(createEvent(step++, "not_found", {
      algorithm: "binary_search",
      dataStructure: "array",
      target,
      array: [...arr],
      low,
      high,
      message:
        target === null
          ? "Binary search completed."
          : `Target ${target} was not found.`,
    }));
  }

  events.push(createEvent(step++, "complete", {
    algorithm: "binary_search",
    dataStructure: "array",
    array: [...arr],
    target,
    found,
    foundIndex,
    low,
    high,
    message: "Binary search completed.",
  }));

  return {
    supported: true,
    algorithm: "binary_search",
    dataStructure: "array",
    stoppedAtError: false,
    events,
  };
}

function detectArrayTraversal(code) {
  const info = getPrimaryArray(code);
  if (!info) return false;

  return (
    (/for\s*\(/i.test(code) ||
      /while\s*\(/i.test(code)) &&
    new RegExp(`${info.name}\\s*\\[`).test(code)
  );
}

function generateArrayTraversalTrace(code) {
  const info = getPrimaryArray(code);
  if (!info) return unsupported("array_traversal", "array");

  const events = [];
  let step = 1;

  events.push(createEvent(step++, "initial_state", {
    algorithm: "array_traversal",
    dataStructure: "array",
    array: [...info.values],
    arrayName: info.name,
    message: "Array initialized.",
  }));

  for (let i = 0; i < info.values.length; i++) {
    events.push(createEvent(step++, "visit", {
      algorithm: "array_traversal",
      dataStructure: "array",
      index: i,
      value: info.values[i],
      array: [...info.values],
      message:
        `Visit index ${i} containing ${info.values[i]}.`,
    }));
  }

  events.push(createEvent(step++, "complete", {
    algorithm: "array_traversal",
    dataStructure: "array",
    array: [...info.values],
    arrayName: info.name,
    message: "Array traversal completed.",
  }));

  return {
    supported: true,
    algorithm: "array_traversal",
    dataStructure: "array",
    stoppedAtError: false,
    events,
  };
}

/* =========================================================
   STACK
========================================================= */

function detectStack(code) {
  return (
    /\b(?:std\s*::\s*)?stack\s*<[^>]+>\s+\w+/i.test(code) &&
    /\.\s*(push|pop|top|empty|size)\s*\(/i.test(code)
  );
}

function generateStackTrace(code) {
  const match = code.match(
    /\b(?:std\s*::\s*)?stack\s*<[^>]+>\s+(\w+)/i
  );

  const name = match?.[1] || "stack";
  const stack = [];
  const events = [];
  let step = 1;

  const state = () => ({
    algorithm: "stack_operations",
    dataStructure: "stack",
    structureName: name,
    values: [...stack],
    stack: [...stack],
    size: stack.length,
    top: stack.length
      ? stack[stack.length - 1]
      : null,
  });

  events.push(createEvent(step++, "initial_state", {
    ...state(),
    message: "Stack initialized.",
  }));

  const regex = new RegExp(
    `\\b${name}\\s*\\.\\s*(push|pop|top|empty|size)\\s*\\(([^)]*)\\)`,
    "gi"
  );

  let matchOp;

  while ((matchOp = regex.exec(code)) !== null) {
    const action = matchOp[1].toLowerCase();
    const raw = matchOp[2].trim();

    if (action === "push") {
      const value = literalValue(raw);
      stack.push(value);

      events.push(createEvent(step++, "push", {
        ...state(),
        value,
        index: stack.length - 1,
        message:
          `Push ${value} onto the stack.`,
      }));
    } else if (action === "pop") {
      const value = stack.length
        ? stack.pop()
        : null;

      events.push(createEvent(step++, "pop", {
        ...state(),
        value,
        poppedValue: value,
        message:
          value === null
            ? "Pop attempted on an empty stack."
            : `Pop ${value} from the stack.`,
      }));
    } else if (action === "top") {
      const value = stack.length
        ? stack[stack.length - 1]
        : null;

      events.push(createEvent(step++, "peek", {
        ...state(),
        value,
        message:
          value === null
            ? "Stack is empty."
            : `Top element is ${value}.`,
      }));
    } else if (action === "empty") {
      events.push(createEvent(step++, "peek", {
        ...state(),
        empty: stack.length === 0,
        message:
          stack.length === 0
            ? "Stack is empty."
            : "Stack is not empty.",
      }));
    } else if (action === "size") {
      events.push(createEvent(step++, "peek", {
        ...state(),
        message:
          `Stack size is ${stack.length}.`,
      }));
    }
  }

  events.push(createEvent(step++, "complete", {
    ...state(),
    message:
      "Stack operations completed.",
  }));

  return {
    supported: true,
    algorithm: "stack_operations",
    dataStructure: "stack",
    stoppedAtError: false,
    events,
  };
}

/* =========================================================
   QUEUE
========================================================= */

function detectQueue(code) {
  return (
    /\b(?:std\s*::\s*)?queue\s*<[^>]+>\s+\w+/i.test(code) &&
    /\.\s*(push|pop|front|back|empty|size)\s*\(/i.test(code)
  );
}

function generateQueueTrace(code) {
  const match = code.match(
    /\b(?:std\s*::\s*)?queue\s*<[^>]+>\s+(\w+)/i
  );

  const name = match?.[1] || "queue";
  const queue = [];
  const events = [];
  let step = 1;

  const state = () => ({
    algorithm: "queue_operations",
    dataStructure: "queue",
    structureName: name,
    values: [...queue],
    queue: [...queue],
    size: queue.length,
    front: queue.length
      ? queue[0]
      : null,
    back: queue.length
      ? queue[queue.length - 1]
      : null,
  });

  events.push(createEvent(step++, "initial_state", {
    ...state(),
    message: "Queue initialized.",
  }));

  const regex = new RegExp(
    `\\b${name}\\s*\\.\\s*(push|pop|front|back|empty|size)\\s*\\(([^)]*)\\)`,
    "gi"
  );

  let matchOp;

  while ((matchOp = regex.exec(code)) !== null) {
    const action = matchOp[1].toLowerCase();
    const raw = matchOp[2].trim();

    if (action === "push") {
      const value = literalValue(raw);
      queue.push(value);

      events.push(createEvent(step++, "enqueue", {
        ...state(),
        value,
        index: queue.length - 1,
        message:
          `Enqueue ${value} at the rear.`,
      }));
    } else if (action === "pop") {
      const value = queue.length
        ? queue.shift()
        : null;

      events.push(createEvent(step++, "dequeue", {
        ...state(),
        value,
        removedValue: value,
        message:
          value === null
            ? "Dequeue attempted on an empty queue."
            : `Dequeue ${value} from the front.`,
      }));
    } else if (
      action === "front" ||
      action === "back"
    ) {
      const value =
        action === "front"
          ? (queue.length ? queue[0] : null)
          : (queue.length
              ? queue[queue.length - 1]
              : null);

      events.push(createEvent(step++, action, {
        ...state(),
        value,
        message:
          value === null
            ? "Queue is empty."
            : `${
                action === "front"
                  ? "Front"
                  : "Back"
              } element is ${value}.`,
      }));
    } else if (action === "empty") {
      events.push(createEvent(step++, "front", {
        ...state(),
        empty: queue.length === 0,
        message:
          queue.length === 0
            ? "Queue is empty."
            : "Queue is not empty.",
      }));
    } else if (action === "size") {
      events.push(createEvent(step++, "front", {
        ...state(),
        message:
          `Queue size is ${queue.length}.`,
      }));
    }
  }

  events.push(createEvent(step++, "complete", {
    ...state(),
    message:
      "Queue operations completed.",
  }));

  return {
    supported: true,
    algorithm: "queue_operations",
    dataStructure: "queue",
    stoppedAtError: false,
    events,
  };
}

/* =========================================================
   LINKED LIST
========================================================= */

function detectLinkedList(code) {
  return (
    (
      /\b(?:struct|class)\s+Node\b/i.test(code) ||
      /\bNode\s*\*/.test(code)
    ) &&
    (
      /\.\s*next\b/i.test(code) ||
      /->\s*next\b/i.test(code)
    ) &&
    /new\s+Node\s*\(/i.test(code)
  );
}

function generateLinkedListTrace(code) {
  const nodes = [];
  const events = [];
  let step = 1;

  const state = () => ({
    algorithm: "linked_list",
    dataStructure: "linked_list",
    nodes: nodes.map((n) => ({ ...n })),
    edges: nodes
      .slice(1)
      .map((node, i) => [
        nodes[i].id,
        node.id,
      ]),
    values: nodes.map((n) => n.value),
  });

  events.push(createEvent(step++, "initial_state", {
    ...state(),
    message:
      "Linked list initialized.",
  }));

  const allocations = [
    ...String(code).matchAll(
      /new\s+Node\s*\(\s*([^,)]+)[^)]*\)/gi
    ),
  ];

  allocations.forEach((match, index) => {
    const value = literalValue(
      match[1].trim()
    );

    nodes.push({
      id: index,
      value,
    });

    events.push(createEvent(step++, "insert", {
      ...state(),
      nodeId: index,
      value,
      message:
        `Create node ${value}.`,
    }));
  });

  if (nodes.length > 1) {
    events.push(createEvent(step++, "link", {
      ...state(),
      message:
        "Connect nodes using next pointers.",
    }));
  }

  events.push(createEvent(step++, "complete", {
    ...state(),
    message:
      "Linked list visualization completed.",
  }));

  return {
    supported: true,
    algorithm: "linked_list",
    dataStructure: "linked_list",
    stoppedAtError: false,
    events,
  };
}

/* =========================================================
   SOURCE-LEVEL ARRAY ERROR HELPER
========================================================= */

function detectOutOfBounds(code) {
  const info = getPrimaryArray(code);
  if (!info) return null;

  const regex =
    /for\s*\(\s*(?:int|long|size_t)\s+(\w+)\s*=\s*0\s*;\s*\1\s*(<=|<)\s*(\d+)\s*;/gi;

  let match;

  while ((match = regex.exec(code)) !== null) {
    const operator = match[2];
    const limit = Number(match[3]);

    const maxIndex =
      operator === "<"
        ? limit - 1
        : limit;

    if (maxIndex >= info.size) {
      return {
        type: "error",
        errorType: "OUT_OF_BOUNDS",
        variable: match[1],
        invalidIndex: info.size,
        validRange:
          `0-${info.size - 1}`,
        arrayName: info.name,
        message:
          `Array index ${info.size} is outside the valid range 0-${info.size - 1}.`,
      };
    }
  }

  return null;
}

function findErrorLine(code, variable) {
  const lines =
    String(code || "").split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].includes(
        `${variable}[`
      ) ||
      lines[i].includes(
        `${variable} [`
      )
    ) {
      return i + 1;
    }
  }

  return null;
}

/* =========================================================
   GENERIC INFERENCE
========================================================= */

function inferAlgorithm(code) {
  const lower =
    String(code || "").toLowerCase();

  if (
    /\bdfs\b|depth\s*[- ]?first/.test(
      lower
    )
  ) {
    return "dfs";
  }

  if (
    /\bbfs\b|breadth\s*[- ]?first/.test(
      lower
    )
  ) {
    return "bfs";
  }

  if (
    /dijkstra|shortest\s+path/.test(
      lower
    )
  ) {
    return "shortest_path";
  }

  if (
    /knapsack|dynamic\s+programming|\bdp\b/.test(
      lower
    )
  ) {
    return "dynamic_programming";
  }

  if (
    /backtrack|n[- ]?queens|sudoku/.test(
      lower
    )
  ) {
    return "backtracking";
  }

  if (
    /factorial|fibonacci|recursive|recursion/.test(
      lower
    )
  ) {
    return "recursion";
  }

  if (
    /binary\s*search/.test(lower)
  ) {
    return "binary_search";
  }

  if (
    /linear\s*search/.test(lower)
  ) {
    return "linear_search";
  }

  if (
    /bubble\s*sort/.test(lower)
  ) {
    return "bubble_sort";
  }

  if (
    /selection\s*sort/.test(lower)
  ) {
    return "selection_sort";
  }

  if (
    /insertion\s*sort/.test(lower)
  ) {
    return "insertion_sort";
  }

  if (/\bstack\b/.test(lower)) {
    return "stack_operations";
  }

  if (/\bqueue\b/.test(lower)) {
    return "queue_operations";
  }

  if (
    /\bnode\b/.test(lower) &&
    /\bnext\b|->\s*next/.test(lower)
  ) {
    return "linked_list";
  }

  if (/\btree\b/.test(lower)) {
    return "tree";
  }

  if (
    /\bvector\b|\barray\b|\[[^\]]+\]/.test(
      lower
    )
  ) {
    return "array";
  }

  return "generic_dsa";
}

function inferDataStructure(
  code,
  algorithm
) {
  if (
    algorithm ===
    "stack_operations"
  ) {
    return "stack";
  }

  if (
    algorithm ===
    "queue_operations"
  ) {
    return "queue";
  }

  if (
    algorithm ===
    "linked_list"
  ) {
    return "linked_list";
  }

  if (
    [
      "bubble_sort",
      "selection_sort",
      "insertion_sort",
      "linear_search",
      "binary_search",
      "array",
    ].includes(algorithm)
  ) {
    return "array";
  }

  if (
    algorithm === "bfs" ||
    algorithm === "dfs" ||
    algorithm === "shortest_path"
  ) {
    return "graph";
  }

  if (algorithm === "tree") {
    return "tree";
  }

  if (
    algorithm === "backtracking"
  ) {
    return "grid";
  }

  if (
    algorithm ===
    "dynamic_programming"
  ) {
    return "table";
  }

  if (
    algorithm === "recursion"
  ) {
    return "call_stack";
  }

  const lower =
    String(code || "").toLowerCase();

  if (
    /\bmap\b|unordered_map|dictionary/.test(
      lower
    )
  ) {
    return "map";
  }

  if (
    /\bmatrix\b|\bgrid\b/.test(
      lower
    )
  ) {
    return "grid";
  }

  return "unknown";
}

function classifyCodeLine(line) {
  const lower =
    String(line || "").toLowerCase();

  if (
    /\bpush\s*\(/.test(lower)
  ) {
    return "push";
  }

  if (
    /\bpop\s*\(/.test(lower)
  ) {
    return "pop";
  }

  if (
    /\b(top|peek)\s*\(/.test(
      lower
    )
  ) {
    return "peek";
  }

  if (
    /\benqueue\s*\(/.test(lower)
  ) {
    return "enqueue";
  }

  if (
    /\bdequeue\s*\(/.test(lower)
  ) {
    return "dequeue";
  }

  if (
    /\bfront\s*\(/.test(lower)
  ) {
    return "front";
  }

  if (
    /\bback\s*\(/.test(lower)
  ) {
    return "back";
  }

  if (
    /\bswap\s*\(/.test(lower)
  ) {
    return "swap";
  }

  if (
    /\b(insert|insertnode)\s*\(/.test(
      lower
    )
  ) {
    return "insert";
  }

  if (
    /\b(erase|remove|delete)\s*\(/.test(
      lower
    )
  ) {
    return "remove";
  }

  if (
    /\bsort\s*\(/.test(lower)
  ) {
    return "sort";
  }

  if (
    /\breverse\s*\(/.test(lower)
  ) {
    return "reverse";
  }

  if (
    /\b(for|while|do)\b/.test(lower)
  ) {
    return "loop";
  }

  if (
    /\b(if|else\s+if|else|switch|case)\b/.test(
      lower
    )
  ) {
    return "condition";
  }

  if (
    /\b(try|catch|throw|except|finally)\b/.test(
      lower
    )
  ) {
    return "exception";
  }

  if (
    /\b(return|yield)\b/.test(lower)
  ) {
    return "return";
  }

  if (
    /\b(class|struct|function|def|func)\b/.test(
      lower
    )
  ) {
    return "function";
  }

  if (
    /\b(new|malloc|calloc|realloc|free|delete)\b/.test(
      lower
    )
  ) {
    return "memory";
  }

  if (
    /\b(cout|printf|print|println|console\.log|system\.out)\b/.test(
      lower
    )
  ) {
    return "output";
  }

  if (
    /\[[^\]]+\]\s*=/.test(lower)
  ) {
    return "assignment";
  }

  return "code";
}

/* =========================================================
   UNIVERSAL GENERIC TRACE HELPERS
========================================================= */

function stripInlineComments(line) {
  return String(line || "")
    .replace(/\/\/.*$/g, "")
    .replace(/\/\*.*?\*\//g, "")
    .trim();
}

function cleanExpression(value) {
  return String(value ?? "")
    .trim()
    .replace(/;+\s*$/, "")
    .replace(/\s+/g, " ");
}

function parseKnownValue(
  raw,
  variables = {}
) {
  const value =
    cleanExpression(raw);

  if (!value) return null;

  if (
    Object.prototype.hasOwnProperty.call(
      variables,
      value
    )
  ) {
    return variables[value];
  }

  if (
    /^(true|false)$/i.test(value)
  ) {
    return (
      value.toLowerCase() ===
      "true"
    );
  }

  if (
    /^(null|nullptr|none|nil)$/i.test(
      value
    )
  ) {
    return null;
  }

  if (
    (
      value.startsWith('"') &&
      value.endsWith('"')
    ) ||
    (
      value.startsWith("'") &&
      value.endsWith("'")
    )
  ) {
    return value.slice(1, -1);
  }

  const numeric =
    Number(value);

  return Number.isNaN(numeric)
    ? value
    : numeric;
}

function extractInitialVariables(
  code
) {
  const variables = {};
  const source =
    String(code || "");

  /*
    The semicolon requirement prevents
    "int main()" from being mistaken
    for a variable declaration.
  */
  const declarationRegex =
    /\b(?:(?:unsigned|signed|long|short)\s+)*(?:int|float|double|char|bool|string|String|boolean|byte|number|auto|let|const|var)\s+([A-Za-z_]\w*)\s*(?:=\s*([^;,\n]+))?;/g;

  let match;

  while (
    (match =
      declarationRegex.exec(
        source
      )) !== null
  ) {
    variables[match[1]] =
      match[2] !== undefined
        ? parseKnownValue(
            match[2],
            variables
          )
        : null;
  }

  /*
    Python-style simple assignments.
  */
  const pythonAssignment =
    /^\s*([A-Za-z_]\w*)\s*=\s*([^#\n]+)$/gm;

  while (
    (match =
      pythonAssignment.exec(
        source
      )) !== null
  ) {
    const name = match[1];
    const raw =
      match[2].trim();

    if (
      /^(if|elif|else|for|while|def|class|return|print|import|from)\b/i.test(
        name
      )
    ) {
      continue;
    }

    const value =
      parseKnownValue(
        raw,
        variables
      );

    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null ||
      (
        typeof value === "string" &&
        (
          raw.startsWith('"') ||
          raw.startsWith("'")
        )
      )
    ) {
      variables[name] =
        value;
    }
  }

  return variables;
}

function extractInitialArrays(
  code
) {
  const arrays = {};
  const source =
    String(code || "");

  const patterns = [
    /(?:int|float|double|char|long|short)\s+([A-Za-z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]+)\}/gi,

    /(?:std\s*::\s*)?vector\s*<[^>]+>\s+([A-Za-z_]\w*)\s*(?:=)?\s*\{([^}]+)\}/gi,

    /\b([A-Za-z_]\w*)\s*=\s*\[([^\]]+)\]/g,
  ];

  for (
    const regex of patterns
  ) {
    let match;

    while (
      (match =
        regex.exec(source)) !==
      null
    ) {
      arrays[match[1]] =
        match[2]
          .split(",")
          .map((v) =>
            v.trim()
          )
          .filter(Boolean)
          .map((v) =>
            parseKnownValue(v)
          );
    }
  }

  return arrays;
}

function evaluateSimpleValue(
  raw,
  variables
) {
  const value =
    cleanExpression(raw);

  if (
    Object.prototype.hasOwnProperty.call(
      variables,
      value
    )
  ) {
    return {
      known: true,
      value: variables[value],
    };
  }

  const literal =
    parseKnownValue(
      value,
      variables
    );

  if (
    typeof literal === "number" ||
    typeof literal === "boolean" ||
    literal === null ||
    (
      typeof literal === "string" &&
      (
        value.startsWith('"') ||
        value.startsWith("'")
      )
    )
  ) {
    return {
      known: true,
      value: literal,
    };
  }

  return {
    known: false,
    value,
  };
}

function calculateBinary(
  left,
  operator,
  right
) {
  if (
    typeof left !== "number" ||
    typeof right !== "number"
  ) {
    return {
      known: false,
      value: null,
    };
  }

  switch (operator) {
    case "+":
      return {
        known: true,
        value: left + right,
      };

    case "-":
      return {
        known: true,
        value: left - right,
      };

    case "*":
      return {
        known: true,
        value: left * right,
      };

    case "/":
      return right !== 0
        ? {
            known: true,
            value:
              left / right,
          }
        : {
            known: false,
            value: null,
          };

    case "%":
      return right !== 0
        ? {
            known: true,
            value:
              left % right,
          }
        : {
            known: false,
            value: null,
          };

    default:
      return {
        known: false,
        value: null,
      };
  }
}

function extractCalculation(
  line,
  variables
) {
  const clean =
    stripInlineComments(line);

  /*
    Examples:
      int c = a + b;
      sum = sum + i;
      total += value;
  */

  let match =
    clean.match(
      /^(?:(?:const|static|unsigned|signed|long|short|int|float|double|char|bool|string|String|boolean|auto|let|var)\s+)+([A-Za-z_]\w*)\s*=\s*(.+?);?$/
    );

  if (match) {
    const resultName =
      match[1];

    const expression =
      cleanExpression(
        match[2]
      );

    const operation =
      expression.match(
        /^(.+?)\s*([+\-*/%])\s*(.+)$/
      );

    if (operation) {
      const leftRaw =
        cleanExpression(
          operation[1]
        );

      const rightRaw =
        cleanExpression(
          operation[3]
        );

      const left =
        evaluateSimpleValue(
          leftRaw,
          variables
        );

      const right =
        evaluateSimpleValue(
          rightRaw,
          variables
        );

      const result =
        calculateBinary(
          left.value,
          operation[2],
          right.value
        );

      return {
        type: "calculation",
        resultName,
        expression,
        leftRaw,
        rightRaw,
        operator:
          operation[2],
        left:
          left.value,
        right:
          right.value,
        result:
          result.value,
        known:
          left.known &&
          right.known &&
          result.known,
      };
    }

    const value =
      evaluateSimpleValue(
        expression,
        variables
      );

    return {
      type: "assignment",
      resultName,
      expression,
      result:
        value.value,
      known:
        value.known,
    };
  }

  match =
    clean.match(
      /^([A-Za-z_]\w*)\s*(\+=|-=|\*=|\/=|%=)\s*(.+?);?$/
    );

  if (match) {
    const name =
      match[1];

    const operator =
      match[2][0];

    const rightRaw =
      cleanExpression(
        match[3]
      );

    const leftValue =
      Object.prototype.hasOwnProperty.call(
        variables,
        name
      )
        ? variables[name]
        : null;

    const right =
      evaluateSimpleValue(
        rightRaw,
        variables
      );

    const result =
      calculateBinary(
        leftValue,
        operator,
        right.value
      );

    return {
      type: "calculation",
      resultName: name,
      expression:
        `${name} ${match[2]} ${rightRaw}`,
      leftRaw: name,
      rightRaw,
      operator,
      left: leftValue,
      right: right.value,
      result:
        result.value,
      known:
        typeof leftValue ===
          "number" &&
        right.known &&
        result.known,
    };
  }

  return null;
}

function extractCondition(
  line,
  variables
) {
  const clean =
    stripInlineComments(line);

  const match =
    clean.match(
      /\b(if|else\s+if|while)\s*\((.*)\)/
    );

  if (!match) return null;

  const condition =
    cleanExpression(
      match[2]
    );

  const comparison =
    condition.match(
      /^(.+?)\s*(===|==|!==|!=|>=|<=|>|<)\s*(.+)$/
    );

  if (!comparison) {
    return {
      keyword: match[1],
      condition,
      known: false,
      result: null,
    };
  }

  const left =
    evaluateSimpleValue(
      comparison[1],
      variables
    );

  const right =
    evaluateSimpleValue(
      comparison[3],
      variables
    );

  let result = null;

  if (
    left.known &&
    right.known
  ) {
    switch (
      comparison[2]
    ) {
      case "==":
      case "===":
        result =
          left.value ===
          right.value;
        break;

      case "!=":
      case "!==":
        result =
          left.value !==
          right.value;
        break;

      case ">":
        result =
          left.value >
          right.value;
        break;

      case "<":
        result =
          left.value <
          right.value;
        break;

      case ">=":
        result =
          left.value >=
          right.value;
        break;

      case "<=":
        result =
          left.value <=
          right.value;
        break;
    }
  }

  return {
    keyword: match[1],
    condition,
    left:
      left.value,
    operator:
      comparison[2],
    right:
      right.value,
    result,
    known:
      result !== null,
  };
}

function extractLoopInfo(line) {
  const clean =
    stripInlineComments(line);

  const forMatch =
    clean.match(
      /\bfor\s*\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)/
    );

  if (forMatch) {
    return {
      loopType: "for",
      initialization:
        cleanExpression(
          forMatch[1]
        ),
      condition:
        cleanExpression(
          forMatch[2]
        ),
      update:
        cleanExpression(
          forMatch[3]
        ),
    };
  }

  const whileMatch =
    clean.match(
      /\bwhile\s*\((.*)\)/
    );

  if (whileMatch) {
    return {
      loopType: "while",
      condition:
        cleanExpression(
          whileMatch[1]
        ),
    };
  }

  return null;
}

function extractFunctionCall(line) {
  const clean =
    stripInlineComments(line);

  const match =
    clean.match(
      /\b([A-Za-z_]\w*)\s*\(([^()]*)\)/
    );

  if (!match) return null;

  const ignored =
    new Set([
      "if",
      "for",
      "while",
      "switch",
      "catch",
      "sizeof",
    ]);

  if (
    ignored.has(
      match[1].toLowerCase()
    )
  ) {
    return null;
  }

  return {
    functionName:
      match[1],

    arguments:
      match[2]
        .split(",")
        .map(
          cleanExpression
        )
        .filter(Boolean),
  };
}

function extractOutputOperation(
  line
) {
  const clean =
    stripInlineComments(line);

  return /\b(cout|printf|print|println|console\.log|system\.out)\b/i.test(
    clean
  )
    ? clean
    : null;
}

function variableSnapshot(
  variables
) {
  return {
    ...variables,
  };
}

/* =========================================================
   UNIVERSAL GENERIC RUNTIME TRACE
========================================================= */

function generateGenericRuntimeTrace(
  code,
  language,
  executionResult = {}
) {
  const algorithm =
    inferAlgorithm(code);

  const dataStructure =
    inferDataStructure(
      code,
      algorithm
    );

  const events = [];
  let step = 1;

  const variables =
    extractInitialVariables(
      code
    );

  const arrays =
    extractInitialArrays(code);

  const lines =
    String(code || "")
      .split(/\r?\n/);

  const MAX_SOURCE_LINES = 500;
  const MAX_EVENTS = 5000;

  const pushEvent = (
    type,
    data = {}
  ) => {
    if (
      events.length >=
      MAX_EVENTS
    ) {
      return;
    }

    events.push(
      createEvent(
        step++,
        type,
        {
          algorithm,
          dataStructure,
          language,
          ...data,
        }
      )
    );
  };

  pushEvent(
    "program_start",
    {
      variables:
        variableSnapshot(
          variables
        ),

      arrays,

      message:
        "Program execution trace started.",
    }
  );

  for (
    let index = 0;
    index < lines.length &&
    index < MAX_SOURCE_LINES;
    index++
  ) {
    const line =
      lines[index].trim();

    if (!line) continue;

    if (
      line.startsWith("//") ||
      line.startsWith("/*") ||
      line.startsWith("*") ||
      line === "*/" ||
      line === "{" ||
      line === "}"
    ) {
      continue;
    }

    const operation =
      classifyCodeLine(line);

    const calculation =
      extractCalculation(
        line,
        variables
      );

    const condition =
      extractCondition(
        line,
        variables
      );

    const loop =
      extractLoopInfo(line);

    const functionCall =
      extractFunctionCall(line);

    const outputOperation =
      extractOutputOperation(
        line
      );

    const declaration =
      /\b(int|float|double|char|bool|string|String|boolean|long|short|auto|let|const|var)\b/i.test(
        line
      );

    const interesting =
      operation !== "code" ||
      calculation ||
      condition ||
      loop ||
      functionCall ||
      outputOperation ||
      declaration;

    if (!interesting) {
      continue;
    }

    const before =
      variableSnapshot(
        variables
      );

    /*
      Apply only values that can be
      calculated safely from known values.
    */
    if (
      calculation &&
      calculation.known &&
      calculation.resultName
    ) {
      variables[
        calculation.resultName
      ] =
        calculation.result;
    }

    const after =
      variableSnapshot(
        variables
      );

    pushEvent(
      "code_step",
      {
        line:
          index + 1,

        code:
          line,

        operation,

        variables:
          after,

        variablesBefore:
          before,

        arrays,

        message:
          `Executing line ${index + 1}.`,
      }
    );

    if (calculation) {
      pushEvent(
        "calculation",
        {
          line:
            index + 1,

          code:
            line,

          resultName:
            calculation.resultName,

          expression:
            calculation.expression,

          left:
            calculation.left,

          right:
            calculation.right,

          leftRaw:
            calculation.leftRaw,

          rightRaw:
            calculation.rightRaw,

          operator:
            calculation.operator,

          result:
            calculation.result,

          known:
            calculation.known,

          variables:
            variableSnapshot(
              variables
            ),

          message:
            calculation.known
              ? `${calculation.resultName} = ${calculation.result}`
              : `Evaluate ${calculation.expression}`,
        }
      );
    }

    if (condition) {
      pushEvent(
        "condition",
        {
          line:
            index + 1,

          code:
            line,

          condition:
            condition.condition,

          left:
            condition.left,

          right:
            condition.right,

          operator:
            condition.operator,

          result:
            condition.result,

          known:
            condition.known,

          variables:
            variableSnapshot(
              variables
            ),

          message:
            condition.known
              ? `Condition is ${
                  condition.result
                    ? "true"
                    : "false"
                }.`
              : "Condition will be evaluated by the execution engine.",
        }
      );
    }

    if (loop) {
      pushEvent(
        "loop",
        {
          line:
            index + 1,

          code:
            line,

          loopType:
            loop.loopType,

          initialization:
            loop.initialization,

          condition:
            loop.condition,

          update:
            loop.update,

          variables:
            variableSnapshot(
              variables
            ),

          message:
            `${loop.loopType} loop encountered.`,
        }
      );
    }

    if (functionCall) {
      pushEvent(
        "function_call",
        {
          line:
            index + 1,

          code:
            line,

          functionName:
            functionCall.functionName,

          arguments:
            functionCall.arguments,

          variables:
            variableSnapshot(
              variables
            ),

          message:
            `Function ${functionCall.functionName}() called.`,
        }
      );
    }

    if (outputOperation) {
      pushEvent(
        "output",
        {
          line:
            index + 1,

          code:
            line,

          outputExpression:
            outputOperation,

          variables:
            variableSnapshot(
              variables
            ),

          message:
            "Output operation encountered.",
        }
      );
    }
  }

  /*
    Runtime error = executor truth.
    Visualization freezes here.
  */
  if (
    executionResult &&
    executionResult.error
  ) {
    pushEvent(
      "error",
      {
        errorType:
          executionResult.errorType ||
          "EXECUTION_ERROR",

        error:
          executionResult.error,

        message:
          executionResult.error,

        line:
          executionResult.errorLine ||
          null,

        stderr:
          executionResult.stderr ||
          "",

        output:
          executionResult.output ||
          "",

        variables:
          variableSnapshot(
            variables
          ),

        arrays,

        frozen:
          true,

        messageTitle:
          "Execution stopped because of an error.",
      }
    );

    return {
      supported: true,
      algorithm,
      dataStructure,
      stoppedAtError: true,
      events,
      generic: true,
      reason:
        "Universal trace generated from source structure and the authoritative executor result.",
    };
  }

  /*
    Never reconstruct stdout.
    Copy the actual executor output.
  */
  pushEvent(
    "program_complete",
    {
      output:
        executionResult?.output ||
        "",

      stderr:
        executionResult?.stderr ||
        "",

      exitCode:
        executionResult?.exitCode ??
        executionResult?.code ??
        0,

      variables:
        variableSnapshot(
          variables
        ),

      arrays,

      message:
        "Program execution completed successfully.",
    }
  );

  return {
    supported: true,
    algorithm,
    dataStructure,
    stoppedAtError: false,
    events,
    generic: true,
    reason:
      "Universal trace generated from source structure and the authoritative executor result.",
  };
}

/* =========================================================
   MAIN TRACE ENGINE
========================================================= */

function generateTrace(
  code,
  language = "cpp",
  executionResult = {}
) {
  const normalizedLanguage =
    normalizeLanguage(
      language
    );

  if (
    !code ||
    typeof code !== "string"
  ) {
    return {
      supported: false,
      algorithm: "unknown",
      dataStructure: "unknown",
      stoppedAtError: false,
      events: [],
      reason:
        "No source code was provided.",
    };
  }

  /*
    Runtime errors MUST bypass synthetic
    specialized traces.
  */
  if (
    executionResult &&
    executionResult.error
  ) {
    const errorTrace =
      generateGenericRuntimeTrace(
        code,
        normalizedLanguage,
        executionResult
      );

    return {
      ...errorTrace,
      supported: true,
      stoppedAtError: true,
    };
  }

  /*
    Existing source-level
    out-of-bounds explanation.
  */
  const outOfBounds =
    detectOutOfBounds(code);

  if (outOfBounds) {
    const info =
      getPrimaryArray(code);

    return {
      supported: true,
      algorithm: "array",
      dataStructure: "array",
      stoppedAtError: true,
      reason:
        "Array index out of bounds.",

      events: [
        createEvent(
          1,
          "initial_state",
          {
            algorithm:
              "array",

            dataStructure:
              "array",

            array:
              info?.values || [],

            arrayName:
              info?.name || null,

            message:
              "Array initialized before the invalid access.",
          }
        ),

        createEvent(
          2,
          "error",
          {
            ...outOfBounds,

            line:
              findErrorLine(
                code,
                outOfBounds.variable
              ),

            frozen:
              true,

            array:
              info?.values || [],

            message:
              outOfBounds.message ||
              "Array index is outside the valid range.",
          }
        ),
      ],
    };
  }

  /*
    Specialized DSA adapters.
    They are used only after the real
    executor reports success.
  */
  if (detectStack(code)) {
    return generateStackTrace(
      code
    );
  }

  if (detectQueue(code)) {
    return generateQueueTrace(
      code
    );
  }

  if (detectLinkedList(code)) {
    return generateLinkedListTrace(
      code
    );
  }

  if (detectBubbleSort(code)) {
    return generateBubbleSortTrace(
      code
    );
  }

  if (detectSelectionSort(code)) {
    return generateSelectionSortTrace(
      code
    );
  }

  if (detectInsertionSort(code)) {
    return generateInsertionSortTrace(
      code
    );
  }

  if (detectBinarySearch(code)) {
    return generateBinarySearchTrace(
      code
    );
  }

  if (detectLinearSearch(code)) {
    return generateLinearSearchTrace(
      code
    );
  }

  if (detectArrayTraversal(code)) {
    return generateArrayTraversalTrace(
      code
    );
  }

  /*
    UNIVERSAL FALLBACK:
    Any other program still receives
    visualization events.
  */
  const genericTrace =
    generateGenericRuntimeTrace(
      code,
      normalizedLanguage,
      executionResult
    );

  return {
    ...genericTrace,

    supported:
      true,

    generic:
      true,

    algorithm:
      genericTrace.algorithm ||
      inferAlgorithm(code),

    dataStructure:
      genericTrace.dataStructure ||
      inferDataStructure(
        code,
        genericTrace.algorithm ||
          inferAlgorithm(code)
      ),
  };
}

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  generateTrace,
};
