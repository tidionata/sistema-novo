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
// TESTE DE CONEXÃO E STATUS
// ==========================================

export const checkDatabaseStatus = async () => {
  try {
    const { count, error } = await supabase
      .from('socios')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.code === 'PGRST205') {
        return {
          connected: true,
          tablesCreated: false,
          message: 'Conectado ao Supabase, mas tabelas ainda não foram criadas no SQL Editor.'
        };
      }
      return {
        connected: false,
        tablesCreated: false,
        message: error.message
      };
    }

    return {
      connected: true,
      tablesCreated: true,
      sociosCount: count || 0,
      message: 'Banco de dados Supabase online e tabelas criadas!'
    };
  } catch (err) {
    return {
      connected: false,
      tablesCreated: false,
      message: err.message
    };
  }
};
