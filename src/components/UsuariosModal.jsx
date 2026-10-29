import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, Stethoscope, DollarSign, X, Check, AlertCircle } from 'lucide-react';
import { usuariosService, profissionaisService } from '../lib/supabase';

const UsuariosModal = ({ isOpen, onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modoCriar, setModoCriar] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'medico',
    especialidade: '',
    telefone: ''
  });

  const carregar = async () => {
    setLoading(true);
    try {
      const u = await usuariosService.getAll();
      setUsuarios(u || []);
      const p = await profissionaisService.getAll();
      setProfissionais(p || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregar();
      setModoCriar(false);
      setFeedback(null);
    }
  }, [isOpen]);

  const handleCriar = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) {
      setFeedback({ type: 'error', text: 'Nome, e-mail e senha são obrigatórios!' });
      return;
    }

    try {
      await usuariosService.create(form);
      setFeedback({ type: 'success', text: 'Conta salva com sucesso no banco de dados!' });
      setForm({ nome: '', email: '', senha: '', cargo: 'medico', especialidade: '', telefone: '' });
      setModoCriar(false);
      await carregar();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Erro ao salvar usuário: ' + err.message });
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta de usuário?')) {
      await usuariosService.delete(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '750px',
        maxHeight: '85vh',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Gerenciamento de Contas & Usuários</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Contas com permissão de login no banco de dados Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div style={{
            padding: '12px 24px',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: feedback.type === 'success' ? '#4ade80' : '#f87171',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Total de Contas: <strong style={{ color: 'white' }}>{usuarios.length}</strong>
            </span>
            <button
              onClick={() => setModoCriar(!modoCriar)}
              style={{
                background: modoCriar ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                color: 'white',
                border: '1px solid var(--border-color)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {modoCriar ? 'Cancelar' : <><Plus size={16} /> Criar Nova Conta</>}
            </button>
          </div>

          {/* Form de Criação */}
          {modoCriar && (
            <form onSubmit={handleCriar} style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Cadastrar Nova Conta no Banco</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nome Completo:</label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Dra. Camila Ramos"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>E-mail / Login:</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="exemplo@boasnovas.com"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Senha de Acesso:</label>
                  <input
                    type="password"
                    required
                    value={form.senha}
                    onChange={e => setForm({ ...form, senha: e.target.value })}
                    placeholder="••••••"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tipo de Acesso (Cargo):</label>
                  <select
                    value={form.cargo}
                    onChange={e => setForm({ ...form, cargo: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'white', outline: 'none' }}
                  >
                    <option value="medico" style={{ background: '#1a1d24' }}>🩺 Médico / Especialista</option>
                    <option value="financeiro" style={{ background: '#1a1d24' }}>💰 Financeiro</option>
                    <option value="admin" style={{ background: '#1a1d24' }}>👑 Administrador Geral</option>
                  </select>
                </div>
              </div>

              {form.cargo === 'medico' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Especialidade Médica:</label>
                    <input
                      type="text"
                      value={form.especialidade}
                      onChange={e => setForm({ ...form, especialidade: e.target.value })}
                      placeholder="Ex: Cardiologia, Pediatria..."
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'white', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Telefone / WhatsApp:</label>
                    <input
                      type="text"
                      value={form.telefone}
                      onChange={e => setForm({ ...form, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '6px', color: 'white', outline: 'none' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  Salvar Conta no Banco
                </button>
              </div>
            </form>
          )}

          {/* Tabela de Contas Existentes */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <th style={{ padding: '10px 12px' }}>USUÁRIO</th>
                <th style={{ padding: '10px 12px' }}>E-MAIL</th>
                <th style={{ padding: '10px 12px' }}>CARGO / PAINEL</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => {
                const isAdmin = u.cargo === 'admin';
                const isMedico = u.cargo === 'medico';
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'white' }}>{u.nome}</div>
                      {u.especialidade && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.especialidade}</div>}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: isAdmin ? 'rgba(234, 179, 8, 0.15)' : isMedico ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isAdmin ? '#facc15' : isMedico ? '#818cf8' : '#34d399',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {isAdmin ? 'Administrador' : isMedico ? 'Médico' : 'Financeiro'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {u.id !== 1 && (
                        <button
                          onClick={() => handleExcluir(u.id)}
                          title="Excluir conta"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f87171',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              padding: '8px 20px',
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
  );
};

export default UsuariosModal;
