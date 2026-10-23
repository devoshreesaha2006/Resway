import {api} from './client.js';
export const getSimulation=()=>api('/simulation/state');export const start=()=>api('/simulation/start',{method:'POST'});export const pause=()=>api('/simulation/pause',{method:'POST'});export const reset=()=>api('/simulation/reset',{method:'POST'});export const scenario=type=>api('/simulation/scenario',{method:'POST',body:JSON.stringify({type})});
