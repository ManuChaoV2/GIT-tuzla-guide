import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  authClient: AuthClient | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create({
          idleOptions: {
            idleTimeout: 1000 * 60 * 30, // 30 minutes
            disableDefaultIdleCallback: true,
          },
        });

        setAuthClient(client);

        if (await client.isAuthenticated()) {
          const identity = client.getIdentity();
          setPrincipal(identity.getPrincipal());
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;

    try {
      await authClient.login({
        identityProvider: process.env.NODE_ENV === 'development' 
          ? 'http://rdmx6-jaaaa-aaaah-qcadq-cai.localhost:4943'
          : 'https://identity.ic0.app',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal());
          setIsAuthenticated(true);
        },
        onError: (error) => {
          console.error('Login error:', error);
        },
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    if (!authClient) return;

    try {
      await authClient.logout();
      setPrincipal(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    principal,
    authClient,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};