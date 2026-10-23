import {api} from './client.js';
export const listRiders=()=>api('/riders');export const getRider=id=>api(`/riders/${id}`);export const updateRiderStatus=(id,status)=>api(`/riders/${id}/status`,{method:'PATCH',body:JSON.stringify({status})});
