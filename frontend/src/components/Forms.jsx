import React, { useState } from 'react';
import { usuariosAPI } from '../services/api';
import { errorMessage } from './Workspace';
export function Field({ label, options, ...props }) {
  return <label className="block text-sm font-medium">{label}
    {options ? <select className="block w-full border rounded p-2 bg-white mt-1" {...props}>
      <option value="">Selecione</option>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select> : <input className="block w-full border rounded p-2 mt-1" {...props} />}
  </label>;
}
export function CustomerPicker({ onSelect }) {
  const [email, setEmail] = useState(''), [client, setClient] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const search = async () => {
    setBusy(true); setError(''); setClient(null); onSelect('');
    try { const { data } = await usuariosAPI.buscarCliente(email); setClient(data); onSelect(data.id); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <div className="space-y-2"><Field label="Email do cliente cadastrado" type="email" value={email} onChange={e => { setEmail(e.target.value); setClient(null); onSelect(''); }} />
    <button type="button" className="border rounded p-2" disabled={busy || !email} onClick={search}>{busy ? 'Buscando...' : 'Buscar cliente'}</button>
    {client && <p>Cliente: {client.nome}</p>}{error && <p role="alert" className="text-red-700">{error}</p>}
  </div>;
}
