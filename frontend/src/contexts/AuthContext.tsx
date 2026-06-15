import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type UserRole = 'doctor' | 'nurse' | 'patient' | 'admin';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  selectRole: (role: UserRole) => void;
  logout: () => void;
  demoLogin: (role?: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers: Record<UserRole, User> = {
  doctor: {
    id: 'U001',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@caresync.ai',
    role: 'doctor',
    department: 'Critical Care',
  },
  nurse: {
    id: 'U002',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@caresync.ai',
    role: 'nurse',
    department: 'ICU',
  },
  patient: {
    id: 'U003',
    name: 'Robert Carter',
    email: 'robert.carter@patient.caresync.ai',
    role: 'patient',
  },
  admin: {
    id: 'U004',
    name: 'James Wilson',
    email: 'admin@caresync.ai',
    role: 'admin',
    department: 'Hospital Administration',
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const login = async (_email: string, _password: string): Promise<boolean> => {
    // Demo mode: accept any credentials
    return true;
  };

  const selectRole = (selectedRole: UserRole) => {
    const demoUser = demoUsers[selectedRole];
    setUser(demoUser);
    setRole(selectedRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  const demoLogin = (preselectedRole?: UserRole) => {
    const r = preselectedRole || 'doctor';
    const demoUser = demoUsers[r];
    setUser(demoUser);
    setRole(r);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated: !!user && !!role,
      login,
      selectRole,
      logout,
      demoLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
