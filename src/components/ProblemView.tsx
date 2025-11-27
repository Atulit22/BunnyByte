import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProgress } from '../contexts/UserProgressContext';
import { getProblemById, getProblemsByLevel } from '../data/problems';
import { ArrowLeft, Play, RotateCcw, Lightbulb, CheckCircle, XCircle, ArrowRight, ArrowLeft as PrevArrow, Send } from 'lucide-react';
import CodeEditor from './CodeEditor';
import CommentSection from './CommentSection';

interface ProblemViewProps {
  problemId: string;
  onBack: () => void;
  level: 'easy' | 'intermediate' | 'advanced';
}

export default function ProblemView({ problemId, onBack, level }: ProblemViewProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const problem = getProblemById(problemId);
  const levelProblems = getProblemsByLevel(level);
  const currentIndex = levelProblems.findIndex(p => p.id === problemId);
  const prevProblem = currentIndex > 0 ? levelProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex < levelProblems.length - 1 ? levelProblems[currentIndex + 1] : null;
  const isLastProblem = currentIndex === levelProblems.length - 1;

  const { colors } = useTheme();
  const { progress, updateProgress } = useUserProgress();
  const isSolved = progress?.solvedProblems.includes(problemId) || false;

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode);
    }
  }, [problem]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setTestResults([]);

    try {
      const wrappedCode = `
        ${code}

        const testResults = [];
        ${problem?.testCases.map((testCase, index) => `
          try {
            const result = ${testCase.input};
            const expected = ${testCase.expectedOutput.includes('[') || testCase.expectedOutput.includes('{')
              ? testCase.expectedOutput
              : `"${testCase.expectedOutput}"`};
            const passed = JSON.stringify(result) === JSON.stringify(expected);
            testResults.push({
              passed,
              input: "${testCase.input}",
              expected: expected,
              actual: result,
              description: "${testCase.description}"
            });
          } catch (error) {
            testResults.push({
              passed: false,
              error: error.message,
              input: "${testCase.input}",
              description: "${testCase.description}"
            });
          }
        `).join('')}

        return testResults;
      `;

      const testFunction = new Function(wrappedCode);
      const results = testFunction();

      setTestResults(results);

      const allPassed = results.every((result: any) => result.passed);

      if (allPassed && !isSolved) {
        updateProgress(problemId, level, problem?.points || 0);
        setOutput('Congratulations! All tests passed!');
      } else if (allPassed) {
        setOutput('All tests passed!');
      } else {
        setOutput('Some tests failed. Check the results below.');
      }

    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
      setTestResults([]);
    }

    setIsRunning(false);
  };

  const resetCode = () => {
    setCode(problem?.starterCode || '');
    setOutput('');
    setTestResults([]);
  };

  const handlePrevious = () => {
    if (prevProblem) {
      window.location.hash = `#problem-${prevProblem.id}`;
      window.location.reload();
    }
  };

  const handleNext = () => {
    if (nextProblem) {
      window.location.hash = `#problem-${nextProblem.id}`;
      window.location.reload();
    }
  };

  const handleSubmit = () => {
    const allPassed = testResults.every((result: any) => result.passed);
    if (allPassed && testResults.length > 0) {
      alert('Solution submitted successfully! You have completed all problems in this level.');
      onBack();
    } else if (testResults.length === 0) {
      alert('Please run your code first before submitting.');
    } else {
      alert('Please pass all test cases before submitting.');
    }
  };

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={colors.textSecondary}>Problem not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className={`flex items-center space-x-2 px-4 py-2 ${colors.textSecondary} hover:text-white transition-colors duration-200`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Learning Path</span>
        </button>

        <div className="flex items-center space-x-4">
          <span className={`text-sm ${colors.textSecondary}`}>
            Problem {currentIndex + 1} of {levelProblems.length}
          </span>

          {isSolved && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-500 text-sm font-medium">Solved</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Problem Description */}
        <div className="xl:col-span-1">
          <div className={`${colors.surface} rounded-xl p-6 border border-white/10 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h1 className={`text-2xl font-bold ${colors.text}`}>
                {problem.title}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                problem.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                problem.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {problem.difficulty} • {problem.points}pts
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>Description</h3>
                <p className={colors.textSecondary}>{problem.description}</p>
              </div>

              <div>
                <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>Example</h3>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <code className={`text-sm ${colors.text}`}>{problem.example}</code>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>Expected Output</h3>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <code className={`text-sm ${colors.text}`}>{problem.expectedOutput}</code>
                </div>
              </div>

              {/* Hints Section */}
              <div>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`flex items-center space-x-2 mb-3 ${colors.textSecondary} hover:text-white transition-colors duration-200`}
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>Hints ({problem.hints.length})</span>
                </button>

                {showHints && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${colors.textSecondary}`}>
                        Hint {currentHintIndex + 1} of {problem.hints.length}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setCurrentHintIndex(Math.max(0, currentHintIndex - 1))}
                          disabled={currentHintIndex === 0}
                          className={`text-xs px-2 py-1 rounded ${
                            currentHintIndex === 0 ? 'text-slate-500' : 'text-yellow-400 hover:text-yellow-300'
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentHintIndex(Math.min(problem.hints.length - 1, currentHintIndex + 1))}
                          disabled={currentHintIndex === problem.hints.length - 1}
                          className={`text-xs px-2 py-1 rounded ${
                            currentHintIndex === problem.hints.length - 1 ? 'text-slate-500' : 'text-yellow-400 hover:text-yellow-300'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                    <p className="text-yellow-300 text-sm">
                      {problem.hints[currentHintIndex]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <CommentSection problemId={problemId} />
        </div>

        {/* Code Editor and Results */}
        <div className="xl:col-span-2 space-y-6">
          {/* Code Editor */}
          <div className={`${colors.surface} rounded-xl border border-white/10 overflow-hidden`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className={`font-semibold ${colors.text}`}>Code Editor</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetCode}
                  className={`p-2 ${colors.textSecondary} hover:text-white transition-colors duration-200`}
                  title="Reset Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>
            </div>
            
            <CodeEditor
              value={code}
              onChange={setCode}
              language="javascript"
            />
          </div>

          {/* Output */}
          {output && (
            <div className={`${colors.surface} rounded-xl p-4 border border-white/10`}>
              <h3 className={`font-semibold ${colors.text} mb-2`}>Output</h3>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <pre className={`text-sm ${colors.text} whitespace-pre-wrap`}>{output}</pre>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className={`${colors.surface} rounded-xl p-4 border border-white/10`}>
              <h3 className={`font-semibold ${colors.text} mb-3`}>Test Results</h3>
              <div className="space-y-3">
                {testResults.map((result: any, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.passed
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {result.passed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        result.passed ? 'text-green-500' : 'text-red-500'
                      }`}>
                        Test {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>

                    <p className={`text-xs ${colors.textSecondary} mb-2`}>
                      {result.description}
                    </p>

                    <div className="text-xs space-y-1">
                      <div>
                        <span className={colors.textSecondary}>Input: </span>
                        <code className={colors.text}>{result.input}</code>
                      </div>
                      {result.error ? (
                        <div>
                          <span className="text-red-400">Error: </span>
                          <span className="text-red-300">{result.error}</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className={colors.textSecondary}>Expected: </span>
                            <code className={colors.text}>{JSON.stringify(result.expected)}</code>
                          </div>
                          <div>
                            <span className={colors.textSecondary}>Actual: </span>
                            <code className={result.passed ? colors.text : 'text-red-300'}>
                              {JSON.stringify(result.actual)}
                            </code>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className={`${colors.surface} rounded-xl p-6 border border-white/10`}>
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={!prevProblem}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  prevProblem
                    ? 'bg-slate-700/50 hover:bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-700/30 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <PrevArrow className="w-5 h-5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3">
                {!isLastProblem ? (
                  <button
                    onClick={handleNext}
                    disabled={!nextProblem}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      nextProblem
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white shadow-lg'
                        : 'bg-slate-700/30 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200"
                  >
                    <span>Submit Solution</span>
                    <Send className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className={`mt-4 pt-4 border-t border-white/10 text-sm ${colors.textSecondary} text-center`}>
              {prevProblem && (
                <span>Previous: {prevProblem.title}</span>
              )}
              {prevProblem && (nextProblem || isLastProblem) && <span className="mx-3">•</span>}
              {nextProblem && !isLastProblem && (
                <span>Next: {nextProblem.title}</span>
              )}
              {isLastProblem && (
                <span>This is the last problem in this level</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}