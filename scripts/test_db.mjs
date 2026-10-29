import { createClient } from '@supabase/supabase-js';

const url = 'https://mfxhblwklziyccvcqelq.supabase.co';
const key = 'sb_publishable_KSQGSfvs5ywJ4hyl4255vA_kvpLC_0z';
const supabase = createClient(url, key);

async function test() {
  console.log('Testing Supabase connection...');
  const tables = ['socios', 'faturas', 'profissionais', 'consultas', 'cursos', 'usuarios', 'prontuarios', 'atendimentos'];
  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table [${t}]: ERROR -> ${error.message} (${error.code})`);
    } else {
      console.log(`Table [${t}]: OK -> count: ${count}`);
    }
  }
}

test().catch(console.error);
