
import React from 'react';
import { Boleto } from '../types';

interface BoletoItemProps {
  boleto: Boleto;
  onToggleStatus: (id: string) => void;
  onClick: (boleto: Boleto) => void;
}

const BoletoItem: React.FC<BoletoItemProps> = ({ boleto, onToggleStatus, onClick }) => {
  const isOverdue = new Date(boleto.dueDate) < new Date() && boleto.status === 'pending';
  
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div 
      className={`group flex items-center gap-4 p-4 mb-2 bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-200 transition-all duration-200 cursor-pointer ${boleto.status === 'paid' ? 'opacity-60' : ''}`}
      onClick={() => onClick(boleto)}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(boleto.id);
        }}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          boleto.status === 'paid' 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {boleto.status === 'paid' && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-grow min-w-0">
        <h3 className={`text-sm font-semibold truncate ${boleto.status === 'paid' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {boleto.name || boleto.issuer}
        </h3>
        <p className="text-xs text-gray-500 truncate">{boleto.issuer}</p>
      </div>

      <div className="flex flex-col items-end flex-shrink-0">
        <span className={`text-sm font-bold ${boleto.status === 'paid' ? 'text-gray-400' : 'text-blue-600'}`}>
          {formatCurrency(boleto.value)}
        </span>
        <span className={`text-[10px] font-medium uppercase tracking-wider ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
          Vence {formatDate(boleto.dueDate)}
        </span>
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default BoletoItem;
