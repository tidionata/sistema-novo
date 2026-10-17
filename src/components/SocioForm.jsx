import React, { useState, useRef } from 'react';
import { X, User, MapPin, Users as UsersIcon, Clock, FileText, Camera, UploadCloud, Plus, Trash2, Eye, CheckCircle } from 'lucide-react';
import '../index.css';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const SocioForm = ({ initialData = null, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Dados da Aba 1: Cadastro
  const [nome, setNome] = useState(initialData?.nNome || '');
  const [celular, setCelular] = useState(initialData?.Telefones || initialData?.Celular || '');
  const [nDia, setNDia] = useState(initialData?.NDia || '');
  const [nMes, setNMes] = useState(initialData?.NMes || '');
  const [nAno, setNAno] = useState(initialData?.NAno || '');
  const [rg, setRg] = useState(initialData?.RG || '');
  const [cpf, setCpf] = useState(initialData?.CPF || '');
  const [natural, setNatural] = useState(initialData?.Natural || '');
  const [estadoCivil, setEstadoCivil] = useState(initialData?.['Estado Civil'] || 'SOLTEIRO(A)');
  const [email, setEmail] = useState(initialData?.['Endereço de Email'] || '');
  const [tipoSanguineo, setTipoSanguineo] = useState(initialData?.['Tipo Sanguinio'] || 'A+');
  const [categoria, setCategoria] = useState(initialData?.Categoria || 'ASSOCIADO (A) USUÁRIO');
  const [situacao, setSituacao] = useState(initialData?.['Situação'] || 'ATIVO');
  const [fotoUrl, setFotoUrl] = useState(initialData?.fotoUrl || null);

  // Dados da Aba 2: Endereço
  const [tipoEndereco, setTipoEndereco] = useState(initialData?.tipoEndereco || 'RESIDENCIAL');
  const [complemento, setComplemento] = useState(initialData?.complemento || '');
  const [logradouro, setLogradouro] = useState(initialData?.logradouro || '');
  const [numero, setNumero] = useState(initialData?.numero || '');
  const [bairro, setBairro] = useState(initialData?.bairro || '');
  const [cidade, setCidade] = useState(initialData?.cidade || '');
  const [uf, setUf] = useState(initialData?.Estado || 'RO');
  const [cep, setCep] = useState(initialData?.cep || '');
  const [telefoneFixo, setTelefoneFixo] = useState(initialData?.telefoneFixo || '');

  // Dados da Aba 3: Dependentes
  const [dependentes, setDependentes] = useState(
    initialData?.dependentes || [
      { id: 1, nome: '', dia: '', mes: '', ano: '', cpf: '', parentesco: 'FILHO(A)', tipoSanguineo: 'A+', foto: null }
    ]
  );

  // Dados da Aba 4: Histórico
  const [historico, setHistorico] = useState(initialData?.OBS || '');

  // Dados da Aba 5: Documentos
  const [documentos, setDocumentos] = useState(initialData?.documentos || []);
  const [isDraggingDoc, setIsDraggingDoc] = useState(false);

  const docInputRef = useRef(null);
  const fotoInputRef = useRef(null);

  const tabs = [
    { id: 'cadastro', label: 'Cadastro', icon: <User size={18} /> },
    { id: 'endereco', label: 'Endereço', icon: <MapPin size={18} /> },
    { id: 'dependentes', label: 'Dependentes', icon: <UsersIcon size={18} /> },
    { id: 'historico', label: 'Histórico', icon: <Clock size={18} /> },
    { id: 'documentos', label: 'Documentos', icon: <FileText size={18} /> }
  ];

  const handleNext = () => setActiveTab(prev => Math.min(prev + 1, tabs.length - 1));
  const handlePrev = () => setActiveTab(prev => Math.max(prev - 1, 0));

  // Funções de Foto do Titular
  const handleFotoSelect = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFotoUrl(url);
  };

  // Funções de Dependentes
  const handleAddDependente = () => {
    setDependentes([
      ...dependentes,
      { id: Date.now(), nome: '', dia: '', mes: '', ano: '', cpf: '', parentesco: 'FILHO(A)', tipoSanguineo: 'A+', foto: null }
    ]);
  };

  const handleRemoveDependente = (id) => {
    setDependentes(dependentes.filter(d => d.id !== id));
  };

  const handleChangeDependente = (id, field, value) => {
    setDependentes(dependentes.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // Funções de Documentos
  const adicionarArquivos = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const novosDocs = Array.from(fileList).map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nome: file.name,
      tamanho: formatFileSize(file.size),
      tipo: file.type || 'application/octet-stream',
      dataEnvio: new Date().toLocaleDateString('pt-BR'),
      url: URL.createObjectURL(file)
    }));
    setDocumentos(prev => [...prev, ...novosDocs]);
  };

  const handleRemoverDocumento = (id) => {
    setDocumentos(prev => prev.filter(doc => doc.id !== id));
  };

  const handleSalvar = () => {
    if (!nome.trim()) {
      alert('Por favor, preencha o nome do sócio na aba Cadastro.');
      setActiveTab(0);
      return;
    }

    const socioSalvo = {
      ...(initialData || {}),
      'Código': initialData?.['Código'] || Date.now(),
      nNome: nome.toUpperCase(),
      Telefones: celular,
      NDia: nDia,
      NMes: nMes,
      NAno: nAno,
      RG: rg,
      CPF: cpf,
      Natural: natural,
      'Estado Civil': estadoCivil,
      'Endereço de Email': email,
      'Tipo Sanguinio': tipoSanguineo,
      Categoria: categoria,
      'Situação': situacao,
      fotoUrl,
      tipoEndereco,
      complemento,
      logradouro,
      numero,
      bairro,
      cidade,
      Estado: uf,
      cep,
      telefoneFixo,
      dependentes,
      OBS: historico,
      documentos
    };

    if (onSave) {
      onSave(socioSalvo);
    } else {
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflow: 'hidden',
        background: 'var(--bg-primary)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>{initialData ? 'Editar Sócio' : 'Novo Sócio'}</h2>
            <p className="subtitle">{initialData ? `Editando cadastro de ${initialData.nNome}` : 'Preencha os dados do novo associado'}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)',
          overflowX: 'auto'
        }}>
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              style={{
                flex: 1,
                padding: '16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === index ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === index ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: activeTab === index ? 600 : 500,
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'documentos' && documentos.length > 0 && (
                <span style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {documentos.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div style={{ padding: '24px', overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: '400px' }}>
          
          {/* Aba 1: Cadastro */}
          {activeTab === 0 && (
            <div style={{ display: 'flex', gap: '32px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormInput label="*Nome" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
                  <FormInput label="Celular" placeholder="(00) 00000-0000" value={celular} onChange={e => setCelular(e.target.value)} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <FormInput label="*Nascimento (Dia)" placeholder="DD" value={nDia} onChange={e => setNDia(e.target.value)} />
                    <FormInput label="(Mês)" placeholder="MM" value={nMes} onChange={e => setNMes(e.target.value)} />
                    <FormInput label="(Ano)" placeholder="AAAA" value={nAno} onChange={e => setNAno(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormInput label="RG" placeholder="000.000 SSP" value={rg} onChange={e => setRg(e.target.value)} />
                    <FormInput label="*CPF" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
                  </div>

                  <FormInput label="Natural" placeholder="Cidade natal" value={natural} onChange={e => setNatural(e.target.value)} />
                  <FormSelect label="Estado Civil" options={['SOLTEIRO(A)', 'CASADO(A)', 'DIVORCIADO(A)', 'VIÚVO(A)', 'AMASIADO(A)']} value={estadoCivil} onChange={e => setEstadoCivil(e.target.value)} />
                  
                  <FormInput label="Email" type="email" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
                  <FormSelect label="Tipo Sanguíneo" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} value={tipoSanguineo} onChange={e => setTipoSanguineo(e.target.value)} />
                  
                  <FormSelect label="*Categoria" options={['ASSOCIADO (A) USUÁRIO', 'ASSOCIADO (A) ADMINISTRADOR', 'CONVIDADO']} value={categoria} onChange={e => setCategoria(e.target.value)} />
                  <FormSelect label="*Situação" options={['ATIVO', 'INATIVO', 'CANCELADO']} value={situacao} onChange={e => setSituacao(e.target.value)} />
                </div>
                <p style={{ color: '#f87171', fontSize: '0.85rem', marginTop: '16px' }}>Campos com * uso obrigatório</p>
              </div>
              
              {/* Photo Upload Area */}
              <div style={{ width: '220px' }}>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleFotoSelect(e.target.files?.[0])}
                />
                <div
                  onClick={() => fotoInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    handleFotoSelect(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    width: '100%',
                    height: '280px',
                    border: '2px dashed var(--border-color)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.color = 'var(--accent-primary)';}}
                  onMouseLeave={e => {e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)';}}
                >
                  {fotoUrl ? (
                    <>
                      <img src={fotoUrl} alt="Foto do Sócio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'rgba(0,0,0,0.65)', color: 'white',
                        padding: '8px', textAlign: 'center', fontSize: '0.8rem'
                      }}>
                        Clique para trocar a foto
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Adicionar Foto</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>Clique ou arraste</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Aba 2: Endereço */}
          {activeTab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <FormSelect label="*Tipo de Endereço" options={['RESIDENCIAL', 'COMERCIAL']} value={tipoEndereco} onChange={e => setTipoEndereco(e.target.value)} />
                <FormInput label="Local" placeholder="Complemento" value={complemento} onChange={e => setComplemento(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                <FormInput label="*Endereço" placeholder="Rua, Avenida..." value={logradouro} onChange={e => setLogradouro(e.target.value)} />
                <FormInput label="*Nº" placeholder="123" value={numero} onChange={e => setNumero(e.target.value)} />
              </div>
              <FormInput label="*Bairro" placeholder="Nome do Bairro" value={bairro} onChange={e => setBairro(e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                <FormInput label="*Cidade" placeholder="Nome da Cidade" value={cidade} onChange={e => setCidade(e.target.value)} />
                <FormInput label="*UF" placeholder="RO" value={uf} onChange={e => setUf(e.target.value)} />
                <FormInput label="*CEP" placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                 <FormInput label="Telefone Fixo" placeholder="(00) 0000-0000" value={telefoneFixo} onChange={e => setTelefoneFixo(e.target.value)} />
                 <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop: '30px'}}>
                   <input type="checkbox" id="usarendereco" defaultChecked style={{width: '18px', height: '18px', accentColor: 'var(--accent-primary)'}} />
                   <label htmlFor="usarendereco">Usar este endereço para correspondência</label>
                 </div>
              </div>
            </div>
          )}

          {/* Aba 3: Dependentes */}
          {activeTab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleAddDependente}
                  style={{
                    background: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  <Plus size={18} /> Adicionar Dependente
                </button>
              </div>
              
              {dependentes.map((dep) => (
                <div key={dep.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', paddingRight: '48px', display: 'flex', gap: '24px', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveDependente(dep.id)}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    title="Remover Dependente"
                  >
                    <Trash2 size={18} />
                  </button>
                  <label style={{ width: '120px', minWidth: '120px', height: '150px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', cursor: 'pointer', overflow: 'hidden' }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleChangeDependente(dep.id, 'foto', URL.createObjectURL(file));
                      }}
                    />
                    {dep.foto ? (
                      <img src={dep.foto} alt="Dependente" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <User size={32} color="var(--text-secondary)" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>Foto</span>
                      </>
                    )}
                  </label>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                     <FormInput label="Nome" placeholder="Nome completo do dependente" value={dep.nome} onChange={e => handleChangeDependente(dep.id, 'nome', e.target.value)} />
                     
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr', gap: '12px' }}>
                        <FormInput label="Nasc (Dia)" placeholder="DD" value={dep.dia} onChange={e => handleChangeDependente(dep.id, 'dia', e.target.value)} />
                        <FormInput label="(Mês)" placeholder="MM" value={dep.mes} onChange={e => handleChangeDependente(dep.id, 'mes', e.target.value)} />
                        <FormInput label="(Ano)" placeholder="AAAA" value={dep.ano} onChange={e => handleChangeDependente(dep.id, 'ano', e.target.value)} />
                        <FormInput label="*CPF" placeholder="000.000.000-00" value={dep.cpf} onChange={e => handleChangeDependente(dep.id, 'cpf', e.target.value)} />
                     </div>
                     
                     <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                       <FormSelect label="Grau de Parentesco" options={['FILHO(A)', 'CÔNJUGE', 'PAI/MÃE', 'OUTROS']} value={dep.parentesco} onChange={e => handleChangeDependente(dep.id, 'parentesco', e.target.value)} />
                       <FormSelect label="Tipo Sanguíneo" options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} value={dep.tipoSanguineo} onChange={e => handleChangeDependente(dep.id, 'tipoSanguineo', e.target.value)} />
                     </div>
                  </div>
                </div>
              ))}

              {dependentes.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                  Nenhum dependente adicionado. Clique em "Adicionar Dependente" acima.
                </p>
              )}
            </div>
          )}

          {/* Aba 4: Histórico */}
          {activeTab === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>OBSERVAÇÕES GERAIS / HISTÓRICO</label>
              <textarea 
                value={historico}
                onChange={e => setHistorico(e.target.value)}
                placeholder="Digite o histórico ou anotações importantes sobre o associado aqui..."
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '250px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '1rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Aba 5: Documentos */}
          {activeTab === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input
                ref={docInputRef}
                type="file"
                multiple
                accept=".pdf,image/*,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => {
                  adicionarArquivos(e.target.files);
                  e.target.value = '';
                }}
              />

              <div
                onClick={() => docInputRef.current?.click()}
                onDragOver={e => {
                  e.preventDefault();
                  setIsDraggingDoc(true);
                }}
                onDragLeave={e => {
                  e.preventDefault();
                  setIsDraggingDoc(false);
                }}
                onDrop={e => {
                  e.preventDefault();
                  setIsDraggingDoc(false);
                  adicionarArquivos(e.dataTransfer.files);
                }}
                style={{
                  width: '100%',
                  height: '200px',
                  border: `2px dashed ${isDraggingDoc ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  background: isDraggingDoc ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              >
                <UploadCloud size={56} style={{ marginBottom: '12px', color: isDraggingDoc ? 'var(--accent-primary)' : 'var(--text-secondary)', opacity: 0.8 }} />
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white' }}>
                  Clique aqui para selecionar ou arraste os arquivos
                </span>
                <span style={{ fontSize: '0.88rem', marginTop: '6px' }}>
                  Suporta PDFs, Imagens (RG, CPF, Comprovante de Residência) ou Documentos
                </span>
              </div>

              {documentos.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0' }}>
                  Nenhum documento anexado ainda.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Documentos Anexados ({documentos.length})
                  </div>
                  {documentos.map(doc => (
                    <div
                      key={doc.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '12px 16px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '8px',
                          background: 'rgba(99, 102, 241, 0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--accent-primary)', flexShrink: 0
                        }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {doc.nome}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {doc.tamanho} • Anexado em {doc.dataEnvio}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.8rem', marginRight: '8px' }}>
                          <CheckCircle size={14} /> Anexado
                        </span>
                        {doc.url && (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              color: 'white',
                              border: '1px solid var(--border-color)',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Eye size={14} /> Abrir
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoverDocumento(doc.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#f87171',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <Trash2 size={14} /> Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <button 
            onClick={handlePrev}
            disabled={activeTab === 0}
            style={{
              background: 'transparent',
              color: activeTab === 0 ? 'rgba(255,255,255,0.2)' : 'white',
              border: '1px solid',
              borderColor: activeTab === 0 ? 'rgba(255,255,255,0.1)' : 'var(--border-color)',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: activeTab === 0 ? 'default' : 'pointer',
              fontWeight: 500
            }}
          >
            Voltar
          </button>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onClose} style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500
            }}>
              Cancelar
            </button>
            
            {activeTab < tabs.length - 1 && (
              <button 
                onClick={handleNext}
                style={{
                  background: 'var(--accent-glow)',
                  color: 'var(--accent-primary)',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Próxima Etapa
              </button>
            )}

            <button 
              onClick={handleSalvar}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                padding: '10px 32px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
              }}
            >
              SALVAR CADASTRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components for Form Fields
const FormInput = ({ label, placeholder, type = "text", value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ 
        background: 'rgba(0,0,0,0.2)', 
        border: '1px solid var(--border-color)', 
        padding: '10px 12px', 
        borderRadius: '6px',
        color: 'white',
        outline: 'none',
        fontSize: '0.95rem',
        width: '100%',
        boxSizing: 'border-box'
      }} 
      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    />
  </div>
);

const FormSelect = ({ label, options, defaultValue, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</label>
    <select 
      value={value !== undefined ? value : defaultValue}
      onChange={onChange}
      style={{ 
        background: 'rgba(0,0,0,0.2)', 
        border: '1px solid var(--border-color)', 
        padding: '10px 12px', 
        borderRadius: '6px',
        color: 'white',
        outline: 'none',
        fontSize: '0.95rem',
        width: '100%',
        boxSizing: 'border-box',
        appearance: 'none',
        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px top 50%',
        backgroundSize: '12px auto'
      }} 
      onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      {options.map(opt => <option key={opt} value={opt} style={{background: 'var(--bg-secondary)'}}>{opt}</option>)}
    </select>
  </div>
);

export default SocioForm;
