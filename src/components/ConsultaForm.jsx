import React, { useState, useEffect } from 'react';
import { X, Search, Camera, CheckCircle } from 'lucide-react';
import '../index.css';
import sociosData from '../socios.json';

// Mocks
const PROFISSIONAIS_MOCK = [
  { id: 1, nome: 'Dr. João Silva' },
  { id: 2, nome: 'Dra. Maria Souza' },
  { id: 3, nome: 'Dra. Ana Clara' },
  { id: 4, nome: 'Dr. Roberto Carlos' },
  { id: 5, nome: 'Dra. Silvia Santos' },
  { id: 6, nome: 'Dr. Carlos Almeida' },
];

const MODALIDADES_MOCK = [
  'Clínico Geral', 'Pediatria', 'Psicologia', 'Fisioterapia', 'Ortopedia', 'Natação', 'Hidroginástica'
];

const ConsultaForm = ({ initialData = null, onClose, onSave }) => {
  const [pacientePesquisa, setPacientePesquisa] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(initialData?.paciente || null);
  const [profissional, setProfissional] = useState(initialData?.profissional || '');
  const [modalidade, setModalidade] = useState(initialData?.modalidade || '');
  const [convenio, setConvenio] = useState(initialData?.convenio || '');
  const [carteirinha, setCarteirinha] = useState(initialData?.carteirinha || '');
  const [data, setData] = useState(initialData?.data || '');
  const [hora, setHora] = useState(initialData?.hora || '');
  const [valor, setValor] = useState(initialData?.valor ?? '');
  const [status, setStatus] = useState(initialData?.status || 'Agendado');
  const [observacoes, setObservacoes] = useState(initialData?.observacoes || '');
  
  const pacientesFiltrados = sociosData.filter(s => 
    (s.nNome || '').toLowerCase().includes(pacientePesquisa.toLowerCase())
  ).slice(0, 5); // Mostra apenas os 5 primeiros

  const handleSubmit = () => {
    const nomePaciente = pacienteSelecionado || pacientePesquisa.trim();
    if (!nomePaciente || !profissional || !modalidade || !data || !hora) {
      alert('Por favor, preencha os campos obrigatórios (Paciente, Profissional, Modalidade, Data e Hora).');
      return;
    }

    const consultaSalva = {
      id: initialData?.id || Date.now(),
      paciente: nomePaciente,
      profissional,
      modalidade,
      convenio: convenio || 'Particular',
      carteirinha,
      data,
      hora,
      valor: convenio === 'Particular' ? parseFloat(valor || 0) : 0,
      status,
      observacoes
    };

    if (onSave) {
      onSave(consultaSalva);
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{initialData ? 'Editar Consulta' : 'Agendar Consulta'}</h2>
            <p className="subtitle">{initialData ? 'Atualize os dados do agendamento' : 'Marque uma nova consulta médica'}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
          
          {/* Selecionar Paciente */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>*Paciente (Sócio/Dependente)</label>
            {!pacienteSelecionado ? (
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar pelo nome..."
                  value={pacientePesquisa}
                  onChange={e => setPacientePesquisa(e.target.value)}
                  style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    border: '1px solid var(--border-color)', 
                    padding: '10px 12px 10px 36px', 
                    borderRadius: '6px',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.95rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }} 
                />
                {pacientePesquisa && pacientesFiltrados.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', marginTop: '4px', zIndex: 10 }}>
                    {pacientesFiltrados.map(p => (
                      <div 
                        key={p['Código']} 
                        style={{ padding: '12px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => setPacienteSelecionado(p.nNome)}
                      >
                        {p.nNome}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', padding: '12px', borderRadius: '6px' }}>
                <span style={{ color: '#4ade80', fontWeight: 500 }}>{pacienteSelecionado}</span>
                <button onClick={() => setPacienteSelecionado(null)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}>Trocar</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>*Profissional</label>
              <select 
                value={profissional}
                onChange={e => setProfissional(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', appearance: 'none'
                }} 
              >
                <option value="" disabled>Selecione...</option>
                {PROFISSIONAIS_MOCK.map(m => <option key={m.id} value={m.nome} style={{ background: 'var(--bg-secondary)' }}>{m.nome}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>*Modalidade (Atividade)</label>
              <select 
                value={modalidade}
                onChange={e => setModalidade(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', appearance: 'none'
                }} 
              >
                <option value="" disabled>Selecione...</option>
                {MODALIDADES_MOCK.map(m => <option key={m} value={m} style={{ background: 'var(--bg-secondary)' }}>{m}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>*Convênio</label>
              <select 
                value={convenio}
                onChange={e => setConvenio(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', appearance: 'none'
                }} 
              >
                <option value="" disabled>Selecione...</option>
                <option value="Particular" style={{ background: 'var(--bg-secondary)' }}>Particular</option>
                <option value="SUS" style={{ background: 'var(--bg-secondary)' }}>SUS</option>
                <option value="Unimed" style={{ background: 'var(--bg-secondary)' }}>Unimed</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Número da Carteirinha</label>
              <input 
                type="text"
                value={carteirinha}
                onChange={e => setCarteirinha(e.target.value)}
                placeholder="Ex: 001234567890"
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>*Data e Hora da Consulta</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="date"
                  value={data}
                  onChange={e => setData(e.target.value)}
                  style={{ 
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                    padding: '10px 12px', borderRadius: '6px', color: 'white',
                    outline: 'none', fontSize: '0.95rem', width: '60%', boxSizing: 'border-box', colorScheme: 'dark'
                  }} 
                />
                <input 
                  type="time"
                  value={hora}
                  onChange={e => setHora(e.target.value)}
                  style={{ 
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                    padding: '10px 12px', borderRadius: '6px', color: 'white',
                    outline: 'none', fontSize: '0.95rem', width: '40%', boxSizing: 'border-box', colorScheme: 'dark'
                  }} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Status</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box', appearance: 'none'
                }} 
              >
                <option value="Agendado" style={{ background: 'var(--bg-secondary)' }}>Agendado</option>
                <option value="Concluído" style={{ background: 'var(--bg-secondary)' }}>Concluído</option>
                <option value="Cancelado" style={{ background: 'var(--bg-secondary)' }}>Cancelado</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Valor (R$) - Particular</label>
              <input 
                type="number"
                value={valor}
                onChange={e => setValor(e.target.value)}
                placeholder="Ex: 150.00"
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Foto da Carteirinha (Opcional)</label>
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                padding: '10px 12px', borderRadius: '6px', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={18} />
                  <span>carteirinha.jpg</span>
                </div>
                <CheckCircle size={18} color="#4ade80" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Observações (Opcional)</label>
            <textarea 
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Motivo da consulta ou detalhes adicionais..."
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                padding: '10px 12px', 
                borderRadius: '6px',
                color: 'white',
                outline: 'none',
                fontSize: '0.95rem',
                width: '100%',
                boxSizing: 'border-box',
                minHeight: '80px',
                resize: 'none',
                fontFamily: 'inherit'
              }} 
            />
          </div>

        </div>

        <div style={{
          padding: '24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '16px',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <button onClick={onClose} style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500
          }}>
            Cancelar
          </button>
          
          <button 
            onClick={handleSubmit}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              padding: '10px 32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            {initialData ? 'SALVAR ALTERAÇÕES' : 'AGENDAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultaForm;
