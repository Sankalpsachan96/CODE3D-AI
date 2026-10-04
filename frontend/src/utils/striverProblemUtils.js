// Utilities for the CODE3D Striver workspace. The catalog contains reference
// implementations for development, but the learner never receives those as
// their starting editor content.

function braceEnd(code, openIndex) {
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < code.length; i++) {
    const ch = code[i];
    const prev = code[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function buildStarterCode(problem, language = 'java') {
  const source = language === 'python' ? problem.pythonCode : language === 'cpp' ? problem.cppCode : language === 'javascript' ? problem.javascriptCode || problem.pythonCode : problem.javaCode;
  if (!source) return '';

  if (language === 'python') {
    const lines = source.split(/\r?\n/);
    const defIndex = lines.findIndex((line) => /^\s*def\s+/.test(line));
    if (defIndex >= 0) {
      const indent = (lines[defIndex].match(/^\s*/) || [''])[0];
      const bodyIndent = `${indent}    `;
      const out = lines.slice(0, defIndex + 1);
      let i = defIndex + 1;
      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        const currentIndent = (line.match(/^\s*/) || [''])[0].length;
        if (trimmed && currentIndent <= indent.length) break;
        i++;
      }
      out.push(`${bodyIndent}# Write your solution here`);
      out.push(`${bodyIndent}pass`);
      return out.join('\n');
    }
    return `# ${problem.title}\n\ndef solve(nums):\n    # Write your solution here\n    pass\n`;
  }

  if (!source.includes('class Solution')) {
    return `// ${problem.title}\n// ${problem.description}\n\nclass Solution {\n    // Design the required data structure / algorithm here.\n}`;
  }

  const methodMatch = source.match(/(public\s+(?:static\s+)?[\w<>\[\], ?]+\s+\w+\s*\([^)]*\)\s*\{|(?:[\w<>:\[\], ?]+)\s+\w+\s*\([^)]*\)\s*\{)/m);
  if (methodMatch) {
    const open = source.indexOf('{', methodMatch.index + methodMatch[0].length - 1);
    const close = braceEnd(source, open);
    if (open >= 0 && close > open) {
      const prefix = source.slice(0, open + 1);
      const returnType = methodMatch[0].match(/\b(public\s+)?(?:static\s+)?([\w<>\[\]]+)\s+\w+\s*\(/)?.[2] || 'int';
      const placeholder = returnType === 'void' ? '        // Write your solution here' : `        // Write your solution here\n        ${returnType === 'boolean' ? 'return false;' : returnType.includes('List') || returnType.includes('[]') || returnType.includes('vector') ? 'return null;' : 'return 0;'}`;
      return `${prefix}\n${placeholder}\n    }\n}`;
    }
  }

  // Safe fallback: never expose the reference implementation in the learner editor.
  // Data-structure problems (LRU/LFU/Trie/MinStack/etc.) get a clean interface shell.
  return `// ${problem.title}\n// ${problem.description}\n\nclass Solution {\n    // Implement the required data structure / algorithm here.\n}`;
}

export function buildProblemMeta(problem) {
  return {
    examples: [
      { label: 'Try this input', input: problem.defaultInput || 'Use your own test input' },
      { label: 'Expected behavior', input: 'Your output should satisfy the problem statement for all valid inputs.' },
    ],
    constraints: [
      `Difficulty: ${problem.difficulty}`,
      `Expected time: ${problem.timeComplexity}`,
      `Expected space: ${problem.spaceComplexity}`,
      'Handle edge cases and do not hard-code the example.',
    ],
  };
}
