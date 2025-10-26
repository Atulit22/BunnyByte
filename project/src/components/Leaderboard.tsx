import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Crown, Star } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Fetch real leaderboard data from backend
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        
        // Add fullName and previousRank (mock previousRank for now)
        const enrichedData = data.map((entry: any) => ({
          ...entry,
          fullName: entry.username, // Use username as fullName for now
          previousRank: entry.rank + Math.floor(Math.random() * 3) - 1 // Mock previous rank
        }));
        
        setLeaderboard(enrichedData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Set empty leaderboard on error
        setLeaderboard([]);
      }
    };

    fetchLeaderboard();
  }, [timeframe, user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return <span className={`text-lg font-bold ${colors.textSecondary}`}>#{rank}</span>;
    }
  };

  const getRankChange = (currentRank: number, previousRank?: number) => {
    if (!previousRank || currentRank === previousRank) {
      return <Minus className="w-4 h-4 text-slate-500" />;
    }
    
    if (currentRank < previousRank) {
      return (
        <div className="flex items-center text-green-500">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs ml-1">+{previousRank - currentRank}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-500">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs ml-1">-{currentRank - previousRank}</span>
        </div>
      );
    }
  };

  const timeframeButtons = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'all-time', label: 'All Time' }
  ] as const;

  const currentUserEntry = leaderboard.find(entry => entry.userId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${colors.text} mb-2`}>
          Leaderboard 🏆
        </h1>
        <p className={colors.textSecondary}>
          See how you rank against other JavaScript learners
        </p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex mb-8">
        <div className="flex bg-slate-700/30 rounded-lg p-1">
          {timeframeButtons.map((button) => (
            <button
              key={button.id}
              onClick={() => setTimeframe(button.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeframe === button.id
                  ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                  : `${colors.textSecondary} hover:text-white hover:bg-white/10`
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Top 3 Podium */}
        <div className="lg:col-span-4 mb-8">
          <div className="flex items-end justify-center space-x-8 mb-12">
            {leaderboard.slice(0, 3).map((entry, index) => {
              const heights = ['h-32', 'h-40', 'h-24'];
              const positions = [1, 0, 2]; // Second, First, Third
              const actualIndex = positions[index];
              const actualEntry = leaderboard[actualIndex];
              
              return (
                <div key={actualEntry.userId} className="text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-lg">
                        {actualEntry.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className={`font-semibold ${colors.text}`}>
                      {actualEntry.username}
                    </h3>
                    <p className={`text-sm ${colors.textSecondary}`}>
                      {actualEntry.totalPoints} pts
                    </p>
                  </div>
                  
                  <div className={`${colors.surface} ${heights[index]} w-24 rounded-t-lg border border-white/10 flex flex-col items-center justify-between p-4`}>
                    <div className="text-3xl">
                      {actualIndex === 0 ? '🥇' : actualIndex === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={`text-2xl font-bold ${colors.text}`}>
                      {actualIndex + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current User Stats */}
        {currentUserEntry && (
          <div className={`${colors.surface} rounded-xl p-6 border border-white/10`}>
            <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>Your Position</h3>
            
            <div className="text-center mb-4">
              <div className={`text-3xl font-bold ${colors.text} mb-2`}>
                #{currentUserEntry.rank}
              </div>
              <div className="flex items-center justify-center">
                {getRankChange(currentUserEntry.rank, currentUserEntry.previousRank)}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={colors.textSecondary}>Points</span>
                <span className={`font-semibold ${colors.text}`}>
                  {currentUserEntry.totalPoints}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={colors.textSecondary}>Solved</span>
                <span className={`font-semibold ${colors.text}`}>
                  {currentUserEntry.problemsSolved}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={colors.textSecondary}>Avg Time</span>
                <span className={`font-semibold ${colors.text}`}>
                  {currentUserEntry.averageTime}min
                </span>
              </div>
              <div className="flex justify-between">
                <span className={colors.textSecondary}>Streak</span>
                <span className={`font-semibold ${colors.text}`}>
                  {currentUserEntry.streak} days
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="lg:col-span-3">
          <div className={`${colors.surface} rounded-xl border border-white/10 overflow-hidden`}>
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className={`text-lg font-semibold ${colors.text}`}>
                Rankings ({timeframe.replace('-', ' ')})
              </h3>
            </div>
            
            <div className="divide-y divide-white/10">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                
                return (
                  <div
                    key={entry.userId}
                    className={`px-6 py-4 transition-all duration-200 ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-pink-500/10 to-violet-500/10 border-l-4 border-pink-500' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {entry.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div>
                            <div className={`font-semibold ${colors.text}`}>
                              {entry.username}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className={`text-sm ${colors.textSecondary}`}>
                              {entry.fullName}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="hidden md:flex items-center space-x-8 text-sm">
                        <div className="text-center">
                          <div className={`font-semibold ${colors.text}`}>
                            {entry.totalPoints}
                          </div>
                          <div className={colors.textSecondary}>Points</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`font-semibold ${colors.text}`}>
                            {entry.problemsSolved}
                          </div>
                          <div className={colors.textSecondary}>Solved</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`font-semibold ${colors.text}`}>
                            {entry.averageTime}m
                          </div>
                          <div className={colors.textSecondary}>Avg Time</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`font-semibold ${colors.text}`}>
                            {entry.streak}
                          </div>
                          <div className={colors.textSecondary}>Streak</div>
                        </div>
                      </div>
                      
                      {/* Rank Change */}
                      <div className="w-8 flex justify-center">
                        {getRankChange(entry.rank, entry.previousRank)}
                      </div>
                    </div>
                    
                    {/* Mobile Stats */}
                    <div className="md:hidden mt-3 grid grid-cols-4 gap-4 text-xs">
                      <div className="text-center">
                        <div className={`font-semibold ${colors.text}`}>
                          {entry.totalPoints}
                        </div>
                        <div className={colors.textSecondary}>Points</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${colors.text}`}>
                          {entry.problemsSolved}
                        </div>
                        <div className={colors.textSecondary}>Solved</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${colors.text}`}>
                          {entry.averageTime}m
                        </div>
                        <div className={colors.textSecondary}>Avg Time</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${colors.text}`}>
                          {entry.streak}
                        </div>
                        <div className={colors.textSecondary}>Streak</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Competition Info */}
      <div className={`${colors.surface} rounded-xl p-6 border border-white/10 mt-8`}>
        <h3 className={`text-lg font-semibold ${colors.text} mb-4`}>
          How Rankings Work
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`font-medium ${colors.text} mb-2`}>Scoring System</h4>
            <ul className={`text-sm ${colors.textSecondary} space-y-1`}>
              <li>• Easy problems: 10 points each</li>
              <li>• Intermediate problems: 15 points each</li>
              <li>• Advanced problems: 25 points each</li>
              <li>• Bonus challenges: Extra points</li>
              <li>• Speed bonuses for fast solutions</li>
            </ul>
          </div>
          
          <div>
            <h4 className={`font-medium ${colors.text} mb-2`}>Ranking Factors</h4>
            <ul className={`text-sm ${colors.textSecondary} space-y-1`}>
              <li>• Total points earned</li>
              <li>• Problems solved count</li>
              <li>• Average solution time</li>
              <li>• Current solving streak</li>
              <li>• Recent activity bonus</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}