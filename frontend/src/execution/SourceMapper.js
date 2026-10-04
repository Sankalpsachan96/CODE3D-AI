/**
 * CODE3D-AI - Source Mapper
 * 
 * Maps execution steps and AST events to:
 * - Source line highlighting
 * - Variable diff highlighting
 * - Diagnostic error markers in Monaco editor
 */

export class SourceMapper {
  constructor(sourceCode = '', language = 'java') {
    this.sourceCode = sourceCode;
    this.language = language;
    this.lines = sourceCode.split('\n');
  }

  getLineContent(lineNumber) {
    if (lineNumber < 1 || lineNumber > this.lines.length) return '';
    return this.lines[lineNumber - 1];
  }

  getLineCount() {
    return this.lines.length;
  }

  /**
   * Generates Monaco decoration descriptor for an active execution line
   */
  getExecutionDecorations(lineNumber, monaco) {
    if (!monaco || !lineNumber || lineNumber < 1 || lineNumber > this.lines.length) {
      return [];
    }

    return [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'active-execution-line-bg',
          glyphMarginClassName: 'active-execution-glyph',
          overviewRuler: {
            color: '#00f2fe',
            position: monaco.editor.OverviewRulerLane.Full,
          },
        },
      },
    ];
  }

  /**
   * Generates error markers for Monaco editor
   */
  getErrorMarkers(error, monaco) {
    if (!monaco || !error) return [];

    const line = Math.max(1, Math.min(error.line || 1, this.lines.length));
    const column = error.column || 1;
    const lineLen = this.lines[line - 1]?.length || 1;

    return [
      {
        severity: monaco.MarkerSeverity.Error,
        message: `${error.message}${error.suggestion ? ` (${error.suggestion})` : ''}`,
        startLineNumber: line,
        startColumn: column,
        endLineNumber: line,
        endColumn: Math.max(column + 1, lineLen + 1),
      },
    ];
  }
}
