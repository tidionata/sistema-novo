import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, BookOpen, Settings, Bell, Search, Menu, Plus, Calendar, BarChart2, UserCircle, X, AlertTriangle, CheckCircle, FileText, Printer, Copy, RefreshCw } from 'lucide-react';
import SocioForm from './components/SocioForm';
import Agenda from './components/Agenda';
import Cursos from './components/Cursos';
import Profissionais from './components/Profissionais';
import Relatorios from './components/Relatorios';
import sociosData from './socios.json';
import './index.css';

// Componentes das páginas
const Dashboard = () => (
  <div className="page-content">
    <h2>Visão Geral</h2>
    <p className="subtitle">Bem-vindo ao Sistema Associação Boas Novas</p>
    
    <div className="dashboard-grid">
      <div className="glass-card stat-card">
        <div className="stat-icon"><Users size={24} /></div>
        <div className="stat-info">
          <h3>Total de Sócios</h3>
          <p>{sociosData.length}</p>
        </div>
      </div>
      <div className="glass-card stat-card">
        <div className="stat-icon"><CreditCard size={24} /></div>
        <div className="stat-info">
          <h3>Faturamento (Exemplo)</h3>
          <p>R$ 15.430,00</p>
        </div>
      </div>
      <div className="glass-card stat-card">
        <div className="stat-icon"><BookOpen size={24} /></div>
        <div className="stat-info">
          <h3>Atividades Ativas</h3>
          <p>12</p>
        </div>
      </div>
    </div>
  </div>
);

const Cadastros = () => {
  const [socios, setSocios] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [socioEmEdicao, setSocioEmEdicao] = useState(null);

  useEffect(() => {
    setSocios(sociosData);
  }, []);

  const sociosFiltrados = socios.filter(s => 
    (s.nNome || '').toLowerCase().includes(pesquisa.toLowerCase())
  );

  const handleSaveSocio = (socioSalvo) => {
    if (socioEmEdicao) {
      setSocios(socios.map(s => s['Código'] === socioSalvo['Código'] ? socioSalvo : s));
    } else {
      setSocios([socioSalvo, ...socios]);
    }
    setSocioEmEdicao(null);
    setIsFormOpen(false);
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2>Cadastros</h2>
          <p className="subtitle">Gerencie os sócios da associação</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar sócio..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                padding: '8px 16px 8px 36px', 
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                width: '300px'
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-primary)'}
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
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nome</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Telefone</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>CPF</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sociosFiltrados.slice(0, 50).map((socio) => (
                <tr key={socio['Código'] || Math.random()} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px' }}>{socio['Código']}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{socio.nNome}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem',
                      background: socio['Situação'] === 'ATIVO' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: socio['Situação'] === 'ATIVO' ? '#4ade80' : '#f87171'
                    }}>
                      {socio['Situação'] || 'INATIVO'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{socio.Telefones || socio.Celular || '-'}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{socio.CPF || '-'}</td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => { setSocioEmEdicao(socio); setIsFormOpen(true); }}
                      style={{ 
                      background: 'var(--accent-glow)', 
                      color: 'var(--accent-primary)',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}>
                      Editar
                    </button>
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
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'right' }}>
          Mostrando {Math.min(sociosFiltrados.length, 50)} de {sociosFiltrados.length} sócios
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

const parseFaturaDate = (dtValue) => {
  if (!dtValue) return null;
  const str = String(dtValue);
  const match = str.match(/\/Date\((\d+)\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const getStatusFatura = (fatura) => {
  if (fatura.dtPago) return 'Pago';
  const vencDate = parseFaturaDate(fatura.dtVencimento);
  if (vencDate) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencCompare = new Date(vencDate);
    vencCompare.setHours(0, 0, 0, 0);
    if (vencCompare < hoje) {
      return 'Vencido';
    }
  }
  return 'Pendente';
};

const getStatusFaturaStyle = (status) => {
  switch (status) {
    case 'Pago':
      return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' };
    case 'Vencido':
      return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' };
    default:
      return { bg: 'rgba(239, 168, 34, 0.2)', color: '#fbbf24' };
  }
};

const getDefaultNovoVencimento = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

const SOCIOS_COM_NOME = sociosData.filter(s => s.nNome && s.nNome.trim().length > 2);

const getSocioDaFatura = (fatura) => {
  if (!fatura) return null;
  const exato = sociosData.find(s => s['Código'] === fatura.NumFatura && s.nNome && s.nNome.trim().length > 2);
  if (exato) return exato;
  if (SOCIOS_COM_NOME.length > 0) {
    const idx = Math.abs(Number(fatura.NumFatura) || 0) % SOCIOS_COM_NOME.length;
    return SOCIOS_COM_NOME[idx];
  }
  return null;
};

const Financeiro = () => {
  const [faturas, setFaturas] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [ordensSelecionadasBoleto, setOrdensSelecionadasBoleto] = useState([]);
  const [novoVencimento, setNovoVencimento] = useState(getDefaultNovoVencimento());
  const [boletoEmitido, setBoletoEmitido] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    // Carregar dinamicamente para não quebrar caso o arquivo não exista no primeiro load
    import('./financeiro.json').then(module => {
      setFaturas(module.default || module);
    }).catch(err => console.error("Erro ao carregar financeiro", err));
  }, []);

  const handleAbrirDetalhes = (fatura) => {
    setFaturaSelecionada(fatura);
    setBoletoEmitido(null);
    setCopiado(false);
    setNovoVencimento(getDefaultNovoVencimento());

    // Verifica todas as faturas vencidas da mesma NumFatura
    const vencidasMesmaFatura = faturas.filter(
      f => f.NumFatura === fatura.NumFatura && getStatusFatura(f) === 'Vencido'
    );
    if (vencidasMesmaFatura.length > 0) {
      setOrdensSelecionadasBoleto([fatura.NumOrdem]);
    } else {
      setOrdensSelecionadasBoleto([fatura.NumOrdem]);
    }
  };

  const toggleOrdemBoleto = (numOrdem) => {
    if (ordensSelecionadasBoleto.includes(numOrdem)) {
      if (ordensSelecionadasBoleto.length === 1) return; // Mantém pelo menos 1 selecionada
      setOrdensSelecionadasBoleto(ordensSelecionadasBoleto.filter(id => id !== numOrdem));
    } else {
      setOrdensSelecionadasBoleto([...ordensSelecionadasBoleto, numOrdem]);
    }
    setBoletoEmitido(null);
  };

  const selecionarTodasVencidas = (vencidas) => {
    setOrdensSelecionadasBoleto(vencidas.map(v => v.NumOrdem));
    setBoletoEmitido(null);
  };

  const handleEmitirNovoBoleto = (faturasParaBoleto) => {
    if (!novoVencimento) {
      alert('Informe a nova data de vencimento para emitir o boleto.');
      return;
    }

    const [ano, mes, dia] = novoVencimento.split('-').map(Number);
    const novaDataMs = new Date(ano, mes - 1, dia, 12, 0, 0).getTime();
    const novoDtVencimento = `/Date(${novaDataMs})/`;

    const valorTotal = faturasParaBoleto.reduce((acc, curr) => acc + (curr.ValorDuplicata || 0), 0);
    const ordensIds = faturasParaBoleto.map(f => f.NumOrdem);
    const parcelasNums = faturasParaBoleto.map(f => `${f.Duplicata}ª`);

    // Atualiza a data de vencimento das faturas incluídas no novo boleto
    const faturasAtualizadas = faturas.map(f =>
      ordensIds.includes(f.NumOrdem)
        ? { ...f, dtVencimento: novoDtVencimento, boletoReemitidoEm: new Date().toLocaleDateString('pt-BR') }
        : f
    );
    setFaturas(faturasAtualizadas);

    const faturaPrincipalAtualizada = faturasAtualizadas.find(f => f.NumOrdem === faturaSelecionada.NumOrdem);
    if (faturaPrincipalAtualizada) {
      setFaturaSelecionada(faturaPrincipalAtualizada);
    }

    const socioVinculado = getSocioDaFatura(faturaSelecionada);
    const valorCentavos = Math.round(valorTotal * 100).toString().padStart(10, '0');
    const nossoNumero = `${faturaSelecionada.NumFatura}${ordensIds[0]}`.padStart(8, '0');
    const linhaDigitavel = `34191.79001 01043.510047 91020.150008 8 ${nossoNumero}${valorCentavos}`;

    setBoletoEmitido({
      numFatura: faturaSelecionada.NumFatura,
      ordens: ordensIds,
      parcelas: parcelasNums,
      quantidadeParcelas: faturasParaBoleto.length,
      pagador: socioVinculado ? socioVinculado.nNome : `Paciente #${faturaSelecionada.NumFatura}`,
      cpf: socioVinculado?.CPF || 'Não informado',
      novoVencimentoBR: `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`,
      valorTotal,
      nossoNumero,
      linhaDigitavel,
      dataEmissao: new Date().toLocaleDateString('pt-BR')
    });
  };

  const handleMarcarPago = (faturaAlvo) => {
    const agoraMs = Date.now();
    const novoDtPago = `/Date(${agoraMs})/`;
    const idsParaBaixar = ordensSelecionadasBoleto.length > 0
      ? ordensSelecionadasBoleto
      : [faturaAlvo.NumOrdem];

    const atualizadas = faturas.map(f =>
      idsParaBaixar.includes(f.NumOrdem) ? { ...f, dtPago: novoDtPago } : f
    );
    setFaturas(atualizadas);

    const faturaPrincipalAtualizada = atualizadas.find(f => f.NumOrdem === faturaAlvo.NumOrdem);
    setFaturaSelecionada(faturaPrincipalAtualizada || { ...faturaAlvo, dtPago: novoDtPago });
  };

  const faturasFiltradas = faturas.filter(f => {
    const socio = getSocioDaFatura(f);
    const nomePaciente = (socio?.nNome || '').toLowerCase();
    const termo = pesquisa.toLowerCase();
    const matchPesquisa =
      nomePaciente.includes(termo) ||
      (f.NumFatura?.toString() || '').includes(pesquisa) ||
      (f.Duplicata?.toString() || '').includes(pesquisa) ||
      (f.NumOrdem?.toString() || '').includes(pesquisa);
    if (!matchPesquisa) return false;
    if (filtroStatus === 'Todos') return true;
    return getStatusFatura(f) === filtroStatus;
  });

  const totalRecebido = faturas
    .filter(f => getStatusFatura(f) === 'Pago')
    .reduce((acc, curr) => acc + (curr.ValorDuplicata || 0), 0);

  const faturasVencidasGeral = faturas.filter(f => getStatusFatura(f) === 'Vencido');
  const totalVencido = faturasVencidasGeral.reduce((acc, curr) => acc + (curr.ValorDuplicata || 0), 0);

  const totalPendenteEmDia = faturas
    .filter(f => getStatusFatura(f) === 'Pendente')
    .reduce((acc, curr) => acc + (curr.ValorDuplicata || 0), 0);

  return (
    <div className="page-content" translate="no">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Financeiro</h2>
          <p className="subtitle">Gerencie as faturas, verifique vencimentos e emita novos boletos</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['Todos', 'Vencido', 'Pendente', 'Pago'].map(statusOpt => (
              <button
                key={statusOpt}
                onClick={() => setFiltroStatus(statusOpt)}
                style={{
                  background: filtroStatus === statusOpt ? 'var(--accent-primary)' : 'transparent',
                  color: filtroStatus === statusOpt ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}
              >
                {statusOpt === 'Todos' ? 'Todas' : `${statusOpt}s`}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Pesquisar paciente, fatura ou parcela..." 
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              style={{ 
                background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', 
                padding: '8px 16px 8px 36px', 
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                width: '280px'
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80'}}><CreditCard size={24} /></div>
          <div className="stat-info">
            <h3>Recebido (Pago)</h3>
            <p>R$ {totalRecebido.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#f87171'}}><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Vencido ({faturasVencidasGeral.length} faturas)</h3>
            <p style={{ color: '#f87171' }}>R$ {totalVencido.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{background: 'rgba(239, 168, 34, 0.2)', color: '#fbbf24'}}><CreditCard size={24} /></div>
          <div className="stat-info">
            <h3>Pendente (A Vencer)</h3>
            <p>R$ {totalPendenteEmDia.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Fatura / Paciente</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nº da Parcela</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Vencimento</th>
                <th className="notranslate" translate="no" style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Valor</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturasFiltradas.map((fatura) => {
                const status = getStatusFatura(fatura);
                const statusStyle = getStatusFaturaStyle(status);
                const vencDate = parseFaturaDate(fatura.dtVencimento);
                const dataVenc = vencDate ? vencDate.toLocaleDateString('pt-BR') : '-';
                const socio = getSocioDaFatura(fatura);
                const nomePaciente = socio ? socio.nNome : `Paciente #${fatura.NumFatura}`;
                
                return (
                <tr key={fatura.NumOrdem} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'white' }}>{nomePaciente}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fatura #{fatura.NumFatura}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {fatura.Duplicata}ª Parcela
                  </td>
                  <td style={{ padding: '16px', color: status === 'Vencido' ? '#f87171' : 'var(--text-secondary)', fontWeight: status === 'Vencido' ? 500 : 400 }}>
                    {dataVenc}
                  </td>
                  <td className="notranslate" translate="no" style={{ padding: '16px', fontWeight: 500 }}>
                    R$ {(fatura.ValorDuplicata || 0).toFixed(2).replace('.', ',')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      background: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button 
                      onClick={() => handleAbrirDetalhes(fatura)}
                      style={{ 
                        background: 'var(--accent-glow)', 
                        color: 'var(--accent-primary)',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500
                      }}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              )})}
              {faturasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes da Fatura, Verificação de Vencidas e Emissão de Novo Boleto */}
      {faturaSelecionada && (() => {
        const statusAtual = getStatusFatura(faturaSelecionada);
        const statusStyle = getStatusFaturaStyle(statusAtual);
        const vencDate = parseFaturaDate(faturaSelecionada.dtVencimento);
        const dataVencFormatada = vencDate ? vencDate.toLocaleDateString('pt-BR') : '-';
        const socioVinculado = getSocioDaFatura(faturaSelecionada);
        const nomePacienteModal = socioVinculado ? socioVinculado.nNome : `Paciente #${faturaSelecionada.NumFatura}`;

        // Todas as faturas vencidas para esta mesma NumFatura
        const vencidasDaMesmaFatura = faturas.filter(
          f => f.NumFatura === faturaSelecionada.NumFatura && getStatusFatura(f) === 'Vencido'
        );
        const temMaisDeUmaVencida = vencidasDaMesmaFatura.length > 1;
        const totalVencidasDaFatura = vencidasDaMesmaFatura.reduce((acc, curr) => acc + (curr.ValorDuplicata || 0), 0);

        const faturasSelecionadasObj = faturas.filter(f => ordensSelecionadasBoleto.includes(f.NumOrdem));
        const valorSelecionadoBoleto = faturasSelecionadasObj.reduce((acc, curr) => acc + (curr.ValorDuplicata || 0), 0);

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
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              overflow: 'hidden',
              background: 'var(--bg-primary)'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h2 style={{ fontSize: '1.35rem', margin: 0 }}>
                      {nomePacienteModal}
                    </h2>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      {statusAtual}
                    </span>
                  </div>
                  <p className="subtitle" style={{ margin: 0 }}>
                    Fatura #{faturaSelecionada.NumFatura} • {faturaSelecionada.Duplicata}ª Parcela {socioVinculado?.CPF ? `• CPF: ${socioVinculado.CPF}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setFaturaSelecionada(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%'
                  }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Corpo */}
              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Resumo da Parcela Selecionada */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Fatura</div>
                    <div style={{ fontWeight: 600 }}>#{faturaSelecionada.NumFatura}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Nº da Parcela</div>
                    <div style={{ fontWeight: 600 }}>{faturaSelecionada.Duplicata}ª Parcela</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Vencimento</div>
                    <div style={{ fontWeight: 600, color: statusAtual === 'Vencido' ? '#f87171' : 'white' }}>{dataVencFormatada}</div>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div className="notranslate" translate="no" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Valor</div>
                    <div style={{ fontWeight: 600, color: '#4ade80' }}>
                      R$ {(faturaSelecionada.ValorDuplicata || 0).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                {/* Verificação de Faturas Vencidas */}
                <div style={{
                  background: vencidasDaMesmaFatura.length > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                  border: vencidasDaMesmaFatura.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '10px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: vencidasDaMesmaFatura.length > 0 ? '12px' : '0', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {vencidasDaMesmaFatura.length > 0 ? (
                        <AlertTriangle size={20} color="#f87171" />
                      ) : (
                        <CheckCircle size={20} color="#4ade80" />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: vencidasDaMesmaFatura.length > 0 ? '#f87171' : '#4ade80' }}>
                          {temMaisDeUmaVencida
                            ? `Atenção: Existem ${vencidasDaMesmaFatura.length} parcelas vencidas para ${nomePacienteModal}!`
                            : vencidasDaMesmaFatura.length === 1
                            ? `Existe 1 parcela vencida para ${nomePacienteModal}.`
                            : `Nenhuma parcela vencida para ${nomePacienteModal}.`}
                        </div>
                        {vencidasDaMesmaFatura.length > 0 && (
                          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                            Total acumulado em atraso: <strong>R$ {totalVencidasDaFatura.toFixed(2).replace('.', ',')}</strong> • Selecione abaixo quais deseja incluir no novo boleto:
                          </div>
                        )}
                      </div>
                    </div>

                    {temMaisDeUmaVencida && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => selecionarTodasVencidas(vencidasDaMesmaFatura)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          Selecionar Todas ({vencidasDaMesmaFatura.length})
                        </button>
                        <button
                          onClick={() => { setOrdensSelecionadasBoleto([faturaSelecionada.NumOrdem]); setBoletoEmitido(null); }}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Apenas {faturaSelecionada.Duplicata}ª Parcela
                        </button>
                      </div>
                    )}
                  </div>

                  {vencidasDaMesmaFatura.length > 0 && (
                    <div style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '8px 12px', width: '36px' }}>
                              <input
                                type="checkbox"
                                checked={vencidasDaMesmaFatura.length > 0 && vencidasDaMesmaFatura.every(v => ordensSelecionadasBoleto.includes(v.NumOrdem))}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    selecionarTodasVencidas(vencidasDaMesmaFatura);
                                  } else {
                                    setOrdensSelecionadasBoleto([faturaSelecionada.NumOrdem]);
                                    setBoletoEmitido(null);
                                  }
                                }}
                                style={{ cursor: 'pointer' }}
                                title="Selecionar todas as vencidas"
                              />
                            </th>
                            <th style={{ padding: '8px 12px' }}>Nº da Parcela</th>
                            <th style={{ padding: '8px 12px' }}>Fatura</th>
                            <th style={{ padding: '8px 12px' }}>Vencimento Original</th>
                            <th className="notranslate" translate="no" style={{ padding: '8px 12px', textAlign: 'right' }}>Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vencidasDaMesmaFatura.map(v => {
                            const vDate = parseFaturaDate(v.dtVencimento);
                            const checked = ordensSelecionadasBoleto.includes(v.NumOrdem);
                            return (
                              <tr
                                key={v.NumOrdem}
                                onClick={() => toggleOrdemBoleto(v.NumOrdem)}
                                style={{
                                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                                  cursor: 'pointer',
                                  background: checked ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
                                }}
                              >
                                <td style={{ padding: '8px 12px' }}>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {}}
                                    style={{ cursor: 'pointer' }}
                                  />
                                </td>
                                <td style={{ padding: '8px 12px', fontWeight: v.NumOrdem === faturaSelecionada.NumOrdem ? 700 : 400 }}>
                                  {v.Duplicata}ª Parcela {v.NumOrdem === faturaSelecionada.NumOrdem ? '(Atual)' : ''}
                                </td>
                                <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>#{v.NumFatura}</td>
                                <td style={{ padding: '8px 12px', color: '#f87171' }}>
                                  {vDate ? vDate.toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                                  R$ {(v.ValorDuplicata || 0).toFixed(2).replace('.', ',')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Emissão de Novo Boleto */}
                {statusAtual !== 'Pago' && (
                  <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontWeight: 600 }}>
                      <RefreshCw size={18} color="var(--accent-primary)" />
                      <span>Emitir Novo Boleto (2ª Via Atualizada)</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Nova Data de Vencimento
                        </label>
                        <input
                          type="date"
                          value={novoVencimento}
                          onChange={e => setNovoVencimento(e.target.value)}
                          style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-color)',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none',
                            boxSizing: 'border-box',
                            colorScheme: 'dark'
                          }}
                        />
                      </div>

                      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {faturasSelecionadasObj.length} parcela(s) selecionada(s)
                        </div>
                        <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '1rem' }}>
                          Total: R$ {valorSelecionadoBoleto.toFixed(2).replace('.', ',')}
                        </div>
                      </div>

                      <button
                        onClick={() => handleEmitirNovoBoleto(faturasSelecionadasObj)}
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
                        <FileText size={18} />
                        Emitir Novo Boleto
                      </button>
                    </div>
                  </div>
                )}

                {/* Boleto Gerado */}
                {boletoEmitido && (
                  <div style={{
                    background: 'white',
                    color: '#111827',
                    borderRadius: '10px',
                    padding: '20px',
                    border: '2px dashed #6366f1'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #111827', paddingBottom: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>ASSOCIAÇÃO BOAS NOVAS</div>
                        <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>Novo Boleto Emitido em {boletoEmitido.dataEmissao}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>Nosso Número</div>
                        <div style={{ fontWeight: 700 }}>{boletoEmitido.nossoNumero}</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Paciente / Pagador</div>
                        <div style={{ fontWeight: 600 }}>{boletoEmitido.pagador}</div>
                        <div style={{ color: '#4b5563', fontSize: '0.78rem' }}>
                          Ref.: Fatura #{boletoEmitido.numFatura} ({boletoEmitido.quantidadeParcelas} parcela(s): {(boletoEmitido.parcelas || []).slice(0, 5).join(', ')}{(boletoEmitido.parcelas || []).length > 5 ? '...' : ''})
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Novo Vencimento</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#dc2626' }}>{boletoEmitido.novoVencimentoBR}</div>
                      </div>
                      <div>
                        <div className="notranslate" translate="no" style={{ color: '#6b7280', fontSize: '0.75rem' }}>Valor</div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#15803d' }}>
                          R$ {boletoEmitido.valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#f3f4f6', padding: '10px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', letterSpacing: '0.03em', marginBottom: '12px', wordBreak: 'break-all' }}>
                      {boletoEmitido.linhaDigitavel}
                    </div>

                    {/* Representação visual do código de barras */}
                    <div style={{
                      height: '38px',
                      background: 'repeating-linear-gradient(90deg, #111 0px, #111 2px, transparent 2px, transparent 4px, #111 4px, #111 5px, transparent 5px, transparent 8px, #111 8px, #111 11px, transparent 11px, transparent 13px)',
                      marginBottom: '14px'
                    }}></div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(boletoEmitido.linhaDigitavel);
                          setCopiado(true);
                          setTimeout(() => setCopiado(false), 2500);
                        }}
                        style={{
                          background: '#e5e7eb',
                          color: '#1f2937',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Copy size={15} /> {copiado ? 'Linha Copiada!' : 'Copiar Linha Digitável'}
                      </button>
                      <button
                        onClick={() => window.print()}
                        style={{
                          background: '#4f46e5',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <Printer size={15} /> Imprimir Boleto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)'
              }}>
                {faturasSelecionadasObj.some(f => getStatusFatura(f) !== 'Pago') ? (
                  <button
                    onClick={() => handleMarcarPago(faturaSelecionada)}
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle size={16} />
                    {faturasSelecionadasObj.length > 1
                      ? `Dar Baixa nas ${faturasSelecionadasObj.length} Parcelas Selecionadas (R$ ${valorSelecionadoBoleto.toFixed(2).replace('.', ',')})`
                      : `Dar Baixa como Pago (R$ ${valorSelecionadoBoleto.toFixed(2).replace('.', ',')})`}
                  </button>
                ) : (
                  <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 600 }}>
                    ✓ Parcela(s) quitada(s)
                  </span>
                )}

                <button
                  onClick={() => setFaturaSelecionada(null)}
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'white',
                    border: '1px solid var(--border-color)',
                    padding: '10px 24px',
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
      })()}
    </div>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontWeight: 'bold', color: 'white' }}>A</span>
        </div>
        <h1>Associação Boas Novas</h1>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/cadastros" className={`nav-item ${path === '/cadastros' ? 'active' : ''}`}>
          <Users size={20} />
          <span>Cadastros</span>
        </Link>
        <Link to="/agenda" className={`nav-item ${path === '/agenda' ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Agenda Médica</span>
        </Link>
        <Link to="/financeiro" className={`nav-item ${path === '/financeiro' ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>Financeiro</span>
        </Link>
        <Link to="/cursos" className={`nav-item ${path === '/cursos' ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Atividades</span>
        </Link>
        <Link to="/profissionais" className={`nav-item ${path === '/profissionais' ? 'active' : ''}`}>
          <UserCircle size={20} />
          <span>Profissionais</span>
        </Link>
        <Link to="/relatorios" className={`nav-item ${path === '/relatorios' ? 'active' : ''}`}>
          <BarChart2 size={20} />
          <span>Relatórios</span>
        </Link>
        <div style={{ flex: 1 }}></div>
        <Link to="/config" className={`nav-item ${path === '/config' ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
      </nav>
    </aside>
  );
};

const Topbar = () => (
  <header className="topbar">
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
      <Menu size={20} style={{ cursor: 'pointer' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Bell size={20} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
    </div>
  </header>
);

const Login = ({ onLogin }) => {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (senha === '784912') {
      onLogin(true);
    } else if (senha === '123') {
      onLogin(false); // Login normal, não admin
    } else {
      setErro('Senha incorreta! Tente novamente.');
      setTimeout(() => setErro(''), 3000);
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, rgba(15, 17, 21, 1) 100%)'
    }}>
      <div className="glass-card" style={{ width: '400px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' }}>
          <span style={{ fontWeight: 'bold', color: 'white', fontSize: '2rem' }}>A</span>
        </div>
        <h2 style={{ marginBottom: '8px' }}>Associação Boas Novas</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>Digite sua senha para acessar o sistema</p>
        
        <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Senha de Acesso:</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••"
              style={{ 
                width: '100%',
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--border-color)', 
                padding: '12px 16px', 
                borderRadius: '8px',
                color: 'white',
                outline: 'none',
                fontSize: '1.1rem',
                letterSpacing: '0.2em'
              }} 
            />
          </div>
          
          {erro && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {erro}
            </div>
          )}

          <button type="submit" style={{ 
            background: 'var(--accent-primary)', 
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            marginTop: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-primary)'}
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (isAdminUser) => {
    setIsAuthenticated(true);
    setIsAdmin(isAdminUser);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Topbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cadastros" element={<Cadastros />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/cursos" element={<Cursos />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/config" element={<div className="page-content"><h2>Configurações</h2></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
