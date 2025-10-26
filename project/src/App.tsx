import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProgressProvider } from './contexts/UserProgressContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LearningPath from './components/LearningPath';
import ProblemView from './components/ProblemView';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import Navbar from './components/Navbar';
import { User } from './types';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <UserProgressProvider>
          <AppContent />
        </UserProgressProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'learn' | 'profile' | 'leaderboard'>('dashboard');
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'easy' | 'intermediate' | 'advanced'>('easy');

  const handleViewChange = (view: 'dashboard' | 'learn' | 'profile' | 'leaderboard') => {
    setCurrentView(view);
    setSelectedProblem(null); // Clear selected problem when navigating
  };

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  if (selectedProblem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar currentView={currentView} setCurrentView={handleViewChange} />
        <ProblemView 
          problemId={selectedProblem}
          onBack={() => setSelectedProblem(null)}
          level={selectedLevel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar currentView={currentView} setCurrentView={handleViewChange} />
      
      <main className="pt-20">
        {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
        {currentView === 'learn' && (
          <LearningPath 
            onProblemSelect={setSelectedProblem}
            onLevelSelect={setSelectedLevel}
            selectedLevel={selectedLevel}
          />
        )}
        {currentView === 'profile' && <Profile />}
        {currentView === 'leaderboard' && <Leaderboard />}
      </main>
    </div>
  );
}