/**
 * Sale Admin VistaX – máy chủ Google Apps Script
 * - Giao diện: tải từ GitHub Pages (app.css, shell.html, app.js) → sửa giao diện chỉ cần đẩy GitHub.
 * - Dữ liệu công việc: Google Sheet "Sale Admin VistaX – Dữ liệu" (tạo tự động lần đầu).
 * - Checklist: chỉ ĐỌC sheet DỰ ÁN và CÔNG NỢ TỔNG HỢP, không ghi gì vào Checklist.
 * Triển khai: Deploy → Web app → Execute as: User accessing the web app · Who has access: Anyone with Google account.
 */
const CHECKLIST_ID = '1l7A8hZrSBrkEQoWRXEMYvxmqcUWcA1YlaGBZ2gqMFZ8';
const STORE = '_store';
const CHUNK = 45000;
const TZ = 'Asia/Ho_Chi_Minh';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Sale Admin VistaX')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** Chạy một lần (bấm Run) để tạo file dữ liệu và ghi nhận chủ sở hữu. */
function setup() {
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('OWNER_EMAIL')) p.setProperty('OWNER_EMAIL', Session.getEffectiveUser().getEmail());
  const ss = dataSS_();
  SpreadsheetApp.openById(CHECKLIST_ID).getName(); // kiểm tra quyền đọc Checklist
  Logger.log('File dữ liệu: ' + ss.getUrl());
}

function dataSS_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('DATA_ID');
  let ss;
  if (id) ss = SpreadsheetApp.openById(id);
  else {
    ss = SpreadsheetApp.create('Sale Admin VistaX – Dữ liệu');
    p.setProperty('DATA_ID', ss.getId());
    ss.getSheets()[0].setName(STORE).getRange('A1:B1').setValues([['{}', 0]]);
  }
  // Tạo các tab xem trước, rồi mới ẩn _store (Google không cho ẩn tab duy nhất)
  ['Dự án', 'Hạng mục', 'Công việc', 'Lịch sử'].forEach(n => { if (!ss.getSheetByName(n)) ss.insertSheet(n); });
  let st = ss.getSheetByName(STORE);
  if (!st) { st = ss.insertSheet(STORE); st.getRange('A1:B1').setValues([['{}', 0]]); }
  if (!st.isSheetHidden()) st.hideSheet();
  return ss;
}

function readStore_(ss) {
  const sh = ss.getSheetByName(STORE);
  const n = Math.max(1, sh.getLastRow());
  const col = sh.getRange(1, 1, n, 1).getValues().map(r => r[0]).join('');
  const ver = Number(sh.getRange('B1').getValue()) || 0;
  let state = {};
  try { state = col ? JSON.parse(col) : {}; } catch (e) { throw new Error('File dữ liệu bị hỏng (_store). Khôi phục từ bản sao lưu.'); }
  return { state, ver };
}

function writeStore_(ss, state, ver) {
  const sh = ss.getSheetByName(STORE);
  const s = JSON.stringify(state);
  const parts = [];
  for (let i = 0; i < s.length; i += CHUNK) parts.push([s.slice(i, i + CHUNK)]);
  if (!parts.length) parts.push(['{}']);
  sh.getRange('A:A').clearContent();
  sh.getRange(1, 1, parts.length, 1).setNumberFormat('@').setValues(parts);
  sh.getRange('B1').setValue(ver);
}

function user_() {
  const email = (Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || '').toLowerCase();
  const owner = (PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL') || '').toLowerCase();
  return { email, isOwner: !!email && email === owner };
}

/** Tải toàn bộ dữ liệu. sinceVer: nếu không đổi thì trả gọn. */
function loadAll(sinceVer) {
  const ss = dataSS_();
  const { state, ver } = readStore_(ss);
  if (sinceVer && Number(sinceVer) === ver) return { version: ver };
  return { version: ver, state, user: user_(), dataUrl: ss.getUrl() };
}

/** Ghi các thay đổi: [{c:'tasks'|'projects'|'items'|'notes', id, v|null}, {c:'config', v}, {c:'logs', v:[...]}] */
function applyOps(ops) {
  const u = user_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = dataSS_();
    const { state, ver } = readStore_(ss);
    const team = (state.config && state.config.team) || [];
    const me = team.find(m => String(m.email || '').toLowerCase().split(/[\s,;]+/).includes(u.email));
    const role = u.isOwner ? 'admin' : (me ? me.role : (team.length ? 'viewer' : 'admin'));
    if (role === 'viewer') throw new Error('Tài khoản ' + u.email + ' chỉ có quyền xem.');
    const touched = {};
    ['projects', 'items', 'tasks', 'notes'].forEach(c => { state[c] = state[c] || {}; });
    state.logs = state.logs || [];
    (ops || []).forEach(o => {
      if (o.c === 'config') { if (role !== 'admin') throw new Error('Chỉ Quản trị viên được đổi Cài đặt.'); state.config = o.v; return; }
      if (o.c === 'logs') { state.logs = (o.v || []).concat(state.logs).slice(0, 3000); touched.logs = 1; return; }
      if (!state[o.c]) return;
      if (o.v === null) { if (role !== 'admin') throw new Error('Chỉ Quản trị viên được xóa.'); delete state[o.c][o.id]; }
      else state[o.c][o.id] = o.v;
      touched[o.c] = 1;
    });
    const nv = ver + 1;
    writeStore_(ss, state, nv);
    mirror_(ss, state, touched);
    return { version: nv };
  } finally {
    lock.releaseLock();
  }
}

/** Các tab đọc được trong Google Sheets (chỉ để xem/lọc; dữ liệu gốc nằm ở _store). */
function mirror_(ss, s, touched) {
  const ST = { todo: 'Chưa bắt đầu', doing: 'Đang thực hiện', wait: 'Chờ phản hồi', hold: 'Tạm hoãn', done: 'Hoàn thành', cancel: 'Đã hủy' };
  const PR = { khan: 'Khẩn', cao: 'Cao', tb: 'Trung bình', thap: 'Thấp' };
  const P = s.projects || {}, I = s.items || {};
  const put = (name, head, rows) => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    sh.clearContents();
    const data = [head].concat(rows);
    sh.getRange(1, 1, data.length, head.length).setValues(data);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#F7E9F0');
  };
  if (touched.projects || touched.tasks) put('Dự án', ['Mã', 'Deal ID', 'Dự án', 'CĐT', 'Phụ trách', 'Bắt đầu', 'Hạn', 'Ưu tiên', 'Số việc', 'Việc xong'],
    Object.values(P).map(p => { const ts = Object.values(s.tasks || {}).filter(t => t.projectId === p.id); return [p.code, p.dealId || '', p.name, p.cdt || '', p.owner || '', p.start || '', p.due || '', PR[p.priority] || '', ts.length, ts.filter(t => t.status === 'done').length]; }));
  if (touched.items) put('Hạng mục', ['Mã', 'Dự án', 'Hạng mục', 'Phụ trách', 'Hạn', 'Ưu tiên', 'Kết quả cần đạt'],
    Object.values(I).map(i => [i.code, (P[i.projectId] || {}).name || '', i.name, i.owner || '', i.due || '', PR[i.priority] || '', i.goal || '']));
  if (touched.tasks) put('Công việc', ['Mã', 'Công việc', 'Dự án', 'Hạng mục', 'Người thực hiện', 'Hạn', 'Ngày làm', 'Ưu tiên', 'Trạng thái', 'Chờ ai', 'Nhắc lại', 'Nguyên nhân', 'Bước tiếp theo', 'Hoàn thành lúc', 'Cập nhật', 'Người cập nhật'],
    Object.values(s.tasks || {}).sort((a, b) => String(a.code).localeCompare(String(b.code))).map(t => [t.code, t.title, (P[t.projectId] || {}).name || '', (I[t.itemId] || {}).name || '', t.assignee || '', t.due || '', t.todoDate || '', PR[t.priority] || '', ST[t.status] || t.status, t.waitWho || '', t.followUp || '', t.blockReason || t.cancelReason || '', t.nextStep || '', (t.doneAt || '').slice(0, 10), (t.updatedAt || '').slice(0, 16).replace('T', ' '), t.updatedBy || '']));
  if (touched.logs) put('Lịch sử', ['Thời điểm', 'Người', 'Thao tác', 'Đối tượng', 'Mã', 'Thay đổi'],
    (s.logs || []).slice(0, 1000).map(l => [(l.at || '').slice(0, 16).replace('T', ' '), l.by, l.action, l.entity, l.code, (l.changes || []).map(c => c.f + ': ' + (c.from ? c.from + ' → ' : '') + c.to).join(' | ')]));
}

/** Đọc Checklist (cache 5 phút). */
function getChecklist(force) {
  const cache = CacheService.getUserCache();
  if (!force) { const c = cache.get('ck'); if (c) return JSON.parse(c); }
  const ck = SpreadsheetApp.openById(CHECKLIST_ID);
  const iso = x => x instanceof Date ? Utilities.formatDate(x, TZ, 'yyyy-MM-dd') : (String(x || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/) ? String(x).replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (m, d, mo, y) => y + '-' + ('0' + mo).slice(-2) + '-' + ('0' + d).slice(-2)) : '');
  const num = x => typeof x === 'number' ? x : Number(String(x || '').replace(/[^\d-]/g, '')) || 0;
  const txt = x => String(x == null ? '' : x).trim();
  const da = ck.getSheetByName('DỰ ÁN').getRange('C7:Y306').getValues();
  const deals = da.filter(v => /^[A-Za-z]{2,}-?\d+/.test(txt(v[3]))).map(v => ({
    id: txt(v[3]).toUpperCase(), cdt: txt(v[0]), name: txt(v[1]), stage: txt(v[2]), hm: txt(v[5]), sale: txt(v[13]),
    val: num(v[15]), bg: iso(v[16]), next: txt(v[17]).replace(/\s*\n\s*/g, '; '), chot: iso(v[18]), tk: txt(v[22])
  }));
  const cn = ck.getSheetByName('CÔNG NỢ TỔNG HỢP').getRange('B7:T306').getValues();
  const no = cn.filter(v => /\d{4}$/.test(txt(v[0])) && txt(v[18])).map(v => ({
    id: 'VTX-' + txt(v[0]).slice(-4), lbl: txt(v[3]), con: num(v[7]), han: iso(v[11]), st: txt(v[13]), fb: txt(v[14]).replace(/\s*\n\s*[•-]?\s*/g, '; ').replace(/^[•\-\s]+/, ''), dot: txt(v[18])
  }));
  const out = { deals, no, at: new Date().toISOString() };
  try { cache.put('ck', JSON.stringify(out), 300); } catch (e) {}
  return out;
}
