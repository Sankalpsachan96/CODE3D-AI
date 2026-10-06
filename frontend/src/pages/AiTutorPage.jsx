import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  executeProgram,
  askAiFollowUp,
  getAiExplanation,
} from '../services/apiService';

import './AiTutorPage.css';

const LANGUAGES = [
  {
    value: 'cpp',
    label: 'C++',
    starter: `#include <iostream>
using namespace std;

int main() {
    int a = 10;
    int b = 20;
    cout << a + b;
    return 0;
}`,
  },
  {
    value: 'python',
    label: 'Python',
    starter: `a = 10
b = 20
print(a + b)`,
  },
  {
    value: 'java',
    label: 'Java',
    starter: `public class Main {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        System.out.println(a + b);
    }
}`,
  },
  {
    value: 'javascript',
    label: 'JavaScript',
    starter: `const a = 10;
const b = 20;
console.log(a + b);`,
  },
];

function formatOutput(value) {
  if (Array.isArray(value)) {
    return value.join('\n');
  }

  if (value == null || value === '') {
    return '(No output)';
  }

  return String(value);
}

function codeLanguageFromValue(value) {
  return (
    LANGUAGES.find((item) => item.value === value)?.label ||
    value
  );
}

export default function AiTutorPage() {
  const [language, setLanguage] = useState('cpp');

  const [code, setCode] = useState(
    LANGUAGES[0].starter
  );

  const [input, setInput] = useState('');

  const [output, setOutput] = useState(
    'Click Run Code to execute your program.'
  );

  const [executionError, setExecutionError] = useState('');

  const [executionTime, setExecutionTime] = useState(null);

  const [isRunning, setIsRunning] = useState(false);

  const [question, setQuestion] = useState('');

  const [messages, setMessages] = useState([]);

  const [aiLoading, setAiLoading] = useState(false);

  const [analysis, setAnalysis] = useState(null);

  const [analysisLoading, setAnalysisLoading] = useState(false);

  const runRequestId = useRef(0);

  const chatContainerRef = useRef(null);

  const currentLanguage = useMemo(
    () => codeLanguageFromValue(language),
    [language]
  );

  /* =====================================================
     AI CHAT AUTO SCROLL
     ===================================================== */

  useEffect(() => {
    const chat = chatContainerRef.current;

    if (!chat) {
      return;
    }

    requestAnimationFrame(() => {
      chat.scrollTo({
        top: chat.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, [messages, aiLoading]);

  /* =====================================================
     LANGUAGE CHANGE
     ===================================================== */

  const changeLanguage = (next) => {
    setLanguage(next);

    const item = LANGUAGES.find(
      (entry) => entry.value === next
    );

    setCode(item?.starter || '');

    setOutput(
      'Click Run Code to execute your program.'
    );

    setExecutionError('');

    setExecutionTime(null);

    setAnalysis(null);

    setMessages([]);
  };

  /* =====================================================
     RUN CODE
     ===================================================== */

  const runCode = async () => {
    if (!code.trim() || isRunning) {
      return;
    }

    const requestId = ++runRequestId.current;

    setIsRunning(true);

    setOutput('Running code...');

    setExecutionError('');

    setExecutionTime(null);

    try {
      const started = performance.now();

      const result = await executeProgram(
        code,
        'ai-tutor',
        language,
        input,
        true
      );

      if (requestId !== runRequestId.current) {
        return;
      }

      const elapsed =
        result?.executionTimeMs ??
        Math.round(performance.now() - started);

      setExecutionTime(elapsed);

      setOutput(
        formatOutput(result?.output)
      );

      if (
        !result ||
        result.status === 'ERROR' ||
        result.success === false
      ) {
        setExecutionError(
          result?.message ||
            result?.error ||
            'Execution failed.'
        );
      } else {
        setExecutionError('');
      }
    } catch (error) {
      if (requestId !== runRequestId.current) {
        return;
      }

      setOutput('(No output)');

      setExecutionError(
        error.message || 'Execution failed.'
      );
    } finally {
      if (requestId === runRequestId.current) {
        setIsRunning(false);
      }
    }
  };

  /* =====================================================
     COMPLEXITY ANALYSIS
     ===================================================== */

  const analyzeComplexity = async () => {
    if (!code.trim() || analysisLoading) {
      return;
    }

    setAnalysisLoading(true);

    try {
      const result = await getAiExplanation({
        code,
        language,
        question:
          'Analyze only the time complexity and auxiliary space complexity of this exact code. Do not invent runtime output. Return a concise explanation.',
      });

      setAnalysis({
        explanation:
          result?.explanation || '',
        timeComplexity:
          result?.timeComplexity || '—',
        spaceComplexity:
          result?.spaceComplexity || '—',
      });
    } catch (error) {
      setAnalysis({
        explanation:
          error.message ||
          'Complexity analysis failed.',
        timeComplexity: '—',
        spaceComplexity: '—',
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  /* =====================================================
     AI RESPONSE RENDERER
     ===================================================== */

  const renderAiResponse = (text) => {
    if (!text) {
      return null;
    }

    const lines = String(text).split('\n');

    const elements = [];

    let codeBuffer = [];

    let insideCode = false;

    let codeLanguage = '';

    const flushCode = () => {
      if (!codeBuffer.length) {
        return;
      }

      elements.push(
        <pre
          className="ai-code-block"
          key={`code-${elements.length}`}
        >
          <div className="ai-code-header">
            <span>
              {codeLanguage || 'code'}
            </span>
          </div>

          <code>
            {codeBuffer.join('\n')}
          </code>
        </pre>
      );

      codeBuffer = [];

      codeLanguage = '';
    };

    const formatInline = (value) => {
      const parts = String(value).split(
        /(`[^`]+`|\*\*[^*]+\*\*)/g
      );

      return parts.map((part, index) => {
        if (
          part.startsWith('`') &&
          part.endsWith('`')
        ) {
          return (
            <code
              className="ai-inline-code"
              key={index}
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (
          part.startsWith('**') &&
          part.endsWith('**')
        ) {
          return (
            <strong key={index}>
              {part.slice(2, -2)}
            </strong>
          );
        }

        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      /* Code block */
      if (trimmed.startsWith('```')) {
        if (insideCode) {
          flushCode();

          insideCode = false;
        } else {
          insideCode = true;

          codeLanguage = trimmed
            .replace('```', '')
            .trim();
        }

        return;
      }

      if (insideCode) {
        codeBuffer.push(line);

        return;
      }

      /* Empty line */
      if (!trimmed) {
        elements.push(
          <div
            className="ai-response-space"
            key={`space-${index}`}
          />
        );

        return;
      }

      /* Heading */
      if (/^#{1,3}\s+/.test(trimmed)) {
        const heading = trimmed.replace(
          /^#{1,3}\s+/,
          ''
        );

        elements.push(
          <h4
            className="ai-response-heading"
            key={`heading-${index}`}
          >
            {formatInline(heading)}
          </h4>
        );

        return;
      }

      /* Bullet */
      if (/^[-*•]\s+/.test(trimmed)) {
        const bullet = trimmed.replace(
          /^[-*•]\s+/,
          ''
        );

        elements.push(
          <div
            className="ai-response-bullet"
            key={`bullet-${index}`}
          >
            <span className="ai-bullet-dot">
              •
            </span>

            <span>
              {formatInline(bullet)}
            </span>
          </div>
        );

        return;
      }

      /* Numbered list */
      if (/^\d+\.\s+/.test(trimmed)) {
        const match = trimmed.match(
          /^(\d+)\.\s+(.*)$/
        );

        elements.push(
          <div
            className="ai-response-number"
            key={`number-${index}`}
          >
            <span className="ai-number-badge">
              {match[1]}
            </span>

            <span>
              {formatInline(match[2])}
            </span>
          </div>
        );

        return;
      }

      /* Normal paragraph */
      elements.push(
        <p
          className="ai-response-paragraph"
          key={`paragraph-${index}`}
        >
          {formatInline(trimmed)}
        </p>
      );
    });

    if (insideCode) {
      flushCode();
    }

    return (
      <div className="ai-response">
        {elements}
      </div>
    );
  };

  /* =====================================================
     ASK AI TUTOR
     ===================================================== */

  const askTutor = async (
    requestedQuestion = question
  ) => {
    const finalQuestion = String(
      requestedQuestion || ''
    ).trim();

    if (!finalQuestion || aiLoading) {
      return;
    }

    const history = messages
  .slice(-10)
  .map((message) => ({
    role:
      message.role === 'ai'
        ? 'assistant'
        : 'user',
    content: message.content,
  }));

    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        content: finalQuestion,
      },
    ]);

    setQuestion('');

    setAiLoading(true);

    try {
      const response = await askAiFollowUp(
        finalQuestion,
        code,
        language,
        history,
        output,
        executionError || null
      );

      setMessages((previous) => [
        ...previous,
        {
          role: 'ai',
          content:
            response?.answer ||
            response?.message ||
            'The AI Tutor returned no answer.',
        },
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          role: 'ai',
          content:
            error.message ||
            'AI Tutor is temporarily unavailable.',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  /* =====================================================
     CLEAR CODE
     ===================================================== */

  const clearCode = () => {
    setCode('');

    setOutput('Editor cleared.');

    setExecutionError('');

    setExecutionTime(null);

    setAnalysis(null);
  };

  const suggestions = [
    'Explain my code simply',
    'Find errors in my code',
    'Explain the output of my code',
    'Analyze the time and space complexity of my code',
  ];

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="app ai-tutor-page ai-tutor-embedded">
      <main className="workspace ai-tutor-workspace">

        {/* LEFT SIDE */}
        <section className="tutor-left-column">

          {/* CODE EDITOR */}
          <section className="editor-panel">

            <div className="panel-header">

              <div className="panel-title">
                <span>
                  Code Editor
                </span>

                <span className="live-badge">
                  LIVE
                </span>
              </div>

              <select
                value={language}
                onChange={(e) =>
                  changeLanguage(
                    e.target.value
                  )
                }
                className="language-select"
              >
                {LANGUAGES.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

            </div>

            <div className="editor-wrapper">

              <div className="line-numbers">
                {code
                  .split('\n')
                  .map((_, index) => (
                    <div key={index}>
                      {index + 1}
                    </div>
                  ))}
              </div>

              <textarea
                className="code-editor"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value)
                }
                spellCheck="false"
              />

            </div>

            <div className="editor-actions">

              <button
                className="run-button"
                onClick={runCode}
                disabled={isRunning}
              >
                {isRunning
                  ? '⏳ Running...'
                  : '▶ Run Code'}
              </button>

              <button
                className="clear-button"
                onClick={clearCode}
                disabled={isRunning}
              >
                Clear
              </button>

            </div>

          </section>

          {/* OUTPUT */}
          <section className="output-panel tutor-output-panel">

            <div className="panel-header">

              <span className="panel-title">
                Output
              </span>

              <span
                className={
                  executionError
                    ? 'output-status error'
                    : 'output-status'
                }
              >
                {executionError
                  ? 'Error'
                  : 'Ready'}
              </span>

            </div>

            <div className="output-content">

              <pre>
                {output}
              </pre>

              {executionTime != null && (
                <div className="execution-time">
                  Execution time:{' '}
                  {executionTime} ms
                </div>
              )}

              {executionError && (
                <pre className="runtime-error">
                  Error:
                  {'\n'}
                  {executionError}
                </pre>
              )}

            </div>

          </section>

        </section>

        {/* RIGHT SIDE */}
        <section className="tutor-right-column">

          {/* AI TUTOR */}
          <section className="ai-panel">

            <div className="ai-header">

              <div className="ai-title">

                <div className="ai-icon">
                  ✦
                </div>

                <div>

                  <h3>
                    AI Code Tutor
                  </h3>

                  <span>
                    <strong>
                      {currentLanguage}
                    </strong>

                    <i>•</i>

                    Groq AI
                  </span>

                </div>

              </div>

              <span className="ai-online">
                <span className="online-dot" />
                Online
              </span>

            </div>

            {/* CHAT AREA */}
            <div
              className="ai-chat"
              ref={chatContainerRef}
            >

              {messages.length === 0 ? (

                <div className="ai-welcome">

                  <div className="welcome-icon">
                    ✦
                  </div>

                  <h3>
                    How can I help?
                  </h3>

                  <p>
                    I can explain your actual
                    code, debug it, explain its
                    real output, analyze DSA
                    concepts and help you
                    understand algorithms.
                  </p>

                  <div className="suggestions">

                    {suggestions.map(
                      (item) => (
                        <button
                          key={item}
                          onClick={() =>
                            askTutor(item)
                          }
                          disabled={aiLoading}
                        >
                          {item}
                        </button>
                      )
                    )}

                  </div>

                </div>

              ) : (

                <div className="chat-messages">

                  {messages.map(
                    (message, index) => (

                      <div
                        key={index}
                        className={
                          message.role === 'user'
                            ? 'chat-message user-message'
                            : 'chat-message ai-message'
                        }
                      >

                        <div className="message-label">
                          {message.role === 'user'
                            ? 'You'
                            : 'Code3D AI'}
                        </div>

                        <div className="message-content">
                          {message.role === 'ai'
                            ? renderAiResponse(
                                message.content
                              )
                            : message.content}
                        </div>

                      </div>

                    )
                  )}

                  {aiLoading && (

                    <div className="chat-message ai-message">

                      <div className="message-label">
                        Code3D AI
                      </div>

                      <div className="message-content thinking-message">

                        <span />
                        <span />
                        <span />

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

            {/* FIXED CHAT INPUT */}
            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault();
                askTutor();
              }}
            >

              <input
                type="text"
                value={question}
                onChange={(e) =>
                  setQuestion(
                    e.target.value
                  )
                }
                placeholder="Ask about your code..."
                disabled={aiLoading}
              />

              <button
                type="submit"
                disabled={
                  aiLoading ||
                  !question.trim()
                }
              >
                {aiLoading
                  ? '...'
                  : '➤'}
              </button>

            </form>

          </section>

          {/* COMPLEXITY */}
          <section className="complexity-panel">

            <div className="complexity-head">

              <span>
                Complexity Analysis
              </span>

              <button
                onClick={analyzeComplexity}
                disabled={analysisLoading}
              >
                {analysisLoading
                  ? 'Analyzing...'
                  : 'Analyze'}
              </button>

            </div>

            <div className="complexity-body">

              <div>

                <strong>
                  Time:
                </strong>{' '}

                {analysis?.timeComplexity ||
                  '—'}

                &nbsp;&nbsp;

                <strong>
                  Space:
                </strong>{' '}

                {analysis?.spaceComplexity ||
                  '—'}

              </div>

              <div className="complexity-explanation">

                {analysis?.explanation ||
                  'Run Analyze to inspect the current code. You can also ask the AI Tutor directly.'}

              </div>

            </div>

          </section>

        </section>

      </main>
    </div>
  );
}