/**
 * CODE3D-AI - Master Java Execution & Visualization Engine
 * 
 * Safe deterministic architecture:
 * JAVA SOURCE
 *   ↓
 * LEXER / TOKENIZER
 *   ↓
 * PARSER
 *   ↓
 * AST / IR
 *   ↓
 * VALIDATOR
 *   ↓
 * SAFE SIMULATOR
 *   ↓
 * EXECUTION TRACE
 *   ↓
 * VISUALIZATION STATE (3D WebGL)
 * 
 * Strictly sandbox-safe: no eval(), no Function().
 */

import { tokenize } from './javaLexer.js';
import { parseJava, ASTNodeType } from './javaParser.js';
import { validateJavaAST } from './javaValidator.js';
import { simulateJavaAST, EventType } from './javaSimulator.js';
import {
  generateBubbleSortSteps as generateBubbleSortTrace,
  generateSelectionSortSteps as generateSelectionSortTrace,
  generateInsertionSortSteps as generateInsertionSortTrace,
  generateMergeSortSteps as generateMergeSortTrace,
  generateQuickSortSteps as generateQuickSortTrace,
  generateLinearSearchSteps as generateLinearSearchTrace,
  generateBinarySearchSteps as generateBinarySearchTrace,
  ALGORITHM_CATALOG,
  getAlgorithm,
  generateAlgorithmSteps
} from '../algorithms/index.js';

export {
  tokenize,
  parseJava,
  validateJavaAST,
  simulateJavaAST,
  EventType,
  ASTNodeType,
  generateBubbleSortTrace,
  generateSelectionSortTrace,
  generateInsertionSortTrace,
  generateMergeSortTrace,
  generateQuickSortTrace,
  generateLinearSearchTrace,
  generateBinarySearchTrace,
  ALGORITHM_CATALOG,
  getAlgorithm,
  generateAlgorithmSteps
};

/**
 * Parses numbers from a string or custom input
 */
export function extractNumbers(input) {
  if (Array.isArray(input)) return input.map(Number).filter(n => !isNaN(n));
  if (typeof input !== 'string') return [];
  const matches = input.match(/-?\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Master Java Execution Pipeline
 * 
 * @param {string} sourceCode - Raw Java code
 * @param {string|number[]|null} customInput - User input from form or runner
 * @param {string|null} archetype - Explicit algorithm archetype (e.g. 'bubble-sort', 'binary-search')
 * @returns {{ success: boolean, steps?: Array, error?: { line: number, column: number, message: string, suggestion: string } }}
 */
export function executeJavaCode(sourceCode, customInput = null, archetype = null) {
  if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
    return {
      success: false,
      error: {
        line: 1,
        column: 1,
        message: 'Java code is empty.',
        suggestion: 'Write or paste supported Java code into the editor.'
      }
    };
  }

  const clean = sourceCode.toLowerCase();
  const inputNumbers = extractNumbers(customInput);

  // Check for specialized algorithm traces if requested or clearly detected
  if (archetype) {
    const arch = archetype.toLowerCase();
    if (arch.includes('bubble-sort')) {
      const steps = generateBubbleSortTrace(inputNumbers.length >= 2 ? inputNumbers : null);
      return { success: true, steps, totalSteps: steps.length };
    }
    if (arch.includes('selection-sort')) {
      const steps = generateSelectionSortTrace(inputNumbers.length >= 2 ? inputNumbers : null);
      return { success: true, steps, totalSteps: steps.length };
    }
    if (arch.includes('insertion-sort')) {
      const steps = generateInsertionSortTrace(inputNumbers.length >= 2 ? inputNumbers : null);
      return { success: true, steps, totalSteps: steps.length };
    }
    if (arch.includes('merge-sort')) {
      const steps = generateMergeSortTrace(inputNumbers.length >= 2 ? inputNumbers : null);
      return { success: true, steps, totalSteps: steps.length };
    }
    if (arch.includes('quick-sort')) {
      const steps = generateQuickSortTrace(inputNumbers.length >= 2 ? inputNumbers : null);
      return { success: true, steps, totalSteps: steps.length };
    }
    if (arch.includes('binary-search')) {
      const target = inputNumbers.length > 0 ? inputNumbers[inputNumbers.length - 1] : 42;
      const arr = inputNumbers.length > 1 ? inputNumbers.slice(0, -1) : null;
      const steps = generateBinarySearchTrace(arr, target);
      return { success: true, steps, totalSteps: steps.length };
    }
    if (arch.includes('linear-search') || arch.includes('search')) {
      const target = inputNumbers.length > 0 ? inputNumbers[inputNumbers.length - 1] : 23;
      const arr = inputNumbers.length > 1 ? inputNumbers.slice(0, -1) : null;
      const steps = generateLinearSearchTrace(arr, target);
      return { success: true, steps, totalSteps: steps.length };
    }
  }

  // 1. TOKENIZE
  let tokens;
  try {
    tokens = tokenize(sourceCode);
  } catch (lexErr) {
    return {
      success: false,
      error: {
        line: lexErr.line || 1,
        column: lexErr.column || 1,
        message: lexErr.message || 'Lexical Error',
        suggestion: lexErr.suggestion || 'Review code syntax.'
      }
    };
  }

  // 2. PARSE AST
  let ast;
  try {
    ast = parseJava(tokens);
  } catch (parseErr) {
    return {
      success: false,
      error: {
        line: parseErr.line || 1,
        column: parseErr.column || 1,
        message: parseErr.message || 'Java Syntax Error',
        suggestion: parseErr.suggestion || 'Check brackets, semicolons, and variable types.'
      }
    };
  }

  // 3. SEMANTIC VALIDATION
  const validation = validateJavaAST(ast);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }

  // 4. SIMULATION & DETERMINISTIC TRACE
  try {
    const steps = simulateJavaAST(ast, customInput);
    if (!steps || steps.length === 0) {
      return {
        success: false,
        error: {
          line: 1,
          column: 1,
          message: 'Simulation produced no execution steps.',
          suggestion: 'Ensure your program contains executable statements.'
        }
      };
    }

    return {
      success: true,
      steps,
      totalSteps: steps.length
    };
  } catch (simErr) {
    return {
      success: false,
      error: {
        line: simErr.line || 1,
        column: simErr.column || 1,
        message: `Runtime Simulation Error: ${simErr.message}`,
        suggestion: simErr.suggestion || 'Check array indices and loop bounds.'
      }
    };
  }
}
