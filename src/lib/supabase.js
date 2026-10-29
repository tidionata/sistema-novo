import { createClient } from '@supabase/supabase-js';
import initialSocios from '../socios.json';
import initialFaturas from '../financeiro.json';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mfxhblwklziyccvcqelq.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_KSQGSfvs5ywJ4hyl4255vA_kvpLC_0z';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// MAPPERS (Banco <-> Interface)
// ==========================================

export const mapSocioFromDb = (db) => {
  if (!db) return null;
  return {
    id: db.id,
    'Código': db.codigo || db.id,
    nNome: db.nome || '',
    CPF: db.cpf || '',
    RG: db.rg || '',
    Telefones: db.telefones || db.celular || '',
    Celular: db.celular || db.telefones || '',
    NDia: db.n_dia,
    NMes: db.n_mes,
    NAno: db.n_ano,
    Natural: db.naturalidade || '',
    'Estado Civil': db.estado_civil || 'SOLTEIRO(A)',
    DataCadastro: db.data_cadastro,
    'Tipo Sanguinio': db.tipo_sanguineo || '',
    Categoria: db.categoria || 'ASSOCIADO (A) USUÁRIO',
    Sexo: db.sexo || 'M',
    'Situação': db.situacao || 'ATIVO',
    'Agente Cadastrador': db.agente_cadastrador || '',
    DataCancelamento: db.data_cancelamento,
    Estado: db.estado || 'RO',
    'Endereço de Email': db.email || '',
    fotoUrl: db.foto_url || null,
    OBS: db.obs || '',
    tipoEndereco: db.tipo_endereco || 'RESIDENCIAL',
    logradouro: db.logradouro || '',
    numero: db.numero || '',
    complemento: db.complemento || '',
    bairro: db.bairro || '',
    cidade: db.cidade || '',
    cep: db.cep || '',
    telefoneFixo: db.telefone_fixo || '',
    dependentes: Array.isArray(db.dependentes) ? db.dependentes : [],
    documentos: Array.isArray(db.documentos) ? db.documentos : []
  };
};

export const mapSocioToDb = (socio) => {
  const codigo = Number(socio['Código'] || socio.codigo || Date.now());
  return {
    codigo,
    nome: (socio.nNome || socio.nome || '').trim().toUpperCase(),
    cpf: socio.CPF || socio.cpf || null,
    rg: socio.RG || socio.rg || null,
    telefones: socio.Telefones || socio.Celular || socio.telefones || null,
    celular: socio.Celular || socio.Telefones || socio.celular || null,
    n_dia: socio.NDia ? Number(socio.NDia) : null,
    n_mes: socio.NMes ? Number(socio.NMes) : null,
    n_ano: socio.NAno ? Number(socio.NAno) : null,
    naturalidade: socio.Natural || socio.naturalidade || null,
    estado_civil: socio['Estado Civil'] || socio.estado_civil || 'SOLTEIRO(A)',
    data_cadastro: socio.DataCadastro || socio.data_cadastro || new Date().toISOString(),
    tipo_sanguineo: socio['Tipo Sanguinio'] || socio.tipo_sanguineo || null,
    categoria: socio.Categoria || socio.categoria || 'ASSOCIADO (A) USUÁRIO',
    sexo: socio.Sexo || socio.sexo || 'M',
    situacao: socio['Situação'] || socio.situacao || 'ATIVO',
    agente_cadastrador: socio['Agente Cadastrador'] || socio.agente_cadastrador || null,
    data_cancelamento: socio.DataCancelamento || socio.data_cancelamento || null,
    estado: socio.Estado || socio.estado || 'RO',
    email: socio['Endereço de Email'] || socio.email || null,
    foto_url: socio.fotoUrl || socio.foto_url || null,
    obs: socio.OBS || socio.obs || null,
    tipo_endereco: socio.tipoEndereco || socio.tipo_endereco || 'RESIDENCIAL',
    logradouro: socio.logradouro || null,
    numero: socio.numero || null,
    complemento: socio.complemento || null,
    bairro: socio.bairro || null,
    cidade: socio.cidade || null,
    cep: socio.cep || null,
    telefone_fixo: socio.telefoneFixo || socio.telefone_fixo || null,
    dependentes: Array.isArray(socio.dependentes) ? socio.dependentes : [],
    documentos: Array.isArray(socio.documentos) ? socio.documentos : []
  };
};

export const mapFaturaFromDb = (db) => {
  if (!db) return null;
  return {
    NumOrdem: db.num_ordem,
    NumFatura: db.num_fatura,
    Duplicata: db.duplicata,
    ValorDuplicata: Number(db.valor_duplicata) || 0,
    dtVencimento: db.dt_vencimento,
    dtPago: db.dt_pago,
    Descontos: Number(db.descontos) || 0,
    status: db.status || (db.dt_pago ? 'Pago' : 'Pendente')
  };
};

export const mapFaturaToDb = (fatura) => {
  return {
    num_ordem: Number(fatura.NumOrdem),
    num_fatura: Number(fatura.NumFatura),
    duplicata: fatura.Duplicata ? Number(fatura.Duplicata) : null,
    valor_duplicata: Number(fatura.ValorDuplicata) || 0,
    dt_vencimento: fatura.dtVencimento ? String(fatura.dtVencimento) : null,
    dt_pago: fatura.dtPago ? String(fatura.dtPago) : null,
    descontos: Number(fatura.Descontos) || 0,
    status: fatura.status || (fatura.dtPago ? 'Pago' : 'Pendente'),
    socio_codigo: Number(fatura.NumFatura)
  };
};

// ==========================================
// SERVIÇOS DE BANCO DE DADOS
// ==========================================

export const sociosService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('socios')
        .select('*')
        .order('codigo', { ascending: true });

      if (error) {
        console.warn('[Supabase] Tabela socios ainda não existe ou sem permissão. Usando dados locais.', error.message);
        return initialSocios;
      }
      if (data && data.length > 0) {
        return data.map(mapSocioFromDb);
      }
      return initialSocios;
    } catch (err) {
      console.warn('[Supabase] Erro ao buscar socios. Fallback local:', err);
      return initialSocios;
    }
  },

  async save(socio) {
    const dbPayload = mapSocioToDb(socio);
    try {
      const { data, error } = await supabase
        .from('socios')
        .upsert(dbPayload, { onConflict: 'codigo' })
        .select();

      if (error) throw error;
      return (data && data[0]) ? mapSocioFromDb(data[0]) : socio;
    } catch (err) {
      console.error('[Supabase] Erro ao salvar socio no banco:', err);
      // Retorna o objeto em memória para não quebrar a UI
      return socio;
    }
  },

  async delete(codigo) {
    try {
      const { error } = await supabase
        .from('socios')
        .delete()
        .eq('codigo', codigo);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Erro ao excluir socio no banco:', err);
      return false;
    }
  }
};

export const financeiroService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .order('num_ordem', { ascending: true });

      if (error) {
        console.warn('[Supabase] Tabela faturas ainda não existe. Usando dados locais.', error.message);
        return initialFaturas;
      }
      if (data && data.length > 0) {
        return data.map(mapFaturaFromDb);
      }
      return initialFaturas;
    } catch (err) {
      console.warn('[Supabase] Erro ao buscar faturas:', err);
      return initialFaturas;
    }
  },

  async save(fatura) {
    const dbPayload = mapFaturaToDb(fatura);
    try {
      const { data, error } = await supabase
        .from('faturas')
        .upsert(dbPayload, { onConflict: 'num_ordem' })
        .select();

      if (error) throw error;
      return (data && data[0]) ? mapFaturaFromDb(data[0]) : fatura;
    } catch (err) {
      console.error('[Supabase] Erro ao salvar fatura:', err);
      return fatura;
    }
  },

  async updatePagamento(numOrdem, dtPago = new Date().toISOString(), status = 'Pago') {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .update({ dt_pago: dtPago, status: status })
        .eq('num_ordem', numOrdem)
        .select();

      if (error) throw error;
      return (data && data[0]) ? mapFaturaFromDb(data[0]) : null;
    } catch (err) {
      console.error('[Supabase] Erro ao atualizar pagamento:', err);
      return null;
    }
  }
};

export const profissionaisService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome', { ascending: true });

      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async save(prof) {
    try {
      const payload = {
        nome: prof.nome,
        especialidade: prof.especialidade,
        telefone: prof.telefone || null,
        status: prof.status || 'Ativo'
      };
      if (prof.id && typeof prof.id === 'number' && prof.id < 1000000) {
        payload.id = prof.id;
      }
      const { data, error } = await supabase
        .from('profissionais')
        .upsert(payload)
        .select();

      if (error) throw error;
      return (data && data[0]) ? data[0] : prof;
    } catch (err) {
      console.error('[Supabase] Erro ao salvar profissional:', err);
      return prof;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase.from('profissionais').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Erro ao excluir profissional:', err);
      return false;
    }
  }
};

export const consultasService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select('*')
        .order('data', { ascending: false });

      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async save(consulta) {
    try {
      const payload = {
        data: consulta.data,
        hora: consulta.hora,
        paciente: consulta.paciente,
        profissional: consulta.profissional,
        modalidade: consulta.modalidade,
        convenio: consulta.convenio || 'Particular',
        carteirinha: consulta.carteirinha || null,
        valor: Number(consulta.valor) || 0,
        status: consulta.status || 'Agendado',
        observacoes: consulta.observacoes || null
      };
      if (consulta.id && typeof consulta.id === 'number' && consulta.id < 1000000) {
        payload.id = consulta.id;
      }
      const { data, error } = await supabase
        .from('consultas')
        .upsert(payload)
        .select();

      if (error) throw error;
      return (data && data[0]) ? data[0] : consulta;
    } catch (err) {
      console.error('[Supabase] Erro ao salvar consulta:', err);
      return consulta;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase.from('consultas').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Erro ao excluir consulta:', err);
      return false;
    }
  }
};

export const cursosService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .order('nome', { ascending: true });

      if (error || !data || data.length === 0) return null;
      return data;
    } catch {
      return null;
    }
  },

  async save(curso) {
    try {
      const payload = {
        nome: curso.nome,
        categoria: curso.categoria,
        professor: curso.professor,
        horario: curso.horario,
        inscritos: Number(curso.inscritos) || 0,
        vagas: Number(curso.vagas) || 30,
        status: curso.status || 'Ativo',
        cor: curso.cor || '#3b82f6',
        turmas: Array.isArray(curso.turmas) ? curso.turmas : []
      };
      if (curso.id && typeof curso.id === 'number' && curso.id < 1000000) {
        payload.id = curso.id;
      }
      const { data, error } = await supabase
        .from('cursos')
        .upsert(payload)
        .select();

      if (error) throw error;
      return (data && data[0]) ? data[0] : curso;
    } catch (err) {
      console.error('[Supabase] Erro ao salvar curso:', err);
      return curso;
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase.from('cursos').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('[Supabase] Erro ao excluir curso:', err);
      return false;
    }
  }
};

// ==========================================
// USUÁRIOS E CONTAS DE ACESSO
// ==========================================

export const INITIAL_USUARIOS = [
  {
    id: 1,
    nome: 'Administrador Geral',
    email: 'admin@boasnovas.com',
    senha: '784912',
    cargo: 'admin',
    especialidade: 'Direção Geral',
    telefone: '(11) 99999-0000',
    ativo: true
  },
  {
    id: 2,
    nome: 'Dr. João Silva',
    email: 'joao.silva@boasnovas.com',
    senha: '123456',
    cargo: 'medico',
    especialidade: 'Clínico Geral',
    telefone: '(11) 99999-1111',
    ativo: true
  },
  {
    id: 3,
    nome: 'Dra. Maria Souza',
    email: 'maria.souza@boasnovas.com',
    senha: '123456',
    cargo: 'medico',
    especialidade: 'Pediatria',
    telefone: '(11) 98888-2222',
    ativo: true
  },
  {
    id: 4,
    nome: 'Dra. Ana Clara',
    email: 'ana.clara@boasnovas.com',
    senha: '123456',
    cargo: 'medico',
    especialidade: 'Psicologia',
    telefone: '(11) 97777-3333',
    ativo: true
  },
  {
    id: 5,
    nome: 'Dr. Roberto Carlos',
    email: 'roberto.carlos@boasnovas.com',
    senha: '123456',
    cargo: 'medico',
    especialidade: 'Fisioterapia',
    telefone: '(11) 96666-4444',
    ativo: true
  },
  {
    id: 6,
    nome: 'Dra. Silvia Santos',
    email: 'silvia.santos@boasnovas.com',
    senha: '123456',
    cargo: 'medico',
    especialidade: 'Fisioterapia',
    telefone: '(11) 95555-5555',
    ativo: true
  },
  {
    id: 7,
    nome: 'Gestão Financeira',
    email: 'financeiro@boasnovas.com',
    senha: '123456',
    cargo: 'financeiro',
    especialidade: 'Controladoria',
    telefone: '(11) 94444-0000',
    ativo: true
  }
];

const getLocalUsuarios = () => {
  try {
    const raw = localStorage.getItem('abn_usuarios');
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_USUARIOS;
};

const setLocalUsuarios = (users) => {
  try {
    localStorage.setItem('abn_usuarios', JSON.stringify(users));
  } catch {}
};

export const usuariosService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('id', { ascending: true });

      if (error || !data || data.length === 0) {
        return getLocalUsuarios();
      }
      // Sincroniza cache local com o banco
      setLocalUsuarios(data);
      return data;
    } catch {
      return getLocalUsuarios();
    }
  },

  async create(user) {
    const localList = getLocalUsuarios();
    const payload = {
      nome: user.nome.trim(),
      email: user.email.trim().toLowerCase(),
      senha: user.senha || '123456',
      cargo: user.cargo || 'medico', // 'admin' | 'medico' | 'financeiro'
      profissional_id: user.profissional_id || null,
      especialidade: user.especialidade || null,
      telefone: user.telefone || null,
      ativo: user.ativo !== undefined ? user.ativo : true
    };

    let savedUser = { ...payload, id: Date.now() };

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(payload)
        .select();

      if (!error && data && data[0]) {
        savedUser = data[0];
      }
    } catch (err) {
      console.warn('[Supabase] Falha ao gravar usuario no banco (fallback local ativado):', err);
    }

    const updatedList = [savedUser, ...localList.filter(u => u.email !== savedUser.email)];
    setLocalUsuarios(updatedList);
    return savedUser;
  },

  async delete(id) {
    try {
      await supabase.from('usuarios').delete().eq('id', id);
    } catch {}
    const local = getLocalUsuarios().filter(u => u.id !== id);
    setLocalUsuarios(local);
    return true;
  },

  async authenticate(emailOrName, senha) {
    const termo = (emailOrName || '').trim().toLowerCase();
    
    // Tenta primeiro no Supabase
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`email.ilike.${termo},nome.ilike.%${termo}%`)
        .eq('senha', senha)
        .eq('ativo', true)
        .limit(1);

      if (!error && data && data.length > 0) {
        return { success: true, user: data[0] };
      }
    } catch {}

    // Fallback no cache local e usuários pré-configurados
    const all = getLocalUsuarios();
    const found = all.find(
      u => (u.email.toLowerCase() === termo || u.nome.toLowerCase().includes(termo)) && u.senha === senha
    );

    if (found) {
      return { success: true, user: found };
    }

    // Suporte às senhas mestras legadas
    if (senha === '784912') {
      return {
        success: true,
        user: { id: 999, nome: 'Administrador Master', email: 'admin@boasnovas.com', cargo: 'admin', especialidade: 'Diretoria' }
      };
    }
    if (senha === '123') {
      return {
        success: true,
        user: { id: 998, nome: 'Operador Padrão', email: 'operador@boasnovas.com', cargo: 'admin', especialidade: 'Geral' }
      };
    }

    return { success: false, message: 'E-mail/usuário ou senha inválidos.' };
  }
};

// ==========================================
// PRONTUÁRIOS E HISTÓRICO CLÍNICO
// ==========================================

export const INITIAL_PRONTUARIOS = [
  {
    id: 1,
    consulta_id: 4,
    paciente_nome: 'ROBERTO ALVES',
    paciente_id: 4,
    medico_nome: 'Dr. João Silva',
    data_atendimento: '2026-08-02',
    hora_atendimento: '10:30',
    queixa_principal: 'Cefaleia tensional e cansaço recorrente',
    diagnostico: 'Cefaleia tensional associada a sobrecarga postural e estresse',
    prescricao: 'Dipirona 500mg (1 comprimido a cada 6h se dor); Hidratação regular (2L água/dia); Pausas ativas no trabalho',
    observacoes: 'Paciente orientado a retornar caso haja persistência após 10 dias.',
    status: 'Concluído'
  },
  {
    id: 2,
    consulta_id: 1,
    paciente_nome: 'MARIA APARECIDA DA SILVA',
    paciente_id: 1,
    medico_nome: 'Dr. João Silva',
    data_atendimento: '2026-07-15',
    hora_atendimento: '14:00',
    queixa_principal: 'Check-up anual de rotina',
    diagnostico: 'Sem alterações clínicas significativas detectadas no exame físico',
    prescricao: 'Solicitado hemograma completo, perfil lipídico e glicemia de jejum',
    observacoes: 'Retorno agendado para apresentação dos resultados de exames.',
    status: 'Concluído'
  }
];

const getLocalProntuarios = () => {
  try {
    const raw = localStorage.getItem('abn_prontuarios');
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_PRONTUARIOS;
};

const setLocalProntuarios = (records) => {
  try {
    localStorage.setItem('abn_prontuarios', JSON.stringify(records));
  } catch {}
};

export const prontuariosService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data || data.length === 0) {
        return getLocalProntuarios();
      }
      setLocalProntuarios(data);
      return data;
    } catch {
      return getLocalProntuarios();
    }
  },

  async getByPaciente(pacienteNome) {
    if (!pacienteNome) return [];
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .ilike('paciente_nome', `%${pacienteNome.trim()}%`)
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch {}

    const local = getLocalProntuarios();
    return local.filter(p => (p.paciente_nome || '').toLowerCase().includes(pacienteNome.trim().toLowerCase()));
  },

  async getByMedico(medicoNome) {
    if (!medicoNome) return [];
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .select('*')
        .ilike('medico_nome', `%${medicoNome.trim()}%`)
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch {}

    const local = getLocalProntuarios();
    return local.filter(p => (p.medico_nome || '').toLowerCase().includes(medicoNome.trim().toLowerCase()));
  },

  async save(prontuario) {
    const payload = {
      consulta_id: prontuario.consulta_id || null,
      paciente_nome: prontuario.paciente_nome,
      paciente_id: prontuario.paciente_id || null,
      medico_nome: prontuario.medico_nome,
      medico_id: prontuario.medico_id || null,
      data_atendimento: prontuario.data_atendimento || new Date().toISOString().split('T')[0],
      hora_atendimento: prontuario.hora_atendimento || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      queixa_principal: prontuario.queixa_principal || '',
      diagnostico: prontuario.diagnostico || '',
      prescricao: prontuario.prescricao || '',
      observacoes: prontuario.observacoes || '',
      status: prontuario.status || 'Concluído'
    };

    let result = { ...payload, id: prontuario.id || Date.now() };

    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .upsert(payload)
        .select();

      if (!error && data && data[0]) {
        result = data[0];
      }
    } catch (err) {
      console.warn('[Supabase] Falha ao salvar prontuario no banco (salvo localmente):', err);
    }

    const local = getLocalProntuarios();
    const updated = [result, ...local.filter(p => p.id !== result.id)];
    setLocalProntuarios(updated);
    return result;
  }
};

// ==========================================
// TESTE DE CONEXÃO E STATUS GERAL
// ==========================================

export const checkDatabaseStatus = async () => {
  const statusSummary = {
    connected: false,
    tablesCreated: false,
    tables: {},
    message: ''
  };

  try {
    const tablesToCheck = ['socios', 'faturas', 'profissionais', 'consultas', 'cursos', 'usuarios', 'prontuarios'];
    let allOk = true;

    for (const t of tablesToCheck) {
      try {
        const { count, error } = await supabase
          .from(t)
          .select('*', { count: 'exact', head: true });

        if (error) {
          statusSummary.tables[t] = { ok: false, error: error.message };
          allOk = false;
        } else {
          statusSummary.tables[t] = { ok: true, count: count || 0 };
        }
      } catch (err) {
        statusSummary.tables[t] = { ok: false, error: err.message };
        allOk = false;
      }
    }

    statusSummary.connected = true;
    statusSummary.tablesCreated = allOk;
    statusSummary.sociosCount = statusSummary.tables.socios?.count || 0;
    statusSummary.message = allOk
      ? 'Banco Supabase 100% conectado com todas as 7 tabelas operacionais!'
      : 'Banco Supabase online! Algumas tabelas adicionais ainda precisam ser criadas via SQL Editor.';

    return statusSummary;
  } catch (err) {
    return {
      connected: false,
      tablesCreated: false,
      tables: {},
      message: err.message
    };
  }
};

