/* Capa de conexión del Hub FINANCO con la hoja de cálculo (Google Apps Script).
   La comparten todas las herramientas. No hace falta editarla. */
(function () {
  var C = window.FINANCO || {};
  var KEY = 'financo_token';
  function tk() { try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; } }
  function setTk(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var Sync = {
    enabled: function () { return !!C.syncUrl; },
    status: 'local',
    setStatus: function (s) {
      Sync.status = s;
      var el = document.getElementById('syncchip');
      if (!el) return;
      var m = { local: ['Modo demo', 'sy-low'], ok: ['Conectado', 'sy-ok'], err: ['Sin conexión', 'sy-err'], wait: ['Sincronizando', 'sy-low'] }[s];
      el.textContent = m[0]; el.className = 'sy ' + m[1];
    },
    call: function (action, payload, pub) {
      var body = {}; for (var k in (payload || {})) body[k] = payload[k];
      body.action = action; if (!pub) body.token = tk();
      return fetch(C.syncUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) {
            if (j.error === 'unauthorized' && !pub) {
              var t = window.prompt('Ingresá la clave del equipo FINANCO');
              if (t) { setTk(t.trim()); return Sync.call(action, payload, pub); }
            }
            throw new Error(j.error || 'error');
          }
          Sync.setStatus('ok'); return j;
        })
        .catch(function (e) { if (e && e.message !== 'unauthorized' && e.message !== 'credenciales' && e.message !== 'bloqueado') Sync.setStatus('err'); throw e; });
    },
    list: function (tab, pub) { return Sync.call('list', { tab: tab }, pub).then(function (j) { return j.rows; }); },
    upsert: function (tab, rows) { return Sync.call('upsert', { tab: tab, rows: rows }); },
    remove: function (tab, ids) { return Sync.call('remove', { tab: tab, ids: ids }); },
    /* Compara el estado actual con lo último sincronizado y envía solo los cambios. */
    diff: function (tab, arr, snap) {
      if (!Sync.enabled()) return;
      var up = [], cur = {};
      arr.forEach(function (x) { var s = JSON.stringify(x); cur[x.id] = s; if (snap[x.id] !== s) up.push(x); });
      var del = Object.keys(snap).filter(function (id) { return !(id in cur); });
      if (!up.length && !del.length) return;
      Sync.setStatus('wait');
      var p = Promise.resolve();
      if (up.length) p = p.then(function () { return Sync.upsert(tab, up); }).then(function () { up.forEach(function (x) { snap[x.id] = cur[x.id]; }); });
      if (del.length) p = p.then(function () { return Sync.remove(tab, del); }).then(function () { del.forEach(function (id) { delete snap[id]; }); });
      p.catch(function () {});
    },
    snap: function (arr) { var s = {}; arr.forEach(function (x) { s[x.id] = JSON.stringify(x); }); return s; },
    /* Parámetros del plan (pestaña "config"), públicos */
    config: function () {
      if (!Sync.enabled()) return Promise.resolve({});
      if (!Sync._cfg) Sync._cfg = Sync.list('config', true).then(function (rows) {
        var o = {}; rows.forEach(function (r) { o[r.clave] = r.valor; }); return o;
      }).catch(function () { return {}; });
      return Sync._cfg;
    }
  };
  Sync.bool = function (v) { return v === true || v === 'true' || v === 'TRUE'; };
  Sync.nul = function (v) { return v === '' || v === undefined ? null : v; };
  Sync.num = function (v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; };
  window.Sync = Sync;
})();
