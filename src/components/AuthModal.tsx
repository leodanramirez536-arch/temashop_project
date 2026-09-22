import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { authenticateUser, registerUser, DEFAULT_ADMIN, DEFAULT_ADMIN_PASSWORD } from '../utils/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const result = authenticateUser(loginEmail, loginPassword);
    if (result.success && result.user) {
      setSuccessMessage(`¡Bienvenido de nuevo, ${result.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(result.user!);
        onClose();
      }, 500);
    } else {
      setErrorMessage(result.error || 'Credenciales inválidas.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (registerPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const result = registerUser(registerName, registerEmail, registerPassword);
    if (result.success && result.user) {
      setSuccessMessage('¡Cuenta creada con éxito! Iniciando sesión...');
      setTimeout(() => {
        onLoginSuccess(result.user!);
        onClose();
      }, 600);
    } else {
      setErrorMessage(result.error || 'No se pudo crear la cuenta.');
    }
  };

  // 1-Click Fill & Login with Admin credentials
  const handleQuickAdminLogin = () => {
    setLoginEmail(DEFAULT_ADMIN.email);
    setLoginPassword(DEFAULT_ADMIN_PASSWORD);
    setMode('login');
    setErrorMessage('');
    const result = authenticateUser(DEFAULT_ADMIN.email, DEFAULT_ADMIN_PASSWORD);
    if (result.success && result.user) {
      setSuccessMessage('¡Accediendo como Administrador Oficial!');
      setTimeout(() => {
        onLoginSuccess(result.user!);
        onClose();
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="auth-modal-container"
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white relative">
          <button
            id="close-auth-modal-button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/10 rounded-xl border border-white/20">
              <UserIcon className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-xl font-black">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-xs text-slate-300">
                TemaShop - Colección Departamental Premium
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-black/25 p-1 rounded-xl mt-4 text-xs font-bold">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'login' ? 'bg-amber-400 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'register' ? 'bg-amber-400 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              Crear Cuenta Nueva
            </button>
          </div>
        </div>

        {/* Quick Admin Test Banner */}
        <div className="bg-blue-50 border-b border-blue-200/80 p-3 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-bold text-blue-950 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Acceso de Administrador Oficial:
              </span>
              <p className="text-[11px] text-slate-600">
                Email: <span className="font-mono font-bold text-slate-900">{DEFAULT_ADMIN.email}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Contraseña: <span className="font-mono font-bold text-slate-900">{DEFAULT_ADMIN_PASSWORD}</span>
              </p>
            </div>
            <button
              id="quick-admin-login-button"
              type="button"
              onClick={handleQuickAdminLogin}
              className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shadow-xs flex-shrink-0 transition-all flex items-center gap-1"
            >
              <span>Acceso Rápido</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-input-email"
                    type="email"
                    required
                    placeholder="miguelgraphalterna@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-input-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="submit-login-button"
                type="submit"
                className="w-full mt-2 bg-blue-900 hover:bg-blue-800 text-amber-300 font-bold text-xs py-3 px-4 rounded-xl shadow-md shadow-blue-950/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 border border-amber-500/20"
              >
                <span>Entrar a mi Cuenta</span>
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="register-input-name"
                    type="text"
                    required
                    placeholder="Ej. Laura Gómez"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="register-input-email"
                    type="email"
                    required
                    placeholder="laura@ejemplo.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="register-input-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="submit-register-button"
                type="submit"
                className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-black text-xs py-3 px-4 rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Registrarme y Obtener Beneficios</span>
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tus datos se guardan de forma local y privada en tu navegador.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
