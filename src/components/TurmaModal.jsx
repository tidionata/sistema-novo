import React, { useState } from 'react';
import { X, Search, User, Trash2 } from 'lucide-react';
import sociosData from '../socios.json';

const TurmaModal = ({ curso, onClose }) => {
  const [pesquisa, setPesquisa] = useState('');
  
  // Como não temos a ligação real, vamos mockar alguns alunos pegando nomes aleatórios dos sócios
  // Para demonstração, pegamos 5 sócios aleatórios como alunos dessa turma
  const alunosTurma = sociosData.slice(0, curso.inscritos || 5).map(s => ({
    id: s['Código'],
    nome: s.nNome,
    matricula: `2026${s['Código'].toString().padStart(4, '0')}`,
    dataMatricula: '15/07/2026'
  }));

  const alunosFiltrados = alunosTurma.filter(a => 
    a.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
    a.matricula.includes(pesquisa)
  );

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
        maxWidth: '800px',
        maxHeight: '90vh',
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
          alignItems: 'center',
          background: `linear-gradient(135deg, ${curso.cor}22 0%, rgba(0,0,0,0) 100%)`
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: curso.cor }}></div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Turma: {curso.nome}</h2>
            </div>
            <p className="subtitle" style={{ margin: 0, paddingLeft: '24px' }}>Professor(a): {curso.professor} • {curso.horario}</p>
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

        {/* Toolbar */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar aluno..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                padding: '8px 16px 8px 36px', 
                borderRadius: '6px',
                color: 'white',
                outline: 'none',
                width: '300px',
                fontSize: '0.9rem'
              }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Total: <strong>{alunosTurma.length}</strong> alunos</span>
            <span>Vagas Livres: <strong>{curso.vagas - alunosTurma.length}</strong></span>
          </div>
        </div>

        {/* Lista de Alunos */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Aluno</th>
                <th style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Matrícula</th>
                <th style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>Data Matrícula</th>
                <th style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', width: '80px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunosFiltrados.map((aluno) => (
                <tr key={aluno.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: 500 }}>{aluno.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{aluno.matricula}</td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-secondary)' }}>{aluno.dataMatricula}</td>
                  <td style={{ padding: '12px 24px', textAlign: 'center' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} title="Remover da Turma">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {alunosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <User size={48} style={{ opacity: 0.2, marginBottom: '16px', margin: '0 auto', display: 'block' }} />
                    <p>Nenhum aluno encontrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
          <button style={{
            background: 'transparent',
            color: 'var(--accent-primary)',
            border: '1px solid var(--accent-primary)',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <User size={18} />
            Matricular Novo Aluno
          </button>
          
          <button onClick={onClose} style={{
            background: 'var(--bg-secondary)',
            color: 'white',
            border: '1px solid var(--border-color)',
            padding: '10px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500
          }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurmaModal;
