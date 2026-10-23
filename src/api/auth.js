import {api} from './client.js';
export const login=(email,password)=>api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
export const demoLogin=(role)=>api('/auth/login',{method:'POST',body:JSON.stringify({role,demo:true})});
export const signup=(name,email,password,role)=>api('/auth/signup',{method:'POST',body:JSON.stringify({name,email,password,role})});
export const logout=()=>api('/auth/logout',{method:'POST'});
export const currentUser=()=>api('/auth/me');
