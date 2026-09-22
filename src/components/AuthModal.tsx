import React, { useState } from 'react';
import { X, User as UserIcon, Lock, Mail, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { signIn, signUp, sendPasswordReset, updatePassword } from '../lib/api';

type Mode = 'login' | 'register' | 'forgot' | 'update-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onNotice?: (msg: string) => void;
  initialMode?: 'login' | 'register' | 'update-password';
}

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none';

const Field: React.FC<{
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}> = ({ id, label, icon, type, value, onChange, placeholder, autoComplete, minLength }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{icon}</div>
      <input
        id={id}
        type={type}
        required
        minLength={minLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  </div>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onNotice,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setPassword2('');
  };

  const run = async (fn: () => Promise<void>) => {
    setErrorMessage('');
    setSuccessMessage('');
    setBusy(true);
    try {
      await fn();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const user = await signIn(email, password);
      setPassword('');
      onLoginSuccess(user);
      onClose();
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    run(async () => {
      const user = await signUp(name, email, password);
      setPassword('');
      if (user) {
        onLoginSuccess(user);
        onClose();
      } else {
        setSuccessMessage(
          `Te enviamos un correo a ${email.trim()}. Abre el enlace para confirmar tu cuenta y luego inicia sesión.`
        );
        setMode('login');
      }
    });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      await sendPasswordReset(email);
      setSuccessMessage(`Si existe una cuenta con ${email.trim()}, recibirás un enlace para crear una nueva contraseña.`);
    });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== password2) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    run(async () => {
      await updatePassword(password);
      setPassword('');
      setPassword2('');
      onNotice?.('Contraseña actualizada');
      onClose();
    });
  };

  const titles: Record<Mode, string> = {
    login: 'Iniciar Sesión',
    register: 'Crear Cuenta',
    forgot: 'Recuperar Contraseña',
    'update-password': 'Nueva Contraseña',
  };

  const submitButton = (label: string, variant: 'blue' | 'amber' = 'blue') => (
    <button
      type="submit"
      disabled={busy}
      className={`w-full mt-2 font-bold text-xs py-3 px-4 rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 ${
        variant === 'blue'
          ? 'bg-blue-900 hover:bg-blue-800 text-amber-300 border border-amber-500/20'
          : 'bg-amber-500 hover:bg-amber-400 text-blue-950 font-black'
      }`}
    >
      {busy && <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-blue-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="auth-modal-container"
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-slate-900 text-white relative">
          <button
            id="close-auth-modal-button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/10 rounded-xl border border-white/20">
              <UserIcon className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-xl font-black">{titles[mode]}</h2>
              <p className="text-xs text-slate-300">TemaShop</p>
            </div>
          </div>

          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-black/25 p-1 rounded-xl mt-4 text-xs font-bold">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  id={m === 'login' ? 'auth-tab-login' : 'auth-tab-register'}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    mode === m ? 'bg-amber-400 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
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

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <Field id="login-input-email" label="Correo electrónico" icon={<Mail className="w-4 h-4" />} type="email"
                value={email} onChange={setEmail} placeholder="tucorreo@ejemplo.com" autoComplete="email" />
              <Field id="login-input-password" label="Contraseña" icon={<Lock className="w-4 h-4" />} type="password"
                value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" />
              <div className="text-right">
                <button type="button" onClick={() => switchMode('forgot')} className="text-[11px] font-semibold text-blue-900 hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              {submitButton('Entrar a mi cuenta')}
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <Field id="register-input-name" label="Nombre completo" icon={<UserIcon className="w-4 h-4" />} type="text"
                value={name} onChange={setName} placeholder="Ej. Laura Gómez" autoComplete="name" />
              <Field id="register-input-email" label="Correo electrónico" icon={<Mail className="w-4 h-4" />} type="email"
                value={email} onChange={setEmail} placeholder="laura@ejemplo.com" autoComplete="email" />
              <Field id="register-input-password" label="Contraseña (mínimo 8 caracteres)" icon={<Lock className="w-4 h-4" />}
                type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="new-password" minLength={8} />
              {submitButton('Crear mi cuenta', 'amber')}
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-3.5">
              <p className="text-xs text-slate-600">Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
              <Field id="forgot-input-email" label="Correo electrónico" icon={<Mail className="w-4 h-4" />} type="email"
                value={email} onChange={setEmail} placeholder="tucorreo@ejemplo.com" autoComplete="email" />
              {submitButton('Enviar enlace')}
              <button type="button" onClick={() => switchMode('login')} className="w-full text-[11px] font-semibold text-blue-900 hover:underline">
                Volver a iniciar sesión
              </button>
            </form>
          )}

          {mode === 'update-password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <p className="text-xs text-slate-600">Elige tu nueva contraseña.</p>
              <Field id="new-password" label="Nueva contraseña (mínimo 8 caracteres)" icon={<Lock className="w-4 h-4" />}
                type="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
              <Field id="new-password-2" label="Repite la contraseña" icon={<Lock className="w-4 h-4" />}
                type="password" value={password2} onChange={setPassword2} autoComplete="new-password" minLength={8} />
              {submitButton('Guardar contraseña')}
            </form>
          )}

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Tu contraseña se guarda cifrada y nunca se muestra a nadie.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
