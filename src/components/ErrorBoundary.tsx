import React from 'react';

// Si una parte de la tienda falla, muestra un aviso con opción de recargar
// en lugar de dejar la pantalla en blanco.
interface Props {
  children: React.ReactNode;
  onReset?: () => void;
  inline?: boolean;
}

interface State {
  error: Error | null;
}

const isEnglish = () => {
  try {
    return (localStorage.getItem('temashop_lang') || 'en') === 'en';
  } catch {
    return true;
  }
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[TemaShop] Error en pantalla:', error, info?.componentStack);
    // Tras publicar una versión nueva, una pestaña vieja puede pedir archivos que ya no existen
    if (/dynamically imported module|Loading chunk|Importing a module script failed/i.test(String(error?.message))) {
      window.location.reload();
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;
    const en = isEnglish();
    const box = (
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-3">
        <p className="text-lg font-extrabold text-blue-950">
          {en ? 'Something went wrong' : 'Algo salió mal'}
        </p>
        <p className="text-sm text-slate-600">
          {en
            ? 'Please try again. Your cart is saved.'
            : 'Inténtalo de nuevo. Tu bolsa sigue guardada.'}
        </p>
        <div className="flex gap-2 justify-center pt-1">
          <button onClick={this.reset} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-4 py-2.5 rounded-xl">
            {en ? 'Close' : 'Cerrar'}
          </button>
          <button onClick={() => window.location.reload()} className="bg-blue-950 hover:bg-blue-900 text-white font-semibold text-sm px-4 py-2.5 rounded-xl">
            {en ? 'Reload page' : 'Recargar página'}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 break-words">{String(this.state.error?.message || '').slice(0, 200)}</p>
      </div>
    );
    if (this.props.inline) return box;
    return <div className="fixed inset-0 z-[70] bg-blue-950/70 flex p-4 overflow-y-auto"><div className="m-auto">{box}</div></div>;
  }
}
