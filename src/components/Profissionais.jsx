import React, { useState } from 'react';
import { Search, Plus, UserCircle, Edit2, Trash2 } from 'lucide-react';

const PROFISSIONAIS_MOCK = [
  { id: 1, nome: 'Dr. João Silva', especialidade: 'Clínico Geral', telefone: '(11) 99999-1111', status: 'Ativo' },
  { id: 2, nome: 'Dra. Maria Souza', especialidade: 'Pediatria', telefone: '(11) 98888-2222', status: 'Ativo' },
  { id: 3, nome: 'Dra. Ana Clara', especialidade: 'Psicologia', telefone: '(11) 97777-3333', status: 'Ativo' },
  { id: 4, nome: 'Dr. Roberto Carlos', especialidade: 'Fisioterapia', telefone: '(11) 96666-4444', status: 'Ativo' },
  { id: 5, nome: 'Dra. Silvia Santos', especialidade: 'Fisioterapia', telefone: '(11) 95555-5555', status: 'Ativo' },
];

const Profissionais = () => {
  const [profissionais, setProfissionais] = useState(PROFISSIONAIS_MOCK);
  const [pesquisa, setPesquisa] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [profissionalEmEdicao, setProfissionalEmEdicao] = useState(null);

  const [form, setForm] = useState({ nome: '', especialidade: '', telefone: '', status: 'Ativo' });

  const handleOpenForm = (profissional = null) => {
    if (profissional) {
      setProfissionalEmEdicao(profissional);
      setForm({ ...profissional });
    } else {
      setProfissionalEmEdicao(null);
      setForm({ nome: '', especialidade: '', telefone: '', status: 'Ativo' });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.especialidade) {
      alert("Nome e especialidade são obrigatórios.");
      return;
    }

    if (profissionalEmEdicao) {
      setProfissionais(profissionais.map(p => p.id === form.id ? form : p));
    } else {
      setProfissionais([...profissionais, { ...form, id: Date.now() }]);
    }
    setIsFormOpen(false);
  };

  const handleExcluir = (id) => {
    if (window.confirm("Deseja realmente excluir este profissional?")) {
      setProfissionais(profissionais.filter(p => p.id !== id));
    }
  };

  const profissionaisFiltrados = profissionais.filter(p => 
    p.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
    p.especialidade.toLowerCase().includes(pesquisa.toLowerCase())
  );

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Profissionais</h2>
          <p className="subtitle">Gerencie os profissionais de saúde e parceiros</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar nome ou especialidade..." 
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
            onClick={() => handleOpenForm()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            <Plus size={18} />
            Novo Profissional
          </button>
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Profissional</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Especialidade / Modalidade</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Telefone</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {profissionaisFiltrados.map((prof) => (
                <tr key={prof.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCircle size={24} color="var(--accent-primary)" />
                      </div>
                      <span style={{ fontWeight: 500 }}>{prof.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{prof.especialidade}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{prof.telefone || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem',
                      background: prof.status === 'Ativo' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: prof.status === 'Ativo' ? '#4ade80' : '#f87171'
                    }}>
                      {prof.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleOpenForm(prof)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(prof.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#f87171', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {profissionaisFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhum profissional encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-primary)' }}>
            <h3 style={{ marginBottom: '20px' }}>{profissionalEmEdicao ? 'Editar Profissional' : 'Novo Profissional'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nome Completo</label>
                <input 
                  type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Especialidade / Modalidade</label>
                <input 
                  type="text" placeholder="Ex: Fisioterapia" value={form.especialidade} onChange={e => setForm({...form, especialidade: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Telefone</label>
                <input 
                  type="text" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status</label>
                <select 
                  value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: 'white', boxSizing: 'border-box' }}
                >
                  <option value="Ativo" style={{background: 'var(--bg-secondary)'}}>Ativo</option>
                  <option value="Inativo" style={{background: 'var(--bg-secondary)'}}>Inativo</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleSave} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profissionais;
