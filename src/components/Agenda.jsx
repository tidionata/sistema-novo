import React, { useState } from 'react';
import { Search, Plus, Calendar as CalendarIcon, Clock, User, Activity, X, Edit2, Trash2, CheckCircle, XCircle, FileText, CreditCard } from 'lucide-react';
import ConsultaForm from './ConsultaForm';

// Dados fictícios de consultas
const CONSULTAS_MOCK = [
  { id: 1, data: '2026-08-01', hora: '14:30', paciente: 'MARIA APARECIDA DA SILVA', profissional: 'Dr. João Silva', modalidade: 'Clínico Geral', convenio: 'Particular', carteirinha: '001928374', valor: 150.00, status: 'Agendado', observacoes: 'Primeira consulta de rotina.' },
  { id: 2, data: '2026-08-01', hora: '15:00', paciente: 'JOSE CARLOS SANTOS', profissional: 'Dra. Maria Souza', modalidade: 'Pediatria', convenio: 'Unimed', carteirinha: '883920112', valor: 0.00, status: 'Agendado', observacoes: 'Retorno para avaliação de exames.' },
  { id: 3, data: '2026-08-02', hora: '09:00', paciente: 'ANA JULIA DE SOUZA', profissional: 'Dr. Carlos Almeida', modalidade: 'Ortopedia', convenio: 'SUS', carteirinha: '70451293841', valor: 0.00, status: 'Cancelado', observacoes: 'Paciente solicitou cancelamento por telefone.' },
  { id: 4, data: '2026-08-02', hora: '10:30', paciente: 'ROBERTO ALVES', profissional: 'Dr. João Silva', modalidade: 'Clínico Geral', convenio: 'Particular', carteirinha: '005432198', valor: 150.00, status: 'Concluído', observacoes: 'Consulta realizada normalmente.' }
];

const getStatusColor = (status) => {
  switch(status) {
    case 'Agendado': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' };
    case 'Concluído': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#4ade80' };
    case 'Cancelado': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' };
    default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
  }
};

const formatDateBR = (dataStr) => {
  if (!dataStr) return '-';
  const parts = dataStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dataStr;
};

const Agenda = () => {
  const [consultas, setConsultas] = useState(CONSULTAS_MOCK);
  const [pesquisa, setPesquisa] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [consultaEmEdicao, setConsultaEmEdicao] = useState(null);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  const consultasFiltradas = consultas.filter(c => 
    c.paciente.toLowerCase().includes(pesquisa.toLowerCase()) || 
    c.profissional.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.modalidade.toLowerCase().includes(pesquisa.toLowerCase()) ||
    c.data.includes(pesquisa)
  );

  const handleAlterarStatus = (id, novoStatus) => {
    const atualizadas = consultas.map(c => c.id === id ? { ...c, status: novoStatus } : c);
    setConsultas(atualizadas);
    if (consultaSelecionada && consultaSelecionada.id === id) {
      setConsultaSelecionada({ ...consultaSelecionada, status: novoStatus });
    }
  };

  const handleExcluir = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      setConsultas(consultas.filter(c => c.id !== id));
      setConsultaSelecionada(null);
    }
  };

  const handleEditar = (consulta) => {
    setConsultaSelecionada(null);
    setConsultaEmEdicao(consulta);
    setIsFormOpen(true);
  };

  const handleSaveConsulta = (consultaSalva) => {
    if (consultaEmEdicao) {
      setConsultas(consultas.map(c => c.id === consultaSalva.id ? consultaSalva : c));
    } else {
      setConsultas([consultaSalva, ...consultas]);
    }
    setConsultaEmEdicao(null);
    setIsFormOpen(false);
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Agenda Médica</h2>
          <p className="subtitle">Gerencie as consultas e agendamentos</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar paciente, médico..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                padding: '10px 16px 10px 36px', 
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                width: '300px'
              }} 
            />
          </div>
          
          <button 
            className="action-button primary"
            onClick={() => { setConsultaEmEdicao(null); setIsFormOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={18} />
            Agendar Consulta
          </button>
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Data/Hora</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Paciente</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Profissional / Modalidade</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Convênio / Valor</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', width: '120px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {consultasFiltradas.map((consulta) => {
                const formattedDate = formatDateBR(consulta.data);
                const statusStyle = getStatusColor(consulta.status);

                return (
                  <tr key={consulta.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><CalendarIcon size={14} color="var(--accent-primary)"/> {formattedDate}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}><Clock size={14} /> {consulta.hora}</div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{consulta.paciente}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                          <Activity size={14} color="var(--accent-primary)" />
                          {consulta.profissional}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {consulta.modalidade}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 500 }}>{consulta.convenio}</span>
                        {consulta.convenio === 'Particular' && (
                          <span style={{ color: '#4ade80', fontSize: '0.85rem' }}>R$ {(consulta.valor || 0).toFixed(2).replace('.', ',')}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: statusStyle.bg, 
                        color: statusStyle.text,
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        {consulta.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => setConsultaSelecionada(consulta)}
                        style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }} 
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} 
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {consultasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <CalendarIcon size={48} style={{ opacity: 0.2, marginBottom: '16px', margin: '0 auto', display: 'block' }} />
                    <p>Nenhuma consulta encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ver Detalhes da Consulta */}
      {consultaSelecionada && (() => {
        const statusStyle = getStatusColor(consultaSelecionada.status);
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
              maxWidth: '560px',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              overflow: 'hidden',
              background: 'var(--bg-primary)'
            }}>
              {/* Header */}
              <div style={{
                padding: '24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Detalhes da Consulta</h2>
                    <span style={{ 
                      background: statusStyle.bg, 
                      color: statusStyle.text,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {consultaSelecionada.status}
                    </span>
                  </div>
                  <p className="subtitle" style={{ margin: 0 }}>Agendamento #{consultaSelecionada.id}</p>
                </div>
                <button 
                  onClick={() => setConsultaSelecionada(null)} 
                  style={{
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

              {/* Corpo */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Paciente */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '14px', 
                  background: 'rgba(255,255,255,0.03)', padding: '16px', 
                  borderRadius: '10px', border: '1px solid var(--border-color)' 
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Paciente</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{consultaSelecionada.paciente}</div>
                  </div>
                </div>

                {/* Informações em Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={14} color="var(--accent-primary)" /> Profissional
                    </div>
                    <div style={{ fontWeight: 600 }}>{consultaSelecionada.profissional}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{consultaSelecionada.modalidade}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={14} color="var(--accent-primary)" /> Data e Horário
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatDateBR(consultaSelecionada.data)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>às {consultaSelecionada.hora}</div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={14} color="var(--accent-primary)" /> Convênio / Valor
                    </div>
                    <div style={{ fontWeight: 600 }}>{consultaSelecionada.convenio}</div>
                    <div style={{ fontSize: '0.85rem', color: '#4ade80', marginTop: '2px' }}>
                      {consultaSelecionada.convenio === 'Particular' 
                        ? `R$ ${(consultaSelecionada.valor || 0).toFixed(2).replace('.', ',')}` 
                        : 'Isento / Convênio'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--accent-primary)" /> Nº Carteirinha
                    </div>
                    <div style={{ fontWeight: 600 }}>{consultaSelecionada.carteirinha || 'Não informado'}</div>
                  </div>
                </div>

                {/* Observações */}
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Observações</div>
                  <div style={{ fontSize: '0.95rem', color: consultaSelecionada.observacoes ? 'white' : 'var(--text-secondary)' }}>
                    {consultaSelecionada.observacoes || 'Nenhuma observação registrada para esta consulta.'}
                  </div>
                </div>

                {/* Ações Rápidas de Status */}
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Alterar Status da Consulta</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleAlterarStatus(consultaSelecionada.id, 'Concluído')}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        background: consultaSelecionada.status === 'Concluído' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.1)',
                        color: '#4ade80',
                        border: consultaSelecionada.status === 'Concluído' ? '1px solid #4ade80' : '1px solid rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      <CheckCircle size={16} /> Concluir
                    </button>
                    <button
                      onClick={() => handleAlterarStatus(consultaSelecionada.id, 'Agendado')}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        background: consultaSelecionada.status === 'Agendado' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                        border: consultaSelecionada.status === 'Agendado' ? '1px solid #60a5fa' : '1px solid rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <Clock size={16} /> Agendado
                    </button>
                    <button
                      onClick={() => handleAlterarStatus(consultaSelecionada.id, 'Cancelado')}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                        background: consultaSelecionada.status === 'Cancelado' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.1)',
                        color: '#f87171',
                        border: consultaSelecionada.status === 'Cancelado' ? '1px solid #f87171' : '1px solid rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <XCircle size={16} /> Cancelar
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <button
                  onClick={() => handleExcluir(consultaSelecionada.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={16} /> Excluir
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => handleEditar(consultaSelecionada)}
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit2 size={16} /> Editar
                  </button>
                  <button
                    onClick={() => setConsultaSelecionada(null)}
                    style={{
                      background: 'var(--bg-secondary)',
                      color: 'white',
                      border: '1px solid var(--border-color)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {isFormOpen && (
        <ConsultaForm 
          initialData={consultaEmEdicao}
          onClose={() => { setIsFormOpen(false); setConsultaEmEdicao(null); }}
          onSave={handleSaveConsulta}
        />
      )}
    </div>
  );
};

export default Agenda;
