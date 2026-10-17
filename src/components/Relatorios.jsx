import React, { useState } from 'react';
import { BarChart2, DollarSign, Users, Activity, Filter, Search, Calendar, HeartPulse } from 'lucide-react';

const RELATORIOS_MOCK = [
  { id: 1, data: '2026-08-01', paciente: 'MARIA APARECIDA DA SILVA', profissional: 'Dr. João Silva', modalidade: 'Clínico Geral', convenio: 'Particular', valor: 150.00 },
  { id: 2, data: '2026-08-01', paciente: 'JOSE CARLOS SANTOS', profissional: 'Dra. Maria Souza', modalidade: 'Pediatria', convenio: 'SUS', valor: 0.00 },
  { id: 3, data: '2026-08-02', paciente: 'ROBERTO ALVES', profissional: 'Dr. João Silva', modalidade: 'Clínico Geral', convenio: 'Unimed', valor: 80.00 },
  { id: 4, data: '2026-08-03', paciente: 'ANA CLARA', profissional: 'Dr. Roberto Carlos', modalidade: 'Fisioterapia', convenio: 'SUS', valor: 0.00 },
  { id: 5, data: '2026-08-04', paciente: 'CARLOS EDUARDO', profissional: 'Dra. Silvia Santos', modalidade: 'Fisioterapia', convenio: 'Particular', valor: 120.00 },
  { id: 6, data: '2026-08-05', paciente: 'MARCOS VINICIUS', profissional: 'Dra. Ana Clara', modalidade: 'Psicologia', convenio: 'Particular', valor: 180.00 },
  { id: 7, data: '2026-08-06', paciente: 'JULIA FERNANDES', profissional: 'Dr. João Silva', modalidade: 'Clínico Geral', convenio: 'SUS', valor: 0.00 },
];

const PROFISSIONAIS = [...new Set(RELATORIOS_MOCK.map(r => r.profissional))];
const CONVENIOS = [...new Set(RELATORIOS_MOCK.map(r => r.convenio))];

const Relatorios = () => {
  const [filtroProfissional, setFiltroProfissional] = useState('');
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroConvenio, setFiltroConvenio] = useState('');

  const dadosFiltrados = RELATORIOS_MOCK.filter(r => {
    const matchProfissional = filtroProfissional === '' || r.profissional === filtroProfissional;
    const matchConvenio = filtroConvenio === '' || r.convenio === filtroConvenio;
    const matchPaciente = filtroPaciente === '' || r.paciente.toLowerCase().includes(filtroPaciente.toLowerCase());
    return matchProfissional && matchConvenio && matchPaciente;
  });

  const totalArrecadado = dadosFiltrados.reduce((acc, curr) => acc + curr.valor, 0);
  const totalAtendimentos = dadosFiltrados.length;
  
  const atendimentosSUS = dadosFiltrados.filter(r => r.convenio === 'SUS').length;
  const atendimentosParticular = dadosFiltrados.filter(r => r.convenio === 'Particular').length;
  const atendimentosOutros = dadosFiltrados.filter(r => r.convenio !== 'SUS' && r.convenio !== 'Particular').length;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Relatório Geral e Produtividade</h2>
          <p className="subtitle">Filtre atendimentos por profissional, paciente e convênio</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '32px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-secondary)' }}>
          <Filter size={18} />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Filtros</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profissional</label>
            <select 
              value={filtroProfissional} 
              onChange={e => setFiltroProfissional(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
            >
              <option value="" style={{background: 'var(--bg-secondary)'}}>Todos os Profissionais</option>
              {PROFISSIONAIS.map(p => <option key={p} value={p} style={{background: 'var(--bg-secondary)'}}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Convênio / Tipo</label>
            <select 
              value={filtroConvenio} 
              onChange={e => setFiltroConvenio(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white' }}
            >
              <option value="" style={{background: 'var(--bg-secondary)'}}>Todos os Convênios</option>
              {CONVENIOS.map(c => <option key={c} value={c} style={{background: 'var(--bg-secondary)'}}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Paciente</label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Nome do paciente..."
                value={filtroPaciente}
                onChange={e => setFiltroPaciente(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-card stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa'}}><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total Atendimentos</h3>
            <p>{totalAtendimentos}</p>
          </div>
        </div>
        <div className="glass-card stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="stat-icon" style={{background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc'}}><HeartPulse size={24} /></div>
          <div className="stat-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '4px' }}>Por Tipo</h3>
            <div style={{ fontSize: '0.9rem', display: 'flex', gap: '12px' }}>
              <span style={{ color: '#4ade80' }}>SUS: <b>{atendimentosSUS}</b></span>
              <span style={{ color: '#60a5fa' }}>Part: <b>{atendimentosParticular}</b></span>
              <span style={{ color: '#f87171' }}>Outros: <b>{atendimentosOutros}</b></span>
            </div>
          </div>
        </div>
        <div className="glass-card stat-card" style={{ gridColumn: 'span 1' }}>
          <div className="stat-icon" style={{background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80'}}><DollarSign size={24} /></div>
          <div className="stat-info">
            <h3>Faturamento Ref.</h3>
            <p>R$ {totalArrecadado.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={20} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Lista de Atendimentos ({dadosFiltrados.length})</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Data</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Paciente</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Profissional / Modalidade</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Convênio</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px' }}>{r.data.split('-').reverse().join('/')}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{r.paciente}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span>{r.profissional}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.modalidade}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem',
                      background: r.convenio === 'SUS' ? 'rgba(59, 130, 246, 0.2)' : r.convenio === 'Particular' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: r.convenio === 'SUS' ? '#60a5fa' : r.convenio === 'Particular' ? '#4ade80' : '#fbbf24'
                    }}>
                      {r.convenio}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#4ade80', fontWeight: 500 }}>
                    R$ {r.valor.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
              {dadosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhum atendimento encontrado para os filtros selecionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Relatorios;
