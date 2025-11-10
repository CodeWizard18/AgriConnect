import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'customer' | 'admin';
  phone?: string;
  address?: string;
  pincode?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  signup: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; userId?: string; email?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  resendOTP: (email: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('agriconnect_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        setIsLoading(false);
        // Show specific error message from backend
        if (errorData.message) {
          // For now, we'll throw the error so it can be caught by the component
          throw new Error(errorData.message);
        }
        return false;
      }
      const data = await response.json();
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('agriconnect_user', JSON.stringify(userData));
      localStorage.setItem('agriconnect_token', data.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; userId?: string; email?: string }> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        setIsLoading(false);
        return { success: false };
      }
      const data = await response.json();
      setIsLoading(false);
      return { success: true, userId: data.userId, email: data.email };
    } catch (error) {
      setIsLoading(false);
      return { success: false };
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) {
        setIsLoading(false);
        return false;
      }
      const data = await response.json();
      const userData = data.user;
      setUser(userData);
      localStorage.setItem('agriconnect_user', JSON.stringify(userData));
      localStorage.setItem('agriconnect_token', data.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const resendOTP = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        setIsLoading(false);
        return false;
      }
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('agriconnect_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, verifyOTP, resendOTP, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}