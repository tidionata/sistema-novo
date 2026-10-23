import React, { useState, useEffect } from 'react';
import { X, Search, User, Trash2, Plus, Check, CheckCircle, AlertCircle } from 'lucide-react';
import { sociosService, cursosService } from '../lib/supabase';
import initialSocios from '../socios.json';

const TurmaModal = ({ curso, onClose, onUpdateCurso }) => {
  const [sociosList, setSociosList] = useState(initialSocios);
  const [pesquisa, setPesquisa] = useState('');
  const [isMatriculando, setIsMatriculando] = useState(false);
  const [pesquisaSocio, setPesquisaSocio] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Inicializa a lista de alunos com turmas já salvas ou mock inicial
  const [alunos, setAlunos] = useState(() => {
    if (Array.isArray(curso.turmas) && curso.turmas.length > 0) {
      return curso.turmas;
    }
    return [];
  });

  useEffect(() => {
    sociosService.getAll().then(data => {
      if (data && data.length > 0) {
        setSociosList(data);
        // Se ainda não tinha alunos cadastrados no curso, inicializa com sócios existentes
        if ((!curso.turmas || curso.turmas.length === 0) && alunos.length === 0) {
          const inicial = data.slice(0, curso.inscritos || 5).map(s => ({
            id: s['Código'] || s.id,
            nome: s.nNome || s.nome,
            cpf: s.CPF || s.cpf || '',
            matricula: `2026${String(s['Código'] || s.id || 1).padStart(4, '0')}`,
            dataMatricula: '15/07/2026'
          }));
          setAlunos(inicial);
        }
      }
    });
  }, [curso]);

  // Alunos filtrados na tabela
  const alunosFiltrados = alunos.filter(a => 
    (a.nome || '').toLowerCase().includes(pesquisa.toLowerCase()) || 
    (a.matricula || '').includes(pesquisa)
  );

  // Sócios disponíveis para matrícula (que ainda não estão na turma)
  const idsJaMatriculados = new Set(alunos.map(a => Number(a.id)));
  const sociosDisponiveis = sociosList.filter(s => {
    const idSocio = Number(s['Código'] || s.id);
    if (idsJaMatriculados.has(idSocio)) return false;
    const nome = (s.nNome || s.nome || '').toLowerCase();
    const cpf = (s.CPF || s.cpf || '').toLowerCase();
    const termo = pesquisaSocio.toLowerCase();
    return nome.includes(termo) || cpf.includes(termo);
  });

  const vagasLivres = Math.max(0, (curso.vagas || 30) - alunos.length);

  // Efetivar matrícula de um sócio
  const handleEfetivarMatricula = async (socio) => {
    if (vagasLivres <= 0) {
      alert('Esta turma já atingiu o limite de vagas!');
      return;
    }

    const novoAluno = {
      id: socio['Código'] || socio.id || Date.now(),
      nome: socio.nNome || socio.nome,
      cpf: socio.CPF || socio.cpf || '',
      matricula: `2026${String(socio['Código'] || socio.id || Math.floor(Math.random() * 9000 + 1000)).padStart(4, '0')}`,
      dataMatricula: new Date().toLocaleDateString('pt-BR')
    };

    const novosAlunos = [novoAluno, ...alunos];
    setAlunos(novosAlunos);

    const cursoAtualizado = {
      ...curso,
      inscritos: novosAlunos.length,
      turmas: novosAlunos
    };

    await cursosService.save(cursoAtualizado);
    if (onUpdateCurso) onUpdateCurso(cursoAtualizado);

    setMensagemSucesso(`Aluno(a) ${novoAluno.nome} matriculado(a) com sucesso!`);
    setTimeout(() => setMensagemSucesso(''), 3500);
    setPesquisaSocio('');
  };

  // Remover aluno da turma
  const handleRemoverAluno = async (alunoId) => {
    const aluno = alunos.find(a => a.id === alunoId);
    if (!window.confirm(`Deseja realmente remover o aluno(a) ${aluno?.nome || ''} desta turma?`)) {
      return;
    }

    const novosAlunos = alunos.filter(a => a.id !== alunoId);
    setAlunos(novosAlunos);

    const cursoAtualizado = {
      ...curso,
      inscritos: novosAlunos.length,
      turmas: novosAlunos
    };

    await cursosService.save(cursoAtualizado);
    if (onUpdateCurso) onUpdateCurso(cursoAtualizado);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${curso.cor || '#ec4899'}22 0%, rgba(0,0,0,0) 100%)`
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: curso.cor || '#ec4899', boxShadow: `0 0 10px ${curso.cor || '#ec4899'}` }}></div>
              <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Turma: {curso.nome}</h2>
            </div>
            <p className="subtitle" style={{ margin: 0, paddingLeft: '26px' }}>Professor(a): {curso.professor} • {curso.horario}</p>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Mensagem de Feedback */}
        {mensagemSucesso && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#4ade80',
            padding: '12px 24px',
            fontSize: '0.9rem',
            borderBottom: '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle size={18} />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* Painel Expansível de Matrícula de Novo Aluno */}
        {isMatriculando && (
          <div style={{
            padding: '20px 24px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} style={{ color: '#818cf8' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#818cf8', fontWeight: 600 }}>
                  Matricular Sócio na Turma
                </h4>
              </div>
              <button 
                onClick={() => setIsMatriculando(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Fechar busca ✕
              </button>
            </div>
            
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Buscar sócio por nome ou CPF..."
                value={pesquisaSocio}
                onChange={(e) => setPesquisaSocio(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 16px 9px 38px',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Lista de Sócios Disponíveis */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sociosDisponiveis.slice(0, 6).map(socio => (
                <div key={socio['Código'] || socio.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white' }}>{socio.nNome || socio.nome}</span>
                    <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      CPF: {socio.CPF || socio.cpf || 'Não informado'} • Cód: #{socio['Código'] || socio.id}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEfetivarMatricula(socio)}
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-primary)'}
                  >
                    <Check size={14} /> Matricular
                  </button>
                </div>
              ))}
              {sociosDisponiveis.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '16px 0' }}>
                  {pesquisaSocio ? 'Nenhum sócio encontrado com esse termo.' : 'Todos os sócios disponíveis já estão matriculados nesta turma.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar aluno na turma..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ 
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                padding: '8px 16px 8px 36px', 
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                width: '300px',
                fontSize: '0.9rem'
              }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Total: <strong style={{ color: 'white' }}>{alunos.length}</strong> alunos</span>
            <span>Vagas Livres: <strong style={{ color: vagasLivres > 0 ? '#4ade80' : '#f87171' }}>{vagasLivres}</strong></span>
          </div>
        </div>

        {/* Lista de Alunos Matriculados */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0', minHeight: '260px' }}>
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
                    <button 
                      onClick={() => handleRemoverAluno(aluno.id)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '6px', borderRadius: '4px' }} 
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} 
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'} 
                      title="Remover da Turma"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {alunosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <User size={48} style={{ opacity: 0.2, marginBottom: '16px', margin: '0 auto', display: 'block' }} />
                    <p style={{ margin: '0 0 12px 0' }}>Nenhum aluno encontrado.</p>
                    <button
                      onClick={() => setIsMatriculando(true)}
                      style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 18px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      Matricular Primeiro Aluno
                    </button>
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
          <button 
            onClick={() => setIsMatriculando(!isMatriculando)}
            disabled={vagasLivres <= 0 && !isMatriculando}
            style={{
              background: isMatriculando ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: vagasLivres > 0 || isMatriculando ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: `1px solid ${vagasLivres > 0 || isMatriculando ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: vagasLivres > 0 || isMatriculando ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              if (vagasLivres > 0 || isMatriculando) e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = isMatriculando ? 'rgba(99, 102, 241, 0.2)' : 'transparent';
            }}
          >
            <User size={18} />
            {isMatriculando ? 'Fechar Painel de Matrícula' : vagasLivres <= 0 ? 'Turma Lotada' : 'Matricular Novo Aluno'}
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
