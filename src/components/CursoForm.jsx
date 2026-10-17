import React, { useState } from 'react';
import { X } from 'lucide-react';

const CursoForm = ({ onClose, onSave, initialData = null }) => {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [categoria, setCategoria] = useState(initialData?.categoria || '');
  const [professor, setProfessor] = useState(initialData?.professor || '');
  const [corSelecionada, setCorSelecionada] = useState(initialData?.cor || '#ec4899');
  const [dias, setDias] = useState(initialData?.horario?.split(' - ')[0] || '');
  const [horaInicio, setHoraInicio] = useState(initialData?.horario?.match(/\d{2}:\d{2}/g)?.[0] || '');
  const [horaFim, setHoraFim] = useState(initialData?.horario?.match(/\d{2}:\d{2}/g)?.[1] || '');
  const [vagas, setVagas] = useState(initialData?.vagas || 30);
  const [status, setStatus] = useState(initialData?.status || 'Ativo');

  const handleSave = () => {
    if (!nome || !categoria || !professor || !dias || !horaInicio || !horaFim) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cursoSalvo = {
      id: initialData?.id || Date.now(),
      nome,
      categoria,
      professor,
      horario: `${dias} - ${horaInicio} às ${horaFim}`,
      inscritos: initialData?.inscritos || 0,
      vagas: parseInt(vagas) || 30,
      status,
      cor: corSelecionada
    };

    onSave(cursoSalvo);
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
            <h2 style={{ fontSize: '1.4rem' }}>{initialData ? 'Editar Curso' : 'Novo Curso / Oficina'}</h2>
            <p className="subtitle">{initialData ? 'Atualize as informações do curso' : 'Cadastre uma nova modalidade ou turma'}</p>
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

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Nome da Atividade</label>
              <input 
                type="text" 
                placeholder="Ex: Natação, Hidroginástica..."
                value={nome}
                onChange={e => setNome(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Categoria (ex: Esporte)</label>
              <input 
                type="text" 
                placeholder="Ex: Esporte, Artesanato..."
                value={categoria}
                onChange={e => setCategoria(e.target.value)}
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
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Professor(a) / Orientador</label>
              <input 
                type="text" 
                placeholder="Nome do professor"
                value={professor}
                onChange={e => setProfessor(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Cor do Tema</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['#ec4899', '#3b82f6', '#eab308', '#10b981', '#f97316', '#a855f7'].map(cor => (
                  <div key={cor} style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: cor, 
                    cursor: 'pointer', border: corSelecionada === cor ? '2px solid white' : '2px solid transparent' 
                  }}
                  onClick={() => setCorSelecionada(cor)}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Dias da Semana</label>
              <input 
                type="text" 
                placeholder="Ex: Segundas e Quartas"
                value={dias}
                onChange={e => setDias(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }} 
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Das</label>
                <input 
                  type="time" 
                  value={horaInicio}
                  onChange={e => setHoraInicio(e.target.value)}
                  style={{ 
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                    padding: '10px 12px', borderRadius: '6px', color: 'white', colorScheme: 'dark',
                    outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                  }} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Às</label>
                <input 
                  type="time" 
                  value={horaFim}
                  onChange={e => setHoraFim(e.target.value)}
                  style={{ 
                    background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                    padding: '10px 12px', borderRadius: '6px', color: 'white', colorScheme: 'dark',
                    outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                  }} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Quantidade de Vagas</label>
              <input 
                type="number" 
                placeholder="Ex: 30"
                value={vagas}
                onChange={e => setVagas(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Status Inicial</label>
              <select 
                value={status}
                onChange={e => setStatus(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', 
                  padding: '10px 12px', borderRadius: '6px', color: 'white', appearance: 'none',
                  outline: 'none', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box'
                }}>
                <option style={{background: 'var(--bg-secondary)'}}>Ativo</option>
                <option style={{background: 'var(--bg-secondary)'}}>Pausado</option>
              </select>
            </div>
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
            onClick={handleSave}
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
            SALVAR CURSO
          </button>
        </div>
      </div>
    </div>
  );
};

export default CursoForm;
