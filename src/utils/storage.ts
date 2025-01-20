import { Question, DailyStats, MonthlyStats, YearlyStats } from '../types';

const QUESTIONS_KEY = 'quiz_questions';
const STATS_KEY = 'quiz_stats';

export const saveQuestion = (question: Question) => {
  const questions = getQuestions();
  questions.push(question);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
};

export const getQuestions = (): Question[] => {
  const stored = localStorage.getItem(QUESTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const updateStats = (date: string, isCorrect: boolean) => {
  const stats = getStats();
  const [year, month, day] = date.split('-');
  
  if (!stats[year]) stats[year] = {};
  if (!stats[year][month]) stats[year][month] = {};
  if (!stats[year][month][day]) {
    stats[year][month][day] = {
      total: 0,
      correct: 0,
      date: date
    };
  }

  stats[year][month][day].total += 1;
  if (isCorrect) stats[year][month][day].correct += 1;

  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

export const getStats = (): YearlyStats => {
  const stored = localStorage.getItem(STATS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const getDailyStats = (date: string): DailyStats | null => {
  const stats = getStats();
  const [year, month, day] = date.split('-');
  return stats[year]?.[month]?.[day] || null;
};

export const getMonthlyStats = (yearMonth: string): MonthlyStats | null => {
  const stats = getStats();
  const [year, month] = yearMonth.split('-');
  return stats[year]?.[month] || null;
};

export const getYearlyStats = (year: string): YearlyStats | null => {
  const stats = getStats();
  return stats[year] || null;
};

export const clearStorage = () => {
  localStorage.removeItem(QUESTIONS_KEY);
  localStorage.removeItem(STATS_KEY);
};