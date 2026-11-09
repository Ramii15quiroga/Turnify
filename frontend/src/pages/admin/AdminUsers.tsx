import React,{useEffect,useState} from 'react';
import {apiRequest} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
type AdminUser={id:string;name:string;email:string;role:'CLIENT'|'ADMIN';isActive:boolean};
export const AdminUsers:React.FC=()=>{
 const {user}=useAuth(); const [users,setUsers]=useState<AdminUser[]>([]); const [error,setError]=useState('');
 const load=()=>apiRequest<AdminUser[]>('/admin/users').then(setUsers).catch((e:any)=>setError(e.message));
 useEffect(()=>{load()},[]);
 const update=async(u:AdminUser,patch:Partial<Pick<AdminUser,'role'|'isActive'>>)=>{setError('');try{await apiRequest(`/admin/users/${u.id}`,{method:'PATCH',body:JSON.stringify(patch)});await load()}catch(e:any){setError(e.message)}};
 return <section className="space-y-5 py-4"><header><h1 className="text-3xl font-bold">Gestión de usuarios</h1><p className="text-sm text-slate-600">Roles y acceso a Turnify.</p></header>{error&&<p className="p-3 bg-rose-50 text-rose-700 rounded-lg">{error}</p>}<div className="bg-white rounded-2xl border overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50"><tr>{['Nombre','Correo','Rol','Estado','Acciones'].map(x=><th key={x} className="text-left p-3">{x}</th>)}</tr></thead><tbody>{users.map(u=><tr key={u.id} className="border-t"><td className="p-3">{u.name}</td><td className="p-3">{u.email}</td><td className="p-3"><select className="border rounded p-1" value={u.role} onChange={e=>update(u,{role:e.target.value as AdminUser['role']})} disabled={u.id===user?.id}><option value="CLIENT">Cliente</option><option value="ADMIN">Administrador</option></select></td><td className="p-3">{u.isActive?'Activo':'Desactivado'}</td><td className="p-3"><button disabled={u.id===user?.id} className="text-indigo-700 font-semibold disabled:text-slate-400" onClick={()=>update(u,{isActive:!u.isActive})}>{u.isActive?'Desactivar':'Activar'}</button></td></tr>)}</tbody></table>{!users.length&&!error&&<p className="p-6 text-slate-500">No hay usuarios para mostrar.</p>}</div></section>
};
