import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_URL } from '../api';

export interface User {
  user_id: string;
  name: string;
  role: 'SECTION_CONTROLLER' | 'BDMS_INCHARGE' | 'FIELD_MANAGER';
  department_id?: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  availableUsers: User[];
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage if present
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error('Failed to parse user from local storage', e);
        }
    }

    // Fetch users for login screen
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users`);
        if (res.ok) {
          const data = await res.json();
          setAvailableUsers(data);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('mock_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, availableUsers, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
