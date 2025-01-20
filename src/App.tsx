import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, RefreshCw, FileUp, BarChart2, ArrowLeft } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Tipos e utilitários
type Question = {
  id: string;
  text: string;
  correctAnswer: boolean;
  justification: string;
  date: string;
  isAnswered: boolean;
  userAnswer: boolean | null;
};

const saveQuestion = (question: Question) => {
  const savedQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
  savedQuestions.push(question);
  localStorage.setItem('questions', JSON.stringify(savedQuestions));
};

const updateStats = (date: string, isCorrect: boolean) => {
  const stats = JSON.parse(localStorage.getItem('stats') || '{}');
  if (!stats[date]) stats[date] = { correct: 0, incorrect: 0 };
  if (isCorrect) stats[date].correct += 1;
  else stats[date].incorrect += 1;
  localStorage.setItem('stats', JSON.stringify(stats));
};

const getStats = (date: string) => {
  const stats = JSON.parse(localStorage.getItem('stats') || '{}');
  return stats[date] || { correct: 0, incorrect: 0 };
};

// Componente de Estatísticas
const Stats = ({ selectedDate, setSelectedDate }) => {
  const calculateMonthlyAndYearlyStats = () => {
    const stats = JSON.parse(localStorage.getItem('stats') || '{}');
    const monthlyStats = { correct: 0, incorrect: 0 };
    const yearlyStats = { correct: 0, incorrect: 0 };

    const selectedYear = new Date(selectedDate).getFullYear();
    const selectedMonth = new Date(selectedDate).getMonth() + 1;

    Object.entries(stats).forEach(([date, { correct, incorrect }]) => {
      const currentYear = new Date(date).getFullYear();
      const currentMonth = new Date(date).getMonth() + 1;

      if (currentYear === selectedYear && currentMonth === selectedMonth) {
        monthlyStats.correct += correct;
        monthlyStats.incorrect += incorrect;
      }

      if (currentYear === selectedYear) {
        yearlyStats.correct += correct;
        yearlyStats.incorrect += incorrect;
      }
    });

    return { monthlyStats, yearlyStats };
  };

  const dailyStats = getStats(selectedDate);
  const { monthlyStats, yearlyStats } = calculateMonthlyAndYearlyStats();

  const calculateStats = (stats) => {
    const total = stats.correct + stats.incorrect;
    const correctPercentage = total > 0 ? ((stats.correct / total) * 100).toFixed(2) : 0;
    const incorrectPercentage = total > 0 ? ((stats.incorrect / total) * 100).toFixed(2) : 0;
    return { total, correctPercentage, incorrectPercentage };
  };

  const dailyData = {
    labels: ['Acertos', 'Erros'],
    datasets: [
      {
        label: 'Desempenho Diário',
        data: [dailyStats.correct, dailyStats.incorrect],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const monthlyData = {
    labels: ['Acertos', 'Erros'],
    datasets: [
      {
        label: 'Desempenho Mensal',
        data: [monthlyStats.correct, monthlyStats.incorrect],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  const yearlyData = {
    labels: ['Acertos', 'Erros'],
    datasets: [
      {
        label: 'Desempenho Anual',
        data: [yearlyStats.correct, yearlyStats.incorrect],
        backgroundColor: ['#4CAF50', '#F44336'],
      },
    ],
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione a Data
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-2">Desempenho Diário</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-medium">Total de Questões:</span> {calculateStats(dailyStats).total}
            </p>
            <p>
              <span className="font-medium">Acertos:</span> {dailyStats.correct} ({calculateStats(dailyStats).correctPercentage}%)
            </p>
            <p>
              <span className="font-medium">Erros:</span> {dailyStats.incorrect} ({calculateStats(dailyStats).incorrectPercentage}%)
            </p>
          </div>
          <div>
            <Pie data={dailyData} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-2">Desempenho Mensal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-medium">Total de Questões:</span> {calculateStats(monthlyStats).total}
            </p>
            <p>
              <span className="font-medium">Acertos:</span> {monthlyStats.correct} ({calculateStats(monthlyStats).correctPercentage}%)
            </p>
            <p>
              <span className="font-medium">Erros:</span> {monthlyStats.incorrect} ({calculateStats(monthlyStats).incorrectPercentage}%)
            </p>
          </div>
          <div>
            <Pie data={monthlyData} />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Desempenho Anual</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-medium">Total de Questões:</span> {calculateStats(yearlyStats).total}
            </p>
            <p>
              <span className="font-medium">Acertos:</span> {yearlyStats.correct} ({calculateStats(yearlyStats).correctPercentage}%)
            </p>
            <p>
              <span className="font-medium">Erros:</span> {yearlyStats.incorrect} ({calculateStats(yearlyStats).incorrectPercentage}%)
            </p>
          </div>
          <div>
            <Pie data={yearlyData} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Revisão de Erros
const ReviewMode = ({
  reviewQuestions,
  exitReviewMode,
  handleReviewAnswer,
}: {
  reviewQuestions: Question[];
  exitReviewMode: () => void;
  handleReviewAnswer: (questionId: string, selectedAnswer: boolean) => void;
}) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const currentQuestion = reviewQuestions[currentReviewIndex];

  const handleNextQuestion = () => {
    if (currentReviewIndex < reviewQuestions.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      exitReviewMode();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={exitReviewMode}
                className="text-white hover:text-blue-100 flex items-center"
              >
                <ArrowLeft className="w-6 h-6 mr-2" />
                Voltar
              </button>
              <h1 className="text-2xl font-bold text-white">Revisão de Erros</h1>
            </div>
          </div>

          <div className="p-6">
            {reviewQuestions.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">
                    Questão {currentReviewIndex + 1} de {reviewQuestions.length}
                  </p>
                  <h2 className="text-xl font-medium mt-2">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleReviewAnswer(currentQuestion.id, true)}
                    className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Certo
                  </button>
                  <button
                    onClick={() => handleReviewAnswer(currentQuestion.id, false)}
                    className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg hover:from-red-600 hover:to-red-700"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Errado
                  </button>
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
                >
                  {currentReviewIndex < reviewQuestions.length - 1
                    ? "Próxima Questão"
                    : "Finalizar Revisão"}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg">Nenhuma questão para revisar.</p>
                <button
                  onClick={exitReviewMode}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
                >
                  Voltar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Principal
function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [showJustification, setShowJustification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const savedProgress = localStorage.getItem('quizProgress');
    if (savedProgress) {
      const { questions: savedQuestions, currentQuestion: savedCurrentQuestion, score: savedScore } = JSON.parse(savedProgress);
      setQuestions(savedQuestions);
      setCurrentQuestion(savedCurrentQuestion);
      setScore(savedScore);
      setFileLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (fileLoaded) {
      const progress = {
        questions,
        currentQuestion,
        score
      };
      localStorage.setItem('quizProgress', JSON.stringify(progress));
    }
  }, [questions, currentQuestion, score, fileLoaded]);

  const parseQuizFile = (text: string): Question[] => {
    try {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line !== '');
      const parsedQuestions: Question[] = [];

      for (let i = 0; i < lines.length; i++) {
        // Verifica se a linha começa com ** (afirmação)
        if (lines[i].startsWith('**')) {
          const questionText = lines[i].replace(/^\*\*|\*\*$/g, '').trim(); // Remove os ** e espaços extras
          i++; // Avança para a próxima linha (resposta)

          // Verifica se a próxima linha contém "Certo" ou "Errado"
          if (i >= lines.length || (lines[i].toLowerCase() !== 'certo' && lines[i].toLowerCase() !== 'errado')) {
            throw new Error(`Resposta inválida na linha ${i + 1}: "${lines[i]}". Use "Certo" ou "Errado".`);
          }

          const correctAnswer = lines[i].toLowerCase() === 'certo'; // Converte para booleano
          i++; // Avança para a próxima linha (justificativa)

          // Verifica se a próxima linha começa com ** (justificativa)
          if (i >= lines.length || !lines[i].startsWith('**')) {
            throw new Error(`Formato inválido: falta justificativa após a resposta na linha ${i + 1}.`);
          }

          const justification = lines[i].replace(/^\*\*|\*\*$/g, '').trim(); // Remove os ** e espaços extras

          // Adiciona a questão ao array de questões
          parsedQuestions.push({
            id: Math.random().toString(36).substr(2, 9), // Gera um ID único
            text: questionText,
            correctAnswer,
            justification,
            date: selectedDate,
            isAnswered: false,
            userAnswer: null,
          });
        }
      }

      if (parsedQuestions.length === 0) {
        throw new Error('Nenhuma questão encontrada no formato válido.');
      }

      return shuffleArray(parsedQuestions); // Embaralha as questões
    } catch (error) {
      throw new Error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedQuestions = parseQuizFile(text);
          setQuestions(parsedQuestions);
          setFileLoaded(true);
          setCurrentQuestion(0);
          setShowScore(false);
          setScore(0);
          setShowJustification(false);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAnswerClick = (selectedAnswer: boolean) => {
    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    updateStats(selectedDate, isCorrect);
    saveQuestion({
      ...currentQ,
      isAnswered: true,
      userAnswer: selectedAnswer
    });

    const newQuestions = [...questions];
    newQuestions[currentQuestion].isAnswered = true;
    newQuestions[currentQuestion].userAnswer = selectedAnswer;
    setQuestions(newQuestions);

    if (isCorrect) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setQuestions(prevQuestions => {
      const resetQuestions = prevQuestions.map(q => ({
        ...q,
        isAnswered: false,
        userAnswer: null
      }));
      return shuffleArray(resetQuestions);
    });
    setCurrentQuestion(0);
    setShowScore(false);
    setScore(0);
    setShowJustification(false);
  };

  const startNewQuiz = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setShowScore(false);
    setScore(0);
    setFileLoaded(false);
    setShowJustification(false);
    setError(null);
  };

  const enterReviewMode = () => {
    const wrongAnswers = questions.filter(q => q.isAnswered && q.userAnswer !== q.correctAnswer);
    setReviewQuestions(wrongAnswers);
    setReviewMode(true);
    setCurrentReviewIndex(0);
  };

  const exitReviewMode = () => {
    setReviewMode(false);
  };

  const handleReviewAnswer = (questionId: string, selectedAnswer: boolean) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          userAnswer: selectedAnswer,
          isAnswered: true,
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);

    const question = questions.find(q => q.id === questionId);
    if (question) {
      const isCorrect = selectedAnswer === question.correctAnswer;
      updateStats(selectedDate, isCorrect);
    }

    const updatedReviewQuestions = reviewQuestions.filter(q => q.id !== questionId);
    setReviewQuestions(updatedReviewQuestions);
  };

  if (reviewMode) {
    return (
      <ReviewMode
        reviewQuestions={reviewQuestions}
        exitReviewMode={exitReviewMode}
        handleReviewAnswer={handleReviewAnswer}
      />
    );
  }

  if (showStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowStats(false)}
                  className="text-white hover:text-blue-100 flex items-center"
                >
                  <ArrowLeft className="w-6 h-6 mr-2" />
                  Voltar
                </button>
                <h1 className="text-2xl font-bold text-white">Estatísticas</h1>
              </div>
            </div>
            
            <div className="p-6">
              <Stats selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Sistema de Questões</h1>
              <button
                onClick={() => setShowStats(true)}
                className="text-white hover:text-blue-100 flex items-center"
              >
                <BarChart2 className="w-6 h-6 mr-2" />
                Estatísticas
              </button>
            </div>
            {fileLoaded && !showScore && (
              <div className="w-full bg-white/20 rounded-full h-2 mt-4">
                <div 
                  className="bg-white rounded-full h-2 transition-all duration-300" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {!fileLoaded ? (
              <div className="text-center space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-500">
                      Clique para carregar arquivo
                    </span>
                    <p className="text-sm text-gray-500 mt-2">ou arraste e solte aqui</p>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Formato do arquivo:</h3>
                  <pre className="text-sm bg-white p-3 rounded border">
                    **Afirmação**{'\n'}
                    Certo ou Errado{'\n'}
                    **Justificativa**
                  </pre>
                </div>
              </div>
            ) : showScore ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Resultado Final</h2>
                  <p className="text-lg">
                    Você acertou {score} de {questions.length} questões
                  </p>
                </div>

                {!showJustification ? (
                  <button
                    onClick={() => setShowJustification(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    Ver Justificativas
                  </button>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-start gap-3">
                          {question.userAnswer === question.correctAnswer ? (
                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">Questão {index + 1}</p>
                            <p className="mt-1 text-gray-600">{question.text}</p>
                            <div className="mt-2 text-sm">
                              <p className="text-gray-500">
                                Resposta correta: 
                                <span className="ml-1 font-medium text-gray-900">
                                  {question.correctAnswer ? 'Certo' : 'Errado'}
                                </span>
                              </p>
                              <p className="text-gray-500">
                                Sua resposta: 
                                <span className={`ml-1 font-medium ${
                                  question.userAnswer === question.correctAnswer 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  {question.userAnswer ? 'Certo' : 'Errado'}
                                </span>
                              </p>
                            </div>
                            <p className="mt-2 text-sm bg-gray-50 p-3 rounded">
                              <span className="font-medium text-gray-700">Justificativa:</span>
                              <br />
                              <span className="text-gray-600">{question.justification}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={restartQuiz}
                    className="flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 rounded-lg hover:from-gray-900 hover:to-black"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recomeçar
                  </button>
                  <button
                    onClick={startNewQuiz}
                    className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700"
                  >
                    <FileUp className="w-4 h-4 mr-2" />
                    Novo Quiz
                  </button>
                  <button
                    onClick={enterReviewMode}
                    className="col-span-2 flex items-center justify-center bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-lg hover:from-yellow-700 hover:to-orange-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Revisar Erros
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500">
                    Questão {currentQuestion + 1} de {questions.length}
                  </p>
                  <h2 className="text-xl font-medium mt-2">
                    {questions[currentQuestion].text}
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswerClick(true)}
                    className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg hover:from-green-600 hover:to-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Certo
                  </button>
                  <button
                    onClick={() => handleAnswerClick(false)}
                    className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg hover:from-red-600 hover:to-red-700"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Errado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;