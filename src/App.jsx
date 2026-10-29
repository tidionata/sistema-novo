import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, BookOpen, Settings, Bell, 
  Search, Menu, Plus, Calendar, BarChart2, UserCircle, Database, 
  Trash2, Stethoscope, Shield, LogOut, KeyRound, CheckCircle2 
} from 'lucide-react';

import SocioForm from './components/SocioForm';
import Agenda from './components/Agenda';
import Cursos from './components/Cursos';
import Profissionais from './components/Profissionais';
import Relatorios from './components/Relatorios';
import DatabaseStatusModal from './components/DatabaseStatusModal';
import PainelMedico from './components/PainelMedico';
import PainelFinanceiro from './components/PainelFinanceiro';
import UsuariosModal from './components/UsuariosModal';
import LoginScreen from './components/LoginScreen';

import { sociosService, checkDatabaseStatus } from './lib/supabase';
import initialSocios from './socios.json';
import './index.css';

// ==========================================
// PÁGINA: DASHBOARD (ADMINISTRADOR)
// ==========================================
const Dashboard = () => {
  const [totalSocios, setTotalSocios] = useState(initialSocios.length);

  useEffect(() => {
    sociosService.getAll().then(data => {
      if (data && data.length > 0) setTotalSocios(data.length);
    });
  }, []);

  return (
    <div className="page-content">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Visão Geral • Administração</h2>
        <p className="subtitle">Painel de controle central da Associação Boas Novas</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total de Sócios</h3>
            <p>{totalSocios}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <CreditCard size={24} />
          </div>
          <div className="stat-info">
            <h3>Arrecadação Mensal</h3>
            <p>R$ 15.430,00</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>Atividades Ativas</h3>
            <p>12</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PÁGINA: CADASTROS DE SÓCIOS
// ==========================================
const Cadastros = () => {
  const [socios, setSocios] = useState(initialSocios);
  const [pesquisa, setPesquisa] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [socioEmEdicao, setSocioEmEdicao] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    sociosService.getAll().then(data => {
      if (data && data.length > 0) setSocios(data);
      setLoading(false);
    });
  }, []);

  const sociosFiltrados = socios.filter(s => 
    (s.nNome || '').toLowerCase().includes(pesquisa.toLowerCase()) ||
    (s.CPF || '').includes(pesquisa) ||
    String(s['Código'] || '').includes(pesquisa)
  );

  const handleSaveSocio = async (socioSalvo) => {
    const salvo = await sociosService.save(socioSalvo);
    if (socioEmEdicao) {
      setSocios(socios.map(s => s['Código'] === salvo['Código'] ? salvo : s));
    } else {
      setSocios([salvo, ...socios]);
    }
    setSocioEmEdicao(null);
    setIsFormOpen(false);
  };

  const handleDeleteSocio = async (codigo, e) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este sócio?')) {
      await sociosService.delete(codigo);
      setSocios(socios.filter(s => s['Código'] !== codigo));
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Cadastros de Sócios</h2>
          <p className="subtitle">Gerencie os associados cadastrados no banco de dados</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar sócio ou CPF..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                padding: '9px 16px 9px 36px', 
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                width: '280px',
                fontSize: '0.85rem'
              }} 
            />
          </div>
          <button 
            onClick={() => { setSocioEmEdicao(null); setIsFormOpen(true); }}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              padding: '0 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            Novo Cadastro
          </button>
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CÓDIGO</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>NOME</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SITUAÇÃO</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>TELEFONE</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CPF</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.slice(0, 50).map((socio) => (
                <tr 
                  key={socio['Código'] || Math.random()} 
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} 
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} 
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 600 }}>#{socio['Código']}</td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: 'white' }}>{socio.nNome}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      background: socio['Situação'] === 'ATIVO' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: socio['Situação'] === 'ATIVO' ? '#4ade80' : '#f87171'
                    }}>
                      {socio['Situação'] || 'INATIVO'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{socio.Telefones || socio.Celular || '-'}</td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{socio.CPF || '-'}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => { setSocioEmEdicao(socio); setIsFormOpen(true); }}
                        style={{ 
                          background: 'var(--accent-glow)', 
                          color: 'var(--accent-primary)',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={(e) => handleDeleteSocio(socio['Código'], e)}
                        title="Excluir sócio"
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: '#f87171',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sociosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhum sócio encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <SocioForm
          initialData={socioEmEdicao}
          onClose={() => { setIsFormOpen(false); setSocioEmEdicao(null); }}
          onSave={handleSaveSocio}
        />
      )}
    </div>
  );
};

// ==========================================
// SIDEBAR (PARA PAINEL DO ADMINISTRADOR)
// ==========================================
const Sidebar = ({ onOpenUsuariosModal }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)' }}>
          <span style={{ fontWeight: 'bold', color: 'white' }}>A</span>
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', margin: 0 }}>Boas Novas</h1>
          <span style={{ fontSize: '0.7rem', color: '#facc15', fontWeight: 600 }}>👑 Painel Administrador</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </Link>
        <Link to="/cadastros" className={`nav-item ${path === '/cadastros' ? 'active' : ''}`}>
          <Users size={18} />
          <span>Cadastros</span>
        </Link>
        <Link to="/agenda" className={`nav-item ${path === '/agenda' ? 'active' : ''}`}>
          <Calendar size={18} />
          <span>Agenda Geral</span>
        </Link>
        <Link to="/financeiro" className={`nav-item ${path === '/financeiro' ? 'active' : ''}`}>
          <CreditCard size={18} />
          <span>Financeiro</span>
        </Link>
        <Link to="/cursos" className={`nav-item ${path === '/cursos' ? 'active' : ''}`}>
          <BookOpen size={18} />
          <span>Atividades</span>
        </Link>
        <Link to="/profissionais" className={`nav-item ${path === '/profissionais' ? 'active' : ''}`}>
          <UserCircle size={18} />
          <span>Profissionais</span>
        </Link>
        <Link to="/relatorios" className={`nav-item ${path === '/relatorios' ? 'active' : ''}`}>
          <BarChart2 size={18} />
          <span>Relatórios</span>
        </Link>

        <div style={{ flex: 1 }}></div>

        <button 
          onClick={onOpenUsuariosModal}
          className="nav-item"
          style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <KeyRound size={18} color="#818cf8" />
          <span style={{ color: '#818cf8', fontWeight: 600 }}>Contas & Usuários</span>
        </button>

        <Link to="/config" className={`nav-item ${path === '/config' ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Configurações</span>
        </Link>
      </nav>
    </aside>
  );
};

// ==========================================
// TOPBAR (COM SELETOR DE PAINÉIS E STATUS)
// ==========================================
const Topbar = ({ 
  currentUser, 
  painelAtivo, 
  setPainelAtivo, 
  onOpenDbModal, 
  onOpenUsuariosModal, 
  onLogout 
}) => {
  const [dbStatus, setDbStatus] = useState({ loading: true, connected: true, tablesCreated: true });

  useEffect(() => {
    checkDatabaseStatus().then(res => {
      setDbStatus({
        loading: false,
        connected: res.connected,
        tablesCreated: res.tablesCreated
      });
    });
  }, []);

  const isAdmin = currentUser?.cargo === 'admin';

  return (
    <header className="topbar" style={{ gap: '16px', flexWrap: 'wrap', height: 'auto', minHeight: '68px', padding: '12px 28px' }}>
      
      {/* SELETOR DE DIVISÕES / PAINÉIS (REQUISITO PRINCIPAL) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isAdmin ? (
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-secondary)', 
            padding: '4px', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setPainelAtivo('admin')}
              style={{
                background: painelAtivo === 'admin' ? 'var(--accent-primary)' : 'transparent',
                color: painelAtivo === 'admin' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Shield size={16} />
              👑 Administrador
            </button>

            <button
              onClick={() => setPainelAtivo('medico')}
              style={{
                background: painelAtivo === 'medico' ? 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)' : 'transparent',
                color: painelAtivo === 'medico' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Stethoscope size={16} />
              🩺 Painel do Médico
            </button>

            <button
              onClick={() => setPainelAtivo('financeiro')}
              style={{
                background: painelAtivo === 'financeiro' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: painelAtivo === 'financeiro' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <CreditCard size={16} />
              💰 Painel Financeiro
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: currentUser?.cargo === 'medico' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: currentUser?.cargo === 'medico' ? '#818cf8' : '#34d399',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {currentUser?.cargo === 'medico' ? <Stethoscope size={16} /> : <CreditCard size={16} />}
              {currentUser?.cargo === 'medico' ? 'Portal do Médico' : 'Portal Financeiro'}
            </span>
          </div>
        )}
      </div>

      {/* LADO DIREITO: STATUS DO BANCO, PERFIL E LOGOUT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto' }}>
        
        {/* BOTÃO GERENCIAR USUÁRIOS NO BANCO (ADMIN) */}
        {isAdmin && (
          <button
            onClick={onOpenUsuariosModal}
            title="Gerenciar Contas e Acessos de Usuários no Banco"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '7px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <KeyRound size={15} color="#818cf8" />
            <span>Contas</span>
          </button>
        )}

        {/* INDICADOR DE STATUS SUPABASE */}
        <button
          onClick={onOpenDbModal}
          title="Clique para gerenciar a conexão com o Supabase"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: dbStatus.connected ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
            border: `1px solid ${dbStatus.connected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            padding: '6px 12px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: dbStatus.connected ? '#4ade80' : '#facc15'
          }}
        >
          <Database size={14} />
          <span>Supabase Online</span>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dbStatus.connected ? '#4ade80' : '#facc15',
            boxShadow: `0 0 8px ${dbStatus.connected ? '#4ade80' : '#facc15'}`
          }}></span>
        </button>

        {/* PERFIL DO USUÁRIO LOGADO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            background: currentUser?.cargo === 'admin' ? 'var(--accent-primary)' : currentUser?.cargo === 'medico' ? '#3b82f6' : '#10b981', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '0.85rem' 
          }}>
            {(currentUser?.nome || 'U')[0]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', lineHeight: '1.2' }}>
              {currentUser?.nome || 'Usuário'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {currentUser?.especialidade || (currentUser?.cargo === 'admin' ? 'Administrador' : currentUser?.cargo === 'medico' ? 'Médico' : 'Financeiro')}
            </span>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={onLogout}
          title="Sair do Sistema"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            padding: '7px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <LogOut size={14} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL (APP)
// ==========================================
const App = () => {
  // Usuário autenticado
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('abn_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Qual painel está ativo: 'admin' | 'medico' | 'financeiro'
  const [painelAtivo, setPainelAtivo] = useState('admin');

  // Modais do sistema
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isUsuariosModalOpen, setIsUsuariosModalOpen] = useState(false);

  // Define painel inicial conforme o cargo do usuário logado
  useEffect(() => {
    if (currentUser) {
      if (currentUser.cargo === 'medico') {
        setPainelAtivo('medico');
      } else if (currentUser.cargo === 'financeiro') {
        setPainelAtivo('financeiro');
      } else {
        setPainelAtivo('admin');
      }
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('abn_current_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('abn_current_user');
    } catch {}
  };

  // Se não estiver logado, exibe tela de login / criação de contas
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Se o usuário estiver no Painel do Médico
  if (painelAtivo === 'medico') {
    return (
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Topbar
          currentUser={currentUser}
          painelAtivo={painelAtivo}
          setPainelAtivo={setPainelAtivo}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          onOpenUsuariosModal={() => setIsUsuariosModalOpen(true)}
          onLogout={handleLogout}
        />
        <main className="main-content" style={{ padding: '0' }}>
          <PainelMedico 
            currentUser={currentUser} 
            isAdminView={currentUser.cargo === 'admin'} 
          />
        </main>

        <DatabaseStatusModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onDataSynced={() => window.location.reload()}
        />
        <UsuariosModal
          isOpen={isUsuariosModalOpen}
          onClose={() => setIsUsuariosModalOpen(false)}
        />
      </div>
    );
  }

  // Se o usuário estiver no Painel Financeiro
  if (painelAtivo === 'financeiro') {
    return (
      <div className="app-container" style={{ flexDirection: 'column' }}>
        <Topbar
          currentUser={currentUser}
          painelAtivo={painelAtivo}
          setPainelAtivo={setPainelAtivo}
          onOpenDbModal={() => setIsDbModalOpen(true)}
          onOpenUsuariosModal={() => setIsUsuariosModalOpen(true)}
          onLogout={handleLogout}
        />
        <main className="main-content" style={{ padding: '0' }}>
          <PainelFinanceiro />
        </main>

        <DatabaseStatusModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onDataSynced={() => window.location.reload()}
        />
        <UsuariosModal
          isOpen={isUsuariosModalOpen}
          onClose={() => setIsUsuariosModalOpen(false)}
        />
      </div>
    );
  }

  // Se estiver no Painel do Administrador (Acesso Geral)
  return (
    <Router>
      <div className="app-container">
        <Sidebar onOpenUsuariosModal={() => setIsUsuariosModalOpen(true)} />
        <main className="main-content">
          <Topbar 
            currentUser={currentUser}
            painelAtivo={painelAtivo}
            setPainelAtivo={setPainelAtivo}
            onOpenDbModal={() => setIsDbModalOpen(true)}
            onOpenUsuariosModal={() => setIsUsuariosModalOpen(true)}
            onLogout={handleLogout}
          />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cadastros" element={<Cadastros />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/financeiro" element={<PainelFinanceiro />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/config" element={
              <div className="page-content">
                <h2>Configurações do Sistema</h2>
                <p className="subtitle">Gerencie configurações globais e permissões</p>
                <div style={{ marginTop: '20px' }}>
                  <button
                    onClick={() => setIsUsuariosModalOpen(true)}
                    style={{
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <KeyRound size={18} />
                    Gerenciar Contas de Acesso no Banco
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </main>

        <DatabaseStatusModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onDataSynced={() => window.location.reload()}
        />

        <UsuariosModal
          isOpen={isUsuariosModalOpen}
          onClose={() => setIsUsuariosModalOpen(false)}
        />
      </div>
    </Router>
  );
};

export default App;
