import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * CODE3D-AI - Time Machine Execution Controls & Playback State Machine
 * 
 * Strict state transitions:
 * IDLE -> READY -> PLAYING <-> PAUSED -> COMPLETED
 * ERROR state handled gracefully.
 * 
 * Implements: Run, Play, Pause, Next, Previous, First, Last, Reset.
 * Race-condition safe with proper interval cleanup.
 */
export const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2, 4];

export function useExecutionTimeline(trace = [], isLoading = false, hasError = false) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 0.25, 0.5, 1, 2, 4
  const [breakpoints, setBreakpoints] = useState(new Set());
  const timerRef = useRef(null);

  const totalSteps = Array.isArray(trace) ? trace.length : 0;
  
  // Strict bound maintenance: 0 <= currentStepIndex < totalSteps
  const safeIndex = totalSteps === 0 ? 0 : Math.min(Math.max(0, currentStepIndex), totalSteps - 1);
  const currentStep = (Array.isArray(trace) && trace[safeIndex]) || null;
  const isAtStart = safeIndex === 0;
  const isAtEnd = totalSteps > 0 && safeIndex >= totalSteps - 1;

  // Toggle breakpoint on specific line
  const toggleBreakpoint = useCallback((lineNumber) => {
    if (!lineNumber) return;
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(lineNumber)) {
        next.delete(lineNumber);
      } else {
        next.add(lineNumber);
      }
      return next;
    });
  }, []);

  const clearBreakpoints = useCallback(() => {
    setBreakpoints(new Set());
  }, []);

  // Execution State Machine: IDLE, LOADING, READY, PLAYING, PAUSED, COMPLETED, ERROR
  const executionState = (() => {
    if (hasError) return 'ERROR';
    if (isLoading) return 'LOADING';
    if (totalSteps === 0) return 'IDLE';
    if (isPlaying) return 'PLAYING';
    if (isAtEnd) return 'COMPLETED';
    if (safeIndex > 0) return 'PAUSED';
    return 'READY';
  })();

  // Clear timer safely
  const clearPlaybackTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Reset index safely whenever a new execution trace is loaded
  useEffect(() => {
    clearPlaybackTimer();
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, [trace, clearPlaybackTimer]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearPlaybackTimer();
  }, [clearPlaybackTimer]);

  const play = useCallback(() => {
    if (totalSteps <= 1) return;
    clearPlaybackTimer();
    setCurrentStepIndex((prev) => (prev >= totalSteps - 1 ? 0 : prev));
    setIsPlaying(true);
  }, [totalSteps, clearPlaybackTimer]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextStep = useCallback(() => {
    pause(); // Manual step pauses auto-playback
    setCurrentStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, [totalSteps, pause]);

  const prevStep = useCallback(() => {
    pause(); // Manual step pauses auto-playback
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, [pause]);

  const goToFirst = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  const goToLast = useCallback(() => {
    pause();
    setCurrentStepIndex(Math.max(0, totalSteps - 1));
  }, [totalSteps, pause]);

  const goToStep = useCallback((index) => {
    pause();
    const clamped = Math.max(0, Math.min(index, totalSteps - 1));
    setCurrentStepIndex(clamped);
  }, [totalSteps, pause]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  const increaseSpeed = useCallback(() => {
    setPlaybackSpeed((curr) => {
      const idx = SPEED_PRESETS.indexOf(curr);
      if (idx === -1) return 1;
      return idx < SPEED_PRESETS.length - 1 ? SPEED_PRESETS[idx + 1] : curr;
    });
  }, []);

  const decreaseSpeed = useCallback(() => {
    setPlaybackSpeed((curr) => {
      const idx = SPEED_PRESETS.indexOf(curr);
      if (idx === -1) return 1;
      return idx > 0 ? SPEED_PRESETS[idx - 1] : curr;
    });
  }, []);

  // Interval timer for playback with breakpoint checking
  useEffect(() => {
    if (isPlaying) {
      if (totalSteps <= 1) {
        setIsPlaying(false);
        return;
      }
      const intervalMs = Math.max(100, Math.round(1000 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          const nextIdx = prev + 1;
          const nextStepObj = trace && trace[nextIdx];
          // Pause if next step hits a set breakpoint
          if (nextStepObj && breakpoints.has(nextStepObj.lineNumber)) {
            setIsPlaying(false);
            return nextIdx;
          }
          return nextIdx;
        });
      }, intervalMs);
    }

    return () => {
      clearPlaybackTimer();
    };
  }, [isPlaying, playbackSpeed, totalSteps, trace, breakpoints, clearPlaybackTimer]);

  // Standardized keyboard shortcuts (Space, ArrowLeft, ArrowRight, R, +, -)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest?.('.monaco-editor')
      );
      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        increaseSpeed();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        decreaseSpeed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePlay, prevStep, nextStep, reset, increaseSpeed, decreaseSpeed]);

  // Accumulate stdout output from step 0 up to safeIndex (WITHOUT incorrect Set deduplication)
  const cumulativeOutput = (() => {
    if (!trace || trace.length === 0) return [];
    
    // In our standardized trace model, each step's output is the cumulative list of lines
    if (currentStep && Array.isArray(currentStep.output)) {
      return currentStep.output;
    }

    // Fallback: gather sequentially from step 0 to safeIndex
    const result = [];
    for (let i = 0; i <= safeIndex && i < trace.length; i++) {
      const stepOut = trace[i]?.output;
      if (Array.isArray(stepOut)) {
        for (const line of stepOut) {
          if (typeof line === 'string' && line.trim()) {
            result.push(line);
          }
        }
      }
    }
    return result;
  })();

  // Extract the verified correct final output / return value
  const finalCorrectOutput = (() => {
    if (!trace || trace.length === 0) return null;
    const lastStep = trace[trace.length - 1];
    if (!lastStep) return null;

    // Check variables for direct results
    const vars = lastStep.variables || {};
    if (vars.result !== undefined) return String(vars.result);
    if (vars.ans !== undefined) return String(vars.ans);
    if (vars.sorted !== undefined) return String(vars.sorted);
    if (vars.maxProfit !== undefined) return `Max Profit: ${vars.maxProfit}`;
    if (vars.minCoins !== undefined) return `Min Coins: ${vars.minCoins}`;
    if (vars.maxWater !== undefined) return `Max Water: ${vars.maxWater}`;
    if (vars.trappedWater !== undefined) return `Trapped Water: ${vars.trappedWater}`;
    if (vars.maxSum !== undefined) return `Max Subarray Sum: ${vars.maxSum}`;
    if (vars.totalTrapped !== undefined) return `Total Trapped: ${vars.totalTrapped}`;
    if (vars.total !== undefined) return `Total: ${vars.total}`;
    if (vars.sum !== undefined) return `Sum: ${vars.sum}`;

    // Check last step output lines
    if (Array.isArray(lastStep.output) && lastStep.output.length > 0) {
      return lastStep.output[lastStep.output.length - 1];
    }

    // Check dataStructureState label
    if (lastStep.dataStructureState?.label) {
      return lastStep.dataStructureState.label;
    }

    return lastStep.dataStructureState?.focusInfo || 'Execution Completed Successfully';
  })();

  return {
    currentStepIndex: safeIndex,
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isAtStart,
    isAtEnd,
    nextStep,
    prevStep,
    goToFirst,
    goToLast,
    goToStep,
    play,
    pause,
    togglePlay,
    reset,
    breakpoints,
    toggleBreakpoint,
    clearBreakpoints,
    executionState,
    cumulativeOutput,
    finalCorrectOutput,
    increaseSpeed,
    decreaseSpeed,
  };
}
