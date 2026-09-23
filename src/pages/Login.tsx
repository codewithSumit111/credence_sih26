import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, User } from '../contexts/AuthContext';
import { ShieldAlert, User as UserIcon, Train } from 'lucide-react';

export default function Login() {
  const { availableUsers, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (user: User) => {
    login(user);
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
    } else {
      // Default routes based on role
      switch (user.role) {
        case 'SECTION_CONTROLLER':
          navigate('/command', { replace: true });
          break;
        case 'BDMS_INCHARGE':
          navigate('/plan', { replace: true });
          break;
        case 'FIELD_MANAGER':
          navigate('/field', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-blue-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="bg-blue-600/20 p-4 rounded-full mb-4">
          <Train className="w-12 h-12 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">SIH26027 ABP</h1>
        <p className="text-slate-400 mt-2">Automatic Block Planning System</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700">
          <ShieldAlert className="w-6 h-6 text-amber-500" />
          <h2 className="text-xl font-semibold text-white">Select Persona (Mock Login)</h2>
        </div>
        
        <div className="space-y-3">
          {availableUsers.map((user) => (
            <button
              key={user.user_id}
              onClick={() => handleLogin(user)}
              className="w-full flex items-center justify-between p-4 rounded-lg bg-slate-700/50 hover:bg-blue-600/20 border border-slate-600 hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-2 rounded-full group-hover:bg-blue-900/50 transition-colors">
                  <UserIcon className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
                    {user.department_id && (
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-xs">
                        Dept: {user.department_id === 1 ? 'ENG' : user.department_id === 2 ? 'SNT' : 'TRD'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {availableUsers.length === 0 && (
            <div className="text-slate-400 text-center py-4">No users found. Did you run seed.sql?</div>
          )}
        </div>
      </div>
    </div>
  );
}
