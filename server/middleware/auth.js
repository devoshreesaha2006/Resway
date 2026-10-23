import { db } from '../db/index.js';
export function authRequired(req,res,next){const sid=req.cookies?.['resway.sid'];if(!sid)return res.status(401).json({error:'Sign in required'});const user=db.prepare('SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>?').get(sid,Date.now());if(!user)return res.status(401).json({error:'Session expired'});req.user=user;next();}
export const allow=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({error:'This role cannot perform that operation'});
