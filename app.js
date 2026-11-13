'use strict';
/* =====================================================================
   SALE ADMIN VISTAX — ứng dụng một file HTML
   Dữ liệu: lưu trong trình duyệt (localStorage), khóa saleadmin_vistax_v1.
   Dùng chung giữa nhiều người: Xuất / Nhập file dữ liệu (.json) ở Cài đặt.
   ===================================================================== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LS = {get(k){try{return localStorage.getItem(k)}catch(_){return null}}, set(k,v){try{localStorage.setItem(k,v); return true}catch(_){return false}}};
const DB_KEY = 'saleadmin_vistax_v1';

const ICONS = {"home": "<path d=\"M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>", "today": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"4\"/><path d=\"m8 12 3 3 5-6\"/>", "folder": "<path d=\"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "list": "<path d=\"M9 6h12M9 12h12M9 18h12\"/><circle cx=\"4.5\" cy=\"6\" r=\"1\"/><circle cx=\"4.5\" cy=\"12\" r=\"1\"/><circle cx=\"4.5\" cy=\"18\" r=\"1\"/>", "cal": "<rect x=\"3\" y=\"4.5\" width=\"18\" height=\"16.5\" rx=\"2.5\"/><path d=\"M3 9.5h18M8 2.5v4M16 2.5v4\"/>", "chart": "<path d=\"M4 20V11M10 20V5M16 20v-8M21 20H3\"/>", "bell": "<path d=\"M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0\"/>", "hist": "<path d=\"M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5M12 7.5V12l3 2\"/>", "gear": "<path d=\"M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1\"/><circle cx=\"15\" cy=\"7\" r=\"2\"/><circle cx=\"9\" cy=\"12\" r=\"2\"/><circle cx=\"17\" cy=\"17\" r=\"2\"/>", "book": "<path d=\"M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3z\"/><path d=\"M5 17a3 3 0 0 1 3-3h11\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>", "alert": "<path d=\"M12 3 2 20h20zM12 10v4M12 17.5v.01\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>", "pause": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M10 9v6M14 9v6\"/>", "check": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m8 12 3 3 5-6\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>", "hour": "<path d=\"M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9\"/>", "x": "<path d=\"M6 6l12 12M18 6 6 18\"/>", "down": "<path d=\"M12 4v12M6 11l6 6 6-6M4 20h16\"/>", "up": "<path d=\"M12 20V8M6 13l6-6 6 6M4 4h16\"/>", "board": "<rect x=\"3\" y=\"4\" width=\"5\" height=\"16\" rx=\"1.5\"/><rect x=\"10\" y=\"4\" width=\"5\" height=\"11\" rx=\"1.5\"/><rect x=\"17\" y=\"4\" width=\"4\" height=\"8\" rx=\"1.5\"/>"};
const ic = k => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]||''}</svg>`;

/* ---------- Danh mục ---------- */
const ST = [
  {k:'todo',  t:'Chưa bắt đầu', c:''},
  {k:'doing', t:'Đang thực hiện', c:'s-doing'},
  {k:'wait',  t:'Chờ phản hồi', c:'s-wait'},
  {k:'hold',  t:'Tạm hoãn', c:'s-hold'},
  {k:'done',  t:'Hoàn thành', c:'s-done'},
  {k:'cancel',t:'Đã hủy', c:'s-cancel'}];
const STm = Object.fromEntries(ST.map(s => [s.k, s]));
const PR = [{k:'khan',t:'Khẩn'},{k:'cao',t:'Cao'},{k:'tb',t:'Trung bình'},{k:'thap',t:'Thấp'}];
const PRm = Object.fromEntries(PR.map(p => [p.k, p])), PRo = {khan:0,cao:1,tb:2,thap:3};
const ROLES = [{k:'admin',t:'Quản trị viên'},{k:'manager',t:'Quản lý'},{k:'sa',t:'Sale Admin'},{k:'viewer',t:'Người phối hợp / Chỉ xem'}];
const ROm = Object.fromEntries(ROLES.map(r => [r.k, r.t]));
const OPEN = new Set(['todo','doing','wait','hold']);
const REP = {'':'Không lặp', ngay:'Hằng ngày (ngày làm việc)', tuan:'Hằng tuần', thang:'Hằng tháng'};
const STC = {todo:'var(--todo)', doing:'var(--brand)', wait:'var(--wait)', hold:'var(--hold)', done:'var(--done)', cancel:'var(--line)'};

/* ---------- Ngày ---------- */
function iso(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function today(){ return iso(new Date()); }
function pd(s){ const [y,m,d] = String(s).split('-').map(Number); return new Date(y, m-1, d); }
function addD(s, n){ const d = pd(s); d.setDate(d.getDate()+n); return iso(d); }
function vn(s){ if (!s) return ''; const [y,m,d] = s.split('-'); return `${d}/${m}/${y}`; }
function vns(s){ if (!s) return ''; const [,m,d] = s.split('-'); return `${d}/${m}`; }
function dt(s){ if (!s) return ''; const d = new Date(s); return isNaN(d) ? '' : d.toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}); }
const DOW = ['CN','T2','T3','T4','T5','T6','T7'];

/* ---------- Kho dữ liệu (một nguồn duy nhất) ----------
   REMOTE: chạy trong Google Apps Script → dữ liệu ở Google Sheet "Sale Admin VistaX – Dữ liệu", đọc Checklist trực tiếp.
   LOCAL : mở file / GitHub Pages → dữ liệu trong trình duyệt (localStorage). */
const S = {P:{}, I:{}, T:{}, L:[], N:{}, cfg:{}};
const CFG0 = {team:[], workdays:[1,2,3,4,5], holidays:[], soonDays:2, stuckDays:3};
const REMOTE = !!(window.google && google.script && google.script.run);
let SAVE_OK = true, READY = false, USER = {email:'', isOwner:false}, DATA_URL = '', SYNC = {ver:0, pending:false, busy:false, err:'', at:''};
let CK = {deals:[], no:[], at:'', err:'', loading:false};
const gs = (fn, ...args) => new Promise((res, rej) => google.script.run.withSuccessHandler(res).withFailureHandler(rej)[fn](...args));
function applyState(j){ S.P = j.projects || {}; S.I = j.items || {}; S.T = j.tasks || {}; S.L = j.logs || []; S.N = j.notes || {}; S.cfg = {...CFG0, ...(j.config||{})}; }
let LAST = {};  // bản đã đồng bộ của từng bản ghi, để chỉ gửi phần thay đổi
function remember(){ LAST = {}; for (const [c, m] of [['projects',S.P],['items',S.I],['tasks',S.T],['notes',S.N]]) for (const [id, o] of Object.entries(m)) LAST[c+'/'+id] = JSON.stringify(o); LAST.config = JSON.stringify(S.cfg); LAST.logIds = new Set(S.L.map(l => l.id)); }
async function load(){
  if (!REMOTE) {
    let raw = LS.get(DB_KEY), j = null;
    try { j = raw ? JSON.parse(raw) : null; } catch(_) { j = null; }
    applyState(j || seed()); if (!raw) persist(); READY = true; return;
  }
  try {
    const r = await gs('loadAll');
    USER = r.user || USER; DATA_URL = r.dataUrl || ''; SYNC.ver = r.version || 0;
    applyState(r.state || {}); remember(); READY = true; SYNC.at = new Date().toISOString();
  } catch(err) { READY = true; SYNC.err = 'Không tải được dữ liệu: ' + (err && err.message || err); }
  loadChecklist();
}
async function loadChecklist(force){
  if (!REMOTE || CK.loading) return; CK.loading = true; CK.err = ''; if (force) render();
  try { const r = await gs('getChecklist', !!force); CK = {...r, loading:false, err:''}; }
  catch(err) { CK.loading = false; CK.err = (err && err.message) || String(err); }
  render();
}
function snapshot(){ return {app:'sale-admin-vistax', version:1, savedAt:new Date().toISOString(), projects:S.P, items:S.I, tasks:S.T, logs:S.L, notes:S.N, config:S.cfg}; }
function collectOps(){
  const ops = [];
  for (const [c, m] of [['projects',S.P],['items',S.I],['tasks',S.T],['notes',S.N]]) {
    for (const [id, o] of Object.entries(m)) { const j = JSON.stringify(o); if (LAST[c+'/'+id] !== j) ops.push({c, id, v:o}); }
    Object.keys(LAST).filter(k => k.startsWith(c+'/') && !(k.slice(c.length+1) in m)).forEach(k => ops.push({c, id:k.slice(c.length+1), v:null}));
  }
  const cfg = JSON.stringify(S.cfg); if (cfg !== LAST.config) ops.push({c:'config', v:S.cfg});
  const newLogs = S.L.filter(l => !LAST.logIds.has(l.id)); if (newLogs.length) ops.push({c:'logs', v:newLogs});
  return ops;
}
function persist(){
  if (!REMOTE) { SAVE_OK = LS.set(DB_KEY, JSON.stringify(snapshot())); if (!SAVE_OK) toast('Trình duyệt chặn lưu dữ liệu (chế độ ẩn danh hoặc đầy bộ nhớ). Hãy Xuất file dữ liệu ngay.'); return; }
  SYNC.pending = true; syncUI(); clearTimeout(persist.t); persist.t = setTimeout(flush, 350);
}
async function flush(){
  if (SYNC.busy) { persist.t = setTimeout(flush, 400); return; }
  const ops = collectOps(); if (!ops.length) { SYNC.pending = false; syncUI(); return; }
  SYNC.busy = true; syncUI();
  const sent = {}; ops.forEach(o => { if (o.c === 'config') sent.config = JSON.stringify(o.v); else if (o.c !== 'logs') sent[o.c+'/'+o.id] = o.v ? JSON.stringify(o.v) : undefined; });
  try {
    const r = await gs('applyOps', ops);
    Object.entries(sent).forEach(([k, v]) => { if (v === undefined) delete LAST[k]; else LAST[k] = v; });
    ops.filter(o => o.c === 'logs').forEach(o => o.v.forEach(l => LAST.logIds.add(l.id)));
    SYNC.ver = r.version; SYNC.err = ''; SYNC.at = new Date().toISOString();
  } catch(err) { SYNC.err = 'Chưa lưu được: ' + ((err && err.message) || err) + '. Đang thử lại…'; setTimeout(persist, 5000); }
  SYNC.busy = false; SYNC.pending = collectOps().length > 0; syncUI(); if (SYNC.pending) persist();
}
async function poll(){
  if (!REMOTE || SYNC.pending || SYNC.busy || document.hidden || $('#dlg').open) return;
  try { const r = await gs('loadAll', SYNC.ver); if (r && r.state && r.version !== SYNC.ver && !SYNC.pending) { SYNC.ver = r.version; applyState(r.state); remember(); render(); } } catch(_) {}
}
function syncUI(){
  const el = $('#sync'); if (!el) return;
  if (!REMOTE) { el.innerHTML = `<span class="dotc" style="background:var(--soon)"></span>Lưu trên trình duyệt này`; el.title = 'Bản chạy độc lập: dữ liệu chỉ có trên máy này'; return; }
  if (SYNC.err) { el.innerHTML = `<span class="dotc" style="background:var(--late)"></span>Lỗi lưu`; el.title = SYNC.err; return; }
  el.innerHTML = SYNC.busy || SYNC.pending ? `<span class="dotc" style="background:var(--soon)"></span>Đang lưu…` : `<span class="dotc" style="background:var(--done)"></span>Đã lưu`;
  el.title = 'Dữ liệu lưu trong Google Sheet' + (SYNC.at ? ' · lần cuối ' + dt(SYNC.at) : '');
}
window.addEventListener('beforeunload', e => { if (REMOTE && (SYNC.pending || SYNC.busy)) { e.preventDefault(); e.returnValue = ''; } });
if (!REMOTE) window.addEventListener('storage', e => { if (e.key === DB_KEY) { load(); render(); } });
else setInterval(poll, 45000);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- Người dùng & quyền ---------- */
let ME = REMOTE ? '' : (LS.get('sa_me') || '');
function team(){ return (S.cfg.team||[]).filter(m => m.active !== false); }
function people(){ const s = new Set(team().map(m => m.name)); Object.values(S.T).forEach(t => [t.assignee, t.assigner, ...(t.collab||[])].forEach(x => x && s.add(x))); Object.values(S.P).forEach(p => p.owner && s.add(p.owner)); return [...s].sort((a,b) => a.localeCompare(b,'vi')); }
function emailsOf(m){ return String((m&&m.email)||'').toLowerCase().split(/[\s,;]+/).filter(Boolean); }
function meMember(){ return REMOTE && USER.email ? team().find(m => emailsOf(m).includes(USER.email.toLowerCase())) : team().find(m => m.name === ME); }
function syncMe(){ if (!REMOTE) return; const m = meMember(); ME = m ? m.name : (USER.email ? USER.email.split('@')[0] : ''); }
function myRole(){ if (REMOTE && USER.isOwner) return team().length ? 'admin' : 'setup'; if (!team().length) return 'setup'; const m = meMember(); return m ? m.role : 'viewer'; }
function can(act, t){
  const r = myRole();
  if (r === 'setup' || r === 'admin') return true;
  if (act === 'config') return false;
  if (r === 'manager') return act !== 'delete';
  if (r === 'sa'){
    if (['create','export','note'].includes(act)) return true;
    if (act === 'edit' || act === 'status') return !t || [t.assignee, t.assigner, ...(t.collab||[])].includes(ME);
    if (act === 'assign') return !t || t.assigner === ME;
    return false;
  }
  return act === 'note' && !!t && (t.collab||[]).includes(ME);
}
const initials = n => { const w = String(n||'?').replace(/\[.*?\]\s*/,'').trim().split(/\s+/); return ((w.length > 1 ? w[w.length-2][0] : '') + (w[w.length-1]||'?')[0]).toUpperCase(); };
const whoChip = n => n ? `<span class="who"><span class="avatar">${esc(initials(n))}</span>${esc(n)}</span>` : '<span class="flag f-noown">Chưa giao</span>';

/* ---------- Ngày làm việc ---------- */
function isWork(s){ return (S.cfg.workdays||[1,2,3,4,5]).includes(pd(s).getDay()) && !(S.cfg.holidays||[]).some(h => h.date === s); }
function nextWork(s){ let d = addD(s,1); for (let i=0;i<30 && !isWork(d);i++) d = addD(d,1); return d; }
function workBetween(a, b){ if (!a || !b || b <= a) return 0; let n = 0, d = a; for (let i=0;i<500 && d < b;i++){ d = addD(d,1); if (isWork(d)) n++; } return n; }
function addWork(s, n){ let d = s; for (let i=0;i<n;i++) d = nextWork(d); return d; }
function weekStart(s){ const d = pd(s); d.setDate(d.getDate() - (d.getDay()+6)%7); return iso(d); }

/* ---------- Tính toán ---------- */
const tasksOf = f => Object.values(S.T).filter(f);
const isLate = t => OPEN.has(t.status) && t.status !== 'hold' && !!t.due && t.due < today();
const isSoon = t => OPEN.has(t.status) && t.status !== 'hold' && !!t.due && t.due >= today() && workBetween(today(), t.due) <= (S.cfg.soonDays ?? 2);
function isStuck(t){ if (t.status !== 'wait') return false; if (t.followUp && t.followUp < today()) return true; const last = (t.updatedAt||'').slice(0,10); return !!last && workBetween(last, today()) >= (S.cfg.stuckDays ?? 3); }
function progress(list){ const live = list.filter(t => t.status !== 'cancel'); const w = live.reduce((a,t) => a + (+t.weight||1), 0); if (!w) return null; return Math.round(live.filter(t => t.status === 'done').reduce((a,t) => a + (+t.weight||1), 0) / w * 100); }
const itemTasks = id => tasksOf(t => t.itemId === id);
const projTasks = id => tasksOf(t => t.projectId === id);
function autoStatus(list, manual){
  if (manual === 'hold' || manual === 'cancel') return manual;
  const live = list.filter(t => t.status !== 'cancel');
  if (!live.length) return 'todo';
  if (!live.some(t => t.required !== false && t.status !== 'done')) return 'done';
  if (live.some(t => t.status !== 'todo')) return live.some(t => t.status === 'wait') ? 'wait' : 'doing';
  return 'todo';
}
function projRisk(p){
  const ts = projTasks(p.id); if (['done','cancel','hold'].includes(autoStatus(ts, p.status))) return '';
  const pg = progress(ts) ?? 0;
  if (p.due && p.due < today()) return 'Quá hạn dự án';
  if (ts.some(t => isLate(t) && ['khan','cao'].includes(t.priority))) return 'Có việc ưu tiên cao quá hạn';
  if (p.due && workBetween(today(), p.due) <= 5 && pg < 70) return `Còn ≤ 5 ngày làm việc, mới đạt ${pg}%`;
  if (ts.filter(isStuck).length >= 2) return 'Nhiều việc kẹt chờ phản hồi';
  return '';
}
function nextCode(prefix, coll, w){ let mx = 0; Object.values(coll).forEach(o => { const m = String(o.code||'').match(new RegExp('^' + prefix + '-(\\d+)$')); if (m) mx = Math.max(mx, +m[1]); }); return prefix + '-' + String(mx+1).padStart(w, '0'); }
const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/\s+/g,' ').trim();

/* ---------- Mảnh giao diện ---------- */
const stPill = k => `<span class="pill ${STm[k]?.c||''}">${esc(STm[k]?.t||k)}</span>`;
const prPill = k => k ? `<span class="pr p-${k}"><i></i>${esc(PRm[k]?.t||k)}</span>` : '';
const bar = v => v == null ? '<span class="sub">Chưa có việc</span>' : `<div class="pgw"><div class="prog"><i style="width:${v}%"></i></div><span class="code">${v}%</span></div>`;
function flags(t){ const a = []; if (isLate(t)) a.push(`<span class="flag f-late">${ic('alert')}Quá hạn ${workBetween(t.due, today())} ngày LV</span>`); else if (isSoon(t)) a.push(`<span class="flag f-soon">${ic('clock')}Sắp đến hạn</span>`); if (isStuck(t)) a.push(`<span class="flag f-stuck">${ic('hour')}Kẹt chờ</span>`); if (!t.assignee && OPEN.has(t.status)) a.push(`<span class="flag f-noown">${ic('user')}Thiếu người làm</span>`); return a.join(''); }
function pathOf(t){ return `${esc(S.P[t.projectId]?.name||'—')} › ${esc(S.I[t.itemId]?.name||'—')}`; }
function toast(m){ const el = $('#toast'); el.textContent = m; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2800); }
const sampleTag = o => o?.sample ? ' <span class="sample">MẪU</span>' : '';
const emptyBox = (icon, title, text, btn) => `<div class="empty">${ic(icon)}<b>${title}</b><span>${text}</span>${btn||''}</div>`;
const card = (title, body, opt={}) => `<section class="card ${opt.cls||''}">${title?`<div class="ch"><h2>${title}</h2>${opt.right?`<span style="margin-left:auto" class="bar">${opt.right}</span>`:''}</div>`:''}<div class="cb ${opt.flush?'flush':''}">${body}</div></section>`;

/* ---------- Ghi dữ liệu + lịch sử ---------- */
const TRACK = {title:'Tên việc', status:'Trạng thái', assignee:'Người thực hiện', due:'Hạn', priority:'Ưu tiên', todoDate:'Ngày làm', waitWho:'Chờ ai', followUp:'Ngày nhắc lại', blockReason:'Nguyên nhân', nextStep:'Bước tiếp theo', itemId:'Hạng mục', projectId:'Dự án', name:'Tên', owner:'Phụ trách', start:'Bắt đầu', cancelReason:'Lý do hủy', holdUntil:'Xem lại ngày', collab:'Phối hợp', required:'Bắt buộc'};
function fmtV(k, v){ if (v == null || v === '') return ''; if (k === 'status') return STm[v]?.t || v; if (k === 'priority') return PRm[v]?.t || v; if (k === 'itemId') return S.I[v]?.name || v; if (k === 'projectId') return S.P[v]?.name || v; if (Array.isArray(v)) return v.join(', '); if (typeof v === 'boolean') return v ? 'Có' : 'Không'; if (/^\d{4}-\d\d-\d\d$/.test(v)) return vn(v); return String(v); }
function diff(a, b){ const out = []; Object.keys(TRACK).forEach(k => { if (!(k in b)) return; if (JSON.stringify(a?.[k] ?? '') !== JSON.stringify(b[k] ?? '')) out.push({f:TRACK[k], from:fmtV(k, a?.[k]), to:fmtV(k, b[k])}); }); return out; }
function logIt(entity, id, code, action, changes){ S.L.unshift({id:uid(), at:new Date().toISOString(), by:ME||'(chưa chọn tên)', entity, entityId:id, code:code||'', action, changes:changes||[]}); if (S.L.length > 3000) S.L.length = 3000; }
const MAP = {projects:() => S.P, items:() => S.I, tasks:() => S.T};
function save(coll, id, data){
  const m = MAP[coll](); const stamp = {updatedAt:new Date().toISOString(), updatedBy:ME||''};
  if (id && m[id]) { const ch = diff(m[id], data); m[id] = {...m[id], ...data, ...stamp}; if (ch.length) logIt(coll, id, m[id].code, 'Sửa', ch); }
  else { id = id || uid(); m[id] = {...data, ...stamp, id, createdAt:new Date().toISOString(), createdBy:ME||''}; logIt(coll, id, data.code, 'Tạo', [{f:'Tên', from:'', to:data.title||data.name}]); }
  persist(); render(); return id;
}
function remove(coll, id){ const o = MAP[coll]()[id]; if (!o) return; delete MAP[coll]()[id]; logIt(coll, id, o.code, 'Xóa', [{f:'Tên', from:o.title||o.name, to:''}]); persist(); render(); }

/* ---------- Bộ lọc / trạng thái giao diện ---------- */
let VIEW = 'tong-quan';
let F = {q:'', proj:'', item:'', who:'', st:'open', pr:'', due:'', mode: LS.get('sa_tmode') || 'list'};
let TD = {date: today(), who: ''};
let CAL = {mode:'thang', ref: today()};
let RP = {kind:'tuan', from:'', to:'', who:'', proj:''};
let OV = {mine:false};
const VIEWS = {'tong-quan':'Tổng quan','hom-nay':'Daily To-do','du-an':'Dự án','cong-viec':'Công việc','lich':'Lịch','bao-cao':'Báo cáo','thong-bao':'Thông báo','lich-su':'Lịch sử','cai-dat':'Cài đặt','huong-dan':'Hướng dẫn'};

function route(){ const h = location.hash.slice(1); VIEW = VIEWS[h] ? h : (h.startsWith('da-') ? 'du-an' : 'tong-quan'); render(); window.scrollTo(0,0); }
window.addEventListener('hashchange', route);
function go(v){ if (location.hash.slice(1) === v) render(); else location.hash = v; }

function meUI(){
  syncMe(); syncUI();
  if (REMOTE) { $('#meSel').hidden = true; $('#meLab').textContent = 'Đăng nhập Google'; $('#meRole').innerHTML = `<b style="color:#fff">${esc(ME||'—')}</b><br>${esc(USER.email||'')}<br>${esc(myRole()==='setup'?'Chủ sở hữu':(ROm[myRole()]||''))}`; $('#meAv').textContent = ME ? initials(ME) : '?'; $('#meAv').title = USER.email; return; }
  const ps = people();
  $('#meSel').innerHTML = '<option value="">— chọn tên của bạn —</option>' + ps.map(p => `<option ${p===ME?'selected':''}>${esc(p)}</option>`).join('');
  $('#meRole').textContent = myRole() === 'setup' ? 'Chưa cấu hình thành viên' : (ROm[myRole()] || '');
  $('#meAv').textContent = ME ? initials(ME) : '?'; $('#meAv').title = ME ? `${ME} · ${ROm[myRole()]||''}` : 'Chưa chọn tên';
}
$('#meSel').addEventListener('change', e => { ME = e.target.value; LS.set('sa_me', ME); render(); });
$('#gq').addEventListener('input', e => { F.q = e.target.value; if (VIEW !== 'cong-viec') go('cong-viec'); else { clearTimeout(route.t); route.t = setTimeout(render, 200); } });
$('#topNew').addEventListener('click', () => openTask(null));

function render(){
  if (!READY) { $('#view').innerHTML = '<div class="empty">'+ic('hist')+'<b>Đang tải dữ liệu…</b><span>Đọc dữ liệu từ Google Sheet.</span></div>'; return; }
  meUI();
  $$('#nav a').forEach(a => a.classList.toggle('on', a.dataset.v === VIEW));
  const noti = notifications(); const c = $('#cNoti'); c.hidden = !noti.unread; c.textContent = noti.unread;
  const tdN = ME ? tasksOf(t => t.assignee === ME && OPEN.has(t.status) && t.status !== 'hold' && (t.todoDate||t.due||'9') <= today()).length : 0; const ct = $('#cToday'); ct.hidden = !tdN; ct.textContent = tdN;
  const hp = location.hash.startsWith('#da-') && S.P[location.hash.slice(4)];
  $('#crumbs').innerHTML = `VistaX <span>›</span> ${hp ? `<a href="#du-an" style="color:inherit">Dự án</a> <span>›</span> <b>${esc(hp.name)}</b>` : `<b>${VIEWS[VIEW]}</b>`}`;
  const a = document.activeElement, fid = a && a.id, pos = a && a.selectionStart;
  ({'tong-quan':vOverview,'hom-nay':vToday,'du-an':vProjects,'cong-viec':vTasks,'lich':vCal,'bao-cao':vReport,'thong-bao':vNoti,'lich-su':vLog,'cai-dat':vSettings,'huong-dan':vGuide}[VIEW])();
  if (fid && fid !== 'gq') { const el = document.getElementById(fid); if (el && el !== document.activeElement) { el.focus(); try { if (pos != null) el.setSelectionRange(pos,pos); } catch(_) {} } }
  if ($('#gq').value !== F.q && document.activeElement !== $('#gq')) $('#gq').value = F.q;
}
function head(t, sub, actions){ return `<div class="ph"><div><h1>${t}</h1>${sub?`<div class="sub">${sub}</div>`:''}</div>${actions?`<div class="acts">${actions}</div>`:''}</div>${banners()}`; }
function banners(){
  const a = [];
  if (!SAVE_OK) a.push(`<div class="banner err">${ic('alert')}<span>Trình duyệt đang chặn lưu dữ liệu. Thay đổi sẽ mất khi đóng trang: vào <a href="#cai-dat">Cài đặt</a> → Xuất file dữ liệu.</span></div>`);
  if (SYNC.err) a.push(`<div class="banner err">${ic('alert')}<span>${esc(SYNC.err)}</span></div>`);
  if (REMOTE && !USER.isOwner && !meMember() && team().length) a.push(`<div class="banner err">${ic('user')}<span>Tài khoản ${esc(USER.email)} chưa có trong danh sách thành viên nên chỉ xem được. Nhờ Quản trị viên thêm email của bạn ở Cài đặt.</span></div>`);
  if (myRole() === 'setup') a.push(`<div class="banner">${ic('user')}<span>Chưa có danh sách thành viên. Vào <a href="#cai-dat">Cài đặt</a> để thêm bạn và người dùng khác (kèm email Google) cùng vai trò.</span></div>`);
  else if (!ME && !REMOTE) a.push(`<div class="banner">${ic('user')}<span>Chọn tên của bạn ở góc trái dưới để thấy việc của mình và để lịch sử ghi đúng người cập nhật.</span></div>`);
  if (Object.values(S.P).some(p => p.sample)) a.push(`<div class="banner info">${ic('book')}<span>Đang có <b>dữ liệu mẫu</b> (nhãn MẪU) để minh họa. Xóa ở <a href="#cai-dat">Cài đặt</a> → Dữ liệu mẫu khi bắt đầu dùng thật.</span></div>`);
  return a.join('');
}

/* ---------- Bảng công việc ---------- */
function sortTasks(list){ return list.sort((a,b) => (isLate(b)-isLate(a)) || (PRo[a.priority]??9)-(PRo[b.priority]??9) || String(a.due||'9').localeCompare(String(b.due||'9'))); }
function taskTable(list, opt={}){
  if (!list.length) return emptyBox('check', opt.emptyT || 'Không có công việc', opt.empty || 'Không có công việc nào khớp bộ lọc.');
  sortTasks(list);
  return `<div class="tbl"><table><thead><tr>${opt.check?'<th style="width:32px"><input type="checkbox" id="bkAll" aria-label="Chọn tất cả"></th>':''}<th>Công việc</th>${opt.noPath?'':'<th>Dự án › Hạng mục</th>'}<th>Người làm</th><th>Hạn</th><th>Ưu tiên</th><th>Trạng thái</th>${opt.quick?'<th style="width:150px">Cập nhật</th>':''}</tr></thead><tbody>${list.map(t => `
    <tr class="click" data-task="${t.id}">${opt.check?`<td><input type="checkbox" class="bk" value="${t.id}" aria-label="Chọn ${esc(t.code)}"></td>`:''}
      <td style="min-width:240px"><div class="t-title">${esc(t.title)}${sampleTag(t)}</div><div class="t-meta"><span class="code">${esc(t.code)}</span>${flags(t)}${t.status==='wait'&&t.waitWho?`<span>Chờ ${esc(t.waitWho)}${t.followUp?' · nhắc '+vns(t.followUp):''}</span>`:''}${t.nextStep?`<span>➜ ${esc(t.nextStep)}</span>`:''}</div></td>
      ${opt.noPath?'':`<td class="sub" style="min-width:170px">${pathOf(t)}</td>`}<td>${whoChip(t.assignee)}</td>
      <td class="${isLate(t)?'due-late':''}" style="white-space:nowrap">${vn(t.due)}</td><td>${prPill(t.priority)}</td><td>${stPill(t.status)}</td>
      ${opt.quick?`<td><select class="qs" data-id="${t.id}" aria-label="Đổi trạng thái ${esc(t.code)}" ${can('status',t)?'':'disabled'}>${ST.map(s=>`<option value="${s.k}" ${s.k===t.status?'selected':''}>${s.t}</option>`).join('')}</select></td>`:''}
    </tr>`).join('')}</tbody></table></div>`;
}
document.addEventListener('click', e => {
  const tr = e.target.closest('[data-task]'); if (tr && !e.target.closest('select,input,button,a,label')) { openTask(tr.dataset.task); return; }
  const hh = e.target.closest('[data-hash]'); if (hh && !e.target.closest('select,input,button')) { location.hash = hh.dataset.hash; return; }
  const k = e.target.closest('[data-go]'); if (k) { Object.assign(F, JSON.parse(k.dataset.f||'{}')); go(k.dataset.go); }
});
document.addEventListener('change', e => {
  const q = e.target.closest('select.qs'); if (q) quickStatus(q.dataset.id, q.value);
  if (e.target.id === 'bkAll') $$('.bk').forEach(c => c.checked = e.target.checked);
});
function quickStatus(id, st){
  const t = S.T[id]; if (!t) return;
  if (['wait','hold','cancel'].includes(st)) { openTask(id, {status:st}); return; }
  const data = {status:st}; if (st === 'done') data.doneAt = new Date().toISOString(); if (st === 'doing' && !t.start) data.start = today();
  save('tasks', id, data); toast(`${t.code}: ${STm[st].t}`); if (st === 'done') spawnRepeat({...t, ...data});
}
function spawnRepeat(t){
  if (!t.repeat || !t.due) return;
  const nd = t.repeat === 'ngay' ? nextWork(t.due) : t.repeat === 'tuan' ? addD(t.due, 7) : (() => { const d = pd(t.due); d.setMonth(d.getMonth()+1); return iso(d); })();
  const series = t.seriesId || t.id;
  if (tasksOf(x => (x.seriesId === series || x.id === series) && x.due === nd).length) return;
  const {id, doneAt, createdAt, updatedAt, ...rest} = t;
  save('tasks', null, {...rest, code: nextCode('CV', S.T, 4), status:'todo', due:nd, todoDate:nd, start:'', seriesId:series, assignedAt:new Date().toISOString(), note:''});
  toast('Đã tạo lần lặp tiếp theo, hạn ' + vn(nd));
}

/* ---------- 1. Tổng quan ---------- */
function vOverview(){
  const mine = OV.mine && ME;
  const base = tasksOf(t => !mine || t.assignee === ME);
  const open = base.filter(t => OPEN.has(t.status));
  const todayL = open.filter(t => t.status !== 'hold' && ((t.todoDate||'') === today() || t.due === today()));
  const late = open.filter(isLate), soon = open.filter(isSoon), wait = open.filter(t => t.status === 'wait'), noown = open.filter(t => !t.assignee);
  const doneToday = base.filter(t => t.status === 'done' && (t.doneAt||'').slice(0,10) === today());
  const risk = Object.values(S.P).map(p => ({p, r:projRisk(p)})).filter(x => x.r);
  const pg = progress(base);
  const who = mine ? ME : '';
  const k = (cls, icon, n, t, f) => `<button class="kpi ${cls}" type="button" data-go="cong-viec" data-f='${esc(JSON.stringify({...f, who: f.who ?? who}))}'><span class="ic">${ic(icon)}</span><b>${n}</b><span>${t}</span></button>`;
  const cnt = ST.map(s => ({...s, n: base.filter(t => t.status === s.k).length}));
  $('#view').innerHTML = head(`Xin chào${ME?', '+esc(ME):''}`, `${DOW[pd(today()).getDay()]}, ${vn(today())}${isWork(today())?'':' · ngày nghỉ'} · ${open.length} việc đang mở · tiến độ chung ${pg ?? 0}%`,
    `<div class="seg" role="group" aria-label="Phạm vi"><button type="button" id="ovAll" class="${mine?'':'on'}">Toàn đội</button><button type="button" id="ovMe" class="${mine?'on':''}" ${ME?'':'disabled'}>Việc của tôi</button></div>`) + `
    <div class="grid g6">${k('brand','today',todayL.length,'Việc hôm nay',{st:'open',due:'today'})}${k('late','alert',late.length,'Quá hạn',{st:'open',due:'late'})}${k('soon','clock',soon.length,'Sắp đến hạn',{st:'open',due:'soon'})}${k('wait','hour',wait.length,'Đang chờ phản hồi',{st:'wait',due:''})}${k('late','user',noown.length,'Thiếu người làm',{st:'open',due:'',who:'__none'})}${k('done','check',doneToday.length,'Xong hôm nay',{st:'done',due:''})}</div>
    <div class="grid g32">
      ${card(`Quá hạn và sắp đến hạn <span class="code">${late.length + soon.length}</span>`, taskTable([...late, ...soon], {quick:true, emptyT:'Không có việc gấp', empty:'Không có việc quá hạn hoặc sắp đến hạn.'}), {flush:true, right:`<button class="btn sm ghost" type="button" data-go="cong-viec" data-f='{"st":"open","due":"late"}'>Xem tất cả</button>`})}
      <div class="grid" style="align-content:start">
        ${card('Phân bố trạng thái', `${statusBar(cnt)}<div class="legend">${cnt.filter(c=>c.n).map(c=>`<span><i style="background:${STC[c.k]}"></i>${c.t} · ${c.n}</span>`).join('') || '<span>Chưa có công việc</span>'}</div>`)}
        ${card('Dự án có nguy cơ trễ', risk.length ? risk.map(x => `<div data-hash="da-${x.p.id}" style="display:grid;gap:4px;cursor:pointer"><div class="bar"><b>${esc(x.p.name)}</b>${sampleTag(x.p)}<span class="sp"></span><span class="code">${esc(x.p.code)}</span></div><span class="flag f-late">${ic('alert')}${esc(x.r)}</span>${bar(progress(projTasks(x.p.id)))}</div>`).join('<hr style="border:0;border-top:1px solid var(--line2);margin:0">') : emptyBox('check','Không có dự án rủi ro','Các dự án đang đúng tiến độ.'))}
      </div>
    </div>
    ${card(`Việc kẹt chờ phản hồi <span class="code">${wait.filter(isStuck).length}</span>`, taskTable(wait.filter(isStuck), {quick:true, emptyT:'Không có việc kẹt', empty:'Không có việc nào quá ngày nhắc lại hoặc chờ quá ' + (S.cfg.stuckDays ?? 3) + ' ngày làm việc.'}), {flush:true})}`;
  $('#ovAll').onclick = () => { OV.mine = false; render(); };
  $('#ovMe').onclick = () => { OV.mine = true; render(); };
}
function statusBar(cnt){ const tot = cnt.reduce((a,c) => a + c.n, 0); return `<div style="display:flex;height:12px;border-radius:6px;overflow:hidden;background:var(--line2)">${tot ? cnt.filter(c=>c.n).map(c => `<i title="${c.t}: ${c.n}" style="width:${c.n/tot*100}%;background:${STC[c.k]}"></i>`).join('') : ''}</div>`; }

/* ---------- 2. Daily To-do ---------- */
function vToday(){
  const who = TD.who || ME || '', d = TD.date;
  const list = tasksOf(t => (!who || t.assignee === who) && (
      (OPEN.has(t.status) && t.status !== 'hold' && ((t.todoDate || t.due || '9') <= d)) ||
      (t.status === 'done' && (t.doneAt||'').slice(0,10) === d)));
  const openL = list.filter(t => t.status !== 'done'), doneL = list.filter(t => t.status === 'done');
  const carry = openL.filter(t => (t.todoDate||t.due) < d).length;
  const noteKey = d + '_' + (norm(who || 'chung').replace(/\W+/g,'-'));
  const note = S.N[noteKey] || {};
  const ps = people(); const pct = list.length ? Math.round(doneL.length / list.length * 100) : 0;
  $('#view').innerHTML = head('Daily To-do', `Việc của ${who ? esc(who) : 'cả đội'} ngày ${DOW[pd(d).getDay()]} ${vn(d)}: việc lên lịch cho ngày này, việc đến hạn và ${carry} việc chưa xong từ trước.`,
    `<button class="btn" id="tdPrev" type="button" aria-label="Ngày trước">‹</button><input type="date" id="tdDate" value="${d}" aria-label="Ngày"><button class="btn" id="tdNext" type="button" aria-label="Ngày sau">›</button>
     <select id="tdWho" aria-label="Người thực hiện"><option value="">Cả đội</option>${ps.map(p=>`<option ${p===who?'selected':''}>${esc(p)}</option>`).join('')}</select>
     <button class="btn pri" id="tdNew" type="button">${ic('plus')}Thêm việc trong ngày</button>`) + `
    <div class="grid g6">
      <div class="kpi brand"><span class="ic">${ic('today')}</span><b>${openL.length}</b><span>Chưa xong</span></div>
      <div class="kpi done"><span class="ic">${ic('check')}</span><b>${doneL.length}</b><span>Đã xong</span></div>
      <div class="kpi late"><span class="ic">${ic('alert')}</span><b>${openL.filter(isLate).length}</b><span>Quá hạn</span></div>
      <div class="kpi"><span class="ic">${ic('chart')}</span><b>${pct}%</b><span>Hoàn thành trong ngày</span></div></div>
    ${card(`Danh sách việc`, taskTable(list, {quick:true, emptyT:'Chưa có việc cho ngày này', empty: 'Bấm “Thêm việc trong ngày” để lên kế hoạch.'}), {flush:true, right:`<button class="btn sm" id="tdCarry" type="button" ${openL.length?'':'disabled'}>Chuyển việc chưa xong sang ${vns(nextWork(d))}</button>`})}
    ${card('Ghi chú cuối ngày', `<div class="form">
        <label class="full" for="nDone">Kết quả chính trong ngày<textarea id="nDone" placeholder="Việc đã xong, kết quả đạt được">${esc(note.done)}</textarea></label>
        <label for="nIssue">Vấn đề, cần hỗ trợ hoặc báo quản lý<textarea id="nIssue">${esc(note.issue)}</textarea></label>
        <label for="nPlan">Ưu tiên ngày làm việc tiếp theo<textarea id="nPlan">${esc(note.plan)}</textarea></label></div>
      <div class="bar"><span class="sub">${note.updatedAt?`Lưu lúc ${dt(note.updatedAt)} bởi ${esc(note.by)}`:'Chưa có ghi chú cho ngày này.'}</span><span class="sp"></span><button class="btn pri" id="nSave" type="button" ${who?'':'disabled'} title="${who?'':'Chọn người thực hiện trước'}">Lưu ghi chú</button></div>`)}`;
  $('#tdDate').onchange = e => { TD.date = e.target.value || today(); render(); };
  $('#tdWho').onchange = e => { TD.who = e.target.value; render(); };
  $('#tdPrev').onclick = () => { TD.date = addD(TD.date, -1); render(); };
  $('#tdNext').onclick = () => { TD.date = addD(TD.date, 1); render(); };
  $('#tdNew').onclick = () => openTask(null, {todoDate:d, assignee:who, due:d});
  $('#nSave').onclick = () => { S.N[noteKey] = {date:d, who, done:$('#nDone').value, issue:$('#nIssue').value, plan:$('#nPlan').value, by:ME||'', updatedAt:new Date().toISOString()}; persist(); render(); toast('Đã lưu ghi chú cuối ngày'); };
  $('#tdCarry').onclick = () => {
    const nd = nextWork(d); const mv = openL.filter(t => t.status !== 'hold');
    confirmBox(`Chuyển ${mv.length} việc sang ${vn(nd)}?`, 'Chỉ đổi “Ngày làm”, không tạo bản ghi mới nên không bị trùng. Hạn hoàn thành giữ nguyên; việc cần dời hạn, mở việc đó để đổi và ghi lý do.', () => {
      mv.forEach(t => { const ch = diff(t, {todoDate:nd}); S.T[t.id] = {...t, todoDate:nd, updatedAt:new Date().toISOString(), updatedBy:ME}; if (ch.length) logIt('tasks', t.id, t.code, 'Sửa', ch); });
      persist(); render(); toast(`Đã chuyển ${mv.length} việc sang ${vn(nd)}`);
    });
  };
}

/* ---------- 3. Dự án ---------- */
function vProjects(){
  const hp = location.hash.startsWith('#da-') ? location.hash.slice(4) : '';
  if (hp) return S.P[hp] ? vProject(S.P[hp]) : ($('#view').innerHTML = head('Không tìm thấy dự án', 'Dự án có thể đã bị xóa.', `<button class="btn" data-hash="du-an" type="button">Về danh sách dự án</button>`));
  const list = Object.values(S.P).sort((a,b) => String(a.code).localeCompare(String(b.code)));
  $('#view').innerHTML = head('Dự án', `${list.length} dự án · cấp 1 của cấu trúc Dự án › Hạng mục › Công việc`,
    `<button class="btn" id="impCk" type="button">${ic('down')}${REMOTE?'Lấy deal từ Checklist':'Nhập từ Checklist'}</button><button class="btn pri" id="newProj" type="button" ${can('create')?'':'disabled'}>${ic('plus')}Tạo dự án</button>`) +
    (list.length ? `<div class="grid g4">${list.map(p => { const ts = projTasks(p.id), r = projRisk(p), pg = progress(ts); return `
      <article class="card" data-hash="da-${p.id}" style="cursor:pointer"><div class="cb">
        <div class="bar"><span class="code">${esc(p.code)}${p.dealId?' · '+esc(p.dealId):''}</span><span class="sp"></span>${stPill(autoStatus(ts, p.status))}</div>
        <div><div class="t-title" style="font-size:15px">${esc(p.name)}${sampleTag(p)}</div><div class="sub">${esc(p.cdt||'—')}</div></div>
        ${bar(pg)}
        ${REMOTE && p.dealId && ckDeal(p.dealId) ? `<div class="bar sub"><span>Checklist: <b style="color:var(--ink2)">${esc(ckDeal(p.dealId).stage)}</b></span>${ckNo(p.dealId).length?`<span class="sp"></span><span>Còn nợ <b style="color:${ckNo(p.dealId).some(n=>n.st==='Quá hạn')?'var(--late)':'var(--ink2)'}">${money(ckNo(p.dealId).reduce((a,n)=>a+(+n.con||0),0))}</b></span>`:''}</div>` : ''}
        <div class="bar sub"><span>${ts.filter(t=>OPEN.has(t.status)).length} việc mở</span>${ts.filter(isLate).length?`<span class="f-late flag">${ts.filter(isLate).length} quá hạn</span>`:''}<span class="sp"></span><span>Hạn ${vn(p.due)||'—'}</span></div>
        <div class="bar">${whoChip(p.owner)}<span class="sp"></span>${prPill(p.priority)}</div>
        ${r?`<span class="flag f-late">${ic('alert')}${esc(r)}</span>`:''}
      </div></article>`; }).join('')}</div>`
    : card('', emptyBox('folder','Chưa có dự án nào','Tạo dự án mới hoặc nhập danh sách deal từ file Checklist.', `<div class="bar"><button class="btn" type="button" id="impCk2">Nhập từ Checklist</button><button class="btn pri" type="button" id="newProj2">Tạo dự án</button></div>`)));
  $('#newProj').onclick = () => openProject(null); $('#impCk').onclick = importChecklist;
  if ($('#newProj2')) { $('#newProj2').onclick = () => openProject(null); $('#impCk2').onclick = importChecklist; }
}
function vProject(p){
  const items = Object.values(S.I).filter(i => i.projectId === p.id).sort((a,b) => String(a.code).localeCompare(String(b.code)));
  const ts = projTasks(p.id); const ast = autoStatus(ts, p.status);
  const reqOpen = ts.filter(t => t.required !== false && OPEN.has(t.status)).length;
  $('#view').innerHTML = head(`${esc(p.name)}${sampleTag(p)}`, `${esc(p.code)}${p.dealId?' · Deal '+esc(p.dealId):''}${p.cdt?' · '+esc(p.cdt):''} · ${vn(p.start)||'?'} → ${vn(p.due)||'?'}`,
    `<button class="btn" id="editProj" type="button" ${can('edit')?'':'disabled'}>Sửa dự án</button><button class="btn pri" id="newItem" type="button" ${can('create')?'':'disabled'}>${ic('plus')}Thêm hạng mục</button>`) + `
    <div class="grid g6">
      <div class="kpi brand"><span class="ic">${ic('folder')}</span><b style="font-size:15px">${STm[ast].t}</b><span>${reqOpen?`Còn ${reqOpen} việc bắt buộc`:'Trạng thái tự tính'}</span></div>
      <div class="kpi"><span class="ic">${ic('chart')}</span><b>${progress(ts) ?? 0}%</b><span>Tiến độ</span></div>
      <div class="kpi late"><span class="ic">${ic('alert')}</span><b>${ts.filter(isLate).length}</b><span>Việc quá hạn</span></div>
      <div class="kpi wait"><span class="ic">${ic('hour')}</span><b>${ts.filter(t=>t.status==='wait').length}</b><span>Đang chờ phản hồi</span></div></div>
    ${(p.goal||p.links||p.members?.length) ? card('Thông tin dự án', `<div class="form"><div class="full"><div class="sub">Mục tiêu</div><div>${esc(p.goal||'—')}</div></div><div><div class="sub">Phụ trách chính</div>${whoChip(p.owner)}</div><div><div class="sub">Thành viên</div>${esc((p.members||[]).join(', ')||'—')}</div>${p.links?`<div class="full"><div class="sub">Tài liệu</div>${linkify(p.links)}</div>`:''}</div>`) : ''}
    ${ckCard(p)}
    <div class="tree">${items.length ? items.map(i => { const it = itemTasks(i.id); return `
      <section class="card item"><div class="ch"><span class="code">${esc(i.code)}</span><h2>${esc(i.name)}</h2>${stPill(autoStatus(it, i.status))}${prPill(i.priority)}<span class="sub">${esc(i.owner||'—')} · hạn ${vn(i.due)||'—'}</span><span class="sp" style="flex:1"></span><div style="width:150px">${bar(progress(it))}</div>
        <button class="btn sm" type="button" data-edit-item="${i.id}" ${can('edit')?'':'disabled'}>Sửa</button><button class="btn sm pri" type="button" data-add-task="${i.id}" ${can('create')?'':'disabled'}>${ic('plus')}Việc</button></div>
        <div class="cb flush">${i.goal?`<div class="sub" style="padding:10px 16px 0">Kết quả cần đạt: ${esc(i.goal)}</div>`:''}${taskTable(it, {quick:true, noPath:true, emptyT:'Chưa có công việc', empty:'Bấm “+ Việc” để thêm công việc chi tiết.'})}</div></section>`; }).join('')
      : card('', emptyBox('list','Dự án chưa có hạng mục','Tạo hạng mục (ví dụ: Hợp đồng, Hồ sơ thanh toán, Bàn giao) rồi thêm công việc vào từng hạng mục.'))}</div>
    ${card('Lịch sử thay đổi', logList(S.L.filter(l => l.entityId === p.id || items.some(i => i.id === l.entityId) || ts.some(t => t.id === l.entityId)).slice(0,40)))}`;
  $('#editProj').onclick = () => openProject(p.id);
  if ($('#ckRe')) $('#ckRe').onclick = () => loadChecklist(true);
  $('#newItem').onclick = () => openItem(null, p.id);
  $$('[data-edit-item]').forEach(b => b.onclick = () => openItem(b.dataset.editItem));
  $$('[data-add-task]').forEach(b => b.onclick = () => { const i = S.I[b.dataset.addTask]; openTask(null, {projectId:i.projectId, itemId:i.id}); });
}
function linkify(s){ return String(s).split(/\s+/).filter(Boolean).map(u => /^https?:\/\//.test(u) ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//,'').slice(0,48))}</a>` : esc(u)).join(' '); }

/* ---------- 4. Công việc ---------- */
function filtered(){
  const q = norm(F.q);
  return tasksOf(t => {
    if (F.proj && t.projectId !== F.proj) return false;
    if (F.item && t.itemId !== F.item) return false;
    if (F.who === '__none') { if (t.assignee) return false; } else if (F.who && t.assignee !== F.who && !(t.collab||[]).includes(F.who)) return false;
    if (F.st === 'open') { if (!OPEN.has(t.status)) return false; } else if (F.st && t.status !== F.st) return false;
    if (F.pr && t.priority !== F.pr) return false;
    if (F.due === 'late' && !isLate(t)) return false;
    if (F.due === 'soon' && !isSoon(t)) return false;
    if (F.due === 'today' && !((t.todoDate||'') === today() || t.due === today())) return false;
    if (F.due === 'stuck' && !isStuck(t)) return false;
    if (q && !norm([t.code, t.title, t.result, t.note, S.P[t.projectId]?.name, S.I[t.itemId]?.name, t.assignee].join(' ')).includes(q)) return false;
    return true;
  });
}
function vTasks(){
  const kan = F.mode === 'board';
  const list = filtered(); const ps = people();
  const items = Object.values(S.I).filter(i => !F.proj || i.projectId === F.proj);
  const sel = (id, lab, opts) => `<select id="${id}" aria-label="${lab}">${opts}</select>`;
  $('#view').innerHTML = head('Công việc', `${list.length} việc khớp bộ lọc`,
    `<div class="seg" role="group" aria-label="Kiểu xem"><button type="button" id="mList" class="${kan?'':'on'}">${ic('list')} Danh sách</button><button type="button" id="mBoard" class="${kan?'on':''}">${ic('board')} Bảng</button></div><button class="btn" id="csvT" type="button">${ic('down')}Xuất CSV</button><button class="btn pri" id="newTask" type="button">${ic('plus')}Tạo công việc</button>`) + `
    <div class="card"><div class="cb"><div class="bar">
      ${sel('fp','Dự án',`<option value="">Tất cả dự án</option>${Object.values(S.P).map(p=>`<option value="${p.id}" ${p.id===F.proj?'selected':''}>${esc(p.name)}</option>`).join('')}`)}
      ${sel('fi','Hạng mục',`<option value="">Tất cả hạng mục</option>${items.map(i=>`<option value="${i.id}" ${i.id===F.item?'selected':''}>${esc(i.name)}</option>`).join('')}`)}
      ${sel('fw','Người',`<option value="">Mọi người</option><option value="__none" ${F.who==='__none'?'selected':''}>Chưa giao</option>${ps.map(p=>`<option ${p===F.who?'selected':''}>${esc(p)}</option>`).join('')}`)}
      ${kan?'':sel('fs','Trạng thái',`<option value="open" ${F.st==='open'?'selected':''}>Đang mở</option><option value="" ${!F.st?'selected':''}>Mọi trạng thái</option>${ST.map(s=>`<option value="${s.k}" ${s.k===F.st?'selected':''}>${s.t}</option>`).join('')}`)}
      ${sel('fr','Ưu tiên',`<option value="">Mọi ưu tiên</option>${PR.map(p=>`<option value="${p.k}" ${p.k===F.pr?'selected':''}>${p.t}</option>`).join('')}`)}
      ${sel('fd','Hạn',`<option value="">Mọi hạn</option>${[['today','Hôm nay'],['soon','Sắp đến hạn'],['late','Quá hạn'],['stuck','Kẹt chờ']].map(([k,t])=>`<option value="${k}" ${F.due===k?'selected':''}>${t}</option>`).join('')}`)}
      ${F.q?`<span class="chip on" id="fqx">“${esc(F.q)}” ✕</span>`:''}
      <span class="sp"></span><button class="btn ghost sm" id="fx" type="button">Bỏ lọc</button></div>
    ${kan?'':`<div class="bar" style="border-top:1px solid var(--line2);padding-top:10px"><span class="sub">Với việc đã tích:</span>
      <select id="bkSt" aria-label="Đổi trạng thái hàng loạt"><option value="">Đổi trạng thái…</option><option value="doing">Đang thực hiện</option><option value="done">Hoàn thành</option></select>
      <select id="bkWho" aria-label="Giao hàng loạt"><option value="">Giao cho…</option>${ps.map(p=>`<option>${esc(p)}</option>`).join('')}</select>
      <input type="date" id="bkDay" aria-label="Đặt ngày làm hàng loạt" title="Đặt ngày làm">
      <button class="btn sm" id="bkGo" type="button">Áp dụng</button></div>`}</div></div>
    ${kan ? board() : card('', taskTable(list, {check:true, quick:true}), {flush:true})}`;
  const set = (id, k) => { const el = $(id); if (el) el.onchange = e => { F[k] = e.target.value; if (k === 'proj') F.item = ''; render(); }; };
  set('#fp','proj'); set('#fi','item'); set('#fw','who'); set('#fs','st'); set('#fr','pr'); set('#fd','due');
  if ($('#fqx')) $('#fqx').onclick = () => { F.q = ''; $('#gq').value = ''; render(); };
  $('#fx').onclick = () => { F = {...F, q:'',proj:'',item:'',who:'',st:'open',pr:'',due:''}; $('#gq').value = ''; render(); };
  $('#mList').onclick = () => { F.mode = 'list'; LS.set('sa_tmode','list'); render(); };
  $('#mBoard').onclick = () => { F.mode = 'board'; LS.set('sa_tmode','board'); render(); };
  $('#newTask').onclick = () => openTask(null, {projectId:F.proj, itemId:F.item});
  $('#csvT').onclick = () => exportCSV('cong-viec_' + today(), list);
  if (kan) wireBoard(); else $('#bkGo').onclick = () => {
    const ids = $$('.bk:checked').map(c => c.value); if (!ids.length) { toast('Chưa tích việc nào.'); return; }
    const st = $('#bkSt').value, who = $('#bkWho').value, day = $('#bkDay').value;
    if (!st && !who && !day) { toast('Chọn thay đổi cần áp dụng.'); return; }
    const deny = ids.filter(id => (who && !can('assign', S.T[id])) || !can('status', S.T[id]));
    if (deny.length) { toast(`Bạn không có quyền sửa ${deny.length} việc đã chọn.`); return; }
    confirmBox(`Áp dụng cho ${ids.length} việc?`, [st && 'Trạng thái → ' + STm[st].t, who && 'Người làm → ' + who, day && 'Ngày làm → ' + vn(day)].filter(Boolean).join(' · '), () => {
      ids.forEach(id => { const d = {}; if (st) { d.status = st; if (st === 'done') d.doneAt = new Date().toISOString(); } if (who) { d.assignee = who; d.assignedAt = new Date().toISOString(); } if (day) d.todoDate = day; save('tasks', id, d); if (st === 'done') spawnRepeat({...S.T[id]}); });
      toast(`Đã cập nhật ${ids.length} việc`);
    });
  };
}
function filteredNoStatus(){ const s = F.st; F.st = ''; const r = filtered(); F.st = s; return r; }
function board(){
  const all = filteredNoStatus();
  const cols = ['todo','doing','wait','hold','done'];
  return `<div class="kan">${cols.map(k => { const l = sortTasks(all.filter(t => t.status === k && (k !== 'done' || (t.doneAt||'').slice(0,10) >= addD(today(), -14)))); return `
    <div class="col" data-col="${k}"><header>${stPill(k)}<span class="code">${l.length}</span></header><div class="list">${l.map(t => `
      <div class="kc" draggable="${can('status',t)}" data-task="${t.id}" data-id="${t.id}"><div class="t-title">${esc(t.title)}${sampleTag(t)}</div><div class="sub">${pathOf(t)}</div>${flags(t)?`<div class="t-meta">${flags(t)}</div>`:''}
        <div class="ft">${whoChip(t.assignee)}<span class="${isLate(t)?'due-late':''}">${vns(t.due)}</span></div><div class="ft"><span class="code">${esc(t.code)}</span>${prPill(t.priority)}</div></div>`).join('') || '<div class="sub" style="padding:8px">Không có việc</div>'}</div></div>`; }).join('')}</div><p class="sub">Kéo thẻ sang cột khác để đổi trạng thái. Cột Hoàn thành chỉ hiện việc xong trong 14 ngày gần nhất.</p>`;
}
function wireBoard(){
  let drag = null;
  $$('.kc').forEach(c => { c.ondragstart = e => { drag = c.dataset.id; e.dataTransfer.effectAllowed = 'move'; }; });
  $$('.col').forEach(col => {
    col.ondragover = e => { if (drag) { e.preventDefault(); col.classList.add('over'); } };
    col.ondragleave = () => col.classList.remove('over');
    col.ondrop = e => { e.preventDefault(); col.classList.remove('over'); if (drag && S.T[drag]?.status !== col.dataset.col) quickStatus(drag, col.dataset.col); drag = null; };
  });
}

/* ---------- 5. Lịch ---------- */
function vCal(){
  const ref = CAL.ref;
  const evs = tasksOf(t => t.due && t.status !== 'cancel' && (!F.who || F.who === '__none' || t.assignee === F.who));
  const ev = d => evs.filter(t => t.due === d).map(t => `<div class="ev ${isLate(t)?'late':t.status==='done'?'done':''}" data-task="${t.id}" title="${esc(t.code+' · '+t.title+' · '+(t.assignee||'chưa giao'))}">${esc(t.title)}</div>`).join('');
  let body;
  if (CAL.mode === 'thang') {
    const d0 = pd(ref); d0.setDate(1); const first = weekStart(iso(d0)); const m = d0.getMonth();
    body = card('', `<div class="cal">${['T2','T3','T4','T5','T6','T7','CN'].map(x=>`<div class="h">${x}</div>`).join('')}${Array.from({length:42}, (_,i) => { const d = addD(first, i); const inM = pd(d).getMonth() === m; return `<div class="d ${isWork(d)?'':'off'} ${d===today()?'today':''}" style="${inM?'':'opacity:.4'}"><span class="n">${+d.slice(8)}</span>${ev(d)}</div>`; }).join('')}</div>`, {flush:true});
  } else {
    const n = CAL.mode === 'tuan' ? 7 : 1, s = CAL.mode === 'tuan' ? weekStart(ref) : ref;
    body = Array.from({length:n}, (_,i) => { const d = addD(s,i); return card(`${DOW[pd(d).getDay()]} ${vn(d)}${isWork(d)?'':' · nghỉ'}`, taskTable(evs.filter(t => t.due === d), {quick:true, emptyT:'Không có việc đến hạn', empty:''}), {flush:true}); }).join('');
  }
  const step = {thang:'tháng', tuan:'tuần', ngay:'ngày'}[CAL.mode];
  const title = CAL.mode === 'thang' ? `Tháng ${pd(ref).getMonth()+1}/${pd(ref).getFullYear()}` : CAL.mode === 'tuan' ? `Tuần ${vns(weekStart(ref))} – ${vn(addD(weekStart(ref),6))}` : vn(ref);
  $('#view').innerHTML = head('Lịch', `${title} · công việc theo hạn hoàn thành`,
    `<select id="cWho" aria-label="Người"><option value="">Mọi người</option>${people().map(p=>`<option ${p===F.who?'selected':''}>${esc(p)}</option>`).join('')}</select>
     <div class="seg" role="group" aria-label="Kiểu lịch">${['ngay','tuan','thang'].map(k=>`<button type="button" data-cm="${k}" class="${CAL.mode===k?'on':''}">${{ngay:'Ngày',tuan:'Tuần',thang:'Tháng'}[k]}</button>`).join('')}</div>
     <button class="btn" id="cP" type="button" aria-label="${step} trước">‹</button><button class="btn" id="cT" type="button">Hôm nay</button><button class="btn" id="cN" type="button" aria-label="${step} sau">›</button>`) + body;
  $$('[data-cm]').forEach(c => c.onclick = () => { CAL.mode = c.dataset.cm; render(); });
  $('#cWho').onchange = e => { F.who = e.target.value; render(); };
  const mv = k => { if (CAL.mode === 'thang') { const d = pd(CAL.ref); d.setDate(1); d.setMonth(d.getMonth()+k); CAL.ref = iso(d); } else CAL.ref = addD(CAL.ref, k*(CAL.mode==='tuan'?7:1)); render(); };
  $('#cP').onclick = () => mv(-1); $('#cN').onclick = () => mv(1); $('#cT').onclick = () => { CAL.ref = today(); render(); };
}

/* ---------- 6. Báo cáo ---------- */
function period(){
  const t = today();
  if (RP.kind === 'ngay') return [t, t];
  if (RP.kind === 'tuan') { const s = weekStart(t); return [s, addD(s,6)]; }
  if (RP.kind === 'tuantruoc') { const s = addD(weekStart(t), -7); return [s, addD(s,6)]; }
  if (RP.kind === 'thang') { const d = pd(t); d.setDate(1); const s = iso(d); d.setMonth(d.getMonth()+1); d.setDate(0); return [s, iso(d)]; }
  return [RP.from || t, RP.to || t];
}
function reportData(){
  const [a, b] = period(); const inP = s => s >= a && s <= b;
  const scope = tasksOf(t => (!RP.who || t.assignee === RP.who) && (!RP.proj || t.projectId === RP.proj));
  const R = {a, b, scope,
    created: scope.filter(t => inP((t.createdAt||'').slice(0,10))),
    done: scope.filter(t => t.status === 'done' && inP((t.doneAt||'').slice(0,10))),
    doing: scope.filter(t => t.status === 'doing'), wait: scope.filter(t => t.status === 'wait'), hold: scope.filter(t => t.status === 'hold'),
    late: scope.filter(isLate), cancel: scope.filter(t => t.status === 'cancel' && inP((t.updatedAt||'').slice(0,10)))};
  R.doneLate = R.done.filter(t => t.due && (t.doneAt||'').slice(0,10) > t.due);
  R.onTime = R.done.length ? Math.round((R.done.length - R.doneLate.length) / R.done.length * 100) : null;
  return R;
}
function vReport(){
  const R = reportData(); const ps = people();
  const byWho = ps.concat(['(chưa giao)']).map(p => { const f = t => p === '(chưa giao)' ? !t.assignee : t.assignee === p; return {p, open: R.scope.filter(t => f(t) && OPEN.has(t.status)).length, done: R.done.filter(f).length, late: R.late.filter(f).length, wait: R.wait.filter(f).length}; }).filter(x => x.open || x.done);
  const mx = Math.max(1, ...byWho.map(x => x.open + x.done));
  const projs = Object.values(S.P).filter(p => !RP.proj || p.id === RP.proj);
  const notes = Object.values(S.N).filter(n => n.date >= R.a && n.date <= R.b && (!RP.who || n.who === RP.who)).sort((x,y) => x.date.localeCompare(y.date));
  const kinds = {ngay:'Hôm nay', tuan:'Tuần này', tuantruoc:'Tuần trước', thang:'Tháng này', khoang:'Khoảng ngày'};
  const blocked = [...R.wait, ...R.hold];
  $('#view').innerHTML = head('Báo cáo', `Kỳ ${vn(R.a)} – ${vn(R.b)} · tính trực tiếp từ dữ liệu công việc`,
    `<button class="btn" id="csvS" type="button">${ic('down')}CSV tổng hợp</button><button class="btn" id="csvR" type="button">${ic('down')}CSV chi tiết</button>`) + `
    <div class="card"><div class="cb"><div class="bar"><div class="seg" role="group" aria-label="Kỳ báo cáo">${Object.entries(kinds).map(([k,t])=>`<button type="button" data-rk="${k}" class="${RP.kind===k?'on':''}">${t}</button>`).join('')}</div>
      ${RP.kind==='khoang'?`<input type="date" id="rA" value="${RP.from||R.a}" aria-label="Từ ngày"><input type="date" id="rB" value="${RP.to||R.b}" aria-label="Đến ngày">`:''}<span class="sp"></span>
      <select id="rW" aria-label="Người"><option value="">Mọi người</option>${ps.map(p=>`<option ${p===RP.who?'selected':''}>${esc(p)}</option>`).join('')}</select>
      <select id="rP" aria-label="Dự án"><option value="">Mọi dự án</option>${Object.values(S.P).map(p=>`<option value="${p.id}" ${p.id===RP.proj?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div></div></div>
    <div class="grid g6">
      <div class="kpi done"><span class="ic">${ic('check')}</span><b>${R.done.length}</b><span>Hoàn thành trong kỳ</span></div>
      <div class="kpi"><span class="ic">${ic('clock')}</span><b>${R.onTime ?? '—'}${R.onTime!=null?'%':''}</b><span>Đúng hạn · ${R.doneLate.length} xong trễ</span></div>
      <div class="kpi brand"><span class="ic">${ic('today')}</span><b>${R.doing.length}</b><span>Đang thực hiện</span></div>
      <div class="kpi wait"><span class="ic">${ic('hour')}</span><b>${R.wait.length}</b><span>Chờ phản hồi</span></div>
      <div class="kpi late"><span class="ic">${ic('alert')}</span><b>${R.late.length}</b><span>Quá hạn</span></div>
      <div class="kpi"><span class="ic">${ic('plus')}</span><b>${R.created.length}</b><span>Việc mới tạo</span></div></div>
    <div class="grid g2">
      ${card('Khối lượng theo người', byWho.length ? `<div class="hbar">${byWho.map(x => `<span>${esc(x.p)}</span><div class="tr" title="Xong ${x.done} · đang mở ${x.open}"><i style="width:${x.done/mx*100}%;background:var(--done)"></i><i style="width:${(x.open-x.late)/mx*100}%;background:var(--brand)"></i><i style="width:${x.late/mx*100}%;background:var(--late)"></i></div><span class="code">${x.done} / ${x.open}${x.late?` · <span class="f-late">${x.late} trễ</span>`:''}</span>`).join('')}</div><div class="legend"><span><i style="background:var(--done)"></i>Xong trong kỳ</span><span><i style="background:var(--brand)"></i>Đang mở</span><span><i style="background:var(--late)"></i>Quá hạn</span></div>` : emptyBox('user','Chưa có dữ liệu','Không có việc trong kỳ.'))}
      ${card('Tiến độ dự án', projs.length ? `<div class="tbl"><table><thead><tr><th>Dự án</th><th>Trạng thái</th><th>Tiến độ</th><th class="num">Quá hạn</th></tr></thead><tbody>${projs.map(p=>{const ts=projTasks(p.id);return `<tr class="click" data-hash="da-${p.id}"><td><div class="t-title">${esc(p.name)}${sampleTag(p)}</div>${projRisk(p)?`<span class="flag f-late">${esc(projRisk(p))}</span>`:''}</td><td>${stPill(autoStatus(ts,p.status))}</td><td>${bar(progress(ts))}</td><td class="num">${ts.filter(isLate).length}</td></tr>`;}).join('')}</tbody></table></div>` : emptyBox('folder','Chưa có dự án',''), {flush:true})}
    </div>
    ${card(`Việc bị chặn: chờ phản hồi / tạm hoãn <span class="code">${blocked.length}</span>`, blocked.length ? `<div class="tbl"><table><thead><tr><th>Công việc</th><th>Trạng thái</th><th>Nguyên nhân</th><th>Chờ ai / xem lại</th><th>Bước tiếp theo</th><th>Người làm</th></tr></thead><tbody>${blocked.map(t=>`<tr class="click" data-task="${t.id}"><td><div class="t-title">${esc(t.title)}</div><div class="t-meta"><span class="code">${esc(t.code)}</span><span>${pathOf(t)}</span></div></td><td>${stPill(t.status)}${isStuck(t)?`<div class="flag f-stuck">Kẹt</div>`:''}</td><td>${esc(t.blockReason)}</td><td>${esc([t.waitWho, t.followUp&&'nhắc '+vn(t.followUp), t.holdUntil&&'xem lại '+vn(t.holdUntil)].filter(Boolean).join(' · '))}</td><td>${esc(t.nextStep)}</td><td>${whoChip(t.assignee)}</td></tr>`).join('')}</tbody></table></div>` : emptyBox('check','Không có việc bị chặn',''), {flush:true})}
    ${card(`Hoàn thành trong kỳ <span class="code">${R.done.length}</span>`, taskTable(R.done, {emptyT:'Chưa có việc hoàn thành', empty:''}), {flush:true})}
    ${card('Ghi chú cuối ngày trong kỳ', notes.length ? `<div class="tbl"><table><thead><tr><th>Ngày</th><th>Người</th><th>Kết quả</th><th>Vấn đề</th><th>Ưu tiên tiếp theo</th></tr></thead><tbody>${notes.map(n=>`<tr><td style="white-space:nowrap">${vn(n.date)}</td><td>${esc(n.who)}</td><td>${esc(n.done)}</td><td>${esc(n.issue)}</td><td>${esc(n.plan)}</td></tr>`).join('')}</tbody></table></div>` : emptyBox('book','Chưa có ghi chú',''), {flush:true})}
    <p class="sub">Cách tính: “Hoàn thành trong kỳ” theo ngày bấm Hoàn thành; “Đúng hạn” là việc xong không muộn hơn hạn. Việc Đã hủy không tính vào tiến độ và quá hạn (${R.cancel.length} việc hủy trong kỳ, có trong CSV chi tiết). Đang thực hiện, Chờ phản hồi, Quá hạn là số hiện tại.</p>`;
  $$('[data-rk]').forEach(c => c.onclick = () => { RP.kind = c.dataset.rk; render(); });
  if ($('#rA')) { $('#rA').onchange = e => { RP.from = e.target.value; render(); }; $('#rB').onchange = e => { RP.to = e.target.value; render(); }; }
  $('#rW').onchange = e => { RP.who = e.target.value; render(); };
  $('#rP').onchange = e => { RP.proj = e.target.value; render(); };
  $('#csvR').onclick = () => exportCSV(`bao-cao-chi-tiet_${R.a}_${R.b}`, R.scope.filter(t => OPEN.has(t.status) || R.done.includes(t) || R.cancel.includes(t) || R.created.includes(t)));
  $('#csvS').onclick = () => { if (!can('export')) { toast('Vai trò của bạn không được xuất báo cáo.'); return; } download(`bao-cao-tong-hop_${R.a}_${R.b}.csv`, csv([['Kỳ', vn(R.a)+' – '+vn(R.b)], ['Người', RP.who||'Tất cả'], ['Dự án', S.P[RP.proj]?.name||'Tất cả'], [], ['Chỉ số','Giá trị'], ['Hoàn thành trong kỳ', R.done.length], ['Hoàn thành đúng hạn (%)', R.onTime ?? ''], ['Hoàn thành trễ', R.doneLate.length], ['Đang thực hiện', R.doing.length], ['Chờ phản hồi', R.wait.length], ['Tạm hoãn', R.hold.length], ['Quá hạn', R.late.length], ['Việc mới tạo', R.created.length], ['Đã hủy trong kỳ', R.cancel.length], [], ['Người','Đang mở','Xong trong kỳ','Quá hạn','Đang chờ'], ...byWho.map(x => [x.p, x.open, x.done, x.late, x.wait])]), 'text/csv'); };
}
const csvCell = v => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; };
const csv = rows => '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n');
function exportCSV(name, list){
  if (!can('export')) { toast('Vai trò của bạn không được xuất báo cáo.'); return; }
  const rows = [['Mã','Công việc','Kết quả cần đạt','Mã dự án','Dự án','Deal ID','Mã hạng mục','Hạng mục','Người giao','Người thực hiện','Phối hợp','Ngày tạo','Bắt đầu','Ngày làm','Hạn','Ưu tiên','Trạng thái','Quá hạn','Chờ ai','Ngày nhắc lại','Nguyên nhân chặn/hoãn/hủy','Bước tiếp theo','Ngày hoàn thành','Cập nhật lần cuối','Người cập nhật','Bắt buộc','Trọng số','Dữ liệu mẫu']];
  list.forEach(t => { const p = S.P[t.projectId]||{}, i = S.I[t.itemId]||{}; rows.push([t.code, t.title, t.result, p.code, p.name, p.dealId, i.code, i.name, t.assigner, t.assignee, (t.collab||[]).join('; '), vn((t.createdAt||'').slice(0,10)), vn(t.start), vn(t.todoDate), vn(t.due), PRm[t.priority]?.t, STm[t.status]?.t, isLate(t)?'Có':'', t.waitWho, vn(t.followUp), t.blockReason||t.cancelReason, t.nextStep, vn((t.doneAt||'').slice(0,10)), dt(t.updatedAt), t.updatedBy, t.required===false?'Không':'Có', t.weight||1, t.sample?'Có':'']); });
  download(name + '.csv', csv(rows), 'text/csv');
}
function download(filename, data, type){
  try { const url = URL.createObjectURL(new Blob([data], {type: (type||'application/octet-stream') + ';charset=utf-8'})); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); toast('Đã tải ' + filename); }
  catch(_) { toast('Trình duyệt không cho tải file.'); }
}

/* ---------- 7. Thông báo ---------- */
function notifications(){
  const seen = LS.get('sa_seen_' + ME) || '1970'; const L = [];
  if (!ME) return {list:L, unread:0};
  tasksOf(t => t.assignee === ME || t.assigner === ME || (t.collab||[]).includes(ME)).forEach(t => {
    if (t.assignee === ME && isLate(t)) L.push({k:'late', at:t.due, t, msg:`Quá hạn từ ${vn(t.due)}`});
    else if (t.assignee === ME && isSoon(t)) L.push({k:'soon', at:t.due, t, msg:`Sắp đến hạn ${vn(t.due)}`});
    if (t.assignee === ME && t.status === 'wait' && t.followUp && t.followUp <= today()) L.push({k:'wait', at:t.followUp, t, msg:`Đến ngày nhắc lại · chờ ${t.waitWho||'phản hồi'}`});
    if (t.assignee === ME && t.assignedAt && t.assigner && t.assigner !== ME && OPEN.has(t.status)) L.push({k:'new', at:t.assignedAt, t, msg:`${t.assigner} giao việc cho bạn`});
  });
  S.L.slice(0, 500).forEach(l => { if (l.entity !== 'tasks' || l.by === ME) return; const t = S.T[l.entityId]; if (!t || !(t.assignee === ME || t.assigner === ME)) return; const ch = (l.changes||[]).find(c => c.f === 'Hạn'); if (ch) L.push({k:'due', at:l.at, t, msg:`${l.by} đổi hạn ${ch.from||'—'} → ${ch.to}`}); });
  L.sort((x,y) => String(y.at).localeCompare(String(x.at)));
  return {list:L, unread: L.filter(n => n.k === 'late' || n.k === 'wait' || String(n.at) > seen).length};
}
function vNoti(){
  const {list} = notifications(); const seen = LS.get('sa_seen_' + ME) || '1970';
  const lab = {late:['Quá hạn','alert','f-late'], soon:['Sắp đến hạn','clock','f-soon'], wait:['Cần phản hồi','hour','f-stuck'], new:['Được giao mới','user',''], due:['Bị đổi hạn','cal','']};
  $('#view').innerHTML = head('Thông báo', ME ? `Của ${esc(ME)} · tự tính từ dữ liệu mỗi lần mở trang` : 'Chọn tên của bạn ở góc trái dưới để xem thông báo.', `<button class="btn" id="seen" type="button" ${ME?'':'disabled'}>Đánh dấu đã xem</button>`) +
    card('', list.length ? `<div class="log">${list.map(n => `<div class="le" data-task="${n.t.id}" style="cursor:pointer;${String(n.at)>seen||n.k==='late'?'':'opacity:.7'}"><span class="dot ${lab[n.k][2]}">${ic(lab[n.k][1])}</span><div><div class="bar"><b>${lab[n.k][0]}</b><span class="sub">${esc(n.msg)}</span><span class="sp"></span><span class="sub">${/T/.test(n.at)?dt(n.at):vn(n.at)}</span></div><div class="sub"><span class="code">${esc(n.t.code)}</span> ${esc(n.t.title)} · ${pathOf(n.t)}</div></div></div>`).join('')}</div>` : emptyBox('bell','Không có thông báo','Bạn đã xử lý hết việc cần chú ý.'));
  $('#seen').onclick = () => { LS.set('sa_seen_' + ME, new Date().toISOString()); render(); };
}

/* ---------- Lịch sử ---------- */
function logList(L){
  const ent = {tasks:'công việc', items:'hạng mục', projects:'dự án', 'he-thong':'hệ thống'};
  return L.length ? `<div class="log">${L.map(l => `<div class="le"><span class="dot">${esc(initials(l.by))}</span><div><div><b>${esc(l.by)}</b> <span class="sub">${esc(l.action.toLowerCase())} ${esc(ent[l.entity]||l.entity)}</span> <span class="code">${esc(l.code)}</span> <span class="sub">· ${dt(l.at)}</span></div>${(l.changes||[]).map(c => `<div class="chg">${esc(c.f)}: ${c.from?`<s>${esc(c.from)}</s> → `:''}<span style="color:var(--ink2)">${esc(c.to)}</span></div>`).join('')}</div></div>`).join('')}</div>` : '<div class="sub">Chưa có thay đổi nào được ghi.</div>';
}
function vLog(){ $('#view').innerHTML = head('Lịch sử cập nhật', `${S.L.length} thay đổi đã ghi · ai đổi gì, lúc nào`) + card('', logList(S.L.slice(0, 300))); }

/* ---------- 8. Cài đặt ---------- */
function vSettings(){
  const c = S.cfg, ok = can('config');
  const dis = ok ? '' : 'disabled';
  $('#view').innerHTML = head('Cài đặt', ok ? (REMOTE ? 'Thay đổi lưu vào file dữ liệu Google Sheet, áp dụng cho mọi người dùng.' : 'Thay đổi áp dụng ngay cho dữ liệu trên trình duyệt này.') : 'Chỉ Quản trị viên được thay đổi cài đặt.') + `
    <div class="grid g2">
    ${card('Thành viên và vai trò', `<p class="sub" style="margin:0">${REMOTE ? 'Mỗi người đăng nhập bằng tài khoản Google; hệ thống nhận ra vai trò theo email. Người mới cần được chia sẻ quyền Chỉnh sửa file dữ liệu Google Sheet.' : 'Mỗi người chọn tên của mình ở góc trái dưới. Bản chạy độc lập chưa có đăng nhập.'}</p>
      <div class="tbl"><table><thead><tr><th>Tên hiển thị</th><th>Email Google</th><th>Vai trò</th><th>Đang làm</th><th></th></tr></thead><tbody>${(c.team||[]).map((m,i)=>`<tr><td><input value="${esc(m.name)}" data-tm="${i}" data-k="name" aria-label="Tên" ${dis}></td><td><input type="text" value="${esc(m.email||'')}" data-tm="${i}" data-k="email" aria-label="Email" placeholder="ten@gmail.com, ten@congty.vn" title="Một người có nhiều tài khoản Google: nhập các email, cách nhau bằng dấu phẩy" ${dis}></td><td><select data-tm="${i}" data-k="role" aria-label="Vai trò" ${dis}>${ROLES.map(r=>`<option value="${r.k}" ${r.k===m.role?'selected':''}>${r.t}</option>`).join('')}</select></td><td><input type="checkbox" data-tm="${i}" data-k="active" ${m.active!==false?'checked':''} aria-label="Đang làm" ${dis}></td><td><button class="btn sm ghost danger" type="button" data-rm="${i}" ${dis}>Bỏ</button></td></tr>`).join('') || '<tr><td colspan="5" class="sub">Chưa có thành viên.</td></tr>'}</tbody></table></div>
      <div class="bar"><input id="tmN" placeholder="Tên thành viên" aria-label="Tên thành viên mới" style="flex:1" value="${REMOTE && !(c.team||[]).length ? esc(USER.email.split('@')[0]) : ''}"><input id="tmE" type="text" placeholder="Email Google (nhiều email: cách bằng dấu phẩy)" aria-label="Email thành viên mới" style="flex:1" value="${REMOTE && !(c.team||[]).length ? esc(USER.email) : ''}"><select id="tmR" aria-label="Vai trò">${ROLES.map(r=>`<option value="${r.k}">${r.t}</option>`).join('')}</select><button class="btn pri" id="tmAdd" type="button" ${dis}>Thêm</button></div>`)}
    ${card('Ngày làm việc và cảnh báo', `<div class="chips">${DOW.map((d,i)=>`<label class="chip ${(c.workdays||[]).includes(i)?'on':''}"><input type="checkbox" data-wd="${i}" ${(c.workdays||[]).includes(i)?'checked':''} hidden ${dis}>${d}</label>`).join('')}</div>
      <div class="form"><label for="cfSoon">“Sắp đến hạn” khi còn ≤ (ngày làm việc)<input id="cfSoon" type="number" min="0" max="10" value="${c.soonDays ?? 2}" ${dis}></label><label for="cfStuck">“Kẹt chờ” khi không cập nhật ≥ (ngày làm việc)<input id="cfStuck" type="number" min="1" max="20" value="${c.stuckDays ?? 3}" ${dis}></label></div>
      <div class="bar"><input type="date" id="hdD" aria-label="Ngày nghỉ"><input id="hdN" placeholder="Tên ngày nghỉ" aria-label="Tên ngày nghỉ" style="flex:1"><button class="btn" id="hdAdd" type="button" ${dis}>Thêm ngày nghỉ</button></div>
      <div class="chips">${(c.holidays||[]).slice().sort((a,b)=>a.date.localeCompare(b.date)).map(h=>`<span class="chip">${vn(h.date)} · ${esc(h.name)} ${ok?`<button class="btn sm ghost" type="button" data-hd="${h.date}" aria-label="Bỏ ngày nghỉ">✕</button>`:''}</span>`).join('') || '<span class="sub">Chưa nhập ngày nghỉ lễ.</span>'}</div>
      <div class="bar"><span class="sp"></span><button class="btn pri" id="cfSave" type="button" ${dis}>Lưu cài đặt</button></div>`)}
    </div>
    ${card('Dữ liệu: lưu, chia sẻ, sao lưu', REMOTE ? `<p style="margin:0">Dữ liệu lưu trong Google Sheet <b>Sale Admin VistaX – Dữ liệu</b> trên Drive của chủ sở hữu, tự lưu sau mỗi thao tác. Các tab Dự án, Hạng mục, Công việc, Lịch sử trong file đó luôn cập nhật để xem hoặc lọc bằng Google Sheets. Google Drive tự giữ lịch sử phiên bản của file.</p>
      <div class="bar">${DATA_URL?`<a class="btn" href="${esc(DATA_URL)}" target="_blank" rel="noopener">${ic('folder')}Mở file dữ liệu</a>`:''}<button class="btn" id="bkJ" type="button">${ic('down')}Tải bản sao lưu (.json)</button><label class="btn" for="rsF">${ic('up')}Khôi phục từ file…</label><input type="file" id="rsF" accept=".json,application/json" hidden ${dis}></div>` : `<p style="margin:0">Dữ liệu đang lưu <b>trong trình duyệt này</b> (${(JSON.stringify(snapshot()).length/1024).toFixed(0)} KB · ${Object.keys(S.T).length} công việc). Người khác không tự thấy. Để làm chung: một người giữ file dữ liệu gốc, mỗi cuối ngày <b>Xuất</b> rồi gửi; người nhận <b>Nhập</b> để cập nhật. Xóa dữ liệu trình duyệt sẽ mất dữ liệu, nên xuất file sao lưu mỗi tuần.</p>
      <div class="bar"><button class="btn" id="bkJ" type="button">${ic('down')}Xuất file dữ liệu (.json)</button><label class="btn" for="rsF">${ic('up')}Nhập file dữ liệu…</label><input type="file" id="rsF" accept=".json,application/json" hidden ${dis}></div>`)}
    ${card('Dữ liệu mẫu', `<p class="sub" style="margin:0">Dự án, hạng mục và công việc gắn nhãn MẪU chỉ để minh họa luồng sử dụng, không phải dữ liệu thật của VistaX.</p><div class="bar"><button class="btn danger" id="rmSample" type="button" ${dis}>Xóa toàn bộ dữ liệu mẫu</button><button class="btn" id="addSample" type="button" ${dis}>Tạo lại dữ liệu mẫu</button></div>`)}`;
  $('#bkJ').onclick = () => download(`sale-admin-vistax_du-lieu_${today()}.json`, JSON.stringify(snapshot(), null, 1), 'application/json');
  if (!ok) return;
  const tm = JSON.parse(JSON.stringify(c.team||[]));
  const saveTeam = () => { S.cfg.team = tm; persist(); render(); toast('Đã lưu thành viên'); };
  $$('[data-tm]').forEach(el => el.onchange = () => { const i = +el.dataset.tm; const v = el.type === 'checkbox' ? el.checked : el.value.trim(); if (el.dataset.k === 'name' && !v) { toast('Tên không được để trống.'); render(); return; } if (el.dataset.k === 'email') { const ems = emailsOf({email:v}); if (ems.some(x => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x))) { toast('Email chưa hợp lệ.'); render(); return; } tm[i].email = ems.join(', '); saveTeam(); return; } tm[i][el.dataset.k] = v; saveTeam(); });
  $$('[data-rm]').forEach(b => b.onclick = () => confirmBox(`Bỏ ${tm[+b.dataset.rm].name} khỏi danh sách?`, 'Việc đã giao cho người này vẫn giữ tên; hãy giao lại ở trang Công việc.', () => { tm.splice(+b.dataset.rm,1); saveTeam(); }));
  $('#tmAdd').onclick = () => { const n = $('#tmN').value.trim(); if (!n) { toast('Nhập tên thành viên.'); return; } if (tm.some(m => norm(m.name) === norm(n))) { toast('Tên này đã có.'); return; } const ems = emailsOf({email:$('#tmE').value}); const em = ems.join(', '); if (REMOTE && (!ems.length || ems.some(x => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)))) { toast('Nhập email Google hợp lệ (nhiều email cách nhau bằng dấu phẩy).'); return; } if (ems.some(x => tm.some(m => emailsOf(m).includes(x)))) { toast('Email này đã có.'); return; } tm.push({name:n, email:em, role:$('#tmR').value, active:true}); if (!ME) { ME = n; LS.set('sa_me', n); } saveTeam(); };
  $$('[data-wd]').forEach(el => el.onchange = () => el.parentElement.classList.toggle('on', el.checked));
  $('#hdAdd').onclick = () => { const d = $('#hdD').value; if (!d) { toast('Chọn ngày nghỉ.'); return; } S.cfg.holidays = (S.cfg.holidays||[]).filter(h => h.date !== d).concat({date:d, name:$('#hdN').value.trim()||'Nghỉ'}); persist(); render(); };
  $$('[data-hd]').forEach(b => b.onclick = () => { S.cfg.holidays = (S.cfg.holidays||[]).filter(h => h.date !== b.dataset.hd); persist(); render(); });
  $('#cfSave').onclick = () => { S.cfg.workdays = $$('[data-wd]').filter(x=>x.checked).map(x=>+x.dataset.wd); S.cfg.soonDays = +$('#cfSoon').value; S.cfg.stuckDays = +$('#cfStuck').value; persist(); render(); toast('Đã lưu cài đặt'); };
  $('#rsF').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { let j; try { j = JSON.parse(r.result); } catch(_) { j = null; } if (!j || j.app !== 'sale-admin-vistax') { toast('File không phải dữ liệu Sale Admin VistaX.'); return; }
      confirmBox('Nhập file dữ liệu?', `File lưu lúc ${dt(j.savedAt)}: ${Object.keys(j.projects||{}).length} dự án, ${Object.keys(j.tasks||{}).length} công việc. Dữ liệu hiện tại trên trình duyệt này sẽ được thay bằng nội dung file. Nên Xuất bản hiện tại trước nếu chưa chắc.`, () => {
        S.P = j.projects||{}; S.I = j.items||{}; S.T = j.tasks||{}; S.L = j.logs||[]; S.N = j.notes||{}; S.cfg = {...CFG0, ...(j.config||{})}; logIt('he-thong','','','Nhập file',[{f:'File', from:'', to:f.name}]); persist(); render(); toast('Đã nhập dữ liệu'); }); }; r.readAsText(f); e.target.value = ''; };
  $('#rmSample').onclick = () => { const n = [S.P,S.I,S.T].reduce((a,m) => a + Object.values(m).filter(o => o.sample).length, 0); if (!n) { toast('Không còn dữ liệu mẫu.'); return; } confirmBox(`Xóa ${n} bản ghi mẫu?`, 'Chỉ xóa dự án, hạng mục, công việc có nhãn MẪU.', () => { for (const m of [S.T, S.I, S.P]) Object.values(m).filter(o => o.sample).forEach(o => delete m[o.id]); S.L = S.L.filter(l => !String(l.by).includes('dữ liệu mẫu')); persist(); render(); toast('Đã xóa dữ liệu mẫu'); }); };
  $('#addSample').onclick = () => { if (Object.values(S.P).some(p => p.sample)) { toast('Dữ liệu mẫu đang có sẵn.'); return; } const j = seed(); Object.assign(S.P, j.projects); Object.assign(S.I, j.items); Object.assign(S.T, j.tasks); persist(); render(); toast('Đã tạo dữ liệu mẫu'); };
}

/* ---------- Hộp thoại / ngăn chi tiết ---------- */
function openDlg(html, center){ const d = $('#dlg'); d.classList.toggle('center', !!center); $('#dlgForm').innerHTML = html; if (!d.open) d.showModal(); }
function closeDlg(){ $('#dlg').close(); }
$('#dlg').addEventListener('click', e => { if (e.target === $('#dlg')) closeDlg(); });
function confirmBox(title, msg, fn){ openDlg(`<h2>${esc(title)}</h2><p style="margin:0;color:var(--ink2)">${esc(msg)}</p><div class="bar"><span class="sp"></span><button class="btn" type="submit" value="x">Hủy</button><button class="btn pri" type="button" id="cfOk">Đồng ý</button></div>`, true); $('#cfOk').onclick = () => { closeDlg(); fn(); }; }
const opt = (arr, v, blank) => (blank!=null?`<option value="">${blank}</option>`:'') + arr.map(x => `<option value="${esc(x.k ?? x)}" ${String(x.k ?? x)===String(v??'')?'selected':''}>${esc(x.t ?? x)}</option>`).join('');
const peopleOpts = v => opt(people(), v, '— chọn —');
const dlgHead = (eyebrow, title) => `<div class="bar"><div><div class="sub">${eyebrow}</div><h2>${title}</h2></div><span class="sp"></span><button class="btn ghost sm" type="submit" value="x" aria-label="Đóng">${ic('x')}</button></div>`;

function openProject(id){
  const p = id ? S.P[id] : {code: nextCode('DA', S.P, 3), priority:'tb', status:'', owner:ME, start:today()};
  openDlg(`${dlgHead(id?esc(p.code):'Dự án mới', id?'Sửa dự án':'Tạo dự án')}
    <div class="form">
    <label class="full req" for="pName">Tên dự án<input id="pName" value="${esc(p.name||'')}" placeholder="vd: Eco Retreat – Phân khu 5"></label>
    <label for="pCode">Mã dự án<input id="pCode" value="${esc(p.code)}" readonly></label>
    <label for="pDeal">Deal ID (theo Checklist)<input id="pDeal" value="${esc(p.dealId||'')}" placeholder="VTX-0000"></label>
    <label for="pCdt">CĐT / Khách hàng<input id="pCdt" value="${esc(p.cdt||'')}"></label>
    <label class="req" for="pOwner">Người phụ trách chính<select id="pOwner">${peopleOpts(p.owner)}</select></label>
    <label for="pStart">Ngày bắt đầu<input type="date" id="pStart" value="${p.start||''}"></label>
    <label class="req" for="pDue">Hạn hoàn thành<input type="date" id="pDue" value="${p.due||''}"></label>
    <label class="req" for="pPr">Ưu tiên<select id="pPr">${opt(PR, p.priority)}</select></label>
    <label for="pSt">Trạng thái<select id="pSt"><option value="">Tự tính từ công việc</option><option value="hold" ${p.status==='hold'?'selected':''}>Tạm hoãn</option><option value="cancel" ${p.status==='cancel'?'selected':''}>Đã hủy</option></select></label>
    <label class="full" for="pGoal">Mục tiêu và mô tả<textarea id="pGoal">${esc(p.goal||'')}</textarea></label>
    <label class="full" for="pMem">Thành viên tham gia (cách nhau bởi dấu phẩy)<input id="pMem" value="${esc((p.members||[]).join(', '))}"></label>
    <label class="full" for="pLinks">Ghi chú / tài liệu (dán đường dẫn)<textarea id="pLinks">${esc(p.links||'')}</textarea></label></div>
    <p class="err-msg" id="pErr"></p>
    <div class="dlg-foot">${id && can('delete')?'<button class="btn ghost danger" type="button" id="pDel">Xóa dự án</button>':''}<span class="sp"></span><button class="btn" type="submit" value="x">Hủy</button><button class="btn pri" type="button" id="pSave">Lưu dự án</button></div>`);
  $('#pSave').onclick = () => {
    const d = {code:$('#pCode').value, dealId:$('#pDeal').value.trim().toUpperCase(), name:$('#pName').value.trim(), cdt:$('#pCdt').value.trim(), owner:$('#pOwner').value, goal:$('#pGoal').value.trim(), members:$('#pMem').value.split(',').map(s=>s.trim()).filter(Boolean), start:$('#pStart').value, due:$('#pDue').value, priority:$('#pPr').value, status:$('#pSt').value, links:$('#pLinks').value.trim()};
    const e = [!d.name && 'tên dự án', !d.owner && 'người phụ trách', !d.due && 'hạn hoàn thành'].filter(Boolean);
    if (e.length) { $('#pErr').textContent = 'Cần nhập: ' + e.join(', ') + '.'; return; }
    if (d.start && d.due < d.start) { $('#pErr').textContent = 'Hạn hoàn thành phải sau ngày bắt đầu.'; return; }
    if (d.dealId && Object.values(S.P).some(x => x.id !== id && x.dealId === d.dealId)) { $('#pErr').textContent = `Deal ${d.dealId} đã gắn với dự án khác. Mỗi deal chỉ có một dự án.`; return; }
    if (id && p.sample) d.sample = true;
    const nid = save('projects', id, d); closeDlg(); toast('Đã lưu dự án'); if (!id) location.hash = 'da-' + nid;
  };
  if ($('#pDel')) $('#pDel').onclick = () => { const n = Object.values(S.I).filter(i => i.projectId === id).length; if (n) { $('#pErr').textContent = `Dự án còn ${n} hạng mục. Đặt trạng thái “Đã hủy” thay vì xóa, hoặc xóa hạng mục trước.`; return; } confirmBox('Xóa dự án ' + p.name + '?', 'Không khôi phục được nếu chưa có file sao lưu.', () => { remove('projects', id); location.hash = 'du-an'; }); };
}
function openItem(id, projectId){
  const i = id ? S.I[id] : {code: nextCode('HM', S.I, 3), projectId, priority:'tb', owner: S.P[projectId]?.owner || ME};
  openDlg(`${dlgHead(esc(S.P[i.projectId]?.name||''), id?'Sửa hạng mục':'Thêm hạng mục')}
    <div class="form">
    <label class="full req" for="iName">Tên hạng mục<input id="iName" value="${esc(i.name||'')}" placeholder="vd: Hồ sơ thanh toán đợt 1"></label>
    <label for="iCode">Mã hạng mục<input id="iCode" value="${esc(i.code)}" readonly></label>
    <label class="req" for="iProj">Dự án trực thuộc<select id="iProj">${opt(Object.values(S.P).map(p=>({k:p.id,t:p.name})), i.projectId)}</select></label>
    <label class="req" for="iOwner">Người phụ trách<select id="iOwner">${peopleOpts(i.owner)}</select></label>
    <label for="iPr">Ưu tiên<select id="iPr">${opt(PR, i.priority)}</select></label>
    <label for="iStart">Ngày bắt đầu<input type="date" id="iStart" value="${i.start||''}"></label>
    <label for="iDue">Hạn hoàn thành<input type="date" id="iDue" value="${i.due||''}"></label>
    <label for="iSt">Trạng thái<select id="iSt"><option value="">Tự tính từ công việc</option><option value="hold" ${i.status==='hold'?'selected':''}>Tạm hoãn</option><option value="cancel" ${i.status==='cancel'?'selected':''}>Đã hủy</option></select></label>
    <label class="full" for="iGoal">Mục tiêu / kết quả cần đạt<textarea id="iGoal">${esc(i.goal||'')}</textarea></label></div>
    <p class="err-msg" id="iErr"></p>
    <div class="dlg-foot">${id && can('delete')?'<button class="btn ghost danger" type="button" id="iDel">Xóa hạng mục</button>':''}<span class="sp"></span><button class="btn" type="submit" value="x">Hủy</button><button class="btn pri" type="button" id="iSave">Lưu hạng mục</button></div>`);
  $('#iSave').onclick = () => {
    const d = {code:$('#iCode').value, projectId:$('#iProj').value, name:$('#iName').value.trim(), goal:$('#iGoal').value.trim(), owner:$('#iOwner').value, priority:$('#iPr').value, start:$('#iStart').value, due:$('#iDue').value, status:$('#iSt').value};
    const e = [!d.projectId && 'dự án', !d.name && 'tên hạng mục', !d.owner && 'người phụ trách'].filter(Boolean);
    if (e.length) { $('#iErr').textContent = 'Cần nhập: ' + e.join(', ') + '.'; return; }
    const pdue = S.P[d.projectId]?.due; if (d.due && pdue && d.due > pdue) { $('#iErr').textContent = `Hạn hạng mục (${vn(d.due)}) sau hạn dự án (${vn(pdue)}). Dời hạn dự án trước.`; return; }
    if (Object.values(S.I).some(x => x.id !== id && x.projectId === d.projectId && norm(x.name) === norm(d.name))) { $('#iErr').textContent = 'Dự án đã có hạng mục cùng tên.'; return; }
    if (id && i.sample) d.sample = true;
    const moved = id && i.projectId !== d.projectId;
    save('items', id, d); if (moved) itemTasks(id).forEach(t => save('tasks', t.id, {projectId:d.projectId}));
    closeDlg(); toast('Đã lưu hạng mục');
  };
  if ($('#iDel')) $('#iDel').onclick = () => { const n = itemTasks(id).length; if (n) { $('#iErr').textContent = `Hạng mục còn ${n} công việc. Chuyển hoặc hủy các việc đó trước.`; return; } confirmBox('Xóa hạng mục ' + i.name + '?', 'Không khôi phục được nếu chưa có file sao lưu.', () => remove('items', id)); };
}

function openTask(id, preset={}){
  const t0 = id ? S.T[id] : {code: nextCode('CV', S.T, 4), priority:'tb', status:'todo', assigner:ME, assignee:'', required:true, weight:1};
  if (!t0) return;
  const t = {...t0, ...preset};
  const editable = id ? can('edit', t0) : can('create');
  if (!id && !editable) { toast('Vai trò của bạn không tạo được công việc.'); return; }
  const stOk = editable || can('status', t0), noteOk = editable || can('note', t0), assignOk = id ? can('assign', t0) : true;
  const D = b => b ? '' : 'disabled';
  const items = Object.values(S.I);
  openDlg(`${dlgHead(id ? `<span class="code">${esc(t.code)}</span> · ${pathOf(t)}` : 'Công việc mới', id ? esc(t0.title) + sampleTag(t0) : 'Tạo công việc')}
    ${id ? `<div class="bar">${stPill(t0.status)}${prPill(t0.priority)}${flags(t0)}</div>` : ''}
    ${id && !editable ? `<div class="banner info">${ic('user')}<span>Bạn đang xem. ${stOk?'Bạn đổi được trạng thái.':noteOk?'Bạn thêm được ghi chú.':'Vai trò của bạn không sửa được việc này.'}</span></div>`:''}
    <div class="form">
      <label class="full req" for="tTitle">Tên việc<input id="tTitle" value="${esc(t.title||'')}" ${D(editable)} placeholder="Động từ + kết quả, vd: Gửi khách ký hợp đồng"></label>
      <label class="full" for="tRes">Kết quả cần hoàn thành<textarea id="tRes" ${D(editable)} placeholder="Thế nào là xong">${esc(t.result||'')}</textarea></label>
      <label class="req" for="tProj">Dự án<select id="tProj" ${D(editable)}>${opt(Object.values(S.P).map(p=>({k:p.id,t:p.name})), t.projectId, '— chọn dự án —')}</select></label>
      <label class="req" for="tItem">Hạng mục<select id="tItem" ${D(editable)}>${opt(items.filter(i=>i.projectId===t.projectId).map(i=>({k:i.id,t:i.name})), t.itemId, '— chọn hạng mục —')}</select></label>
      <label class="req" for="tAsg">Người thực hiện<select id="tAsg" ${D(editable&&assignOk)}>${peopleOpts(t.assignee)}</select></label>
      <label for="tAsgr">Người giao<select id="tAsgr" ${D(editable)}>${peopleOpts(t.assigner)}</select></label>
      <label class="req" for="tDue">Hạn hoàn thành<input type="date" id="tDue" value="${t.due||''}" ${D(editable)}></label>
      <label for="tDay">Ngày làm (Daily To-do)<input type="date" id="tDay" value="${t.todoDate||''}" ${D(editable)}></label>
      <label class="req" for="tSt">Trạng thái<select id="tSt" ${D(stOk)}>${opt(ST, t.status)}</select></label>
      <label class="req" for="tPr">Ưu tiên<select id="tPr" ${D(editable)}>${opt(PR, t.priority)}</select></label>
      <div class="full" id="stBox"></div>
      <label class="full" id="dueWhy" hidden for="tDueWhy">Lý do đổi hạn<input id="tDueWhy" placeholder="vd: khách dời lịch duyệt"></label>
      <label class="full" for="tNext">Bước tiếp theo<input id="tNext" value="${esc(t.nextStep||'')}" ${D(stOk)}></label>
      <label class="full" for="tNote">Ghi chú<textarea id="tNote" ${D(noteOk)}>${esc(t.note||'')}</textarea></label>
      <fieldset class="fs full"><legend>Thêm</legend><div class="form">
        <label class="full" for="tCol">Người phối hợp (cách nhau bởi dấu phẩy)<input id="tCol" value="${esc((t.collab||[]).join(', '))}" ${D(editable)}></label>
        <label for="tStart">Ngày bắt đầu<input type="date" id="tStart" value="${t.start||''}" ${D(editable)}></label>
        <label for="tRep">Lặp lại<select id="tRep" ${D(editable)}>${opt(Object.entries(REP).map(([k,v])=>({k,t:v})), t.repeat||'')}</select></label>
        <label for="tReq">Bắt buộc cho tiến độ<select id="tReq" ${D(editable)}><option value="1" ${t.required!==false?'selected':''}>Có</option><option value="0" ${t.required===false?'selected':''}>Không (việc phụ)</option></select></label>
        <label for="tW">Trọng số (1–5)<input type="number" id="tW" min="1" max="5" value="${t.weight||1}" ${D(editable)}></label>
        <label class="full" for="tLink">Tệp / liên kết liên quan<input id="tLink" value="${esc(t.links||'')}" ${D(editable)} placeholder="Dán đường dẫn Google Drive"></label></div></fieldset>
    </div>
    <p class="err-msg" id="tErr"></p>
    ${id?`<p class="sub" style="margin:0">Tạo ${dt(t0.createdAt)} bởi ${esc(t0.createdBy||'—')} · cập nhật ${dt(t0.updatedAt)} bởi ${esc(t0.updatedBy||'—')}</p>${card('Lịch sử thay đổi', logList(S.L.filter(l => l.entityId === id)))}`:''}
    <div class="dlg-foot">${id && can('delete')?'<button class="btn ghost danger" type="button" id="tDel">Xóa</button>':''}${id && can('create')?'<button class="btn ghost" type="button" id="tDup">Nhân bản</button>':''}<span class="sp"></span><button class="btn" type="submit" value="x">Hủy</button><button class="btn pri" type="button" id="tSave" ${D(stOk||noteOk)}>${id?'Lưu thay đổi':'Tạo công việc'}</button></div>`);
  const stBox = () => { const s = $('#tSt').value;
    $('#stBox').innerHTML = s === 'wait' ? `<fieldset class="fs"><legend>Chờ phản hồi</legend><div class="form"><label class="req" for="tWho">Chờ ai phản hồi<input id="tWho" value="${esc(t.waitWho||'')}" placeholder="vd: chị Mai (CĐT)"></label><label class="req" for="tFu">Ngày nhắc lại<input type="date" id="tFu" value="${t.followUp||addWork(today(),2)}"></label><label class="full req" for="tWhy">Đang chờ nội dung gì<input id="tWhy" value="${esc(t.blockReason||'')}"></label></div></fieldset>`
      : s === 'hold' ? `<fieldset class="fs"><legend>Tạm hoãn</legend><div class="form"><label class="full req" for="tWhy">Lý do tạm hoãn<input id="tWhy" value="${esc(t.blockReason||'')}"></label><label class="req" for="tHold">Ngày xem lại<input type="date" id="tHold" value="${t.holdUntil||''}"></label></div></fieldset>`
      : s === 'cancel' ? `<fieldset class="fs"><legend>Hủy</legend><label class="req" for="tCan" style="display:grid;gap:5px;font-size:12px">Lý do hủy<input id="tCan" value="${esc(t.cancelReason||'')}"></label></fieldset>` : ''; };
  stBox(); $('#tSt').onchange = stBox;
  $('#tProj').onchange = e => { $('#tItem').innerHTML = opt(items.filter(i=>i.projectId===e.target.value).map(i=>({k:i.id,t:i.name})), '', '— chọn hạng mục —'); };
  $('#tDue').onchange = () => { $('#dueWhy').hidden = !(id && t0.due && $('#tDue').value !== t0.due); };
  let dupOk = false;
  $('#tSave').onclick = () => {
    const st = $('#tSt').value; const err = [];
    const d = {code:t.code, title:$('#tTitle').value.trim(), result:$('#tRes').value.trim(), projectId:$('#tProj').value, itemId:$('#tItem').value, assigner:$('#tAsgr').value, assignee:$('#tAsg').value, collab:$('#tCol').value.split(',').map(s=>s.trim()).filter(Boolean), start:$('#tStart').value, due:$('#tDue').value, todoDate:$('#tDay').value, priority:$('#tPr').value, status:st, repeat:$('#tRep').value, nextStep:$('#tNext').value.trim(), note:$('#tNote').value, links:$('#tLink').value.trim(), required:$('#tReq').value === '1', weight:Math.min(5, Math.max(1, +$('#tW').value||1))};
    if (!d.title) err.push('tên việc'); if (!d.projectId) err.push('dự án'); if (!d.itemId) err.push('hạng mục'); if (!d.assignee && st !== 'cancel') err.push('người thực hiện'); if (!d.due) err.push('hạn hoàn thành');
    if (st === 'wait') { d.waitWho = $('#tWho').value.trim(); d.followUp = $('#tFu').value; d.blockReason = $('#tWhy').value.trim(); if (!d.waitWho) err.push('chờ ai'); if (!d.followUp) err.push('ngày nhắc lại'); if (!d.blockReason) err.push('nội dung đang chờ'); }
    if (st === 'hold') { d.blockReason = $('#tWhy').value.trim(); d.holdUntil = $('#tHold').value; if (!d.blockReason) err.push('lý do tạm hoãn'); if (!d.holdUntil) err.push('ngày xem lại'); }
    if (st === 'cancel') { d.cancelReason = $('#tCan').value.trim(); if (!d.cancelReason) err.push('lý do hủy'); }
    if (!['wait','hold'].includes(st)) { d.waitWho = ''; d.followUp = ''; d.holdUntil = ''; if (st !== 'cancel') d.blockReason = ''; }
    if (err.length) { $('#tErr').textContent = 'Cần nhập: ' + err.join(', ') + '.'; return; }
    if (d.start && d.due < d.start) { $('#tErr').textContent = 'Hạn hoàn thành phải sau ngày bắt đầu.'; return; }
    if (id && t0.due && d.due !== t0.due) { const why = $('#tDueWhy').value.trim(); if (!why) { $('#dueWhy').hidden = false; $('#tErr').textContent = 'Đổi hạn cần ghi lý do.'; $('#tDueWhy').focus(); return; } d.note = (d.note ? d.note.replace(/\s+$/,'') + '\n' : '') + `[${vns(today())}] Dời hạn ${vn(t0.due)} → ${vn(d.due)}: ${why}`; }
    if (!id && !dupOk) { const dup = tasksOf(x => x.itemId === d.itemId && OPEN.has(x.status) && norm(x.title) === norm(d.title)); if (dup.length) { dupOk = true; $('#tErr').textContent = `Hạng mục đã có việc đang mở cùng tên (${dup[0].code}). Bấm lại để vẫn tạo.`; return; } }
    if (!id || d.assignee !== t0.assignee) d.assignedAt = new Date().toISOString();
    if (st === 'done' && t0.status !== 'done') d.doneAt = new Date().toISOString();
    if (st === 'doing' && !d.start) d.start = today();
    if (t0.sample) d.sample = true; if (t0.seriesId) d.seriesId = t0.seriesId;
    const nid = save('tasks', id, d); closeDlg(); toast(`Đã lưu ${d.code}`);
    if (st === 'done' && t0.status !== 'done') spawnRepeat({...t0, ...d, id:nid});
  };
  if ($('#tDup')) $('#tDup').onclick = () => { const {id:_, code, status, doneAt, createdAt, updatedAt, createdBy, updatedBy, seriesId, ...rest} = t0; openTask(null, {...rest, title: t0.title + ' (bản sao)', status:'todo'}); };
  if ($('#tDel')) $('#tDel').onclick = () => confirmBox(`Xóa ${t0.code}?`, 'Nên dùng trạng thái “Đã hủy” để giữ lịch sử. Chỉ xóa khi tạo nhầm.', () => { remove('tasks', id); toast('Đã xóa'); });
}

/* ---------- Nhập dự án từ Checklist (dán dữ liệu) ---------- */
function importChecklist(){
  if (REMOTE) return importChecklistLive();
  openDlg(`${dlgHead('Nhập từ Checklist', 'Tạo dự án từ deal')}
    <p style="margin:0;color:var(--ink2)">Mở file Checklist, sheet <b>DỰ ÁN</b>, chọn các dòng cần lấy từ cột <b>C đến Y</b> (CĐT/Khách hàng … Trạng thái triển khai), bấm Ctrl+C rồi dán vào ô dưới. Deal đã có dự án sẽ được bỏ qua để không trùng.</p>
    <textarea id="ckPaste" style="min-height:160px;font-family:var(--mono);font-size:12px" placeholder="Dán dữ liệu ở đây…"></textarea>
    <div id="ckList"></div><p class="err-msg" id="ckErr"></p>
    <div class="dlg-foot"><span class="sp"></span><button class="btn" type="submit" value="x">Hủy</button><button class="btn pri" type="button" id="ckGo" disabled>Tạo dự án đã chọn</button></div>`);
  let deals = [];
  $('#ckPaste').oninput = () => {
    const have = new Set(Object.values(S.P).map(p => p.dealId));
    deals = $('#ckPaste').value.split(/\r?\n/).map(l => l.split('\t')).filter(v => v.length >= 4).map(v => ({cdt:(v[0]||'').trim(), name:(v[1]||'').trim(), stage:(v[2]||'').trim(), id:(v[3]||'').trim().toUpperCase(), hm:(v[5]||'').trim(), sale:(v[13]||'').trim(), tk:(v[22]||'').trim()})).filter(d => /^[A-Z]{2,}-?\d+/.test(d.id));
    const fresh = deals.filter(d => !have.has(d.id));
    $('#ckErr').textContent = deals.length ? (deals.length - fresh.length ? `${deals.length - fresh.length} deal đã có dự án, bỏ qua.` : '') : ($('#ckPaste').value.trim() ? 'Không đọc được Deal ID. Kiểm tra đã chép từ cột C (CĐT) đến ít nhất cột F (Deal ID).' : '');
    $('#ckList').innerHTML = fresh.length ? `<div class="tbl"><table><thead><tr><th></th><th>Deal</th><th>Dự án</th><th>Stage</th><th>Sale</th></tr></thead><tbody>${fresh.map(d => `<tr><td><input type="checkbox" class="imp" value="${esc(d.id)}" ${d.stage==='Lost'?'':'checked'} aria-label="Chọn ${esc(d.id)}"></td><td class="code">${esc(d.id)}</td><td><div class="t-title">${esc(d.name)}</div><div class="sub">${esc(d.cdt)}${d.hm?' · '+esc(d.hm):''}</div></td><td>${esc(d.stage)}</td><td>${esc(d.sale)}</td></tr>`).join('')}</tbody></table></div>` : '';
    $('#ckGo').disabled = !fresh.length;
  };
  $('#ckGo').onclick = () => {
    const ids = $$('.imp:checked').map(c => c.value); if (!ids.length) { $('#ckErr').textContent = 'Chưa chọn deal nào.'; return; }
    deals.filter(d => ids.includes(d.id)).forEach(d => save('projects', null, {code:nextCode('DA', S.P, 3), dealId:d.id, name:d.name, cdt:d.cdt, goal:d.hm, owner: people().includes(d.sale) ? d.sale : '', priority:'tb', status:'', start:today(), due:'', members:[]}));
    closeDlg(); toast(`Đã tạo ${ids.length} dự án. Mở từng dự án để nhập hạn và người phụ trách.`);
  };
}

function importChecklistLive(){
  if (!CK.deals.length) { if (CK.err) { toast('Chưa đọc được Checklist: ' + CK.err); return; } toast('Đang đọc Checklist, thử lại sau vài giây.'); loadChecklist(true); return; }
  const have = new Set(Object.values(S.P).map(p => p.dealId));
  const list = CK.deals.filter(d => !have.has(d.id) && d.stage !== 'Lost');
  const won = list.filter(d => d.stage === 'Won' && d.tk !== 'Hoàn thành'), other = list.filter(d => !won.includes(d));
  const row = d => `<tr><td><input type="checkbox" class="imp" value="${esc(d.id)}" aria-label="Chọn ${esc(d.id)}"></td><td class="code">${esc(d.id)}</td><td><div class="t-title">${esc(d.name)}</div><div class="sub">${esc(d.cdt)}${d.hm?' · '+esc(d.hm):''}</div></td><td>${esc(d.stage)}</td><td>${esc(d.tk||'')}</td><td>${esc(d.sale)}</td></tr>`;
  openDlg(`${dlgHead('Đọc trực tiếp sheet DỰ ÁN · ' + dt(CK.at), 'Tạo dự án từ Checklist')}
    <p class="sub" style="margin:0">Deal đã có dự án được ẩn để không trùng. Mặc định hiện deal Won chưa hoàn thành triển khai.</p>
    <div class="tbl" style="max-height:55vh;border:1px solid var(--line);border-radius:10px"><table><thead><tr><th></th><th>Deal</th><th>Dự án</th><th>Stage</th><th>Triển khai</th><th>Sale</th></tr></thead><tbody>${won.map(row).join('') || '<tr><td colspan="6" class="sub">Không còn deal Won nào chưa có dự án.</td></tr>'}</tbody><tbody id="impMore" hidden>${other.map(row).join('')}</tbody></table></div>
    <div class="dlg-foot"><button class="btn ghost" type="button" id="impAll">Hiện cả deal đang chào giá (${other.length})</button><span class="sp"></span><button class="btn" type="submit" value="x">Hủy</button><button class="btn pri" type="button" id="impGo">Tạo dự án đã chọn</button></div>`);
  $('#impAll').onclick = () => { $('#impMore').hidden = false; };
  $('#impGo').onclick = () => {
    const ids = $$('.imp:checked').map(c => c.value); if (!ids.length) { toast('Chưa chọn deal nào.'); return; }
    CK.deals.filter(d => ids.includes(d.id)).forEach(d => save('projects', null, {code:nextCode('DA', S.P, 3), dealId:d.id, name:d.name, cdt:d.cdt, goal:d.hm, owner: people().includes(d.sale) ? d.sale : '', priority:'tb', status:'', start:today(), due:'', members:[]}));
    closeDlg(); toast(`Đã tạo ${ids.length} dự án. Mở từng dự án để nhập hạn và người phụ trách.`);
  };
}
const ckDeal = id => id ? CK.deals.find(d => d.id === id) : null;
const ckNo = id => id ? CK.no.filter(n => n.id === id) : [];
const money = n => (+n||0).toLocaleString('vi-VN');
function ckCard(p){
  if (!REMOTE || !p.dealId) return '';
  const d = ckDeal(p.dealId), no = ckNo(p.dealId);
  const body = CK.err ? `<div class="banner err">${ic('alert')}<span>Chưa đọc được Checklist: ${esc(CK.err)}</span></div>` : !d ? `<span class="sub">${CK.deals.length ? 'Không thấy Deal '+esc(p.dealId)+' trong sheet DỰ ÁN.' : 'Đang đọc Checklist…'}</span>` : `
    <div class="grid g4" style="gap:12px">
      <div><div class="sub">Stage</div><b>${esc(d.stage)}</b></div><div><div class="sub">Giá chào gần nhất (chưa VAT)</div><b>${money(d.val)}</b></div>
      <div><div class="sub">Sale</div><b>${esc(d.sale||'—')}</b></div><div><div class="sub">Ngày chốt</div><b>${vn(d.chot)||'—'}</b></div>
      <div><div class="sub">Triển khai</div><b>${esc(d.tk||'—')}</b></div><div><div class="sub">Next step</div><span>${esc(d.next||'—')}</span></div></div>
    ${no.length ? `<div class="tbl" style="border:1px solid var(--line2);border-radius:10px"><table><thead><tr><th>Đợt thanh toán</th><th class="num">Còn nợ (gồm VAT)</th><th>Hạn</th><th>Trạng thái</th><th>Phản hồi</th></tr></thead><tbody>${no.map(n => `<tr><td>${esc(n.lbl)}</td><td class="num">${money(n.con)}</td><td>${vn(n.han)||'—'}</td><td><span class="pill ${n.st==='Quá hạn'?'s-cancel':n.st==='Trong hạn'?'s-wait':'s-hold'}" style="${n.st==='Quá hạn'?'color:var(--late);border-color:var(--late);text-decoration:none':''}">${esc(n.st)}</span></td><td class="sub">${esc(n.fb)}</td></tr>`).join('')}</tbody></table></div>` : '<span class="sub">Không còn khoản công nợ nào của deal này.</span>'}`;
  return card(`Từ Checklist · ${esc(p.dealId)}`, body, {right:`<span class="sub">${CK.at ? 'đọc lúc ' + dt(CK.at) : ''}</span><button class="btn sm" type="button" id="ckRe">${CK.loading?'Đang đọc…':'Đọc lại'}</button>`});
}

/* ---------- Dữ liệu mẫu (gắn nhãn MẪU) ---------- */
function seed(){
  const t0 = today(), A = '[Mẫu] Người A', B = '[Mẫu] Người B', by = 'Claude (dữ liệu mẫu)', now = new Date().toISOString();
  const ago = n => addD(t0, -n), fw = n => addWork(t0, n);
  const P = {'s-p1': {id:'s-p1', code:'DA-001', name:'[MẪU] Dự án minh họa', cdt:'Khách hàng giả định', goal:'Dữ liệu giả định để thử luồng: ký hợp đồng, làm hồ sơ thanh toán đợt 1, bàn giao.', owner:A, members:[A,B], start:ago(4), due:fw(12), priority:'cao', status:'', sample:true, createdAt:now, createdBy:by, updatedAt:now, updatedBy:by}};
  const I = {
    's-i1': {id:'s-i1', code:'HM-001', projectId:'s-p1', name:'Hợp đồng', goal:'Hợp đồng hai bên ký, có bản scan', owner:A, priority:'cao', start:ago(4), due:fw(3), sample:true},
    's-i2': {id:'s-i2', code:'HM-002', projectId:'s-p1', name:'Hồ sơ thanh toán đợt 1', goal:'Bộ HSTT đợt 1 gửi khách, có xác nhận đã nhận', owner:B, priority:'tb', start:t0, due:fw(8), sample:true},
    's-i3': {id:'s-i3', code:'HM-003', projectId:'s-p1', name:'Bàn giao', goal:'Biên bản bàn giao có chữ ký', owner:A, priority:'thap', due:fw(12), sample:true}};
  const mk = (n, o) => ({id:'s-t'+n, code:'CV-'+String(n).padStart(4,'0'), projectId:'s-p1', assigner:A, collab:[], required:true, weight:1, sample:true, createdAt:now, createdBy:by, updatedAt:now, updatedBy:by, assignedAt:now, ...o});
  const T = Object.fromEntries([
    mk(1, {title:'Soạn dự thảo hợp đồng', result:'File Word dự thảo theo mẫu VistaX', itemId:'s-i1', assignee:B, start:ago(4), due:ago(3), priority:'cao', status:'done', doneAt:new Date(Date.now()-3*864e5).toISOString()}),
    mk(2, {title:'Gửi khách review hợp đồng', result:'Khách phản hồi ý kiến hoặc đồng ý', itemId:'s-i1', assignee:B, collab:[A], start:ago(3), due:ago(1), priority:'cao', status:'wait', waitWho:'Đầu mối pháp chế bên khách (giả định)', followUp:ago(1), blockReason:'Chờ góp ý điều khoản thanh toán', nextStep:'Gọi nhắc đầu mối, hẹn ngày phản hồi', weight:2, updatedAt:new Date(Date.now()-3*864e5).toISOString()}),
    mk(3, {title:'Trình ký hợp đồng nội bộ', result:'Hợp đồng có chữ ký đại diện VistaX', itemId:'s-i1', assignee:A, due:fw(2), priority:'tb', status:'todo'}),
    mk(4, {title:'Chuẩn bị bộ hồ sơ thanh toán đợt 1', result:'Đề nghị thanh toán + biên bản nghiệm thu đợt 1', itemId:'s-i2', assignee:B, start:ago(1), todoDate:t0, due:t0, priority:'cao', status:'doing', weight:2, nextStep:'Lấy số liệu nghiệm thu từ PM'}),
    mk(5, {title:'Xuất hóa đơn GTGT đợt 1', result:'Hóa đơn điện tử phát hành', itemId:'s-i2', assignee:'', due:fw(5), priority:'tb', status:'todo'}),
    mk(6, {title:'Cập nhật file Checklist sau khi ký', result:'Ngày ký, link hợp đồng điền vào Checklist', itemId:'s-i1', assignee:A, due:ago(2), priority:'thap', status:'todo', required:false}),
    mk(7, {title:'Chuẩn bị biên bản bàn giao', result:'Biên bản bàn giao theo mẫu', itemId:'s-i3', assignee:A, due:fw(10), priority:'thap', status:'hold', blockReason:'Khách chưa chốt lịch bàn giao', holdUntil:fw(5)})
  ].map(t => [t.id, t]));
  return {projects:P, items:I, tasks:T, logs:[{id:'s-l1', at:now, by, entity:'projects', entityId:'s-p1', code:'DA-001', action:'Tạo', changes:[{f:'Tên', from:'', to:'[MẪU] Dự án minh họa'}]}], notes:{}, config:{}};
}

/* ---------- Hướng dẫn & đặc tả ---------- */
function vGuide(){
  $('#view').innerHTML = `<div class="doc" style="max-width:960px">
  <div class="ph"><div><h1>Hướng dẫn vận hành và đặc tả</h1><div class="sub">Tài liệu đi kèm ứng dụng. Các mục ghi “Giả định” cần VistaX xác nhận.</div></div></div><div class="card"><div class="cb doc" style="max-width:none">
  <h2>1. Tóm tắt giải pháp</h2>
  <p>Một trang web gói trong <b>một file HTML</b>, mở bằng trình duyệt (Chrome, Edge), không cần cài đặt hay máy chủ. Dữ liệu lưu trong trình duyệt của máy đang mở (localStorage). Mọi màn hình (Tổng quan, Daily To-do, Dự án, Công việc, Lịch, Báo cáo, Thông báo) đọc cùng một nguồn: bảng <b>công việc</b>. Dự án nối với <b>Deal ID</b> của file Checklist (nhập bằng cách dán dòng từ sheet DỰ ÁN); thông tin bán hàng, công nợ vẫn nằm ở Checklist.</p>
  <h2>2. Giả định và thông tin cần xác nhận</h2>
  <ul><li>Giả định: đội Sale Admin dưới 15 người, dưới 1.000 công việc đang theo dõi cùng lúc.</li><li>Giả định: tuần làm việc T2–T6; T7 tùy chỉnh trong Cài đặt. Ngày nghỉ lễ chưa nhập.</li><li>Cần xác nhận: danh sách thành viên và vai trò; ai là Quản trị viên.</li><li>Cần xác nhận: logo VistaX (chưa dùng). Màu lấy theo bảng màu đang dùng ở Daily Ops.</li><li>Cần xác nhận: có cần gửi thông báo qua email/Zalo hay không (hiện chỉ hiển thị trong trang).</li><li>Cần xác nhận: cách làm chung. Bản một file không có máy chủ, nên mỗi máy có dữ liệu riêng; đội dùng chung bằng cách Xuất / Nhập file dữ liệu, hoặc nâng cấp lên bản có máy chủ (mục 12).</li></ul>
  <h2>3. Cấu trúc ba cấp</h2>
  <pre>Dự án (DA-001, nối Deal VTX-xxxx)
 └─ Hạng mục (HM-001: Hợp đồng · Hồ sơ thanh toán · Bàn giao …)
     └─ Công việc (CV-0001: việc cụ thể, 1 người thực hiện, 1 hạn)</pre>
  <p>Trường bắt buộc (dấu *): Dự án: tên, người phụ trách, hạn, ưu tiên. Hạng mục: dự án, tên, người phụ trách. Công việc: tên, dự án, hạng mục, người thực hiện, hạn, ưu tiên, trạng thái. Còn lại là tùy chọn. Công việc chỉ lưu mã dự án/hạng mục, tên lấy từ bản ghi gốc nên đổi tên dự án là mọi nơi đổi theo.</p>
  <h2>4. Màn hình</h2>
  <ul><li><b>Tổng quan</b>: 6 ô số (bấm để lọc), dự án có nguy cơ trễ, việc kẹt chờ, bảng quá hạn/sắp đến hạn. Chuyển “Toàn đội / Việc của tôi”.</li>
  <li><b>Daily To-do</b>: chọn ngày + người. Hiện việc có Ngày làm = hôm nay, việc đến hạn, việc chưa xong ngày trước và việc đã xong trong ngày. Đổi trạng thái tại chỗ. Ghi chú cuối ngày. Nút chuyển việc chưa xong sang ngày làm việc kế tiếp.</li>
  <li><b>Dự án</b>: thẻ dự án có tiến độ, nút Nhập từ Checklist (dán dữ liệu); trang chi tiết hiển thị Dự án → Hạng mục → Công việc, tiến độ từng cấp, lịch sử.</li>
  <li><b>Công việc</b>: hai kiểu xem Danh sách và Bảng (kéo thẻ để đổi trạng thái); tìm kiếm, lọc theo dự án/hạng mục/người/trạng thái/ưu tiên/hạn, thao tác hàng loạt (trạng thái, giao người, ngày làm), xuất CSV theo bộ lọc.</li>
  <li><b>Lịch</b>: ngày / tuần / tháng theo hạn hoàn thành; ô xám là ngày nghỉ.</li>
  <li><b>Báo cáo</b>: hôm nay, tuần này, tuần trước, tháng này, khoảng ngày; lọc người, dự án; xuất CSV chi tiết và tổng hợp.</li>
  <li><b>Thông báo</b>: quá hạn, sắp đến hạn, đến ngày nhắc lại, được giao mới, bị đổi hạn.</li>
  <li><b>Lịch sử</b>: mọi thay đổi (ai, lúc nào, trường nào, từ → thành).</li>
  <li><b>Cài đặt</b>: thành viên, vai trò, ngày làm việc, ngày nghỉ, ngưỡng cảnh báo, sao lưu, khôi phục, xóa dữ liệu mẫu.</li></ul>
  <p>Trạng thái rỗng: mỗi bảng ghi rõ chưa có gì và cách thêm. Lỗi: báo bằng câu cụ thể (thiếu trường nào, không có quyền, trình duyệt chặn lưu).</p>
  <h2>5. Mô hình dữ liệu</h2>
  <pre>projects  : code, dealId (duy nhất), name, cdt, goal, owner, members[], start, due, priority, status(tự tính | hold | cancel), links
items     : code, projectId → projects, name, goal, owner, start, due, priority, status
tasks     : code, projectId, itemId → items, title, result, assigner, assignee, collab[], createdAt, start, todoDate, due,
            priority, status, waitWho, followUp, blockReason, holdUntil, cancelReason, nextStep, note, links,
            required, weight, repeat, seriesId, doneAt, assignedAt, updatedAt, updatedBy
logs      : at, by, entity, entityId, code, action, changes[{f, from, to}]
notes     : date, who, done, issue, plan   (khóa = ngày_người → 1 ghi chú/người/ngày)
config/main: team[{name, role, active}], workdays[], holidays[], soonDays, stuckDays</pre>
  <p>Nhất quán: không xóa được dự án còn hạng mục, hạng mục còn công việc; khuyến nghị dùng “Đã hủy”. Chuyển hạng mục sang dự án khác thì mọi công việc con chuyển theo. Chống trùng: mỗi Deal ID một dự án; tên hạng mục không trùng trong một dự án; công việc trùng tên đang mở trong cùng hạng mục bị cảnh báo; chuyển việc sang ngày mai chỉ đổi Ngày làm, không tạo bản ghi mới; việc lặp chỉ tạo lần kế tiếp nếu chưa có lần cùng hạn. Lưu lâu dài: dữ liệu ghi ngay vào trình duyệt sau mỗi thao tác; hai tab cùng máy tự đồng bộ. Nhiều máy: không tự đồng bộ; dùng Xuất / Nhập file, file nhập sau thay thế toàn bộ dữ liệu trên máy nhận (đây là quy tắc xử lý xung đột: một người giữ bản gốc).</p>
  <h2>6. Trạng thái, tiến độ và hạn</h2>
  <div class="tbl"><table><thead><tr><th>Trạng thái</th><th>Khi nào dùng</th><th>Bắt buộc nhập</th></tr></thead><tbody>
  <tr><td>Chưa bắt đầu</td><td>Mặc định khi tạo</td><td>—</td></tr>
  <tr><td>Đang thực hiện</td><td>Đã bắt tay làm (tự điền ngày bắt đầu)</td><td>—</td></tr>
  <tr><td>Chờ phản hồi</td><td>Cần người khác trả lời/duyệt mới đi tiếp</td><td>Chờ ai, nội dung chờ, ngày nhắc lại</td></tr>
  <tr><td>Tạm hoãn</td><td>Dừng có chủ đích (khách hoãn, chưa ưu tiên)</td><td>Lý do, ngày xem lại. Không tính quá hạn khi đang hoãn</td></tr>
  <tr><td>Hoàn thành</td><td>Đã ra kết quả trong “Kết quả cần hoàn thành”</td><td>Tự ghi ngày hoàn thành</td></tr>
  <tr><td>Đã hủy</td><td>Không làm nữa</td><td>Lý do hủy. Không tính tiến độ, không tính quá hạn</td></tr></tbody></table></div>
  <p><b>Quá hạn</b>: hạn &lt; hôm nay và việc còn mở (trừ Tạm hoãn). <b>Sắp đến hạn</b>: còn ≤ ${S.cfg.soonDays ?? 2} ngày làm việc (chỉnh trong Cài đặt). <b>Kẹt chờ</b>: Chờ phản hồi mà đã qua ngày nhắc lại, hoặc không cập nhật ≥ ${S.cfg.stuckDays ?? 3} ngày làm việc → hiện ở Tổng quan, Thông báo; xử lý: nhắc lại người được chờ, nếu quá 2 lần thì báo quản lý.</p>
  <p><b>Tiến độ</b> = tổng trọng số việc Hoàn thành ÷ tổng trọng số việc không bị hủy. Ví dụ hạng mục có 4 việc trọng số 1, 1, 2, 1 (một việc đã hủy trọng số 1): xong 2 việc trọng số 1 và 2 → 3 ÷ 4 = 75%. Tiến độ dự án tính trên toàn bộ việc của dự án. Trạng thái dự án/hạng mục tự tính: chỉ là <b>Hoàn thành</b> khi không còn việc bắt buộc nào chưa xong; quản lý chỉ đặt tay được Tạm hoãn hoặc Đã hủy.</p>
  <p><b>Đổi hạn</b>: bắt buộc ghi lý do, tự thêm vào ghi chú và lịch sử, người liên quan nhận thông báo. <b>Đổi người</b>: ghi lịch sử, người mới thấy “được giao mới”. <b>Lặp lại</b>: khi hoàn thành, tự tạo lần kế tiếp (ngày làm việc kế / +7 ngày / +1 tháng).</p>
  <h2>7. Quy trình vận hành</h2>
  <h3>Đầu ngày (10 phút)</h3><ol><li>Mở Thông báo: xử lý việc quá hạn, đến ngày nhắc lại, được giao mới.</li><li>Mở Daily To-do (tên mình): sắp xếp theo ưu tiên Khẩn → Cao; việc không làm kịp hôm nay thì đặt Ngày làm sang ngày khác.</li><li>Quá tải (việc Khẩn/Cao vượt khả năng trong ngày): báo quản lý ngay, quản lý giao lại hoặc hạ ưu tiên ở trang Công việc (thao tác hàng loạt).</li></ol>
  <h3>Trong ngày</h3><ol><li>Đổi trạng thái ngay khi có thay đổi (ô “Cập nhật nhanh”).</li><li>Chờ người khác: chọn Chờ phản hồi, ghi chờ ai, nội dung, ngày nhắc lại, bước tiếp theo.</li><li>Có nguy cơ ảnh hưởng hạn dự án: đổi ưu tiên lên Cao/Khẩn, ghi vào “Vấn đề” ở ghi chú cuối ngày và nhắn quản lý.</li></ol>
  <h3>Cuối ngày (5 phút)</h3><ol><li>Bấm Hoàn thành các việc đã xong.</li><li>Việc chưa xong: ghi bước tiếp theo; cần dời hạn thì đổi hạn và ghi lý do.</li><li>Bấm “Chuyển việc chưa xong sang …”, rồi lưu ghi chú cuối ngày.</li></ol>
  <h3>Hằng tuần (họp nội bộ)</h3><ol><li>Báo cáo → Tuần này: rà quá hạn, việc chặn và nguyên nhân, tiến độ dự án, khối lượng theo người.</li><li>Chốt người phụ trách, hạn mới ngay trong từng công việc (có lịch sử).</li><li>Xuất CSV tổng hợp gửi quản lý; Xuất file dữ liệu ở Cài đặt để sao lưu.</li></ol>
  <h2>8. Phân quyền</h2>
  <div class="tbl"><table><thead><tr><th>Vai trò</th><th>Xem</th><th>Tạo</th><th>Sửa</th><th>Xóa</th><th>Phân công</th><th>Xuất báo cáo</th><th>Cấu hình</th></tr></thead><tbody>
  <tr><td>Quản trị viên</td><td>Tất cả</td><td>Có</td><td>Tất cả</td><td>Có</td><td>Có</td><td>Có</td><td>Có</td></tr>
  <tr><td>Quản lý</td><td>Tất cả</td><td>Có</td><td>Tất cả</td><td>Không (dùng Hủy)</td><td>Có</td><td>Có</td><td>Không</td></tr>
  <tr><td>Sale Admin</td><td>Tất cả</td><td>Có</td><td>Việc mình làm / giao / phối hợp</td><td>Không</td><td>Việc do mình giao</td><td>Có</td><td>Không</td></tr>
  <tr><td>Người phối hợp / Chỉ xem</td><td>Tất cả</td><td>Không</td><td>Chỉ thêm ghi chú việc mình phối hợp</td><td>Không</td><td>Không</td><td>Không</td><td>Không</td></tr></tbody></table></div>
  <p><b>Lưu ý bảo mật:</b> vai trò ở trên chỉ là phân quyền trên giao diện, dựa vào tên người dùng tự chọn; chưa có đăng nhập và mật khẩu. Ai mở được file và máy thì sửa được dữ liệu. Phân quyền thật cần bản có máy chủ (mục 12).</p>
  <h2>9. Báo cáo và xuất dữ liệu</h2>
  <p>Báo cáo hằng ngày (Daily To-do + ghi chú cuối ngày), tiến độ dự án, việc hoàn thành/đang làm/chờ/quá hạn, khối lượng theo người, việc bị chặn và nguyên nhân, báo cáo tuần/tháng/khoảng ngày. Bộ lọc: kỳ, người, dự án. Việc Đã hủy: loại khỏi tiến độ và quá hạn, chỉ đếm riêng. Số liệu khớp hệ thống vì báo cáo tính trực tiếp từ bảng công việc lúc mở. CSV dùng dấu phẩy, mã UTF-8 có BOM để Excel đọc đúng tiếng Việt.</p>
  <h2>10. Rủi ro vận hành</h2>
  <ul><li>Không cập nhật trạng thái → số liệu sai: quy định cập nhật cuối ngày; Tổng quan hiện “Kẹt chờ”, “Thiếu người làm”.</li><li>Chọn sai tên ở “Tôi là” → lịch sử ghi sai người: mỗi người dùng một máy/trình duyệt, kiểm tra tên ở góc trái.</li><li>Mất dữ liệu do xóa nhầm hoặc xóa dữ liệu trình duyệt: chỉ Quản trị viên xóa được, có xác nhận; Xuất file dữ liệu hằng tuần. Không dùng chế độ ẩn danh.</li><li>Hai người nhập file chéo nhau → mất thay đổi: quy định một người giữ bản gốc, người khác gửi file cho người đó.</li><li>Dự án lệch tên với Checklist: Checklist là nguồn của thông tin bán hàng; đổi tên ở dự án nếu Checklist đổi.</li></ul>
  <h2>11. Kiểm thử luồng (dùng dữ liệu MẪU)</h2>
  <ol><li>Dự án → + Dự án: nhập tên, phụ trách, hạn → Lưu. Kết quả: có mã DA-xxx, mở trang chi tiết.</li><li>+ Hạng mục: tên, phụ trách → Lưu. Kết quả: hạng mục hiện trong dự án, tiến độ “chưa có việc”.</li><li>+ Việc: tên, người thực hiện, hạn → Lưu. Kết quả: có mã CV-xxxx, hiện ở Công việc, Lịch, Daily To-do của người đó.</li><li>Đổi trạng thái Đang thực hiện, thêm ghi chú → Lịch sử có dòng mới.</li><li>Chọn Chờ phản hồi: bắt buộc chờ ai + ngày nhắc lại. Đặt ngày nhắc lại là hôm qua → việc hiện “Kẹt chờ” ở Tổng quan và Thông báo.</li><li>Bấm Hoàn thành → tiến độ hạng mục và dự án tăng theo công thức mục 6; dự án chỉ “Hoàn thành” khi hết việc bắt buộc.</li><li>Báo cáo → Tuần này → Xuất CSV: file có đúng các việc theo bộ lọc.</li></ol>
  <h2>12. Phần còn cần cấu hình hoặc triển khai</h2>
  <ul><li>Nhập thành viên và vai trò (Cài đặt) — bắt buộc trước khi dùng thật.</li><li>Nhập ngày nghỉ lễ năm 2026–2027.</li><li>Chưa có: dữ liệu dùng chung tự động giữa nhiều máy, đăng nhập theo tài khoản, gửi thông báo email/Zalo, đính kèm file trực tiếp (hiện dán đường dẫn Drive). Muốn có cần bản có máy chủ, ví dụ Next.js + Supabase: giữ nguyên giao diện và mô hình dữ liệu ở mục 5.</li><li>Nhập từ Checklist là dán dữ liệu thủ công; chưa đọc trực tiếp Google Sheets.</li></ul>
  </div></div></div>`;
}


(async () => { render(); await load(); route(); })();
