import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, RefreshCw, Copy, Check, ExternalLink, X } from 'lucide-react';
import { checkDatabaseStatus, supabase } from '../lib/supabase';
import initialSocios from '../socios.json';
import initialFaturas from '../financeiro.json';

const DatabaseStatusModal = ({ isOpen, onClose, onDataSynced }) => {
  const [status, setStatus] = useState({ loading: true, connected: false, tablesCreated: false, sociosCount: 0, message: '' });
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const checkStatus = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    const result = await checkDatabaseStatus();
    setStatus({
      loading: false,
      connected: result.connected,
      tablesCreated: result.tablesCreated,
      sociosCount: result.sociosCount || 0,
      message: result.message
    });
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleCopySQL = async () => {
    try {
      // Carregar conteúdo do schema
      const res = await fetch('/supabase_schema.sql');
      let sqlText = '';
      if (res.ok) {
        sqlText = await res.text();
      } else {
        // Fallback para importação ou mensagem
        sqlText = '-- Abra o arquivo supabase_schema.sql na raiz do projeto para copiar o script completo.';
      }
      await navigator.clipboard.writeText(sqlText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar SQL:', err);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      // 1. Verificar se tabelas existem
      const { error: testErr } = await supabase.from('socios').select('id').limit(1);
      if (testErr) {
        setFeedback({
          type: 'error',
          text: 'As tabelas ainda não existem no Supabase. Cole o SQL no SQL Editor do Supabase primeiro!'
        });
        setSyncing(false);
        return;
      }

      // 2. Inserir sócios em lote
      const sociosPayload = initialSocios.map(s => ({
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
        estado: s.Estado || 'RO',
        email: s['Endereço de Email'] || null,
        obs: s.OBS || null
      }));

      await supabase.from('socios').upsert(sociosPayload, { onConflict: 'codigo' });

      // 3. Inserir faturas em lote
      const faturasPayload = initialFaturas.map(f => ({
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

      await supabase.from('faturas').upsert(faturasPayload, { onConflict: 'num_ordem' });

      setFeedback({
        type: 'success',
        text: `Sucesso! ${sociosPayload.length} sócios e ${faturasPayload.length} faturas sincronizados com o Supabase.`
      });

      await checkStatus();
      if (onDataSynced) onDataSynced();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Erro ao sincronizar: ' + err.message
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '650px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '28px',
        position: 'relative',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Database size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Banco de Dados Supabase</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Projeto: <code style={{ color: '#818cf8' }}>mfxhblwklziyccvcqelq</code>
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div style={{
          padding: '16px',
          borderRadius: '10px',
          background: status.tablesCreated
            ? 'rgba(34, 197, 94, 0.1)'
            : 'rgba(234, 179, 8, 0.1)',
          border: `1px solid ${status.tablesCreated ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            {status.tablesCreated ? (
              <CheckCircle size={20} style={{ color: '#4ade80' }} />
            ) : (
              <AlertTriangle size={20} style={{ color: '#facc15' }} />
            )}
            <span style={{ fontWeight: 600, color: status.tablesCreated ? '#4ade80' : '#facc15' }}>
              {status.tablesCreated ? 'Banco de Dados Configurado e Ativo' : 'Aguardando Criação das Tabelas'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {status.tablesCreated
              ? `Tabelas detectadas! Total de sócios cadastrados no banco: ${status.sociosCount}.`
              : 'O aplicativo já está configurado com sua URL e chave de API. Falta apenas executar o script SQL no painel Supabase para criar as tabelas.'}
          </p>
        </div>

        {/* Step-by-step for SQL */}
        {!status.tablesCreated && (
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#818cf8' }}>
              Como criar as tabelas no Supabase (em 3 passos):
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>
                Abra o arquivo <strong style={{ color: 'white' }}>supabase_schema.sql</strong> na raiz do projeto (ou clique no botão copiar abaixo).
              </li>
              <li>
                Acesse o{' '}
                <a
                  href="https://supabase.com/dashboard/project/mfxhblwklziyccvcqelq/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#818cf8', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  SQL Editor do Supabase <ExternalLink size={12} />
                </a>
              </li>
              <li>Cole o código SQL e clique em <strong style={{ color: '#4ade80' }}>Run (Executar)</strong>.</li>
            </ol>

            <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
              <button
                onClick={handleCopySQL}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'SQL Copiado!' : 'Copiar Script SQL'}
              </button>

              <a
                href="https://supabase.com/dashboard/project/mfxhblwklziyccvcqelq/sql/new"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={16} /> Abrir SQL Editor
              </a>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem',
            background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: feedback.type === 'success' ? '#4ade80' : '#f87171',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}>
            {feedback.text}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={checkStatus}
            disabled={status.loading}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} className={status.loading ? 'spin' : ''} />
            Verificar Conexão
          </button>

          <button
            onClick={handleSyncData}
            disabled={syncing}
            style={{
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: syncing ? 0.7 : 1
            }}
          >
            <RefreshCw size={16} className={syncing ? 'spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Dados Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatusModal;
