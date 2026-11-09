import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

export const PasswordReset: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      if (token) { const result = await apiRequest<{message:string}>('/auth/password/reset', { method:'POST', body:JSON.stringify({token,password}) }); setMessage(result.message); }
      else { const result = await apiRequest<{message:string}>('/auth/password/forgot', { method:'POST', body:JSON.stringify({email}) }); setMessage(result.message); }
    } catch (e:any) { setError(e.message || 'No se pudo completar la solicitud.'); }
    finally { setBusy(false); }
  };
  return <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-2xl shadow-sm border space-y-4"><h1 className="text-2xl font-bold">{token?'Crear contraseña nueva':'Recuperar contraseña'}</h1><p className="text-sm text-slate-600">{token?'Ingresá una contraseña de al menos 6 caracteres.':'Te enviaremos instrucciones si el correo está registrado.'}</p><form onSubmit={submit} className="space-y-4">{token?<label className="block text-sm">Nueva contraseña<input required minLength={6} type="password" className="mt-1 w-full border rounded-lg p-2" value={password} onChange={e=>setPassword(e.target.value)} /></label>:<label className="block text-sm">Correo electrónico<input required type="email" className="mt-1 w-full border rounded-lg p-2" value={email} onChange={e=>setEmail(e.target.value)} /></label>}<button disabled={busy} className="w-full bg-indigo-600 text-white rounded-lg py-2">{busy?'Procesando…':token?'Actualizar contraseña':'Enviar instrucciones'}</button></form>{message&&<p className="text-emerald-700 text-sm">{message}</p>}{error&&<p className="text-rose-700 text-sm">{error}</p>}</div>;
};
