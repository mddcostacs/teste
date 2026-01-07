
import React from 'react';
import { Boleto } from '../types';

interface BoletoModalProps {
  boleto: Boleto | null;
  onClose: () => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

const BoletoModal: React.FC<BoletoModalProps> = ({ boleto, onClose, onToggleStatus, onDelete }) => {
  if (!boleto) return null;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* PDF Viewer Side */}
        <div className="flex-1 bg-gray-100 p-4 flex flex-col items-center justify-center border-r border-gray-200 min-h-[300px] md:min-h-0">
          {boleto.pdfData ? (
            <iframe 
              src={boleto.pdfData} 
              className="w-full h-full rounded-lg shadow-inner bg-white"
              title="Boleto PDF View"
            />
          ) : (
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Visualização indisponível</p>
            </div>
          )}
        </div>

        {/* Info Side */}
        <div className="w-full md:w-80 p-8 flex flex-col gap-6 bg-white overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start">
            <div>
              <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 ${
                boleto.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {boleto.status === 'paid' ? 'Pago' : 'Pendente'}
              </span>
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">{boleto.name || boleto.issuer}</h2>
              <p className="text-gray-500 text-sm mt-1">{boleto.issuer}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Valor</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(boleto.value)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Vencimento</p>
              <p className="text-lg font-medium text-gray-700">{formatDate(boleto.dueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Código de Barras</p>
              <div className="mt-1 p-2 bg-gray-50 rounded-lg text-xs font-mono break-all text-gray-600 border border-gray-100">
                {boleto.barcode}
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(boleto.barcode);
                  alert('Código copiado!');
                }}
                className="mt-2 text-xs text-blue-500 font-semibold hover:underline flex items-center gap-1"
              >
                Copiar código
              </button>
            </div>
          </div>

          <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
            <button 
              onClick={() => onToggleStatus(boleto.id)}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                boleto.status === 'paid' 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {boleto.status === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago'}
            </button>
            <button 
              onClick={() => {
                if(confirm('Deseja excluir este boleto?')) {
                  onDelete(boleto.id);
                  onClose();
                }
              }}
              className="w-full py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Excluir Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoletoModal;
