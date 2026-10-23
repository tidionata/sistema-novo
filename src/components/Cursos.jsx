import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Users, Clock, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import TurmaModal from './TurmaModal';
import CursoForm from './CursoForm';
import { cursosService } from '../lib/supabase';

// Dados fictícios de cursos
const CURSOS_MOCK = [
  { 
    id: 1, 
    nome: 'Corte e Costura', 
    categoria: 'Artesanato e Ofícios',
    professor: 'Maria Joaquina', 
    horario: 'Seg/Qua - 14:00 às 16:00',
    inscritos: 24,
    vagas: 30,
    status: 'Ativo',
    cor: '#ec4899' // Rosa
  },
  { 
    id: 2, 
    nome: 'Informática Básica', 
    categoria: 'Educação e Tecnologia',
    professor: 'Carlos Eduardo', 
    horario: 'Ter/Qui - 09:00 às 11:00',
    inscritos: 15,
    vagas: 20,
    status: 'Ativo',
    cor: '#3b82f6' // Azul
  },
  { 
    id: 3, 
    nome: 'Natação', 
    categoria: 'Esporte',
    professor: 'Ana Clara', 
    horario: 'Sexta - 14:00 às 17:00',
    inscritos: 30,
    vagas: 30,
    status: 'Lotado',
    cor: '#eab308' // Amarelo
  },
  { 
    id: 4, 
    nome: 'Inglês Instrumental', 
    categoria: 'Educação e Tecnologia',
    professor: 'Roberto Carlos', 
    horario: 'Seg/Qua - 19:00 às 20:30',
    inscritos: 12,
    vagas: 25,
    status: 'Ativo',
    cor: '#10b981' // Verde
  },
  { 
    id: 5, 
    nome: 'Hidroginástica', 
    categoria: 'Esporte',
    professor: 'Dona Benta', 
    horario: 'Sábado - 09:00 às 12:00',
    inscritos: 8,
    vagas: 15,
    status: 'Pausado',
    cor: '#f97316' // Laranja
  },
  { id: 6, nome: 'Psicologia', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' },
  { id: 7, nome: 'Psicopedagogia', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' },
  { id: 8, nome: 'Neuropsicologia', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' },
  { id: 9, nome: 'Fisioterapia', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' },
  { id: 10, nome: 'Clínico Geral', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' },
  { id: 11, nome: 'Ortopedia', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' },
  { id: 12, nome: 'Pediatria', categoria: 'Saúde', professor: 'A definir', horario: 'A definir', inscritos: 0, vagas: 20, status: 'Ativo', cor: '#06b6d4' }
];

const getStatusColor = (status) => {
  switch(status) {
    case 'Ativo': return { bg: 'rgba(34, 197, 94, 0.2)', text: '#4ade80' };
    case 'Lotado': return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171' };
    case 'Pausado': return { bg: 'rgba(156, 163, 175, 0.2)', text: '#9ca3af' };
    default: return { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
  }
};

const Cursos = () => {
  const [pesquisa, setPesquisa] = useState('');
  const [cursoSelecionado, setCursoSelecionado] = useState(null);
  const [cursoEmEdicao, setCursoEmEdicao] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cursos, setCursos] = useState(CURSOS_MOCK);
  const [menuAbertoId, setMenuAbertoId] = useState(null);

  useEffect(() => {
    cursosService.getAll().then(data => {
      if (data && data.length > 0) {
        setCursos(data);
      }
    });
  }, []);

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    if (menuAbertoId === id) {
      setMenuAbertoId(null);
    } else {
      setMenuAbertoId(id);
    }
  };

  const handleDuplicar = async (curso) => {
    const novoCurso = { ...curso, id: undefined, nome: `${curso.nome} (Cópia)`, inscritos: 0 };
    const salvo = await cursosService.save(novoCurso);
    setCursos([salvo, ...cursos]);
    setMenuAbertoId(null);
  };

  const handleExcluir = async (id) => {
    if(window.confirm('Tem certeza que deseja excluir este curso?')) {
      await cursosService.delete(id);
      setCursos(cursos.filter(c => c.id !== id));
    }
    setMenuAbertoId(null);
  };

  const handleAlterarStatus = async (id, novoStatus) => {
    const alvo = cursos.find(c => c.id === id);
    if (alvo) {
      await cursosService.save({ ...alvo, status: novoStatus });
    }
    setCursos(cursos.map(c => c.id === id ? { ...c, status: novoStatus } : c));
    setMenuAbertoId(null);
  };

  const handleImprimirLista = (curso) => {
    alert(`Gerando lista de presença para o curso: ${curso.nome}... (Esta função abrirá um PDF para impressão no futuro)`);
    setMenuAbertoId(null);
  };

  const cursosFiltrados = cursos.filter(c => 
    c.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
    c.professor.toLowerCase().includes(pesquisa.toLowerCase()) ||
    (c.categoria || '').toLowerCase().includes(pesquisa.toLowerCase())
  );

  const categoriasUnicas = [...new Set(cursosFiltrados.map(c => c.categoria || 'Outros'))].sort();

  return (
    <div className="page-content" onClick={() => setMenuAbertoId(null)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Atividades</h2>
          <p className="subtitle">Gerencie as atividades, esportes e cursos oferecidos</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar curso ou professor..." 
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
            onClick={() => { setCursoEmEdicao(null); setIsFormOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={18} />
            Nova Atividade
          </button>
        </div>
      </div>
      
      {/* Grid de Cursos por Categoria */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {categoriasUnicas.map(categoria => (
          <div key={categoria}>
            <h3 style={{ 
              fontSize: '1.4rem', 
              color: 'var(--text-primary)', 
              marginBottom: '20px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ width: 8, height: 24, background: 'var(--accent-primary)', borderRadius: 4 }}></div>
              {categoria}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {cursosFiltrados.filter(c => (c.categoria || 'Outros') === categoria).map(curso => {
                const statusStyle = getStatusColor(curso.status);
                const percentualVagas = Math.round((curso.inscritos / curso.vagas) * 100);
          
          return (
            <div key={curso.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Header do Card com a cor tema do curso */}
              <div style={{ height: '80px', background: `linear-gradient(135deg, ${curso.cor}88 0%, rgba(0,0,0,0) 100%)`, position: 'relative', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', background: curso.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  <BookOpen size={24} color="white" />
                </div>
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <button 
                    onClick={(e) => toggleMenu(curso.id, e)}
                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={20} />
                  </button>
                  
                  {menuAbertoId === curso.id && (
                    <div style={{ 
                      position: 'absolute', top: '100%', right: 0, 
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', 
                      borderRadius: '8px', padding: '8px', minWidth: '200px', 
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10 
                    }}>
                      <button onClick={() => handleAlterarStatus(curso.id, curso.status === 'Ativo' ? 'Pausado' : 'Ativo')} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'white', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {curso.status === 'Ativo' ? 'Pausar Curso' : 'Ativar Curso'}
                      </button>
                      <button onClick={() => handleImprimirLista(curso)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'white', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Imprimir Lista
                      </button>
                      <button onClick={() => handleDuplicar(curso)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: 'white', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Duplicar Curso
                      </button>
                      <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                      <button onClick={() => handleExcluir(curso.id)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#f87171', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        Excluir Curso
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Corpo do Card */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{curso.nome}</h3>
                  <span style={{ 
                    background: statusStyle.bg, 
                    color: statusStyle.text,
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {curso.status}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> Prof. {curso.professor}
                </p>

                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <Calendar size={14} color="var(--accent-primary)" />
                    {curso.horario.split(' - ')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Clock size={14} color="var(--accent-primary)" />
                    {curso.horario.split(' - ')[1]}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Vagas ocupadas</span>
                    <span style={{ fontWeight: 600 }}>{curso.inscritos} / {curso.vagas}</span>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${percentualVagas}%`, 
                      background: curso.status === 'Lotado' ? '#f87171' : 'var(--accent-primary)',
                      borderRadius: '3px'
                    }}></div>
                  </div>
                </div>
                
              </div>
              
              {/* Rodapé do Card */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setCursoSelecionado(curso)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} 
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Ver Turma
                </button>
                <button 
                  onClick={() => { setCursoEmEdicao(curso); setIsFormOpen(true); }}
                  style={{ width: '36px', height: '36px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} 
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
            </div>
          </div>
        ))}
      </div>
      
      {cursosFiltrados.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '16px', margin: '0 auto', display: 'block' }} />
          <p>Nenhum curso encontrado com esse nome.</p>
        </div>
      )}

      {cursoSelecionado && (
        <TurmaModal 
          curso={cursoSelecionado} 
          onClose={() => setCursoSelecionado(null)} 
          onUpdateCurso={(cursoAtualizado) => {
            setCursos(cursos.map(c => c.id === cursoAtualizado.id ? cursoAtualizado : c));
            setCursoSelecionado(cursoAtualizado);
          }}
        />
      )}

      {isFormOpen && (
        <CursoForm 
          initialData={cursoEmEdicao}
          onClose={() => setIsFormOpen(false)} 
          onSave={async (cursoSalvo) => {
            const salvo = await cursosService.save(cursoSalvo);
            if (cursoEmEdicao) {
              setCursos(cursos.map(c => c.id === cursoSalvo.id ? salvo : c));
            } else {
              setCursos([salvo, ...cursos]);
            }
            setIsFormOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Cursos;
