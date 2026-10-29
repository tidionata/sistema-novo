import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, CheckCircle2, AlertCircle, 
  FileText, Stethoscope, Search, ChevronLeft, ChevronRight, Plus, 
  Printer, Check, X, Eye, Filter, UserCheck, CalendarDays, History, Sparkles 
} from 'lucide-react';
import { consultasService, prontuariosService, profissionaisService } from '../lib/supabase';
import ConsultaForm from './ConsultaForm';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Confirmado':
      return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.4)', label: 'Confirmado' };
    case 'Concluído':
    case 'Atendido':
      return { bg: 'rgba(34, 197, 94, 0.2)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.4)', label: 'Atendido' };
    case 'Em Atendimento':
      return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)', label: 'Em Consulta' };
    case 'Cancelado':
      return { bg: 'rgba(239, 68, 68, 0.2)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)', label: 'Cancelado' };
    default:
      return { bg: 'rgba(234, 179, 8, 0.2)', text: '#facc15', border: 'rgba(234, 179, 8, 0.4)', label: 'Agendado' };
  }
};

const formatDateBR = (dataStr) => {
  if (!dataStr) return '-';
  const parts = dataStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dataStr;
};

const getHojeString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const PainelMedico = ({ currentUser, isAdminView = false }) => {
  const [medicoAtivo, setMedicoAtivo] = useState(currentUser?.nome || 'Dr. João Silva');
  const [listaMedicos, setListaMedicos] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controle de datas
  const [dataSelecionada, setDataSelecionada] = useState(getHojeString());
  const [abaAtiva, setAbaAtiva] = useState('dia'); // 'dia' | 'proximos' | 'passados' | 'prontuarios'
  const [pesquisa, setPesquisa] = useState('');

  // Atendimento e Prontuário Modal
  const [consultaEmAtendimento, setConsultaEmAtendimento] = useState(null);
  const [historicoPaciente, setHistoricoPaciente] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [formProntuario, setFormProntuario] = useState({
    queixa_principal: '',
    diagnostico: '',
    prescricao: '',
    observacoes: ''
  });

  // Modal de Histórico isolado
  const [pacienteParaHistorico, setPacienteParaHistorico] = useState(null);
  const [historicoIsolado, setHistoricoIsolado] = useState([]);

  // Modal Novo Agendamento
  const [isNovoAgendamentoOpen, setIsNovoAgendamentoOpen] = useState(false);

  // Carrega lista de profissionais
  useEffect(() => {
    profissionaisService.getAll().then(data => {
      if (data && data.length > 0) {
        setListaMedicos(data);
      }
    });
  }, []);

  // Se o usuário logado for médico, define ele como médico ativo
  useEffect(() => {
    if (currentUser && currentUser.cargo === 'medico') {
      setMedicoAtivo(currentUser.nome);
    }
  }, [currentUser]);

  // Carrega consultas do banco
  const carregarConsultas = async () => {
    setLoading(true);
    try {
      const data = await consultasService.getAll();
      if (data && data.length > 0) {
        setConsultas(data);
      }
    } catch (err) {
      console.error('Erro ao carregar consultas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConsultas();
  }, []);

  // Filtra consultas pelo médico ativo
  const consultasDoMedico = consultas.filter(c => {
    const nomeM = (c.profissional || '').toLowerCase();
    const termo = (medicoAtivo || '').toLowerCase();
    return nomeM.includes(termo) || termo.includes(nomeM);
  });

  // Filtra pelo dia selecionado
  const consultasDoDia = consultasDoMedico
    .filter(c => c.data === dataSelecionada)
    .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

  // Filtra próximos dias (data > hoje)
  const hojeStr = getHojeString();
  const consultasProximas = consultasDoMedico
    .filter(c => c.data > hojeStr)
    .sort((a, b) => a.data.localeCompare(b.data) || (a.hora || '').localeCompare(b.hora || ''));

  // Filtra dias passados (data < hoje)
  const consultasPassadas = consultasDoMedico
    .filter(c => c.data < hojeStr)
    .sort((a, b) => b.data.localeCompare(a.data) || (b.hora || '').localeCompare(a.hora || ''));

  // Consultas conforme a aba ativa
  const consultasExibidas = (() => {
    let lista = [];
    if (abaAtiva === 'dia') lista = consultasDoDia;
    else if (abaAtiva === 'proximos') lista = consultasProximas;
    else if (abaAtiva === 'passados') lista = consultasPassadas;
    else lista = consultasDoMedico;

    if (!pesquisa) return lista;
    const termo = pesquisa.toLowerCase();
    return lista.filter(c => 
      (c.paciente || '').toLowerCase().includes(termo) ||
      (c.modalidade || '').toLowerCase().includes(termo) ||
      (c.convenio || '').toLowerCase().includes(termo) ||
      (c.data || '').includes(termo)
    );
  })();

  // Estatísticas do dia
  const totalHoje = consultasDoDia.length;
  const confirmadosHoje = consultasDoDia.filter(c => c.status === 'Confirmado').length;
  const atendidosHoje = consultasDoDia.filter(c => c.status === 'Concluído' || c.status === 'Atendido').length;
  const pendentesHoje = consultasDoDia.filter(c => c.status === 'Agendado').length;

  // Alterar Status da Consulta
  const handleAlterarStatus = async (id, novoStatus) => {
    const alvo = consultas.find(c => c.id === id);
    if (alvo) {
      const atualizado = { ...alvo, status: novoStatus };
      await consultasService.save(atualizado);
      setConsultas(consultas.map(c => c.id === id ? atualizado : c));
    }
  };

  // Iniciar Atendimento
  const handleIniciarAtendimento = async (consulta) => {
    setConsultaEmAtendimento(consulta);
    setCarregandoHistorico(true);
    setFormProntuario({
      queixa_principal: '',
      diagnostico: '',
      prescricao: '',
      observacoes: consulta.observacoes || ''
    });

    // Atualiza status para Em Atendimento
    await handleAlterarStatus(consulta.id, 'Em Atendimento');

    // Busca histórico prévio do paciente
    try {
      const hist = await prontuariosService.getByPaciente(consulta.paciente);
      setHistoricoPaciente(hist || []);
    } catch {
      setHistoricoPaciente([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // Salvar e Concluir Atendimento
  const handleFinalizarAtendimento = async () => {
    if (!consultaEmAtendimento) return;

    const payloadProntuario = {
      consulta_id: consultaEmAtendimento.id,
      paciente_nome: consultaEmAtendimento.paciente,
      medico_nome: medicoAtivo,
      data_atendimento: consultaEmAtendimento.data || getHojeString(),
      hora_atendimento: consultaEmAtendimento.hora || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      queixa_principal: formProntuario.queixa_principal,
      diagnostico: formProntuario.diagnostico,
      prescricao: formProntuario.prescricao,
      observacoes: formProntuario.observacoes,
      status: 'Concluído'
    };

    await prontuariosService.save(payloadProntuario);
    await handleAlterarStatus(consultaEmAtendimento.id, 'Concluído');

    alert('Atendimento concluído com sucesso e prontuário registrado no sistema!');
    setConsultaEmAtendimento(null);
  };

  // Abrir Histórico do Paciente
  const handleVerHistoricoPaciente = async (nomePaciente) => {
    setPacienteParaHistorico(nomePaciente);
    setCarregandoHistorico(true);
    const hist = await prontuariosService.getByPaciente(nomePaciente);
    setHistoricoIsolado(hist || []);
    setCarregandoHistorico(false);
  };

  // Navegação de dias rápidos
  const mudarDia = (dias) => {
    const [y, m, d] = dataSelecionada.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + dias);
    setDataSelecionada(date.toISOString().split('T')[0]);
  };

  return (
    <div className="page-content" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* CABEÇALHO DO PAINEL MÉDICO */}
      <div className="glass-card" style={{ 
        padding: '24px 32px', 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        borderLeft: '4px solid var(--accent-primary)',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
          }}>
            <Stethoscope size={28} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>{medicoAtivo}</h2>
              <span style={{ 
                background: 'rgba(34, 197, 94, 0.15)', 
                color: '#4ade80', 
                border: '1px solid rgba(34, 197, 94, 0.3)',
                padding: '2px 10px', 
                borderRadius: '12px', 
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }}></span>
                Plantão Ativo
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Painel Clínico Integrado • Visualização exclusiva de atendimentos
            </p>
          </div>
        </div>

        {/* Se for Administrador, permite trocar o médico em tempo real */}
        {isAdminView && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Médico:</span>
            <select
              value={medicoAtivo}
              onChange={(e) => setMedicoAtivo(e.target.value)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {listaMedicos.length > 0 ? (
                listaMedicos.map(m => (
                  <option key={m.id} value={m.nome}>{m.nome} ({m.especialidade})</option>
                ))
              ) : (
                <>
                  <option value="Dr. João Silva">Dr. João Silva (Clínico Geral)</option>
                  <option value="Dra. Maria Souza">Dra. Maria Souza (Pediatria)</option>
                  <option value="Dra. Ana Clara">Dra. Ana Clara (Psicologia)</option>
                  <option value="Dr. Roberto Carlos">Dr. Roberto Carlos (Fisioterapia)</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* CONTROLE DE DATA RÁPIDA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => mudarDia(-1)}
            title="Dia Anterior"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => setDataSelecionada(getHojeString())}
            style={{
              background: dataSelecionada === getHojeString() ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hoje ({formatDateBR(getHojeString())})
          </button>

          <input 
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              padding: '7px 12px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          />

          <button
            onClick={() => mudarDia(1)}
            title="Próximo Dia"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMO DO DIA */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Consultas do Dia</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalHoje}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confirmados</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa' }}>{confirmadosHoje}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aguardando</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#facc15' }}>{pendentesHoje}</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Atendidos</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4ade80' }}>{atendidosHoje}</div>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGAÇÃO DE ABAS & BUSCA */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setAbaAtiva('dia')}
            style={{
              background: abaAtiva === 'dia' ? 'var(--accent-primary)' : 'transparent',
              color: 'white',
              border: 'none',
              padding: '8px 18px',
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
            <CalendarDays size={16} />
            Agenda do Dia ({formatDateBR(dataSelecionada)})
          </button>

          <button
            onClick={() => setAbaAtiva('proximos')}
            style={{
              background: abaAtiva === 'proximos' ? 'var(--accent-primary)' : 'transparent',
              color: 'white',
              border: 'none',
              padding: '8px 18px',
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
            <Clock size={16} />
            Próximos Dias ({consultasProximas.length})
          </button>

          <button
            onClick={() => setAbaAtiva('passados')}
            style={{
              background: abaAtiva === 'passados' ? 'var(--accent-primary)' : 'transparent',
              color: 'white',
              border: 'none',
              padding: '8px 18px',
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
            <History size={16} />
            Agendas Passadas ({consultasPassadas.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Buscar paciente ou convênio..." 
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
            onClick={() => setIsNovoAgendamentoOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Plus size={16} />
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* LISTAGEM DE CONSULTAS */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Carregando agenda do médico...
          </div>
        ) : consultasExibidas.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--text-secondary)'
            }}>
              <CalendarIcon size={32} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Nenhum atendimento encontrado</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 20px auto' }}>
              {abaAtiva === 'dia' 
                ? `Não há pacientes agendados para o dia ${formatDateBR(dataSelecionada)} com ${medicoAtivo}.` 
                : 'Não há registros com os filtros selecionados.'}
            </p>
            {abaAtiva === 'dia' && (
              <button
                onClick={() => setIsNovoAgendamentoOpen(true)}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Agendar Paciente para Hoje
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>HORÁRIO</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>DATA</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PACIENTE</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>ESPECIALIDADE</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>CONVÊNIO</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>STATUS</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'right' }}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {consultasExibidas.map((c) => {
                  const badge = getStatusBadge(c.status);
                  const isConcluido = c.status === 'Concluído' || c.status === 'Atendido';

                  return (
                    <tr 
                      key={c.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: 700, color: 'white', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={15} color="var(--accent-primary)" />
                          <span>{c.hora || '--:--'}</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                        {formatDateBR(c.data)}
                      </td>

                      <td style={{ padding: '16px 20px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ 
                            width: 32, 
                            height: 32, 
                            borderRadius: '50%', 
                            background: 'rgba(99, 102, 241, 0.15)', 
                            color: '#818cf8',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700
                          }}>
                            {(c.paciente || 'P')[0]}
                          </div>
                          <div>
                            <div style={{ color: 'white' }}>{c.paciente}</div>
                            {c.carteirinha && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Cartão: {c.carteirinha}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {c.modalidade || 'Consulta Médica'}
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '0.9rem' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '6px', 
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.8rem'
                        }}>
                          {c.convenio || 'Particular'}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: badge.text }}></span>
                          {badge.label}
                        </span>
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {/* Botão de Confirmar (se agendado) */}
                          {c.status === 'Agendado' && (
                            <button
                              onClick={() => handleAlterarStatus(c.id, 'Confirmado')}
                              title="Confirmar Presença do Paciente"
                              style={{
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <UserCheck size={14} />
                              Confirmar
                            </button>
                          )}

                          {/* Botão de Atender / Prontuário */}
                          <button
                            onClick={() => handleIniciarAtendimento(c)}
                            title={isConcluido ? 'Ver Prontuário deste Atendimento' : 'Iniciar Atendimento do Paciente'}
                            style={{
                              background: isConcluido ? 'rgba(34, 197, 94, 0.15)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                              color: isConcluido ? '#4ade80' : 'white',
                              border: isConcluido ? '1px solid rgba(34, 197, 94, 0.3)' : 'none',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: isConcluido ? 'none' : '0 4px 10px rgba(99, 102, 241, 0.3)'
                            }}
                          >
                            <Stethoscope size={15} />
                            {isConcluido ? 'Prontuário' : 'Atender'}
                          </button>

                          {/* Botão de Ver Histórico Prévio do Paciente */}
                          <button
                            onClick={() => handleVerHistoricoPaciente(c.paciente)}
                            title="Ver Histórico Clínico do Paciente"
                            style={{
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-color)',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            <History size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL DE ATENDIMENTO MÉDICO & PRONTUÁRIO ELETRÔNICO */}
      {/* ========================================================= */}
      {consultaEmAtendimento && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '920px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <button
              onClick={() => setConsultaEmAtendimento(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: 'var(--text-secondary)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Prontuário */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              <div style={{ width: 50, height: 50, borderRadius: '12px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={26} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Atendimento Clínico • Prontuário</h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Médico: <strong style={{ color: 'white' }}>{medicoAtivo}</strong></span>
                  <span>Data: <strong style={{ color: 'white' }}>{formatDateBR(consultaEmAtendimento.data)} às {consultaEmAtendimento.hora}</strong></span>
                </div>
              </div>
            </div>

            {/* Ficha Resumida do Paciente */}
            <div style={{ 
              background: 'rgba(0,0,0,0.25)', 
              padding: '16px 20px', 
              borderRadius: '12px', 
              border: '1px solid var(--border-color)',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>NOME DO PACIENTE</span>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>{consultaEmAtendimento.paciente}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>CONVÊNIO / PLANO</span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>{consultaEmAtendimento.convenio || 'Particular'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>CARTEIRINHA</span>
                <span style={{ color: 'white' }}>{consultaEmAtendimento.carteirinha || 'Não informada'}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>MODALIDADE</span>
                <span style={{ color: 'white' }}>{consultaEmAtendimento.modalidade}</span>
              </div>
            </div>

            {/* HISTÓRICO PRÉVIO DO PACIENTE */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} />
                  Histórico de Atendimentos Anteriores ({historicoPaciente.length})
                </h4>
              </div>

              {carregandoHistorico ? (
                <div style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Buscando histórico...</div>
              ) : historicoPaciente.length === 0 ? (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Primeiro atendimento registrado deste paciente no sistema.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '160px', overflowY: 'auto' }}>
                  {historicoPaciente.map((h) => (
                    <div key={h.id} style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      padding: '12px 16px',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{ color: 'white' }}>{formatDateBR(h.data_atendimento)} • {h.medico_nome}</strong>
                        <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>{h.status || 'Concluído'}</span>
                      </div>
                      {h.diagnostico && <div><span style={{ color: 'var(--text-secondary)' }}>Diagnóstico:</span> {h.diagnostico}</div>}
                      {h.prescricao && <div><span style={{ color: 'var(--text-secondary)' }}>Prescrição:</span> {h.prescricao}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FORMULÁRIO DE CONSULTA ATUAL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Queixa Principal / Motivo da Consulta:
                </label>
                <textarea
                  rows={2}
                  value={formProntuario.queixa_principal}
                  onChange={(e) => setFormProntuario({ ...formProntuario, queixa_principal: e.target.value })}
                  placeholder="Ex: Paciente relata dores na coluna lombar há 3 semanas, piora ao sentar..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Diagnóstico Clínico / Avaliação Médica:
                </label>
                <textarea
                  rows={2}
                  value={formProntuario.diagnostico}
                  onChange={(e) => setFormProntuario({ ...formProntuario, diagnostico: e.target.value })}
                  placeholder="Ex: Lombalgia mecânica postural..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#4ade80' }}>
                  Prescrição Médica & Medicamentos (Receituário):
                </label>
                <textarea
                  rows={3}
                  value={formProntuario.prescricao}
                  onChange={(e) => setFormProntuario({ ...formProntuario, prescricao: e.target.value })}
                  placeholder="Ex: 1. Dipirona 500mg - 1 comp de 6/6h se dor&#10;2. Repouso relativo&#10;3. Fisioterapia motora 10 sessões"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Observações & Orientações de Retorno:
                </label>
                <input
                  type="text"
                  value={formProntuario.observacoes}
                  onChange={(e) => setFormProntuario({ ...formProntuario, observacoes: e.target.value })}
                  placeholder="Ex: Retorno em 15 dias para reavaliação de quadro."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* BOTÕES DE AÇÃO DO PRONTUÁRIO */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Printer size={16} />
                Imprimir Receita
              </button>

              <button
                onClick={handleFinalizarAtendimento}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={18} />
                Concluir Atendimento & Salvar Prontuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL ISOLADO DE HISTÓRICO COMPLETO DO PACIENTE */}
      {/* ========================================================= */}
      {pacienteParaHistorico && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3100,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '750px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setPacienteParaHistorico(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Histórico do Paciente</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Registros clínicos de <strong style={{ color: 'white' }}>{pacienteParaHistorico}</strong>
            </p>

            {carregandoHistorico ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</div>
            ) : historicoIsolado.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Nenhum histórico registrado para este paciente ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '400px', overflowY: 'auto' }}>
                {historicoIsolado.map(h => (
                  <div key={h.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#818cf8' }}>{formatDateBR(h.data_atendimento)} às {h.hora_atendimento}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Médico: {h.medico_nome}</span>
                    </div>
                    {h.queixa_principal && (
                      <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Queixa:</strong> {h.queixa_principal}
                      </p>
                    )}
                    {h.diagnostico && (
                      <p style={{ margin: '4px 0', fontSize: '0.85rem' }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Diagnóstico:</strong> {h.diagnostico}
                      </p>
                    )}
                    {h.prescricao && (
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#4ade80' }}>
                        <strong>Prescrição:</strong> {h.prescricao}
                      </p>
                    )}
                    {h.observacoes && (
                      <p style={{ margin: '4px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Obs:</strong> {h.observacoes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE NOVO AGENDAMENTO RÁPIDO */}
      {isNovoAgendamentoOpen && (
        <ConsultaForm
          consulta={{
            data: dataSelecionada,
            hora: '14:00',
            profissional: medicoAtivo,
            modalidade: 'Clínico Geral',
            convenio: 'Particular'
          }}
          onSave={async (novaConsulta) => {
            await consultasService.save(novaConsulta);
            await carregarConsultas();
            setIsNovoAgendamentoOpen(false);
          }}
          onCancel={() => setIsNovoAgendamentoOpen(false)}
        />
      )}

    </div>
  );
};

export default PainelMedico;
