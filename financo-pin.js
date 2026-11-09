/* PIN animado del Hub FINANCO — estilo "órbita".
   Al completar el PIN, las casillas forman un círculo y giran mientras se verifica;
   si es correcto se cierran en un anillo verde con ✓, si no vuelven a la fila en rojo.
   El color se usa solo para el resultado. Sin dependencias. No hace falta editarlo.
   Desarrollado por The DOM Studio Web · thedomstudioweb.github.io */
(function () {
  var CSS = [
    '.fpin{--ok:#2F8F55;--okbg:#E3F3E8;--bad:#8A2A2A;--badbg:#F6DCDC;--bd:#C9C2AE;--fg:#14391F;--w:52px;--h:58px}',
    '.fpin-l{display:block;font-size:13px;font-weight:800;margin-bottom:5px}',
    '.fpin-stage{position:relative;height:64px;transition:height .45s cubic-bezier(.3,.7,.2,1)}',
    '.fpin-rot{position:absolute;inset:0}',
    '.fpin-b{position:absolute;left:50%;top:50%;width:var(--w);height:var(--h);margin:calc(var(--h)/-2) 0 0 calc(var(--w)/-2);transition:transform .5s cubic-bezier(.3,.7,.2,1),opacity .35s}',
    '.fpin-bx{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#fff;border:1.5px solid var(--bd);border-radius:10px;font-size:26px;font-weight:800;color:var(--fg);transition:border-color .2s,background .2s,color .2s,box-shadow .2s}',
    '.fpin-b.on .fpin-bx{border-color:var(--fg)}',
    '.fpin.focus .fpin-b.cur .fpin-bx{border-color:var(--fg);box-shadow:0 0 0 4px rgba(111,132,68,.25)}',
    '.fpin.focus .fpin-b.cur .fpin-bx:after{content:"";width:2px;height:24px;background:var(--fg);animation:fpin-blink 1s steps(1) infinite}',
    '.fpin-in{position:absolute;left:0;top:0;width:100%;height:64px;opacity:0;font-size:16px;border:0;padding:0;caret-color:transparent;z-index:2;cursor:text}',
    '.fpin.busy .fpin-in{pointer-events:none}',
    '.fpin-ring{position:absolute;left:50%;top:50%;width:190px;height:190px;margin:-95px 0 0 -95px;opacity:0;transform:scale(.6);transition:opacity .35s,transform .45s cubic-bezier(.3,.7,.2,1);pointer-events:none;overflow:visible}',
    '.fpin-ring circle{fill:none;stroke:#A9B98D;stroke-width:1.5;stroke-dasharray:2 8;transition:stroke .3s}',
    '.fpin.orb .fpin-ring{opacity:1;transform:scale(1)}',
    '.fpin.spin .fpin-rot{animation:fpin-spin 1.25s cubic-bezier(.55,.05,.35,1) infinite}',
    '.fpin.spin .fpin-bx{animation:fpin-unspin 1.25s cubic-bezier(.55,.05,.35,1) infinite}',
    '.fpin.ok .fpin-bx{border-color:var(--ok);background:var(--okbg);color:var(--ok)}',
    '.fpin.ok .fpin-ring circle{stroke:var(--ok);stroke-width:3;stroke-dasharray:480;stroke-dashoffset:480;animation:fpin-draw .6s .1s forwards}',
    '.fpin-okm{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:var(--ok);color:#fff;display:flex;align-items:center;justify-content:center;opacity:0;transform:scale(.3);transition:opacity .3s,transform .45s cubic-bezier(.3,1.4,.4,1);pointer-events:none}',
    '.fpin-okm svg{width:30px;height:30px}',
    '.fpin.ok .fpin-okm{opacity:1;transform:scale(1);transition-delay:.3s}',
    '.fpin.bad .fpin-bx{border-color:var(--bad);background:var(--badbg);color:var(--bad)}',
    '.fpin.bad .fpin-ring circle{stroke:var(--bad)}',
    '.fpin.shake .fpin-rot{animation:fpin-shake .42s}',
    '.fpin-m{min-height:20px;margin:8px 0 0;font-size:13.5px;font-weight:700;color:var(--bad);text-align:center}',
    '.fpin-act{display:flex;flex-direction:column;gap:6px;margin-top:4px}',
    '.fpin-more{background:none;border:0;color:#4F6330;font-weight:700;font-size:13px;text-decoration:underline;cursor:pointer;padding:6px;align-self:center;font-family:inherit}',
    '.fpin-go{width:100%}',
    '@keyframes fpin-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}',
    '@keyframes fpin-unspin{from{transform:rotate(0)}to{transform:rotate(-360deg)}}',
    '@keyframes fpin-draw{to{stroke-dashoffset:0}}',
    '@keyframes fpin-blink{50%{opacity:0}}',
    '@keyframes fpin-shake{20%,60%{transform:translateX(-9px)}40%,80%{transform:translateX(9px)}}',
    '@media (prefers-reduced-motion:reduce){.fpin-b,.fpin-stage,.fpin-ring{transition:none}.fpin.spin .fpin-rot,.fpin.spin .fpin-bx,.fpin.shake .fpin-rot{animation:none}}'
  ].join('\n');

  function inject() {
    if (document.getElementById('fpin-css')) return;
    var s = document.createElement('style'); s.id = 'fpin-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function angle(el) {
    var m = getComputedStyle(el).transform;
    if (!m || m === 'none') return 0;
    var v = m.split('(')[1].split(')')[0].split(',');
    var a = Math.atan2(+v[1], +v[0]) * 180 / Math.PI;
    return a < 0 ? a + 360 : a;
  }

  /* opciones:
     label   texto de la etiqueta (por defecto "PIN")
     min/max cantidad de números admitidos (por defecto 4 a 6)
     before()   devuelve un texto de error si falta algo antes de verificar, o '' si está todo
     verify(pin) devuelve una promesa: se resuelve si el PIN es correcto,
                 o se rechaza con Error('mensaje para la persona')
     done(res)  se llama con el resultado de verify cuando termina la animación de éxito */
  function mount(host, o) {
    inject(); o = o || {};
    var min = o.min || 4, max = o.max || 6, n = min, busy = false;
    var uid = 'fpin' + Math.random().toString(36).slice(2, 7);
    host.innerHTML =
      '<div class="fpin">' +
        '<label class="fpin-l" for="' + uid + '">' + (o.label || 'PIN') + '</label>' +
        '<div class="fpin-stage">' +
          '<svg class="fpin-ring" viewBox="-95 -95 190 190" aria-hidden="true"><circle r="62"/></svg>' +
          '<div class="fpin-rot"></div>' +
          '<span class="fpin-okm" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
          '<input id="' + uid + '" class="fpin-in" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" maxlength="' + max + '" aria-describedby="' + uid + 'm">' +
        '</div>' +
        '<p class="fpin-m" id="' + uid + 'm" role="status" aria-live="polite"></p>' +
        '<div class="fpin-act">' +
          '<button type="button" class="btn fpin-go">Ingresar</button>' +
          (max > min ? '<button type="button" class="fpin-more"></button>' : '') +
        '</div>' +
      '</div>';
    var root = host.firstChild, stage = root.querySelector('.fpin-stage'), rot = root.querySelector('.fpin-rot'),
        circ = root.querySelector('circle'), inp = root.querySelector('.fpin-in'), msg = root.querySelector('.fpin-m'),
        go = root.querySelector('.fpin-go'), more = root.querySelector('.fpin-more'), boxes = [], R = 62;

    function build() {
      rot.innerHTML = ''; boxes = [];
      for (var i = 0; i < n; i++) {
        var b = document.createElement('div'); b.className = 'fpin-b';
        b.innerHTML = '<div class="fpin-bx"></div>';
        rot.appendChild(b); boxes.push(b);
      }
      inp.maxLength = n;
      if (inp.value.length > n) inp.value = inp.value.slice(0, n);
      if (more) more.textContent = n === min ? 'Mi PIN tiene más de ' + min + ' números' : 'Mi PIN tiene ' + min + ' números';
      size(); row(); paint();
    }
    function size() {
      var W = stage.clientWidth || 300, gap = n > 4 ? 8 : 12;
      var w = Math.min(52, Math.floor((W - (n - 1) * gap) / n));
      root.style.setProperty('--w', w + 'px');
      root.style.setProperty('--h', Math.round(w * 1.1) + 'px');
      R = n <= 4 ? 62 : 78; circ.setAttribute('r', R);
      size.w = w; size.gap = gap;
    }
    function row() {
      boxes.forEach(function (b, i) {
        var x = (i - (n - 1) / 2) * (size.w + size.gap);
        b.style.transform = 'translate(' + x + 'px,0)'; b.style.opacity = '';
      });
    }
    function orbit() {
      boxes.forEach(function (b, i) {
        var a = (-90 + i * 360 / n) * Math.PI / 180;
        b.style.transform = 'translate(' + (R * Math.cos(a)).toFixed(1) + 'px,' + (R * Math.sin(a)).toFixed(1) + 'px)';
      });
    }
    function paint() {
      var v = inp.value;
      boxes.forEach(function (b, i) {
        b.firstChild.textContent = i < v.length ? '•' : '';
        b.classList.toggle('on', i < v.length);
        b.classList.toggle('cur', i === Math.min(v.length, n - 1) && !(v.length === n));
      });
    }
    function say(t) { msg.textContent = t || ''; }
    function shake() {
      if (RM) return;
      root.classList.remove('shake'); void root.offsetWidth; root.classList.add('shake');
      setTimeout(function () { root.classList.remove('shake'); }, 450);
    }
    /* congela el giro en el ángulo actual para que el cambio no salte */
    function freeze() {
      var a = angle(rot);
      root.classList.remove('spin');
      rot.style.transform = 'rotate(' + a + 'deg)';
      boxes.forEach(function (b) { b.firstChild.style.transform = 'rotate(' + (-a) + 'deg)'; });
      void rot.offsetWidth;
      return a;
    }
    function submit() {
      if (busy) return;
      var pin = inp.value;
      if (pin.length < min) { say('El PIN tiene al menos ' + min + ' números.'); shake(); inp.focus(); return; }
      var pre = o.before ? o.before() : '';
      if (pre) { say(pre); shake(); return; }
      busy = true; say(''); root.classList.add('busy'); inp.blur(); go.disabled = true;
      if (!RM) {
        root.classList.add('orb'); stage.style.height = (2 * R + size.w + 20) + 'px'; orbit();
        setTimeout(function () { if (busy) root.classList.add('spin'); }, 480);
      }
      var p;
      try { p = Promise.resolve(o.verify ? o.verify(pin) : true); } catch (e) { p = Promise.reject(e); }
      var res = p.then(function (r) { return { ok: true, r: r }; }, function (e) { return { ok: false, e: e }; });
      Promise.all([res, wait(RM ? 0 : 1300)]).then(function (x) { (x[0].ok ? win : lose)(x[0]); });
    }
    function win(x) {
      if (!RM) freeze();
      root.classList.add('ok');
      if (!RM) boxes.forEach(function (b) { b.style.transform = 'translate(0,0) scale(.35)'; b.style.opacity = '0'; });
      setTimeout(function () { if (o.done) o.done(x.r); }, RM ? 300 : 1050);
    }
    function lose(x) {
      var t = (x.e && x.e.message) || 'No se pudo verificar el PIN.';
      root.classList.add('bad');
      if (!RM) {
        var a = freeze();
        rot.style.transition = 'transform .5s cubic-bezier(.3,.7,.2,1)';
        boxes.forEach(function (b) { b.firstChild.style.transition = 'transform .5s cubic-bezier(.3,.7,.2,1)'; });
        void rot.offsetWidth;
        var to = a > 180 ? 360 : 0;
        rot.style.transform = 'rotate(' + to + 'deg)';
        boxes.forEach(function (b) { b.firstChild.style.transform = 'rotate(' + (-to) + 'deg)'; });
        root.classList.remove('orb'); stage.style.height = ''; row();
      }
      setTimeout(function () {
        rot.style.transition = 'none'; rot.style.transform = '';
        boxes.forEach(function (b) { b.firstChild.style.transition = 'none'; b.firstChild.style.transform = ''; });
        say(t); shake();
        setTimeout(function () {
          root.classList.remove('bad', 'busy'); rot.style.transition = '';
          boxes.forEach(function (b) { b.firstChild.style.transition = ''; });
          inp.value = ''; paint(); busy = false; go.disabled = false; inp.focus();
        }, 700);
      }, RM ? 0 : 520);
    }

    inp.addEventListener('input', function () {
      var v = inp.value.replace(/\D/g, '').slice(0, n);
      if (v !== inp.value) inp.value = v;
      if (v) say('');
      paint();
      if (v.length === n) submit();
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    inp.addEventListener('focus', function () { root.classList.add('focus'); });
    inp.addEventListener('blur', function () { root.classList.remove('focus'); });
    go.addEventListener('click', submit);
    if (more) more.addEventListener('click', function () { if (busy) return; n = n === min ? max : min; build(); inp.focus(); });
    window.addEventListener('resize', function () { if (!busy) { size(); row(); } });
    build();
    return { focus: function () { inp.focus(); }, input: inp };
  }
  window.FinancoPin = { mount: mount };
})();
