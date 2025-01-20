export interface Question {
  id: string;
  text: string;
  correctAnswer: boolean;
  justification: string;
  date: string;
  isAnswered: boolean;
  userAnswer: boolean | null;
}

export interface DailyStats {
  total: number;
  correct: number;
  date: string;
}

export interface MonthlyStats {
  [day: string]: DailyStats;
}

export interface YearlyStats {
  [month: string]: MonthlyStats;
}