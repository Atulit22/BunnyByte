import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface SignupData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('bunnybyte_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await api.login(username, password);
      
      if (response.success) {
        // Fetch user profile
        const profile = await api.getProfile(response.userId);
        
        const userSession = {
          id: response.userId,
          username: profile.username,
          email: profile.email,
          fullName: profile.username, // Backend doesn't have fullName, using username
          joinDate: profile.created_at
        };
        
        setUser(userSession);
        localStorage.setItem('bunnybyte_user', JSON.stringify(userSession));
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await api.signup(userData.username, userData.email, userData.password);
      
      if (response.success) {
        // Auto login after signup
        const profile = await api.getProfile(response.userId);
        
        const userSession = {
          id: response.userId,
          username: profile.username,
          email: profile.email,
          fullName: userData.fullName || profile.username,
          joinDate: profile.created_at
        };
        
        setUser(userSession);
        localStorage.setItem('bunnybyte_user', JSON.stringify(userSession));
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bunnybyte_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};