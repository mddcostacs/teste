
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Boleto, ReminderSettings } from './types';
import { extractBoletoData } from './services/geminiService';
import BoletoItem from './components/BoletoItem';
import BoletoModal from './components/BoletoModal';

const App: React.FC = () => {
  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega os boletos do navegador
  useEffect(() => {
    const savedBoletos = localStorage.getItem('my_boletos_v1');
    if (savedBoletos) {
      try {
        setBoletos(JSON.parse(savedBoletos));
      } catch (e) {
        console.error("Erro ao carregar boletos", e);
      }
    }
  }, []);

  // Salva os boletos automaticamente
  useEffect(() => {
    localStorage.setItem('my_boletos_v1', JSON.stringify(boletos));
  }, [boletos]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const fullBase64 = event.target?.result as string;
        
        const extracted = await extractBoletoData(base64, file.type);

        const newBoleto: Boleto = {
          id: crypto.randomUUID(),
          name: extracted.issuer || file.name.replace(/\.[^/.]+$/, ""),
          issuer: extracted.issuer || "Emissor não identificado",
          value: extracted.value || 0,
          dueDate: extracted.dueDate || new Date().toISOString().split('T')[0],
          barcode: extracted.barcode || "Código não identificado",
          status: 'pending',
          pdfData: fullBase64,
          createdAt: Date.now()
        };

        setBoletos(prev => [newBoleto, ...prev]);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Não consegui ler este boleto. Verifique se o arquivo está correto.");
      setIsProcessing(false);
    }
  };

  const toggleStatus = useCallback((id: string) => {
    setBoletos(prev => prev.map(b => 
      b.id === id ? { ...b, status: b.status === 'paid' ? 'pending' : 'paid' } : b
    ));
    if (selectedBoleto && selectedBoleto.id === id) {
      setSelectedBoleto(prev => prev ? { ...prev, status: prev.status === 'paid' ? 'pending' : 'paid' } : null);
    }
  }, [selectedBoleto]);

  const deleteBoleto = useCallback((id: string) => {
    setBoletos(prev => prev.filter(b => b.id !== id));
  }, []);

  const totalPending = boletos.filter(b => b.status === 'pending').reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Barra Lateral */}
      <aside className="w-full md:w-80 p-6 flex flex-col gap-6 bg-white border-r border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Meus Boletos</h1>
        </div>

        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Total Pendente</p>
          <p className="text-2xl font-black text-blue-700">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
          </p>
        </div>

        <nav className="flex flex-col gap-1">
          <button onClick={() => setFilter('all')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            Todos
          </button>
          <button onClick={() => setFilter('pending')} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${filter === 'pending' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Pendentes
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <button 
            onClick={() => setShowInstallGuide(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            USAR COMO APP NO CELULAR
          </button>
          <p className="text-[10px] text-center text-gray-400 font-medium px-4">
            Seus boletos ficam salvos apenas neste navegador.
          </p>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex flex-col h-screen overflow-hidden">
        <header className="p-6 flex items-center justify-between glass-effect border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {filter === 'all' ? 'Minha Lista' : 'Pendentes'}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Organizador Pessoal</p>
          </div>
          
          <button 
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all"
          >
            {isProcessing ? 'Lendo...' : 'ADICIONAR BOLETO'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="application/pdf,image/*" />
        </header>

        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-3xl mx-auto space-y-2">
            {boletos.filter(b => filter === 'all' ? true : b.status === filter).length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <svg className="w-20 h-20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="font-bold">Nenhum boleto encontrado.</p>
              </div>
            ) : (
              boletos.filter(b => filter === 'all' ? true : b.status === filter).map(boleto => (
                <BoletoItem key={boleto.id} boleto={boleto} onToggleStatus={toggleStatus} onClick={setSelectedBoleto} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Guia de Instalação (Simples) */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Como salvar no celular</h3>
              <button onClick={() => setShowInstallGuide(false)} className="text-gray-400">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">1</div>
                <p className="text-sm text-gray-600">Abra este link no navegador do seu celular (Safari ou Chrome).</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">2</div>
                <p className="text-sm text-gray-600">No iPhone, clique em <strong>Compartilhar</strong>. No Android, clique nos <strong>3 pontinhos</strong>.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black">3</div>
                <p className="text-sm text-gray-600">Selecione <strong>"Adicionar à Tela de Início"</strong> ou <strong>"Instalar App"</strong>.</p>
              </div>
            </div>

            <button onClick={() => setShowInstallGuide(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200">
              ENTENDI!
            </button>
          </div>
        </div>
      )}

      <BoletoModal boleto={selectedBoleto} onClose={() => setSelectedBoleto(null)} onToggleStatus={toggleStatus} onDelete={deleteBoleto} />
      
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-black text-blue-600">IA lendo seu boleto...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
