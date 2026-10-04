/**
 * CODE3D-AI - Pure Java Lexer & Tokenizer
 * 
 * Accurately tokenizes Java source code into typed lexical tokens with 
 * 1-indexed line and column tracking.
 * Strictly sandbox-safe: no eval(), no Function().
 */

export const TokenType = {
  KEYWORD: 'KEYWORD',
  IDENTIFIER: 'IDENTIFIER',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  CHAR: 'CHAR',
  BOOLEAN: 'BOOLEAN',
  NULL: 'NULL',
  OPERATOR: 'OPERATOR',
  DELIMITER: 'DELIMITER',
  EOF: 'EOF'
};

const KEYWORDS = new Set([
  'public', 'private', 'protected', 'static', 'final', 'class', 'void',
  'int', 'double', 'float', 'boolean', 'String', 'char', 'long',
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue',
  'new'
]);

export function tokenize(source) {
  if (typeof source !== 'string') {
    throw { line: 1, column: 1, message: 'Source code must be a string.', suggestion: 'Provide valid Java code.' };
  }

  const tokens = [];
  let index = 0;
  let line = 1;
  let col = 1;
  const length = source.length;

  const peek = (offset = 0) => (index + offset < length ? source[index + offset] : '');
  const advance = () => {
    const ch = source[index++];
    if (ch === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    return ch;
  };

  while (index < length) {
    const ch = peek();

    // Skip whitespace
    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    // Skip single-line comments //
    if (ch === '/' && peek(1) === '/') {
      advance(); // /
      advance(); // /
      while (index < length && peek() !== '\n') {
        advance();
      }
      continue;
    }

    // Skip multi-line comments /* ... */
    if (ch === '/' && peek(1) === '*') {
      const startLine = line;
      const startCol = col;
      advance(); // /
      advance(); // *
      let closed = false;
      while (index < length) {
        if (peek() === '*' && peek(1) === '/') {
          advance();
          advance();
          closed = true;
          break;
        }
        advance();
      }
      if (!closed) {
        throw {
          line: startLine,
          column: startCol,
          message: 'Unterminated block comment /* ... */',
          suggestion: 'Close the block comment with */'
        };
      }
      continue;
    }

    const startLine = line;
    const startCol = col;

    // Number literals (integers and floating-point)
    if (/[0-9]/.test(ch)) {
      let numStr = '';
      let isFloat = false;
      while (index < length && (/[0-9]/.test(peek()) || (peek() === '.' && !isFloat && /[0-9]/.test(peek(1))))) {
        if (peek() === '.') isFloat = true;
        numStr += advance();
      }
      // Optional trailing 'f', 'F', 'd', 'D', 'l', 'L'
      if (/[fFdDlL]/.test(peek())) {
        advance();
      }
      tokens.push({
        type: TokenType.NUMBER,
        value: isFloat ? parseFloat(numStr) : parseInt(numStr, 10),
        raw: numStr,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // String literals "..."
    if (ch === '"') {
      advance(); // open quote
      let strVal = '';
      let closed = false;
      while (index < length) {
        const c = advance();
        if (c === '"') {
          closed = true;
          break;
        }
        if (c === '\\') {
          if (index < length) {
            const esc = advance();
            if (esc === 'n') strVal += '\n';
            else if (esc === 't') strVal += '\t';
            else if (esc === 'r') strVal += '\r';
            else if (esc === '\\') strVal += '\\';
            else if (esc === '"') strVal += '"';
            else strVal += esc;
          }
        } else if (c === '\n') {
          throw {
            line: startLine,
            column: startCol,
            message: `Unterminated string literal on line ${startLine}. Strings cannot span multiple lines without concatenation.`,
            suggestion: 'Close the string with a double quote " before the end of the line.'
          };
        } else {
          strVal += c;
        }
      }
      if (!closed) {
        throw {
          line: startLine,
          column: startCol,
          message: 'Unterminated string literal.',
          suggestion: 'Close the string literal with "'
        };
      }
      tokens.push({
        type: TokenType.STRING,
        value: strVal,
        raw: `"${strVal}"`,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // Character literals '...'
    if (ch === "'") {
      advance(); // open quote
      let charVal = '';
      if (index < length) {
        const c = advance();
        if (c === '\\' && index < length) {
          const esc = advance();
          if (esc === 'n') charVal = '\n';
          else if (esc === 't') charVal = '\t';
          else if (esc === '\\') charVal = '\\';
          else if (esc === "'") charVal = "'";
          else charVal = esc;
        } else {
          charVal = c;
        }
      }
      if (peek() !== "'") {
        throw {
          line: startLine,
          column: startCol,
          message: 'Invalid character literal.',
          suggestion: "Character literals must be single characters enclosed in single quotes like 'a'."
        };
      }
      advance(); // close quote
      tokens.push({
        type: TokenType.CHAR,
        value: charVal,
        raw: `'${charVal}'`,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let ident = '';
      while (index < length && /[a-zA-Z0-9_$]/.test(peek())) {
        ident += advance();
      }

      if (ident === 'true' || ident === 'false') {
        tokens.push({
          type: TokenType.BOOLEAN,
          value: ident === 'true',
          raw: ident,
          line: startLine,
          col: startCol
        });
      } else if (ident === 'null') {
        tokens.push({
          type: TokenType.NULL,
          value: null,
          raw: 'null',
          line: startLine,
          col: startCol
        });
      } else if (KEYWORDS.has(ident)) {
        tokens.push({
          type: TokenType.KEYWORD,
          value: ident,
          raw: ident,
          line: startLine,
          col: startCol
        });
      } else {
        tokens.push({
          type: TokenType.IDENTIFIER,
          value: ident,
          raw: ident,
          line: startLine,
          col: startCol
        });
      }
      continue;
    }

    // Two-character operators
    const nextTwo = ch + peek(1);
    const twoCharOps = ['++', '--', '==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/=', '%='];
    if (twoCharOps.includes(nextTwo)) {
      advance();
      advance();
      tokens.push({
        type: TokenType.OPERATOR,
        value: nextTwo,
        raw: nextTwo,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // Single-character operators
    const oneCharOps = ['+', '-', '*', '/', '%', '=', '<', '>', '!', '.'];
    if (oneCharOps.includes(ch)) {
      advance();
      tokens.push({
        type: TokenType.OPERATOR,
        value: ch,
        raw: ch,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // Delimiters
    const delimiters = ['(', ')', '{', '}', '[', ']', ';', ','];
    if (delimiters.includes(ch)) {
      advance();
      tokens.push({
        type: TokenType.DELIMITER,
        value: ch,
        raw: ch,
        line: startLine,
        col: startCol
      });
      continue;
    }

    // If unexpected character
    const badChar = advance();
    throw {
      line: startLine,
      column: startCol,
      message: `Unexpected character '${badChar}'.`,
      suggestion: 'Remove or replace the unrecognized symbol.'
    };
  }

  tokens.push({
    type: TokenType.EOF,
    value: 'EOF',
    raw: '',
    line,
    col
  });

  return tokens;
}
