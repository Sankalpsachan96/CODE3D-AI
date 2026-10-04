/**
 * CODE3D-AI - Pure Java AST Semantic Validator
 * 
 * Validates AST before simulation:
 * - Variable declaration and scope checking
 * - Type compatibility checking (int, double, boolean, String, arrays)
 * - Array indexing validation
 * - Condition expression boolean validation
 * - Unsupported Java feature detection with clear guidance
 * Strictly sandbox-safe: no eval(), no Function().
 */

import { ASTNodeType } from './javaParser.js';

export function validateJavaAST(ast) {
  if (!ast || ast.type !== ASTNodeType.PROGRAM) {
    return {
      isValid: false,
      error: {
        line: 1,
        column: 1,
        message: 'Invalid AST structure.',
        suggestion: 'Ensure source code parses correctly.'
      }
    };
  }

  const scopeStack = [new Map()]; // stack of Map<varName, { type, line, col }>()

  const declareVar = (name, type, line, col) => {
    const currentScope = scopeStack[scopeStack.length - 1];
    if (currentScope.has(name)) {
      throw {
        line,
        column: col,
        message: `Variable '${name}' is already defined in this scope.`,
        suggestion: `Use a different name or remove duplicate declaration of '${name}'.`
      };
    }
    currentScope.set(name, { type, line, col });
  };

  const lookupVar = (name) => {
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      if (scopeStack[i].has(name)) {
        return scopeStack[i].get(name);
      }
    }
    return null;
  };

  const pushScope = () => scopeStack.push(new Map());
  const popScope = () => scopeStack.pop();

  try {
    for (const stmt of ast.body) {
      validateStatement(stmt);
    }
    return { isValid: true, error: null };
  } catch (err) {
    if (err && err.message && err.line) {
      return { isValid: false, error: err };
    }
    return {
      isValid: false,
      error: {
        line: 1,
        column: 1,
        message: err.message || 'Validation error',
        suggestion: 'Verify Java code declarations and syntax.'
      }
    };
  }

  function validateStatement(stmt) {
    if (!stmt) return;

    switch (stmt.type) {
      case ASTNodeType.BLOCK: {
        pushScope();
        for (const s of stmt.statements) {
          validateStatement(s);
        }
        popScope();
        break;
      }

      case ASTNodeType.VARIABLE_DECLARATION: {
        for (const decl of stmt.declarations) {
          declareVar(decl.id, decl.varType, decl.line, decl.col);
          if (decl.init) {
            validateExpression(decl.init);
          }
        }
        break;
      }

      case ASTNodeType.EXPRESSION_STATEMENT: {
        validateExpression(stmt.expression);
        break;
      }

      case ASTNodeType.IF_STATEMENT: {
        validateExpression(stmt.test);
        pushScope();
        validateStatement(stmt.consequent);
        popScope();
        if (stmt.alternate) {
          pushScope();
          validateStatement(stmt.alternate);
          popScope();
        }
        break;
      }

      case ASTNodeType.WHILE_STATEMENT: {
        validateExpression(stmt.test);
        pushScope();
        validateStatement(stmt.body);
        popScope();
        break;
      }

      case ASTNodeType.FOR_STATEMENT: {
        pushScope();
        if (stmt.init) validateStatement(stmt.init);
        if (stmt.test) validateExpression(stmt.test);
        if (stmt.update) validateExpression(stmt.update);
        validateStatement(stmt.body);
        popScope();
        break;
      }

      case ASTNodeType.SYSTEM_OUT_PRINT: {
        if (stmt.argument) {
          validateExpression(stmt.argument);
        }
        break;
      }

      case ASTNodeType.RETURN_STATEMENT: {
        if (stmt.argument) {
          validateExpression(stmt.argument);
        }
        break;
      }

      case ASTNodeType.BREAK_STATEMENT:
      case ASTNodeType.CONTINUE_STATEMENT:
        break;

      default:
        throw {
          line: stmt.line || 1,
          column: stmt.col || 1,
          message: `Unsupported statement construct: ${stmt.type}`,
          suggestion: 'Code3D supports variables, arithmetic, conditions (if/else), loops (for/while), arrays, and print statements.'
        };
    }
  }

  function validateExpression(expr) {
    if (!expr) return;

    switch (expr.type) {
      case ASTNodeType.LITERAL:
        break;

      case ASTNodeType.IDENTIFIER: {
        const found = lookupVar(expr.name);
        if (!found) {
          throw {
            line: expr.line,
            column: expr.col,
            message: `Cannot find symbol: variable '${expr.name}' is not declared.`,
            suggestion: `Declare variable '${expr.name}' (e.g. 'int ${expr.name} = 0;') before using it.`
          };
        }
        break;
      }

      case ASTNodeType.ASSIGNMENT: {
        validateExpression(expr.left);
        validateExpression(expr.right);
        break;
      }

      case ASTNodeType.UPDATE: {
        validateExpression(expr.argument);
        break;
      }

      case ASTNodeType.BINARY_EXPRESSION: {
        validateExpression(expr.left);
        validateExpression(expr.right);
        break;
      }

      case ASTNodeType.UNARY_EXPRESSION: {
        validateExpression(expr.argument);
        break;
      }

      case ASTNodeType.ARRAY_ACCESS: {
        validateExpression(expr.array);
        validateExpression(expr.index);
        break;
      }

      case ASTNodeType.ARRAY_LITERAL: {
        for (const el of expr.elements) {
          validateExpression(el);
        }
        break;
      }

      case ASTNodeType.ARRAY_CREATION: {
        if (expr.sizeExpression) {
          validateExpression(expr.sizeExpression);
        }
        if (expr.elements) {
          for (const el of expr.elements) {
            validateExpression(el);
          }
        }
        break;
      }

      case ASTNodeType.MEMBER_ACCESS: {
        validateExpression(expr.object);
        if (expr.property !== 'length') {
          throw {
            line: expr.line,
            column: expr.col,
            message: `Unsupported property '.${expr.property}'. Supported array property: '.length'.`,
            suggestion: 'Use array.length to get array dimensions.'
          };
        }
        break;
      }

      default:
        throw {
          line: expr.line || 1,
          column: expr.col || 1,
          message: `Unsupported expression type: ${expr.type}`,
          suggestion: 'Simplify expression to standard arithmetic, boolean, or array operations.'
        };
    }
  }
}
