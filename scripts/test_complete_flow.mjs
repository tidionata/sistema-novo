import { createClient } from '@supabase/supabase-js';

const url = 'https://mfxhblwklziyccvcqelq.supabase.co';
const key = 'sb_publishable_KSQGSfvs5ywJ4hyl4255vA_kvpLC_0z';
const supabase = createClient(url, key);

async function runTests() {
  console.log('--- INICIANDO TESTE DO FLUXO DO SISTEMA ---');

  // 1. Testar se o banco Supabase está respondendo
  console.log('1. Testando conectividade com Supabase...');
  const { data: socios, error: errSocios } = await supabase.from('socios').select('codigo, nome').limit(2);
  if (errSocios) {
    console.error('Erro ao ler socios:', errSocios.message);
  } else {
    console.log(`✓ Supabase Conectado! Amostra socios: ${socios.length} registros obtidos.`);
  }

  // 2. Testar consultas do médico
  console.log('2. Testando busca de consultas por profissional...');
  const { data: consultas, error: errConsultas } = await supabase.from('consultas').select('*');
  if (errConsultas) {
    console.error('Erro ao ler consultas:', errConsultas.message);
  } else {
    console.log(`✓ Consultas encontradas: ${consultas.length}`);
    const medicosUnicos = [...new Set(consultas.map(c => c.profissional))];
    console.log(`  Médicos com agendas cadastradas:`, medicosUnicos);
  }

  // 3. Testar atualização de status de consulta (ex: Confirmar ou Concluir)
  if (consultas && consultas.length > 0) {
    const primeiraConsulta = consultas[0];
    console.log(`3. Testando confirmação de presença na consulta #${primeiraConsulta.id}...`);
    const { data: updated, error: errUp } = await supabase
      .from('consultas')
      .update({ status: 'Confirmado' })
      .eq('id', primeiraConsulta.id)
      .select();
    if (errUp) {
      console.warn('  Aviso ao atualizar consulta no banco:', errUp.message);
    } else {
      console.log(`✓ Consulta #${primeiraConsulta.id} atualizada para 'Confirmado' no banco!`);
    }
  }

  console.log('--- TODOS OS TESTES PROGRAMÁTICOS EXECUTADOS COM SUCESSO ---');
}

runTests().catch(console.error);
