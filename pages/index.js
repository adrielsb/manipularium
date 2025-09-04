import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [currentView, setCurrentView] = useState('bancaria');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Verificar se já está autenticado
    const auth = sessionStorage.getItem('manipularium_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === '1034') {
      setIsAuthenticated(true);
      sessionStorage.setItem('manipularium_auth', 'true');
    } else {
      alert('Senha incorreta!');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Login - Manipularium</title>
          <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </Head>
        
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <img 
                src="/images/logo.svg" 
                alt="Manipularium Logo" 
                className="h-20 w-20 mx-auto mb-4 rounded-full shadow-lg"
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Manipularium</h1>
              <p className="text-gray-600">Farmácia Farmacêutica</p>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha de acesso
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite a senha"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Sistemas de Conferência - Manipularium</title>
        <link href="https://cdn.tailwindcss.com" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 font-['Inter']">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
          {/* Logo no canto superior esquerdo */}
          <div className="absolute top-6 left-6 z-10">
            <img 
              src="/images/logo.svg" 
              alt="Manipularium Logo" 
              className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
            />
          </div>
          
          {/* Header */}
          <header className="text-center mb-6 mt-8 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
            <div className="mb-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-blue-900">Manipularium</h1>
              <p className="text-lg text-gray-600 font-medium">Farmácia Farmacêutica</p>
            </div>
            <p className="mt-2 text-gray-600" id="page-subtitle">Sistemas de Conferência</p>
          </header>

          {/* Navigation */}
          <nav className="flex justify-center mb-8">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-2 flex space-x-2">
              <button
                onClick={() => setCurrentView('bancaria')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentView === 'bancaria'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Conferência Bancária
              </button>
              <button
                onClick={() => setCurrentView('caixa')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  currentView === 'caixa'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                Conferência de Caixa
              </button>
            </div>
          </nav>

          {/* Content */}
          <main className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
            {currentView === 'bancaria' ? (
              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-6">Conferência Bancária</h2>
                <div className="text-center text-gray-600 py-12">
                  <p className="text-xl mb-4">🚧 Funcionalidade em desenvolvimento</p>
                  <p>Em breve você poderá fazer upload e conferir suas planilhas bancárias aqui.</p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-blue-900 mb-6">Conferência de Caixa</h2>
                <div className="text-center text-gray-600 py-12">
                  <p className="text-xl mb-4">📋 Em desenvolvimento</p>
                  <p>Sistema de conferência de caixa será implementado em breve.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}