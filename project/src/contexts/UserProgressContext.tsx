import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProgress, Achievement } from '../types';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface UserProgressContextType {
  progress: UserProgress | null;
  updateProgress: (problemId: string, level: 'easy' | 'intermediate' | 'advanced', points: number) => void;
  getAchievements: () => Achievement[];
  loading: boolean;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
};

const defaultAchievements: Achievement[] = [
  { id: 'first_solve', title: 'First Steps', description: 'Solve your first problem', icon: '🎯', earned: false },
  { id: 'easy_master', title: 'Easy Peasy', description: 'Complete all easy problems', icon: '🥕', earned: false },
  { id: 'intermediate_master', title: 'Getting Serious', description: 'Complete all intermediate problems', icon: '🏆', earned: false },
  { id: 'advanced_master', title: 'Code Ninja', description: 'Complete all advanced problems', icon: '⚡', earned: false },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day solving streak', icon: '🔥', earned: false },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Solve 5 problems in under 10 minutes each', icon: '💨', earned: false }
];

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`bunnybyte_progress_${user.id}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        // Initialize new user progress
        const newProgress: UserProgress = {
          userId: user.id,
          solvedProblems: [],
          currentStreak: 0,
          totalPoints: 0,
          achievements: defaultAchievements.map(a => ({ ...a })),
          levelProgress: {
            easy: { completed: false, solvedCount: 0, totalCount: 10, rabbitPosition: 0, megaCarrotEarned: false, bonusProblemSolved: false },
            intermediate: { completed: false, solvedCount: 0, totalCount: 15, rabbitPosition: 0, megaCarrotEarned: false, bonusProblemSolved: false },
            advanced: { completed: false, solvedCount: 0, totalCount: 20, rabbitPosition: 0, megaCarrotEarned: false, bonusProblemSolved: false }
          }
        };
        setProgress(newProgress);
        localStorage.setItem(`bunnybyte_progress_${user.id}`, JSON.stringify(newProgress));
      }
    }
    setLoading(false);
  }, [user]);

  const updateProgress = async (problemId: string, level: 'easy' | 'intermediate' | 'advanced', points: number) => {
    if (!progress || !user) return;

    const newProgress = { ...progress };
    
    // Don't add points if already solved
    if (!newProgress.solvedProblems.includes(problemId)) {
      newProgress.solvedProblems.push(problemId);
      newProgress.totalPoints += points;
      newProgress.levelProgress[level].solvedCount += 1;
      newProgress.levelProgress[level].rabbitPosition += 1;

      // Check if level is completed
      if (newProgress.levelProgress[level].solvedCount >= newProgress.levelProgress[level].totalCount) {
        newProgress.levelProgress[level].completed = true;
        newProgress.levelProgress[level].megaCarrotEarned = true;
      }

      // Update achievements
      if (newProgress.solvedProblems.length === 1) {
        const achievement = newProgress.achievements.find(a => a.id === 'first_solve');
        if (achievement) {
          achievement.earned = true;
          achievement.earnedDate = new Date().toISOString();
        }
      }

      // Check level completions
      const levelAchievements = {
        easy: 'easy_master',
        intermediate: 'intermediate_master',
        advanced: 'advanced_master'
      };

      if (newProgress.levelProgress[level].completed) {
        const achievement = newProgress.achievements.find(a => a.id === levelAchievements[level]);
        if (achievement) {
          achievement.earned = true;
          achievement.earnedDate = new Date().toISOString();
        }
      }

      setProgress(newProgress);
      localStorage.setItem(`bunnybyte_progress_${user.id}`, JSON.stringify(newProgress));

      // Sync with backend - convert problemId to challengeId
      // Problem IDs are like 'easy-1', 'intermediate-5', etc.
      // We'll extract the number and map it to a challenge ID
      try {
        const problemNumber = parseInt(problemId.split('-')[1]);
        // For now, use the problem number as the challenge ID
        // In production, you'd have a proper mapping
        await api.updateProgress(
          user.id,
          problemNumber,
          'Completed',
          points,
          '' // You can pass the actual code if needed
        );
      } catch (error) {
        console.error('Failed to sync progress with backend:', error);
      }
    }
  };

  const getAchievements = () => {
    return progress?.achievements || [];
  };

  return (
    <UserProgressContext.Provider value={{
      progress,
      updateProgress,
      getAchievements,
      loading
    }}>
      {children}
    </UserProgressContext.Provider>
  );
};