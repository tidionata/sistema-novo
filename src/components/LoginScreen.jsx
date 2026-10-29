import React, { useState } from 'react';
import { Shield, Stethoscope, DollarSign, UserCheck, CheckCircle2, Lock, Mail, User, Phone, Sparkles, ArrowRight } from 'lucide-react';
import { usuariosService } from '../lib/supabase';

const LoginScreen = ({ onLoginSuccess }) => {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');

  // Cadastro form
  const [cadNome, setCadNome] = useState('');
  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadCargo, setCadCargo] = useState('medico'); // 'admin' | 'medico' | 'financeiro'
  const [cadEspecialidade, setCadEspecialidade] = useState('');
  const [cadTelefone, setCadTelefone] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const res = await usuariosService.authenticate(loginEmail, loginSenha);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErro(res.message || 'Credenciais inválidas. Verifique seu login e senha.');
      }
    } catch (err) {
      setErro('Erro ao autenticar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastroSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!cadNome.trim() || !cadEmail.trim() || !cadSenha.trim()) {
      setErro('Preencha todos os campos obrigatórios (Nome, E-mail e Senha).');
      return;
    }

    setLoading(true);
    try {
      const novoUsuario = await usuariosService.create({
        nome: cadNome,
        email: cadEmail,
        senha: cadSenha,
        cargo: cadCargo,
        especialidade: cadCargo === 'medico' ? (cadEspecialidade || 'Clínico Geral') : null,
        telefone: cadTelefone || null
      });

      setSucesso('Conta criada e salva no banco de dados com sucesso! Você já pode entrar.');
      
      // Imediatamente loga o novo usuário no sistema
      setTimeout(() => {
        onLoginSuccess(novoUsuario);
      }, 1200);

    } catch (err) {
      setErro('Erro ao criar conta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Login rápido para testes imediatos
  const handleAcessoRapido = async (email, senha) => {
    setLoading(true);
    const res = await usuariosService.authenticate(email, senha);
    if (res.success) {
      onLoginSuccess(res.user);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.15) 0%, rgba(15, 17, 21, 1) 90%)',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div className="glass-card" style={{ 
        width: '100%',
        maxWidth: '480px', 
        padding: '36px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        
        {/* LOGO E TÍTULO */}
        <div style={{ 
          width: 60, 
          height: 60, 
          borderRadius: 16, 
          background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '16px', 
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)' 
        }}>
          <span style={{ fontWeight: 'bold', color: 'white', fontSize: '1.8rem' }}>A</span>
        </div>
        <h2 style={{ marginBottom: '6px', textAlign: 'center', fontWeight: 700 }}>Associação Boas Novas</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          Sistema Integrado de Gestão, Consultório & Financeiro
        </p>

        {/* SELETOR DE ABA: ENTRAR OU CRIAR CONTA */}
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '4px', 
          borderRadius: '10px', 
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setModo('login'); setErro(''); setSucesso(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: modo === 'login' ? 'var(--accent-primary)' : 'transparent',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Acessar Sistema
          </button>
          <button
            type="button"
            onClick={() => { setModo('cadastro'); setErro(''); setSucesso(''); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: modo === 'cadastro' ? 'var(--accent-primary)' : 'transparent',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Criar Nova Conta
          </button>
        </div>

        {/* FEEDBACKS */}
        {erro && (
          <div style={{ 
            width: '100%',
            padding: '12px', 
            background: 'rgba(239, 68, 68, 0.15)', 
            color: '#f87171', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            textAlign: 'center', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '16px'
          }}>
            {erro}
          </div>
        )}

        {sucesso && (
          <div style={{ 
            width: '100%',
            padding: '12px', 
            background: 'rgba(34, 197, 94, 0.15)', 
            color: '#4ade80', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            textAlign: 'center', 
            border: '1px solid rgba(34, 197, 94, 0.3)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            {sucesso}
          </div>
        )}

        {/* ========================================= */}
        {/* FORMULÁRIO DE LOGIN */}
        {/* ========================================= */}
        {modo === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                E-mail ou Nome:
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@boasnovas.com ou dr.joao"
                  required
                  style={{ 
                    width: '100%',
                    background: 'rgba(0,0,0,0.25)', 
                    border: '1px solid var(--border-color)', 
                    padding: '12px 14px 12px 38px', 
                    borderRadius: '8px', 
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                Senha de Acesso:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ 
                    width: '100%',
                    background: 'rgba(0,0,0,0.25)', 
                    border: '1px solid var(--border-color)', 
                    padding: '12px 14px 12px 38px', 
                    borderRadius: '8px', 
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }} 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                marginTop: '6px',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Entrando...' : <>ENTRAR NO SISTEMA <ArrowRight size={18} /></>}
            </button>

            {/* ATALHOS RÁPIDOS DE LOGIN */}
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', width: '100%' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px', textAlign: 'center' }}>
                ACESSO RÁPIDO PARA TESTES:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleAcessoRapido('admin@boasnovas.com', '784912')}
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#facc15',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  👑 Admin Geral
                </button>

                <button
                  type="button"
                  onClick={() => handleAcessoRapido('joao.silva@boasnovas.com', '123456')}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#818cf8',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🩺 Dr. João Silva
                </button>

                <button
                  type="button"
                  onClick={() => handleAcessoRapido('maria.souza@boasnovas.com', '123456')}
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#818cf8',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🩺 Dra. Maria Souza
                </button>

                <button
                  type="button"
                  onClick={() => handleAcessoRapido('financeiro@boasnovas.com', '123456')}
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#34d399',
                    padding: '8px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  💰 Financeiro
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================= */}
        {/* FORMULÁRIO DE CADASTRO / CRIAR CONTA */}
        {/* ========================================= */}
        {modo === 'cadastro' && (
          <form onSubmit={handleCadastroSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Nome Completo:
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  value={cadNome}
                  onChange={(e) => setCadNome(e.target.value)}
                  placeholder="Ex: Dr. Lucas Mendes"
                  required
                  style={{ 
                    width: '100%',
                    background: 'rgba(0,0,0,0.25)', 
                    border: '1px solid var(--border-color)', 
                    padding: '10px 14px 10px 38px', 
                    borderRadius: '8px', 
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                E-mail de Login:
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                <input 
                  type="email" 
                  value={cadEmail}
                  onChange={(e) => setCadEmail(e.target.value)}
                  placeholder="lucas@boasnovas.com"
                  required
                  style={{ 
                    width: '100%',
                    background: 'rgba(0,0,0,0.25)', 
                    border: '1px solid var(--border-color)', 
                    padding: '10px 14px 10px 38px', 
                    borderRadius: '8px', 
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Senha de Acesso:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                <input 
                  type="password" 
                  value={cadSenha}
                  onChange={(e) => setCadSenha(e.target.value)}
                  placeholder="Crie sua senha segura"
                  required
                  style={{ 
                    width: '100%',
                    background: 'rgba(0,0,0,0.25)', 
                    border: '1px solid var(--border-color)', 
                    padding: '10px 14px 10px 38px', 
                    borderRadius: '8px', 
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Tipo de Acesso (Cargo):
              </label>
              <select
                value={cadCargo}
                onChange={(e) => setCadCargo(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              >
                <option value="medico" style={{ background: '#1a1d24' }}>🩺 Médico / Especialista</option>
                <option value="financeiro" style={{ background: '#1a1d24' }}>💰 Financeiro</option>
                <option value="admin" style={{ background: '#1a1d24' }}>👑 Administrador Geral</option>
              </select>
            </div>

            {cadCargo === 'medico' && (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Especialidade Médica:
                  </label>
                  <input 
                    type="text" 
                    value={cadEspecialidade}
                    onChange={(e) => setCadEspecialidade(e.target.value)}
                    placeholder="Ex: Clínico Geral, Cardiologia, Pediatria..."
                    style={{ 
                      width: '100%',
                      background: 'rgba(0,0,0,0.25)', 
                      border: '1px solid var(--border-color)', 
                      padding: '10px 14px', 
                      borderRadius: '8px', 
                      color: 'white',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }} 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Telefone de Contato:
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      value={cadTelefone}
                      onChange={(e) => setCadTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      style={{ 
                        width: '100%',
                        background: 'rgba(0,0,0,0.25)', 
                        border: '1px solid var(--border-color)', 
                        padding: '10px 14px 10px 38px', 
                        borderRadius: '8px', 
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.9rem'
                      }} 
                    />
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '1rem',
                marginTop: '8px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Salvando no banco...' : 'CRIAR CONTA & ENTRAR'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default LoginScreen;
