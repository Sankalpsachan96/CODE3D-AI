/**
 * CODE3D-AI - Pure Java AST Parser
 * 
 * Parses token stream into an Abstract Syntax Tree (AST) representing supported
 * Java statements, control flow, declarations, array operations, and expressions.
 * Strictly sandbox-safe: no eval(), no Function().
 */

import { TokenType } from './javaLexer.js';

export const ASTNodeType = {
  PROGRAM: 'Program',
  BLOCK: 'Block',
  VARIABLE_DECLARATION: 'VariableDeclaration',
  VARIABLE_DECLARATOR: 'VariableDeclarator',
  ASSIGNMENT: 'AssignmentExpression',
  UPDATE: 'UpdateExpression',
  IF_STATEMENT: 'IfStatement',
  WHILE_STATEMENT: 'WhileStatement',
  FOR_STATEMENT: 'ForStatement',
  EXPRESSION_STATEMENT: 'ExpressionStatement',
  SYSTEM_OUT_PRINT: 'SystemOutPrint',
  RETURN_STATEMENT: 'ReturnStatement',
  BREAK_STATEMENT: 'BreakStatement',
  CONTINUE_STATEMENT: 'ContinueStatement',
  BINARY_EXPRESSION: 'BinaryExpression',
  UNARY_EXPRESSION: 'UnaryExpression',
  ARRAY_ACCESS: 'ArrayAccess',
  ARRAY_CREATION: 'ArrayCreation',
  ARRAY_LITERAL: 'ArrayLiteral',
  MEMBER_ACCESS: 'MemberAccess',
  IDENTIFIER: 'Identifier',
  LITERAL: 'Literal',
};

export class JavaParser {
  constructor(tokens) {
    this.tokens = tokens;
    this.cursor = 0;
  }

  current() {
    return this.tokens[this.cursor] || { type: TokenType.EOF, value: 'EOF', line: 1, col: 1 };
  }

  peek(offset = 1) {
    return this.tokens[this.cursor + offset] || { type: TokenType.EOF, value: 'EOF', line: 1, col: 1 };
  }

  isAtEnd() {
    return this.current().type === TokenType.EOF;
  }

  advance() {
    const tok = this.current();
    if (!this.isAtEnd()) this.cursor++;
    return tok;
  }

  check(type, val = null) {
    if (this.isAtEnd()) return false;
    const cur = this.current();
    if (cur.type !== type) return false;
    if (val !== null && cur.value !== val) return false;
    return true;
  }

  match(type, val = null) {
    if (this.check(type, val)) {
      return this.advance();
    }
    return null;
  }

  expect(type, val = null, message = null, suggestion = null) {
    const token = this.current();
    if (this.check(type, val)) {
      return this.advance();
    }
    const expectedDesc = val ? `'${val}'` : type;
    throw {
      line: token.line,
      column: token.col,
      message: message || `Expected ${expectedDesc}, found '${token.value}'.`,
      suggestion: suggestion || `Check syntax near '${token.value}'.`
    };
  }

  parse() {
    // Check if source code has "class ... { ... main(...) { ... } }" wrapper
    if (this.check(TokenType.KEYWORD, 'public') || this.check(TokenType.KEYWORD, 'class')) {
      return this.parseFullClass();
    }

    // Otherwise parse directly as statement sequence
    const statements = [];
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }

    return {
      type: ASTNodeType.PROGRAM,
      body: statements,
      line: 1,
      col: 1
    };
  }

  parseFullClass() {
    // Skip modifiers
    while (this.match(TokenType.KEYWORD, 'public') || this.match(TokenType.KEYWORD, 'final')) {}

    if (this.match(TokenType.KEYWORD, 'class')) {
      const className = this.expect(TokenType.IDENTIFIER, null, 'Expected class name after "class".').value;
      this.expect(TokenType.DELIMITER, '{', 'Expected "{" to open class body.');

      let mainBody = null;
      while (!this.isAtEnd() && !this.check(TokenType.DELIMITER, '}')) {
        // Look for main method or methods
        const method = this.parseMethodDeclaration();
        if (method && (method.name === 'main' || !mainBody)) {
          mainBody = method.body;
        }
      }

      this.expect(TokenType.DELIMITER, '}', 'Expected "}" to close class body.');

      return {
        type: ASTNodeType.PROGRAM,
        className,
        body: mainBody ? mainBody.statements : [],
        line: 1,
        col: 1
      };
    }

    throw {
      line: this.current().line,
      column: this.current().col,
      message: `Unexpected token '${this.current().value}'.`,
      suggestion: 'Java classes must begin with "class <Name> { ... }"'
    };
  }

  parseMethodDeclaration() {
    // Skip modifiers: public, static, private, etc.
    while (
      this.match(TokenType.KEYWORD, 'public') ||
      this.match(TokenType.KEYWORD, 'private') ||
      this.match(TokenType.KEYWORD, 'protected') ||
      this.match(TokenType.KEYWORD, 'static') ||
      this.match(TokenType.KEYWORD, 'final')
    ) {}

    // Return type: void, int, etc.
    let returnType = 'void';
    if (this.check(TokenType.KEYWORD)) {
      returnType = this.advance().value;
      if (this.match(TokenType.DELIMITER, '[')) {
        this.expect(TokenType.DELIMITER, ']');
        returnType += '[]';
      }
    } else if (this.check(TokenType.IDENTIFIER)) {
      returnType = this.advance().value;
    }

    // Method name
    const nameToken = this.expect(TokenType.IDENTIFIER, null, 'Expected method name.');
    const methodName = nameToken.value;

    // Parameters: (String[] args)
    this.expect(TokenType.DELIMITER, '(', 'Expected "(" after method name.');
    while (!this.isAtEnd() && !this.check(TokenType.DELIMITER, ')')) {
      this.advance(); // skip param tokens
    }
    this.expect(TokenType.DELIMITER, ')', 'Expected ")" after method parameters.');

    // Method body
    const body = this.parseBlockStatement();

    return {
      name: methodName,
      returnType,
      body,
      line: nameToken.line,
      col: nameToken.col
    };
  }

  parseStatement() {
    // 1. Block { ... }
    if (this.check(TokenType.DELIMITER, '{')) {
      return this.parseBlockStatement();
    }

    // 2. If statement
    if (this.check(TokenType.KEYWORD, 'if')) {
      return this.parseIfStatement();
    }

    // 3. While statement
    if (this.check(TokenType.KEYWORD, 'while')) {
      return this.parseWhileStatement();
    }

    // 4. For statement
    if (this.check(TokenType.KEYWORD, 'for')) {
      return this.parseForStatement();
    }

    // 5. System.out.println / print
    if ((this.check(TokenType.IDENTIFIER, 'System') || this.check(TokenType.KEYWORD, 'System')) && this.peek().value === '.') {
      return this.parseSystemOut();
    }

    // 6. Return / Break / Continue
    if (this.match(TokenType.KEYWORD, 'return')) {
      const tok = this.tokens[this.cursor - 1];
      let argument = null;
      if (!this.check(TokenType.DELIMITER, ';')) {
        argument = this.parseExpression();
      }
      this.expect(TokenType.DELIMITER, ';', 'Expected ";" after return statement.');
      return { type: ASTNodeType.RETURN_STATEMENT, argument, line: tok.line, col: tok.col };
    }
    if (this.match(TokenType.KEYWORD, 'break')) {
      const tok = this.tokens[this.cursor - 1];
      this.expect(TokenType.DELIMITER, ';', 'Expected ";" after break.');
      return { type: ASTNodeType.BREAK_STATEMENT, line: tok.line, col: tok.col };
    }
    if (this.match(TokenType.KEYWORD, 'continue')) {
      const tok = this.tokens[this.cursor - 1];
      this.expect(TokenType.DELIMITER, ';', 'Expected ";" after continue.');
      return { type: ASTNodeType.CONTINUE_STATEMENT, line: tok.line, col: tok.col };
    }

    // 7. Variable declaration: int x = ..., int[] arr = ..., String s = ...
    if (this.isTypeKeyword()) {
      return this.parseVariableDeclaration();
    }

    // 8. Expression Statement (Assignment, Update, Method call)
    const expr = this.parseExpression();
    this.expect(TokenType.DELIMITER, ';', 'Expected ";" after expression statement.');
    return {
      type: ASTNodeType.EXPRESSION_STATEMENT,
      expression: expr,
      line: expr.line,
      col: expr.col
    };
  }

  isTypeKeyword() {
    const cur = this.current();
    if (cur.type === TokenType.KEYWORD) {
      return ['int', 'double', 'float', 'boolean', 'String', 'char', 'long'].includes(cur.value);
    }
    return false;
  }

  parseBlockStatement() {
    const openBrace = this.expect(TokenType.DELIMITER, '{', 'Expected "{" to open block.');
    const statements = [];
    while (!this.isAtEnd() && !this.check(TokenType.DELIMITER, '}')) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    this.expect(TokenType.DELIMITER, '}', 'Expected "}" to close block.');
    return {
      type: ASTNodeType.BLOCK,
      statements,
      line: openBrace.line,
      col: openBrace.col
    };
  }

  parseIfStatement() {
    const ifToken = this.expect(TokenType.KEYWORD, 'if');
    this.expect(TokenType.DELIMITER, '(', 'Expected "(" after "if".');
    const test = this.parseExpression();
    this.expect(TokenType.DELIMITER, ')', 'Expected ")" after if condition.');

    const consequent = this.parseStatement();
    let alternate = null;

    if (this.match(TokenType.KEYWORD, 'else')) {
      alternate = this.parseStatement();
    }

    return {
      type: ASTNodeType.IF_STATEMENT,
      test,
      consequent,
      alternate,
      line: ifToken.line,
      col: ifToken.col
    };
  }

  parseWhileStatement() {
    const whileToken = this.expect(TokenType.KEYWORD, 'while');
    this.expect(TokenType.DELIMITER, '(', 'Expected "(" after "while".');
    const test = this.parseExpression();
    this.expect(TokenType.DELIMITER, ')', 'Expected ")" after while condition.');
    const body = this.parseStatement();

    return {
      type: ASTNodeType.WHILE_STATEMENT,
      test,
      body,
      line: whileToken.line,
      col: whileToken.col
    };
  }

  parseForStatement() {
    const forToken = this.expect(TokenType.KEYWORD, 'for');
    this.expect(TokenType.DELIMITER, '(', 'Expected "(" after "for".');

    // Init: variable declaration or expression or empty
    let init = null;
    if (this.isTypeKeyword()) {
      init = this.parseVariableDeclaration();
    } else if (!this.check(TokenType.DELIMITER, ';')) {
      init = this.parseExpression();
      this.expect(TokenType.DELIMITER, ';', 'Expected ";" after for loop initialization.');
    } else {
      this.expect(TokenType.DELIMITER, ';', 'Expected ";" after for loop initialization.');
    }

    // Test: expression or empty
    let test = null;
    if (!this.check(TokenType.DELIMITER, ';')) {
      test = this.parseExpression();
    }
    this.expect(TokenType.DELIMITER, ';', 'Expected ";" after for loop condition.');

    // Update: expression or empty
    let update = null;
    if (!this.check(TokenType.DELIMITER, ')')) {
      update = this.parseExpression();
    }
    this.expect(TokenType.DELIMITER, ')', 'Expected ")" after for loop update.');

    const body = this.parseStatement();

    return {
      type: ASTNodeType.FOR_STATEMENT,
      init,
      test,
      update,
      body,
      line: forToken.line,
      col: forToken.col
    };
  }

  parseSystemOut() {
    const sysToken = this.advance(); // System
    this.expect(TokenType.OPERATOR, '.', 'Expected "." after System.');
    const outToken = this.current();
    if (outToken.value !== 'out') {
      throw {
        line: outToken.line,
        column: outToken.col,
        message: `Expected 'out' after System., found '${outToken.value}'.`,
        suggestion: 'Use System.out.println(...) or System.out.print(...)'
      };
    }
    this.advance(); // out
    this.expect(TokenType.OPERATOR, '.', 'Expected "." after System.out.');
    
    const methodToken = this.current();
    if (methodToken.value !== 'println' && methodToken.value !== 'print') {
      throw {
        line: methodToken.line,
        column: methodToken.col,
        message: `Unknown method System.out.${methodToken.value}. Expected println or print.`,
        suggestion: 'Use System.out.println(...) or System.out.print(...)'
      };
    }
    this.advance(); // println or print
    const isNewline = methodToken.value === 'println';

    this.expect(TokenType.DELIMITER, '(', 'Expected "(" after System.out.' + methodToken.value);

    let argument = null;
    if (!this.check(TokenType.DELIMITER, ')')) {
      argument = this.parseExpression();
    }

    this.expect(TokenType.DELIMITER, ')', 'Expected ")" to close System.out.' + methodToken.value);
    this.expect(TokenType.DELIMITER, ';', 'Expected ";" after System.out.' + methodToken.value + ' statement.');

    return {
      type: ASTNodeType.SYSTEM_OUT_PRINT,
      argument,
      isNewline,
      line: sysToken.line,
      col: sysToken.col
    };
  }

  parseVariableDeclaration() {
    const typeToken = this.advance();
    let baseType = typeToken.value;
    let isArray = false;

    // Check for array syntax: int[] arr or int arr[]
    if (this.match(TokenType.DELIMITER, '[')) {
      this.expect(TokenType.DELIMITER, ']');
      isArray = true;
    }

    const declarators = [];

    do {
      const nameToken = this.expect(TokenType.IDENTIFIER, null, 'Expected variable name.');
      let name = nameToken.value;
      let varIsArray = isArray;

      // Alternative Java C-style array syntax: int arr[]
      if (!varIsArray && this.match(TokenType.DELIMITER, '[')) {
        this.expect(TokenType.DELIMITER, ']');
        varIsArray = true;
      }

      let init = null;
      if (this.match(TokenType.OPERATOR, '=')) {
        init = this.parseInitExpression(varIsArray ? `${baseType}[]` : baseType);
      }

      declarators.push({
        type: ASTNodeType.VARIABLE_DECLARATOR,
        id: name,
        varType: varIsArray ? `${baseType}[]` : baseType,
        init,
        line: nameToken.line,
        col: nameToken.col
      });
    } while (this.match(TokenType.DELIMITER, ','));

    // Check for ending semicolon (unless inside for-loop init)
    if (!this.check(TokenType.DELIMITER, ')') && !this.check(TokenType.DELIMITER, ';')) {
      this.expect(TokenType.DELIMITER, ';', 'Expected ";" after variable declaration.');
    } else if (this.check(TokenType.DELIMITER, ';')) {
      this.advance();
    }

    return {
      type: ASTNodeType.VARIABLE_DECLARATION,
      varType: isArray ? `${baseType}[]` : baseType,
      declarations: declarators,
      line: typeToken.line,
      col: typeToken.col
    };
  }

  parseInitExpression(expectedType) {
    // Array literal with braces: {1, 2, 3}
    if (this.check(TokenType.DELIMITER, '{')) {
      return this.parseArrayLiteral();
    }

    // new type[] { ... } or new type[size]
    if (this.match(TokenType.KEYWORD, 'new')) {
      const newTok = this.tokens[this.cursor - 1];
      const elemTypeToken = this.advance();
      const elemType = elemTypeToken.value;

      this.expect(TokenType.DELIMITER, '[', 'Expected "[" after new ' + elemType);

      // Sized array: new int[5]
      if (!this.check(TokenType.DELIMITER, ']')) {
        const sizeExpr = this.parseExpression();
        this.expect(TokenType.DELIMITER, ']', 'Expected "]" after array size.');
        return {
          type: ASTNodeType.ARRAY_CREATION,
          elementType: elemType,
          sizeExpression: sizeExpr,
          elements: null,
          line: newTok.line,
          col: newTok.col
        };
      }

      // Initialized array: new int[] { 1, 2, 3 }
      this.expect(TokenType.DELIMITER, ']', 'Expected "]"');
      if (this.check(TokenType.DELIMITER, '{')) {
        const lit = this.parseArrayLiteral();
        return {
          type: ASTNodeType.ARRAY_CREATION,
          elementType: elemType,
          sizeExpression: null,
          elements: lit.elements,
          line: newTok.line,
          col: newTok.col
        };
      }
    }

    return this.parseExpression();
  }

  parseArrayLiteral() {
    const openBrace = this.expect(TokenType.DELIMITER, '{', 'Expected "{" for array literal.');
    const elements = [];

    if (!this.check(TokenType.DELIMITER, '}')) {
      do {
        if (this.check(TokenType.DELIMITER, '}')) break;
        elements.push(this.parseExpression());
      } while (this.match(TokenType.DELIMITER, ','));
    }

    this.expect(TokenType.DELIMITER, '}', 'Expected "}" to close array literal.');

    return {
      type: ASTNodeType.ARRAY_LITERAL,
      elements,
      line: openBrace.line,
      col: openBrace.col
    };
  }

  // -------------------------------------------------------------
  // EXPRESSION PARSER (Operator Precedence)
  // -------------------------------------------------------------
  parseExpression() {
    return this.parseAssignment();
  }

  parseAssignment() {
    const expr = this.parseLogicalOr();

    const assignOps = ['=', '+=', '-=', '*=', '/=', '%='];
    const cur = this.current();
    if (cur.type === TokenType.OPERATOR && assignOps.includes(cur.value)) {
      const op = this.advance().value;
      const right = this.parseAssignment();

      if (expr.type !== ASTNodeType.IDENTIFIER && expr.type !== ASTNodeType.ARRAY_ACCESS) {
        throw {
          line: cur.line,
          column: cur.col,
          message: 'Invalid assignment target.',
          suggestion: 'Assignments must target a variable or array element.'
        };
      }

      return {
        type: ASTNodeType.ASSIGNMENT,
        operator: op,
        left: expr,
        right,
        line: cur.line,
        col: cur.col
      };
    }

    return expr;
  }

  parseLogicalOr() {
    let expr = this.parseLogicalAnd();
    while (this.match(TokenType.OPERATOR, '||')) {
      const op = '||';
      const right = this.parseLogicalAnd();
      expr = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: op,
        left: expr,
        right,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  }

  parseLogicalAnd() {
    let expr = this.parseEquality();
    while (this.match(TokenType.OPERATOR, '&&')) {
      const op = '&&';
      const right = this.parseEquality();
      expr = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: op,
        left: expr,
        right,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  }

  parseEquality() {
    let expr = this.parseRelational();
    while (this.check(TokenType.OPERATOR, '==') || this.check(TokenType.OPERATOR, '!=')) {
      const op = this.advance().value;
      const right = this.parseRelational();
      expr = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: op,
        left: expr,
        right,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  }

  parseRelational() {
    let expr = this.parseAdditive();
    while (
      this.check(TokenType.OPERATOR, '<') ||
      this.check(TokenType.OPERATOR, '<=') ||
      this.check(TokenType.OPERATOR, '>') ||
      this.check(TokenType.OPERATOR, '>=')
    ) {
      const op = this.advance().value;
      const right = this.parseAdditive();
      expr = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: op,
        left: expr,
        right,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  }

  parseAdditive() {
    let expr = this.parseMultiplicative();
    while (this.check(TokenType.OPERATOR, '+') || this.check(TokenType.OPERATOR, '-')) {
      const op = this.advance().value;
      const right = this.parseMultiplicative();
      expr = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: op,
        left: expr,
        right,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  }

  parseMultiplicative() {
    let expr = this.parseUnary();
    while (
      this.check(TokenType.OPERATOR, '*') ||
      this.check(TokenType.OPERATOR, '/') ||
      this.check(TokenType.OPERATOR, '%')
    ) {
      const op = this.advance().value;
      const right = this.parseUnary();
      expr = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: op,
        left: expr,
        right,
        line: expr.line,
        col: expr.col
      };
    }
    return expr;
  }

  parseUnary() {
    // Prefix increment / decrement: ++x, --x
    if (this.check(TokenType.OPERATOR, '++') || this.check(TokenType.OPERATOR, '--')) {
      const op = this.advance().value;
      const arg = this.parseUnary();
      return {
        type: ASTNodeType.UPDATE,
        operator: op,
        argument: arg,
        prefix: true,
        line: arg.line,
        col: arg.col
      };
    }

    // Logical NOT or Unary minus: !x, -x
    if (this.check(TokenType.OPERATOR, '!') || this.check(TokenType.OPERATOR, '-')) {
      const op = this.advance().value;
      const arg = this.parseUnary();
      return {
        type: ASTNodeType.UNARY_EXPRESSION,
        operator: op,
        argument: arg,
        line: arg.line,
        col: arg.col
      };
    }

    return this.parsePostfix();
  }

  parsePostfix() {
    let expr = this.parsePrimary();

    while (true) {
      // Array access: arr[i]
      if (this.match(TokenType.DELIMITER, '[')) {
        const indexExpr = this.parseExpression();
        this.expect(TokenType.DELIMITER, ']', 'Expected "]" to close array indexing.');
        expr = {
          type: ASTNodeType.ARRAY_ACCESS,
          array: expr,
          index: indexExpr,
          line: expr.line,
          col: expr.col
        };
        continue;
      }

      // Member access: arr.length
      if (this.match(TokenType.OPERATOR, '.')) {
        const prop = this.expect(TokenType.IDENTIFIER, null, 'Expected property or method name after "."');
        // Check for equals method: str.equals(...)
        if (this.match(TokenType.DELIMITER, '(')) {
          const arg = this.parseExpression();
          this.expect(TokenType.DELIMITER, ')', 'Expected ")"');
          expr = {
            type: ASTNodeType.BINARY_EXPRESSION,
            operator: '==',
            left: expr,
            right: arg,
            line: expr.line,
            col: expr.col
          };
          continue;
        }

        expr = {
          type: ASTNodeType.MEMBER_ACCESS,
          object: expr,
          property: prop.value,
          line: expr.line,
          col: expr.col
        };
        continue;
      }

      // Postfix increment / decrement: x++, x--
      if (this.check(TokenType.OPERATOR, '++') || this.check(TokenType.OPERATOR, '--')) {
        const op = this.advance().value;
        expr = {
          type: ASTNodeType.UPDATE,
          operator: op,
          argument: expr,
          prefix: false,
          line: expr.line,
          col: expr.col
        };
        continue;
      }

      break;
    }

    return expr;
  }

  parsePrimary() {
    const token = this.current();

    // Literals: number, string, char, boolean, null
    if (token.type === TokenType.NUMBER || token.type === TokenType.STRING || token.type === TokenType.CHAR || token.type === TokenType.BOOLEAN) {
      this.advance();
      return {
        type: ASTNodeType.LITERAL,
        value: token.value,
        raw: token.raw,
        line: token.line,
        col: token.col
      };
    }

    if (token.type === TokenType.NULL) {
      this.advance();
      return {
        type: ASTNodeType.LITERAL,
        value: null,
        raw: 'null',
        line: token.line,
        col: token.col
      };
    }

    // Identifiers
    if (token.type === TokenType.IDENTIFIER) {
      this.advance();
      return {
        type: ASTNodeType.IDENTIFIER,
        name: token.value,
        line: token.line,
        col: token.col
      };
    }

    // Parenthesized expression: (expr)
    if (this.match(TokenType.DELIMITER, '(')) {
      const expr = this.parseExpression();
      this.expect(TokenType.DELIMITER, ')', 'Expected ")" after expression.');
      return expr;
    }

    throw {
      line: token.line,
      column: token.col,
      message: `Unexpected token '${token.value}'.`,
      suggestion: 'Check for typos or misplaced symbols.'
    };
  }
}

export function parseJava(tokens) {
  const parser = new JavaParser(tokens);
  return parser.parse();
}
