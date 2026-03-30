import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type AppRole = 'admin' | 'moderator' | 'user';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  password: string; // plain text for demo only
}

export interface UserRole {
  userId: string;
  role: AppRole;
}

interface AuthContextType {
  user: DemoUser | null;
  roles: AppRole[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  allUsers: DemoUser[];
  allRoles: UserRole[];
  assignRole: (userId: string, role: AppRole) => void;
  removeRole: (userId: string, role: AppRole) => void;
}

const STORAGE_KEYS = {
  users: 'demo_users',
  roles: 'demo_user_roles',
  session: 'demo_session',
};

const defaultUsers: DemoUser[] = [
  { id: 'u1', email: 'admin@serenite.com', name: 'Admin Sérénité', password: 'admin123' },
  { id: 'u2', email: 'staff@serenite.com', name: 'Staff Hôtel', password: 'staff123' },
];

const defaultRoles: UserRole[] = [
  { userId: 'u1', role: 'admin' },
  { userId: 'u2', role: 'user' },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<DemoUser[]>(() => loadFromStorage(STORAGE_KEYS.users, defaultUsers));
  const [userRoles, setUserRoles] = useState<UserRole[]>(() => loadFromStorage(STORAGE_KEYS.roles, defaultRoles));
  const [user, setUser] = useState<DemoUser | null>(() => loadFromStorage(STORAGE_KEYS.session, null));

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(userRoles)); }, [userRoles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user)); }, [user]);

  const roles = user ? userRoles.filter(r => r.userId === user.id).map(r => r.role) : [];
  const isAuthenticated = !!user;
  const isAdmin = roles.includes('admin');

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Email ou mot de passe incorrect' };
    setUser(found);
    return { success: true };
  };

  const register = (name: string, email: string, password: string) => {
    if (users.some(u => u.email === email)) return { success: false, error: 'Cet email est déjà utilisé' };
    const newUser: DemoUser = { id: `u${Date.now()}`, email, name, password };
    setUsers(prev => [...prev, newUser]);
    setUserRoles(prev => [...prev, { userId: newUser.id, role: 'user' as AppRole }]);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => setUser(null);

  const assignRole = (userId: string, role: AppRole) => {
    if (!userRoles.some(r => r.userId === userId && r.role === role)) {
      setUserRoles(prev => [...prev, { userId, role }]);
    }
  };

  const removeRole = (userId: string, role: AppRole) => {
    setUserRoles(prev => prev.filter(r => !(r.userId === userId && r.role === role)));
  };

  return (
    <AuthContext.Provider value={{
      user, roles, isAuthenticated, isAdmin,
      login, register, logout,
      allUsers: users, allRoles: userRoles,
      assignRole, removeRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
