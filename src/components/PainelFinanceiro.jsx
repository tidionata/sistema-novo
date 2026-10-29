import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, AlertTriangle, CheckCircle, FileText, 
  Printer, Copy, RefreshCw, DollarSign, ArrowUpRight, TrendingUp, Calendar, Check 
} from 'lucide-react';
import { financeiroService } from '../lib/supabase';
import initialSocios from '../socios.json';

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

const SOCIOS_COM_NOME = initialSocios.filter(s => s.nNome && s.nNome.trim().length > 2);

const getSocioDaFatura = (fatura) => {
  if (!fatura) return null;
  const exato = initialSocios.find(s => s['Código'] === fatura.NumFatura && s.nNome && s.nNome.trim().length > 2);
  if (exato) return exato;
  if (SOCIOS_COM_NOME.length > 0) {
    const idx = Math.abs(Number(fatura.NumFatura) || 0) % SOCIOS_COM_NOME.length;
    return SOCIOS_COM_NOME[idx];
  }
  return null;
};

const PainelFinanceiro = () => {
  const [faturas, setFaturas] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [ordensSelecionadasBoleto, setOrdensSelecionadasBoleto] = useState([]);
  const [novoVencimento, setNovoVencimento] = useState(getDefaultNovoVencimento());
  const [boletoEmitido, setBoletoEmitido] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    financeiroService.getAll().then(data => {
      if (data && data.length > 0) {
        setFaturas(data);
      }
    }).catch(err => console.error("Erro ao carregar financeiro", err));
  }, []);

  const handleAbrirDetalhes = (fatura) => {
    setFaturaSelecionada(fatura);
    setBoletoEmitido(null);
    setCopiado(false);
    setNovoVencimento(getDefaultNovoVencimento());
    setOrdensSelecionadasBoleto([fatura.NumOrdem]);
  };

  const toggleOrdemBoleto = (numOrdem) => {
    if (ordensSelecionadasBoleto.includes(numOrdem)) {
      if (ordensSelecionadasBoleto.length === 1) return;
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

    const faturasAtualizadas = faturas.map(f => {
      if (ordensIds.includes(f.NumOrdem)) {
        const itemAtualizado = { ...f, dtVencimento: novoDtVencimento, boletoReemitidoEm: new Date().toLocaleDateString('pt-BR') };
        financeiroService.save(itemAtualizado);
        return itemAtualizado;
      }
      return f;
    });
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

  const handleMarcarPago = async (faturaAlvo) => {
    const agoraMs = Date.now();
    const novoDtPago = `/Date(${agoraMs})/`;
    const idsParaBaixar = ordensSelecionadasBoleto.length > 0
      ? ordensSelecionadasBoleto
      : [faturaAlvo.NumOrdem];

    for (const numOrdem of idsParaBaixar) {
      await financeiroService.updatePagamento(numOrdem, novoDtPago);
    }

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
    <div className="page-content" translate="no" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* CABEÇALHO FINANCEIRO */}
      <div className="glass-card" style={{ 
        padding: '24px 32px', 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        borderLeft: '4px solid #10b981',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
          }}>
            <CreditCard size={28} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>Painel Financeiro</h2>
              <span style={{ 
                background: 'rgba(16, 185, 129, 0.15)', 
                color: '#34d399', 
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '2px 10px', 
                borderRadius: '12px', 
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                Gestão de Cobranças & Fluxo
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Controle de mensalidades, baixa automática e reemissão de boletos
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            {['Todos', 'Vencido', 'Pendente', 'Pago'].map(statusOpt => (
              <button
                key={statusOpt}
                onClick={() => setFiltroStatus(statusOpt)}
                style={{
                  background: filtroStatus === statusOpt ? 'var(--accent-primary)' : 'transparent',
                  color: filtroStatus === statusOpt ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {statusOpt === 'Todos' ? 'Todas' : `${statusOpt}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARDS DE RESUMO FINANCEIRO */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}><CreditCard size={24} /></div>
          <div className="stat-info">
            <h3>Recebido (Pago)</h3>
            <p>R$ {totalRecebido.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Vencido ({faturasVencidasGeral.length} faturas)</h3>
            <p style={{ color: '#f87171' }}>R$ {totalVencido.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 168, 34, 0.2)', color: '#fbbf24' }}><CreditCard size={24} /></div>
          <div className="stat-info">
            <h3>Pendente (A Vencer)</h3>
            <p>R$ {totalPendenteEmDia.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Pesquisar paciente, fatura ou parcela..." 
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              padding: '10px 16px 10px 36px', 
              borderRadius: '8px',
              color: 'white',
              outline: 'none',
              width: '320px',
              fontSize: '0.85rem'
            }} 
          />
        </div>
      </div>

      {/* TABELA DE FATURAS */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Fatura / Paciente</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nº da Parcela</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Vencimento</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Valor</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Ações</th>
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
                  <tr 
                    key={fatura.NumOrdem} 
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} 
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} 
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'white' }}>{nomePaciente}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fatura #{fatura.NumFatura}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {fatura.Duplicata}ª Parcela
                    </td>
                    <td style={{ padding: '16px 20px', color: status === 'Vencido' ? '#f87171' : 'var(--text-secondary)', fontWeight: status === 'Vencido' ? 600 : 400 }}>
                      {dataVenc}
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                      R$ {(fatura.ValorDuplicata || 0).toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleAbrirDetalhes(fatura)}
                        style={{ 
                          background: 'var(--accent-glow)', 
                          color: 'var(--accent-primary)',
                          border: '1px solid var(--accent-primary)',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}
                      >
                        Gerenciar / Boleto
                      </button>
                    </td>
                  </tr>
                );
              })}
              {faturasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nenhuma fatura encontrada com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALHES DA FATURA E EMISSÃO DE BOLETO */}
      {faturaSelecionada && (() => {
        const statusAtual = getStatusFatura(faturaSelecionada);
        const statusStyle = getStatusFaturaStyle(statusAtual);
        const vencDate = parseFaturaDate(faturaSelecionada.dtVencimento);
        const dataVencFormatada = vencDate ? vencDate.toLocaleDateString('pt-BR') : '-';
        const socioVinculado = getSocioDaFatura(faturaSelecionada);
        const nomePacienteModal = socioVinculado ? socioVinculado.nNome : `Paciente #${faturaSelecionada.NumFatura}`;

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
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              overflow: 'hidden',
              background: 'var(--bg-primary)',
              borderRadius: '16px'
            }}>
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
                    padding: '8px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Valor</div>
                    <div style={{ fontWeight: 600, color: '#4ade80' }}>
                      R$ {(faturaSelecionada.ValorDuplicata || 0).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                </div>

                {vencidasDaMesmaFatura.length > 0 && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={20} color="#f87171" />
                        <div>
                          <div style={{ fontWeight: 600, color: '#f87171' }}>
                            {temMaisDeUmaVencida
                              ? `Atenção: Existem ${vencidasDaMesmaFatura.length} parcelas vencidas para ${nomePacienteModal}!`
                              : `Existe 1 parcela vencida para ${nomePacienteModal}.`}
                          </div>
                          <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                            Total acumulado em atraso: <strong>R$ {totalVencidasDaFatura.toFixed(2).replace('.', ',')}</strong>
                          </div>
                        </div>
                      </div>
                      {temMaisDeUmaVencida && (
                        <button
                          onClick={() => selecionarTodasVencidas(vencidasDaMesmaFatura)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          Selecionar Todas ({vencidasDaMesmaFatura.length})
                        </button>
                      )}
                    </div>
                  </div>
                )}

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
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Novo Vencimento</div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#dc2626' }}>{boletoEmitido.novoVencimentoBR}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>Valor</div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#15803d' }}>
                          R$ {boletoEmitido.valorTotal.toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#f3f4f6', padding: '10px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '12px', wordBreak: 'break-all' }}>
                      {boletoEmitido.linhaDigitavel}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(boletoEmitido.linhaDigitavel);
                          setCopiado(true);
                          setTimeout(() => setCopiado(false), 3000);
                        }}
                        style={{
                          background: copiado ? '#15803d' : '#4f46e5',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {copiado ? <Check size={16} /> : <Copy size={16} />}
                        {copiado ? 'Copiado!' : 'Copiar Linha Digitável'}
                      </button>

                      <button
                        onClick={() => window.print()}
                        style={{
                          background: '#f3f4f6',
                          color: '#1f2937',
                          border: '1px solid #d1d5db',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Printer size={16} />
                        Imprimir Boleto
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.1)'
              }}>
                {statusAtual !== 'Pago' ? (
                  <button
                    onClick={() => handleMarcarPago(faturaSelecionada)}
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      color: '#4ade80',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle size={16} />
                    Dar Baixa como Pago (R$ {valorSelecionadoBoleto.toFixed(2).replace('.', ',')})
                  </button>
                ) : (
                  <span style={{ color: '#4ade80', fontSize: '0.9rem', fontWeight: 600 }}>
                    ✓ Parcela quitada
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

export default PainelFinanceiro;
