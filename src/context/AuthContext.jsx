import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mytube_user');
      const isGuest = localStorage.getItem('mytube_is_guest');
      if (saved && isGuest !== 'true') {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Initial check on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const isGuest = localStorage.getItem('mytube_is_guest');
        const token = localStorage.getItem('mytube_access_token');
        if (token && isGuest !== 'true') {
          const profile = await authService.getCurrentUser();
          if (profile) {
            setUser(profile);
          }
        }
      } catch {
        // Guest mode fallback
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const handleAuthCleared = () => {
      setUser(null);
    };
    window.addEventListener('mytube_auth_cleared', handleAuthCleared);
    return () => window.removeEventListener('mytube_auth_cleared', handleAuthCleared);
  }, []);

  const login = async (credentials) => {
    localStorage.removeItem('mytube_is_guest');
    const data = await authService.login(credentials);
    setUser(data.user);
    setAuthModalOpen(false);
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const requireAuth = (actionName, callback) => {
    if (user) {
      if (callback) callback();
      return true;
    }
    setAuthModalReason(actionName || 'Sign in to access this feature');
    setAuthModalOpen(true);
    return false;
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalReason('');
  };

  const openUploadModal = () => {
    if (!user) {
      requireAuth('Sign in to upload videos');
      return;
    }
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('mytube_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
        requireAuth,
        authModalOpen,
        authModalReason,
        openAuthModal: (reason) => {
          setAuthModalReason(reason || 'Sign in to your account');
          setAuthModalOpen(true);
        },
        closeAuthModal,
        uploadModalOpen,
        openUploadModal,
        closeUploadModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
