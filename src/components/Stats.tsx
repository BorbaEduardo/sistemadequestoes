import React from 'react';
import { getDailyStats, getMonthlyStats, getYearlyStats } from '../utils/storage';
import { TrendingUp } from 'lucide-react';

interface StatsProps {
  selectedDate: string;
}

export const Stats: React.FC<StatsProps> = ({ selectedDate }) => {
  const dailyStats = getDailyStats(selectedDate);
  const monthlyStats = getMonthlyStats(selectedDate.substring(0, 7));
  const yearlyStats = getYearlyStats(selectedDate.substring(0, 4));

  const calculateMonthlyTotal = () => {
    if (!monthlyStats) return { total: 0, correct: 0 };
    return Object.values(monthlyStats).reduce(
      (acc, day) => ({
        total: acc.total + day.total,
        correct: acc.correct + day.correct,
      }),
      { total: 0, correct: 0 }
    );
  };

  const calculateYearlyTotal = () => {
    if (!yearlyStats) return { total: 0, correct: 0 };
    return Object.values(yearlyStats).reduce(
      (acc, month) => {
        const monthTotal = Object.values(month).reduce(
          (monthAcc, day) => ({
            total: monthAcc.total + day.total,
            correct: monthAcc.correct + day.correct,
          }),
          { total: 0, correct: 0 }
        );
        return {
          total: acc.total + monthTotal.total,
          correct: acc.correct + monthTotal.correct,
        };
      },
      { total: 0, correct: 0 }
    );
  };

  const monthlyTotal = calculateMonthlyTotal();
  const yearlyTotal = calculateYearlyTotal();

  const StatCard = ({ title, stats, icon }: { 
    title: string; 
    stats: { total: number; correct: number } | null;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-blue-600">
          {icon}
        </div>
      </div>
      {stats && stats.total > 0 ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total de questões:</span>
            <span className="font-semibold text-gray-900">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Questões corretas:</span>
            <span className="font-semibold text-green-600">{stats.correct}</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Taxa de acerto:</span>
              <span className="font-semibold text-blue-600">
                {((stats.correct / stats.total) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(stats.correct / stats.total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Nenhuma questão respondida</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6">
      <StatCard
        title="Estatísticas do Dia"
        stats={dailyStats}
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <StatCard
        title="Estatísticas do Mês"
        stats={monthlyTotal}
        icon={<TrendingUp className="w-6 h-6" />}
      />
      <StatCard
        title="Estatísticas do Ano"
        stats={yearlyTotal}
        icon={<TrendingUp className="w-6 h-6" />}
      />
    </div>
  );
};