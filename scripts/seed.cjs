const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const rootDir = path.resolve(__dirname, '..');

// Carregar variáveis do .env manualmente se necessário
let supabaseUrl = 'https://mfxhblwklziyccvcqelq.supabase.co';
let supabaseKey = 'sb_publishable_KSQGSfvs5ywJ4hyl4255vA_kvpLC_0z';

if (fs.existsSync(path.join(rootDir, '.env'))) {
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY') supabaseKey = val;
    }
  });
}

console.log('--- POVOAMENTO DO BANCO DE DADOS SUPABASE ---');
console.log('Conectando a:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const socios = JSON.parse(fs.readFileSync(path.join(rootDir, 'src', 'socios.json'), 'utf8').replace(/^\uFEFF/, ''));
  const faturas = JSON.parse(fs.readFileSync(path.join(rootDir, 'src', 'financeiro.json'), 'utf8').replace(/^\uFEFF/, ''));

  // 1. Testar se a tabela socios existe
  const { error: testErr } = await supabase.from('socios').select('id').limit(1);
  if (testErr) {
    console.error('\n❌ ERRO: As tabelas ainda não foram criadas no Supabase!');
    console.error('Mensagem:', testErr.message);
    console.error('\n👉 AÇÃO NECESSÁRIA:');
    console.error('1. Abra o painel do Supabase no navegador.');
    console.error('2. Vá em SQL Editor (ícone na barra lateral esquerda).');
    console.error('3. Abra o arquivo "supabase_schema.sql" deste projeto, copie todo o conteúdo e cole no SQL Editor.');
    console.error('4. Clique no botão "Run" (Executar).');
    console.error('5. Depois execute novamente: npm run db:seed\n');
    process.exit(1);
  }

  console.log('\n✅ Tabelas detectadas no Supabase!');

  // 2. Inserir Sócios
  console.log(`\nInserindo ${socios.length} sócios...`);
  const sociosPayload = socios.map(s => ({
    codigo: Number(s['Código']),
    nome: (s.nNome || '').trim().toUpperCase(),
    cpf: s.CPF || null,
    rg: s.RG || null,
    telefones: s.Telefones || s.Celular || null,
    celular: s.Celular || s.Telefones || null,
    n_dia: s.NDia ? Number(s.NDia) : null,
    n_mes: s.NMes ? Number(s.NMes) : null,
    n_ano: s.NAno ? Number(s.NAno) : null,
    naturalidade: s.Natural || null,
    estado_civil: s['Estado Civil'] || 'SOLTEIRO(A)',
    data_cadastro: s.DataCadastro || new Date().toISOString(),
    tipo_sanguineo: s['Tipo Sanguinio'] || null,
    categoria: s.Categoria || 'ASSOCIADO (A) USUÁRIO',
    sexo: s.Sexo || 'M',
    situacao: s['Situação'] || 'ATIVO',
    agente_cadastrador: s['Agente Cadastrador'] || null,
    data_cancelamento: s.DataCancelamento || null,
    estado: s.Estado || 'RO',
    email: s['Endereço de Email'] || null,
    obs: s.OBS || null
  }));

  // Inserir em lotes de 25
  for (let i = 0; i < sociosPayload.length; i += 25) {
    const chunk = sociosPayload.slice(i, i + 25);
    const { error } = await supabase.from('socios').upsert(chunk, { onConflict: 'codigo' });
    if (error) {
      console.warn(`Aviso no lote de sócios (${i} a ${i + chunk.length}):`, error.message);
    } else {
      console.log(`  Sócios ${i + 1} a ${Math.min(i + chunk.length, sociosPayload.length)} inseridos com sucesso.`);
    }
  }

  // 3. Inserir Faturas
  console.log(`\nInserindo ${faturas.length} faturas...`);
  const faturasPayload = faturas.map(f => ({
    num_ordem: Number(f.NumOrdem),
    num_fatura: Number(f.NumFatura),
    duplicata: f.Duplicata ? Number(f.Duplicata) : null,
    valor_duplicata: Number(f.ValorDuplicata) || 0,
    dt_vencimento: f.dtVencimento ? String(f.dtVencimento) : null,
    dt_pago: f.dtPago ? String(f.dtPago) : null,
    descontos: Number(f.Descontos) || 0,
    status: f.dtPago ? 'Pago' : 'Pendente',
    socio_codigo: Number(f.NumFatura)
  }));

  for (let i = 0; i < faturasPayload.length; i += 25) {
    const chunk = faturasPayload.slice(i, i + 25);
    const { error } = await supabase.from('faturas').upsert(chunk, { onConflict: 'num_ordem' });
    if (error) {
      console.warn(`Aviso no lote de faturas (${i} a ${i + chunk.length}):`, error.message);
    } else {
      console.log(`  Faturas ${i + 1} a ${Math.min(i + chunk.length, faturasPayload.length)} inseridas com sucesso.`);
    }
  }

  console.log('\n🎉 POVOAMENTO DO BANCO DE DADOS CONCLUÍDO COM SUCESSO!');
}

seed().catch(err => {
  console.error('Erro fatal ao rodar seed:', err);
  process.exit(1);
});
