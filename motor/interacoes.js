/* ============================================================
   MOTOR DE INTERAÇÕES — mecânicas além de "pergunta e alternativa".
   Ver docs/CATALOGO-DE-INTERACOES.md.

   Um módulo liga isto com duas linhas:
     <link rel="stylesheet" href="../motor/interacoes.css">
     <script src="../motor/interacoes.js"></script>
   e, no começo do renderRound():
     if(window.MODOS && MODOS[r.mode]) return MODOS[r.mode](c,r);

   Usa o que todo módulo já tem: gameFrame, correctFlow, speakRound,
   playKeys, sndWrong, sndRight, sndClick, pick, shuffle, OK_KEYS, NO_KEYS.
   Imagens: images/<chave>.webp, geradas por ferramentas/gerar-imagens.mjs.
   ============================================================ */
(function () {
  const M = (window.MODOS = window.MODOS || {});
  const $ = id => document.getElementById(id);

  const src = k => `images/${k}${/\.\w+$/.test(k) ? '' : '.webp'}`;
  const fig = (k, cls) => `<img class="fig ${cls || ''}" src="${src(k)}" alt="" draggable="false">`;
  window.fig = fig;

  const falar = keys => playKeys([].concat(keys).flat().filter(Boolean));

  function feedback(tipo, txt) {
    const fb = $('fb'); if (!fb) return;
    fb.className = 'feedback ' + tipo; fb.textContent = txt;
  }
  function animar(el, cls) {
    // Sem isto, ao sair a tremida a animação de entrada recomeça do zero
    // e o adesivo some e reaparece.
    el.classList.remove('entra');
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    // A tremida e passageira; se ficasse, cancelaria a animacao de flutuar.
    if (cls === 'treme') el.addEventListener('animationend', () => el.classList.remove('treme'), { once: true });
  }
  function errou(el, keys) {
    sndWrong(); if (el) animar(el, 'treme');
    feedback('bad', '🤔 Tenta de novo!');
    falar([].concat(keys || [], pick(NO_KEYS)));
  }
  function acertou(el, keys) {
    sndRight(); if (el) animar(el, 'brilha');
    feedback('good', '⭐');
    falar(keys);
  }
  function concluir(r) {
    const g = document.querySelector('.game');
    if (g) g.classList.add('encerrado');
    setTimeout(() => correctFlow([pick(OK_KEYS), r.expAud]), 650);
  }
  function iniciar(r, extra) {
    window._roundKeys = [].concat(r.audio || [], extra || []);
    setTimeout(() => speakRound(), 400);
  }
  /** Move `el` para dentro de `destino` com animação (FLIP). */
  function voarPara(el, destino) {
    const a = el.getBoundingClientRect();
    destino.appendChild(el);
    const b = el.getBoundingClientRect();
    el.style.transition = 'none';
    el.style.transform = `translate(${a.left - b.left}px,${a.top - b.top}px)`;
    requestAnimationFrame(() => {
      el.style.transition = 'transform .45s cubic-bezier(.3,1.4,.5,1)';
      el.style.transform = '';
    });
  }

  /**
   * Arrastar com o dedo (Pointer Events). Toque curto conta como "toque".
   * soltar(alvoEl) devolve true se aceitou; senão o adesivo volta ao lugar.
   */
  function arrastavel(el, { soltar, toque }) {
    let ini = null, moveu = false;
    el.addEventListener('pointerdown', e => {
      if (el.classList.contains('feito')) return;
      ini = { x: e.clientX, y: e.clientY }; moveu = false;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!ini) return;
      const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      if (!moveu && Math.hypot(dx, dy) < 10) return;
      if (!moveu) { moveu = true; el.classList.add('arrastando'); sndClick(); }
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px,${dy}px) scale(1.12) rotate(${dx / 30}deg)`;
      const alvo = alvoEm(e.clientX, e.clientY, el);
      document.querySelectorAll('[data-alvo]').forEach(a => a.classList.toggle('mira', a === alvo));
    });
    const fim = e => {
      if (!ini) return;
      ini = null; el.classList.remove('arrastando');
      document.querySelectorAll('[data-alvo].mira').forEach(a => a.classList.remove('mira'));
      if (!moveu) { el.style.transform = ''; toque && toque(); return; }
      const alvo = alvoEm(e.clientX, e.clientY, el);
      const aceitou = alvo ? soltar(alvo) : false;
      if (!aceitou) {
        el.style.transition = 'transform .35s cubic-bezier(.3,1.4,.5,1)';
        el.style.transform = '';
      }
    };
    el.addEventListener('pointerup', fim);
    el.addEventListener('pointercancel', fim);
  }
  function alvoEm(x, y, ignorar) {
    const prev = ignorar.style.pointerEvents;
    ignorar.style.pointerEvents = 'none';
    const hit = document.elementFromPoint(x, y);
    ignorar.style.pointerEvents = prev;
    return hit ? hit.closest('[data-alvo]') : null;
  }

  /* ---------------------------------------------------------- *
   * CLASSIFICAR — arrastar cada adesivo para o grupo certo.
   * {mode:'classificar', q, audio, expAud,
   *  grupos:[{id, img, aud}], itens:[{img, aud, grupo}]}
   * ---------------------------------------------------------- */
  M.classificar = (c, r) => {
    gameFrame(c, r, `
      <div class="cl-grupos ia">${r.grupos.map(g => `
        <div class="cl-grupo" data-alvo="${g.id}">
          <div class="cl-topo">${fig(g.img, 'cl-ico flutua')}</div>
          <div class="cl-dentro"></div>
        </div>`).join('')}
      </div>
      <div class="cl-itens ia" id="clItens"></div>`);
    let faltam = r.itens.length, selecionado = null;
    const tentar = (el, it, alvo) => {
      if (alvo.dataset.alvo !== it.grupo) { errou(el, [it.aud]); return false; }
      el.classList.add('feito'); el.classList.remove('sel');
      voarPara(el, alvo.querySelector('.cl-dentro'));
      acertou(alvo, [it.aud]);
      if (--faltam === 0) concluir(r);
      return true;
    };
    shuffle(r.itens).forEach((it, i) => {
      const el = document.createElement('div');
      el.className = 'adesivo entra';
      el.style.animationDelay = i * 90 + 'ms';
      el.innerHTML = fig(it.img);
      el._tentar = alvo => tentar(el, it, alvo);
      arrastavel(el, {
        soltar: alvo => el._tentar(alvo),
        toque: () => {
          document.querySelectorAll('.adesivo.sel').forEach(x => x.classList.remove('sel'));
          el.classList.add('sel'); selecionado = el; falar([it.aud]);
        },
      });
      $('clItens').appendChild(el);
    });
    // Alternativa ao arraste: tocar no adesivo e depois no grupo.
    document.querySelectorAll('.cl-grupo').forEach(g => g.addEventListener('click', () => {
      const grupo = r.grupos.find(x => x.id === g.dataset.alvo);
      if (selecionado && !selecionado.classList.contains('feito')) {
        const s = selecionado; selecionado = null;
        if (!s._tentar(g)) s.classList.remove('sel');
      } else falar([grupo.aud]);
    }));
    iniciar(r, r.grupos.map(g => g.aud));
  };

  /* ---------------------------------------------------------- *
   * LIGAR — puxar uma linha de cada item da esquerda até o par.
   * {mode:'ligar', q, audio, expAud, pares:[{a:{img,aud}, b:{img,aud}}]}
   * ---------------------------------------------------------- */
  M.ligar = (c, r) => {
    const esq = shuffle(r.pares.map((p, i) => ({ ...p.a, par: i })));
    const dir = shuffle(r.pares.map((p, i) => ({ ...p.b, par: i })));
    const col = (lista, lado) => lista.map(it => `
      <button class="lg-item lg-${lado} entra" data-par="${it.par}" data-lado="${lado}" ${lado === 'd' ? 'data-alvo="1"' : ''}>
        ${fig(it.img)}<span class="lg-ponto"></span></button>`).join('');
    gameFrame(c, r, `
      <div class="lg-area ia" id="lgArea">
        <svg class="lg-svg" id="lgSvg"></svg>
        <div class="lg-col">${col(esq, 'e')}</div>
        <div class="lg-col">${col(dir, 'd')}</div>
      </div>`);
    const area = $('lgArea'), svg = $('lgSvg');
    const audDe = el => (el.dataset.lado === 'e' ? esq : dir).find(x => String(x.par) === el.dataset.par).aud;
    const centro = el => {
      const a = area.getBoundingClientRect(), p = el.querySelector('.lg-ponto').getBoundingClientRect();
      return { x: p.left + p.width / 2 - a.left, y: p.top + p.height / 2 - a.top };
    };
    const linha = (p, q, cls) => {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', p.x); l.setAttribute('y1', p.y); l.setAttribute('x2', q.x); l.setAttribute('y2', q.y);
      l.setAttribute('class', cls); svg.appendChild(l); return l;
    };
    let faltam = r.pares.length, origem = null, viva = null;
    const ligar = (a, b) => {
      if (a.dataset.par !== b.dataset.par) { errou(b, [audDe(b)]); return; }
      [a, b].forEach(x => x.classList.add('feito'));
      const l = linha(centro(a), centro(b), 'lg-linha ok');
      l.style.strokeDasharray = l.style.strokeDashoffset = 1000;
      acertou(b, [audDe(b)]);
      if (--faltam === 0) concluir(r);
    };
    area.querySelectorAll('.lg-e').forEach(a => {
      a.addEventListener('pointerdown', e => {
        if (a.classList.contains('feito')) return;
        area.querySelectorAll('.lg-e.sel').forEach(x => x.classList.remove('sel'));
        a.classList.add('sel'); origem = a; falar([audDe(a)]);
        a.releasePointerCapture && a.releasePointerCapture(e.pointerId);
        const p = centro(a); viva = linha(p, p, 'lg-linha viva');
      });
    });
    area.addEventListener('pointermove', e => {
      if (!viva) return;
      const a = area.getBoundingClientRect();
      viva.setAttribute('x2', e.clientX - a.left); viva.setAttribute('y2', e.clientY - a.top);
    });
    const soltar = e => {
      if (!viva) return;
      viva.remove(); viva = null;
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const b = hit && hit.closest('.lg-d');
      if (b && origem && !b.classList.contains('feito')) { const o = origem; origem = null; o.classList.remove('sel'); ligar(o, b); }
    };
    area.addEventListener('pointerup', soltar);
    area.addEventListener('pointercancel', () => { if (viva) { viva.remove(); viva = null; } });
    // Alternativa: tocar na esquerda e depois na direita.
    area.querySelectorAll('.lg-d').forEach(b => b.addEventListener('click', () => {
      if (b.classList.contains('feito')) return;
      if (origem) { const o = origem; origem = null; o.classList.remove('sel'); ligar(o, b); }
      else falar([audDe(b)]);
    }));
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * MEMÓRIA — virar cartas e achar os pares.
   * {mode:'memoria', q, audio, expAud, pares:[{img, aud}]}
   * Par = duas cartas com a mesma figura (ou {a:{img,aud}, b:{img,aud}}
   * quando o par liga coisas diferentes).
   * ---------------------------------------------------------- */
  M.memoria = (c, r) => {
    const cartas = shuffle(r.pares.flatMap((p, i) => p.a ? [{ ...p.a, par: i }, { ...p.b, par: i }]
                                                          : [{ ...p, par: i }, { ...p, par: i }]));
    const cols = cartas.length <= 6 ? 3 : 4;
    gameFrame(c, r, `<div class="mm-grade ia" style="grid-template-columns:repeat(${cols},1fr)">${cartas.map((k, i) => `
      <button class="mm-carta entra" data-i="${i}" style="animation-delay:${i * 50}ms">
        <span class="mm-face mm-verso">❓</span>
        <span class="mm-face mm-frente">${fig(k.img)}</span>
      </button>`).join('')}</div>`);
    let abertas = [], faltam = r.pares.length, travado = false;
    document.querySelectorAll('.mm-carta').forEach(el => el.addEventListener('click', () => {
      if (travado || el.classList.contains('virada')) return;
      const k = cartas[el.dataset.i];
      el.classList.add('virada'); sndClick(); falar([k.aud]);
      abertas.push(el);
      if (abertas.length < 2) return;
      const [x, y] = abertas; abertas = [];
      if (cartas[x.dataset.i].par === cartas[y.dataset.i].par) {
        setTimeout(() => {
          [x, y].forEach(z => z.classList.add('feito'));
          acertou(y, []);
          if (--faltam === 0) concluir(r);
        }, 450);
      } else {
        travado = true;
        setTimeout(() => { [x, y].forEach(z => z.classList.remove('virada')); travado = false; }, 1100);
      }
    }));
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * BALÕES — balões sobem; estourar só os que seguem a regra.
   * {mode:'baloes', q, audio, expAud, meta:5, itens:[{img, aud, certo}]}
   * ---------------------------------------------------------- */
  M.baloes = (c, r) => {
    const meta = r.meta || 5;
    gameFrame(c, r, `
      <div class="bl-placar" id="blPlacar">${'<span class="bl-gota"></span>'.repeat(meta)}</div>
      <div class="bl-ceu ia" id="blCeu"></div>`);
    const ceu = $('blCeu'), cores = ['#ff6b9d', '#4d96ff', '#ffd93d', '#6bcb77', '#a06cd5', '#ff924c'];
    let feitos = 0, ultimo = 0, ativo = true, ultimoTipo = 0;
    const certos = r.itens.filter(i => i.certo), errados = r.itens.filter(i => !i.certo);
    const vivos = [];
    // Cada balão sobe numa faixa própria e todos na mesma velocidade: assim
    // um nunca cobre o outro (no celular, o de cima roubava o toque).
    const larguraFaixa = () => Math.max(1, (ceu.clientWidth - 16) / faixas());
    const faixas = () => Math.max(2, Math.floor((ceu.clientWidth - 16) / 124));
    function faixaLivre() {
      const h = ceu.clientHeight;
      const livres = [];
      for (let f = 0; f < faixas(); f++)
        if (!vivos.some(v => v.faixa === f && v.el.isConnected && v.y > h - 190)) livres.push(f);
      return livres.length ? pick(livres) : null;
    }
    function soltarBalao() {
      const faixa = faixaLivre();
      if (faixa === null) return;
      // Nunca três do mesmo tipo seguidos: a criança sempre tem o que estourar.
      // ultimoTipo > 0: certos seguidos; < 0: errados seguidos.
      const querCerto = ultimoTipo >= 2 ? false : ultimoTipo <= -2 ? true : Math.random() < 0.55;
      ultimoTipo = querCerto ? Math.max(1, ultimoTipo + 1) : Math.min(-1, ultimoTipo - 1);
      const it = pick(querCerto ? certos : errados);
      const b = document.createElement('button');
      b.className = 'bl-balao';
      b.style.setProperty('--cor', pick(cores));
      b.innerHTML = `<span class="bl-corpo">${fig(it.img)}</span><span class="bl-fio"></span>`;
      const s = { el: b, x: 8 + faixa * larguraFaixa(), y: ceu.clientHeight + 10, v: 0.7, fase: Math.random() * 6, faixa };
      b.addEventListener('pointerdown', () => {
        if (!ativo || b.classList.contains('estourou')) return;
        if (it.certo) {
          b.classList.add('estourou'); estouro(b); sndRight(); falar([it.aud]);
          feedback('good', '⭐ Isso!');
          const gotas = document.querySelectorAll('#blPlacar .bl-gota');
          if (gotas[feitos]) gotas[feitos].classList.add('cheia');
          if (++feitos >= meta) { ativo = false; concluir(r); }
          setTimeout(() => b.remove(), 350);
        } else errou(b.querySelector('.bl-corpo'), [it.aud]);
      });
      ceu.appendChild(b); vivos.push(s);
    }
    function estouro(b) {
      const rect = b.getBoundingClientRect(), base = ceu.getBoundingClientRect();
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('span');
        p.className = 'bl-faisca';
        p.style.left = rect.left - base.left + rect.width / 2 + 'px';
        p.style.top = rect.top - base.top + rect.height / 3 + 'px';
        p.style.setProperty('--dx', Math.cos(i * 0.63) * 70 + 'px');
        p.style.setProperty('--dy', Math.sin(i * 0.63) * 70 + 'px');
        ceu.appendChild(p); setTimeout(() => p.remove(), 600);
      }
    }
    function quadro(t) {
      if (!ceu.isConnected) return;               // saiu da tela: para o loop
      if (ativo && t - ultimo > 1250 && vivos.length < 5) { ultimo = t; soltarBalao(); }
      for (let i = vivos.length - 1; i >= 0; i--) {
        const s = vivos[i];
        if (!s.el.isConnected) { vivos.splice(i, 1); continue; }
        s.y -= s.v * (ativo ? 1.6 : 4); s.fase += 0.03;
        s.el.style.transform = `translate(${s.x + Math.sin(s.fase) * 14}px,${s.y}px)`;
        if (s.y < -170) { s.el.remove(); vivos.splice(i, 1); }
      }
      requestAnimationFrame(quadro);
    }
    requestAnimationFrame(quadro);
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * CENA — achar na ilustração tudo que segue a regra.
   * {mode:'cena', q, audio, expAud, fundo:'cenario_chave',
   *  objetos:[{img, aud, certo, x, y, w}]}   x,y,w em % do cenário
   * ---------------------------------------------------------- */
  M.cena = (c, r) => {
    gameFrame(c, r, `
      <div class="cn-cena ia" style="background-image:url(images/${r.fundo}.webp)">
        ${r.objetos.map((o, i) => `
          <button class="cn-obj flutua" data-i="${i}"
            style="left:${o.x}%;top:${o.y}%;width:${o.w}%;animation-delay:${(i % 4) * 0.4}s">${fig(o.img)}</button>`).join('')}
      </div>`);
    let faltam = r.objetos.filter(o => o.certo).length;
    document.querySelectorAll('.cn-obj').forEach(el => el.addEventListener('click', () => {
      const o = r.objetos[el.dataset.i];
      if (el.classList.contains('feito')) return;
      if (!o.certo) { errou(el, [o.aud]); return; }
      el.classList.add('feito'); acertou(el, [o.aud]);
      if (--faltam === 0) concluir(r);
    }));
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * TRAÇAR — escrever a letra com o dedo por cima do modelo.
   * {mode:'tracar', q, audio, expAud, letra:'E', img?}
   * Confere cobertura: quanto do desenho da letra foi pintado e
   * quanto foi rabisco fora dela.
   * ---------------------------------------------------------- */
  M.tracar = (c, r) => {
    gameFrame(c, r, `
      <div class="tr-area ia">
        ${r.img ? `<div class="tr-dica">${fig(r.img, 'flutua')}</div>` : ''}
        <canvas class="tr-tela" id="trTela" width="600" height="600"></canvas>
        <button class="tr-apagar" id="trApagar" aria-label="Apagar">🧽</button>
      </div>`);
    const tela = $('trTela'), ctx = tela.getContext('2d'), N = 40;
    const modelo = document.createElement('canvas'); modelo.width = modelo.height = 600;
    const mctx = modelo.getContext('2d');
    mctx.font = 'bold 470px "Arial Rounded MT Bold", Arial, sans-serif';
    mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
    mctx.fillStyle = '#000'; mctx.fillText(r.letra, 300, 330);
    const px = mctx.getImageData(0, 0, 600, 600).data;
    const naLetra = new Set();
    for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
      const x = Math.floor((gx + 0.5) * 600 / N), y = Math.floor((gy + 0.5) * 600 / N);
      if (px[(y * 600 + x) * 4 + 3] > 128) naLetra.add(gy * N + gx);
    }
    let pintadas = new Set(), desenhando = false, ultimo = null, pronto = false;
    function fundo() {
      ctx.clearRect(0, 0, 600, 600);
      ctx.font = mctx.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#eef3ff'; ctx.fillText(r.letra, 300, 330);
      ctx.setLineDash([14, 12]); ctx.lineWidth = 5; ctx.strokeStyle = '#9db8ff';
      ctx.strokeText(r.letra, 300, 330); ctx.setLineDash([]);
    }
    fundo();
    const ponto = e => {
      const b = tela.getBoundingClientRect();
      return { x: (e.clientX - b.left) * 600 / b.width, y: (e.clientY - b.top) * 600 / b.height };
    };
    const marcar = p => {
      const R = 2;   // o pincel cobre algumas células em volta
      const cx = Math.floor(p.x * N / 600), cy = Math.floor(p.y * N / 600);
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy > R * R) continue;
        const gx = cx + dx, gy = cy + dy;
        if (gx >= 0 && gy >= 0 && gx < N && gy < N) pintadas.add(gy * N + gx);
      }
    };
    tela.addEventListener('pointerdown', e => {
      if (pronto) return;
      desenhando = true; tela.setPointerCapture(e.pointerId);
      ultimo = ponto(e); marcar(ultimo);
    });
    tela.addEventListener('pointermove', e => {
      if (!desenhando) return;
      const p = ponto(e);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 44; ctx.strokeStyle = '#ff6b9d';
      ctx.beginPath(); ctx.moveTo(ultimo.x, ultimo.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      const passos = Math.ceil(Math.hypot(p.x - ultimo.x, p.y - ultimo.y) / 8);
      for (let i = 1; i <= passos; i++) marcar({ x: ultimo.x + (p.x - ultimo.x) * i / passos, y: ultimo.y + (p.y - ultimo.y) * i / passos });
      ultimo = p;
    });
    const parar = () => {
      if (!desenhando) return;
      desenhando = false;
      let dentro = 0; pintadas.forEach(k => { if (naLetra.has(k)) dentro++; });
      const cobertura = dentro / naLetra.size, fora = 1 - dentro / Math.max(1, pintadas.size);
      if (cobertura >= 0.7 && fora <= 0.55) {
        pronto = true; tela.classList.add('brilha'); sndRight(); concluir(r);
      } else if (fora > 0.7 && pintadas.size > 60) {
        feedback('bad', '✏️ Siga o desenho da letra!');
      }
    };
    tela.addEventListener('pointerup', parar);
    tela.addEventListener('pointercancel', parar);
    $('trApagar').addEventListener('click', () => {
      if (pronto) return;
      sndClick(); pintadas = new Set(); fundo(); feedback('', '');
    });
    iniciar(r);
  };

  /** Fala o número se o módulo tiver a voz dele (chave n<número>). */
  const vozNumero = n => (typeof VOICE !== 'undefined' && VOICE['n' + n]) ? 'n' + n : null;

  /* ---------------------------------------------------------- *
   * ORDENAR — arrastar os quadros para a ordem certa (1, 2, 3...).
   * {mode:'ordenar', q, audio, expAud, itens:[{img, aud}]}  ← já na ordem certa
   * ---------------------------------------------------------- */
  M.ordenar = (c, r) => {
    gameFrame(c, r, `
      <div class="or-trilha ia">${r.itens.map((_, i) => `
        <div class="or-vaga" data-alvo="${i}"><span class="or-num">${i + 1}</span></div>`).join('<span class="or-seta">➜</span>')}
      </div>
      <div class="cl-itens ia" id="orItens"></div>`);
    let faltam = r.itens.length, selecionado = null;
    const tentar = (el, i, vaga) => {
      if (vaga.querySelector('.adesivo')) return false;
      if (Number(vaga.dataset.alvo) !== i) { errou(el, [r.itens[i].aud]); return false; }
      el.classList.add('feito'); el.classList.remove('sel');
      voarPara(el, vaga); vaga.classList.add('cheia');
      acertou(vaga, [r.itens[i].aud]);
      if (--faltam === 0) concluir(r);
      return true;
    };
    shuffle(r.itens.map((it, i) => ({ it, i }))).forEach(({ it, i }, k) => {
      const el = document.createElement('div');
      el.className = 'adesivo entra';
      el.style.animationDelay = k * 90 + 'ms';
      el.innerHTML = fig(it.img);
      el._tentar = vaga => tentar(el, i, vaga);
      arrastavel(el, {
        soltar: vaga => el._tentar(vaga),
        toque: () => {
          document.querySelectorAll('.adesivo.sel').forEach(x => x.classList.remove('sel'));
          el.classList.add('sel'); selecionado = el; falar([it.aud]);
        },
      });
      $('orItens').appendChild(el);
    });
    document.querySelectorAll('.or-vaga').forEach(v => v.addEventListener('click', () => {
      if (!selecionado || selecionado.classList.contains('feito')) return;
      const s = selecionado; selecionado = null;
      if (!s._tentar(v)) s.classList.remove('sel');
    }));
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * COFRE — juntar peças até chegar ao valor pedido.
   * Dinheiro (moedas e cédulas), dezenas e unidades, pesos...
   * {mode:'cofre', q, audio, expAud, alvo:7, alvoImg?, prefixo?:'R$',
   *  pecas:[{img, aud, valor}]}   ← cada peça pode ser usada várias vezes
   * Tocar numa peça dentro do cofre devolve ela.
   * ---------------------------------------------------------- */
  M.cofre = (c, r) => {
    const pre = r.prefixo ? r.prefixo + ' ' : '';
    gameFrame(c, r, `
      <div class="cf-topo">
        ${r.alvoImg ? `<div class="cf-alvo-img flutua">${fig(r.alvoImg)}</div>` : ''}
        <div class="cf-meta">🎯 <b>${pre}${r.alvo}</b></div>
      </div>
      <div class="cf-cofre ia" data-alvo="cofre" id="cfCofre">
        <div class="cf-dentro" id="cfDentro"></div>
        <div class="cf-total" id="cfTotal">${pre}0</div>
      </div>
      <div class="cf-pecas ia" id="cfPecas"></div>`);
    let total = 0, pronto = false, selecionada = null;
    const cofre = $('cfCofre');
    const mostrar = () => {
      $('cfTotal').textContent = pre + total;
      cofre.classList.toggle('passou', total > r.alvo);
    };
    const por = (p, origem) => {
      if (pronto) return false;
      const el = document.createElement('button');
      el.className = 'cf-peca-dentro entra'; el.innerHTML = fig(p.img);
      el.addEventListener('click', ev => {
        // Com uma peça da bandeja escolhida, o toque é para depositar:
        // deixa o clique chegar ao cofre em vez de tirar esta peça.
        if (selecionada) return;
        ev.stopPropagation();
        if (pronto) return;
        el.remove(); total -= p.valor; mostrar(); sndClick();
        feedback('', ''); falar([vozNumero(total)]);
        if (total === r.alvo) { pronto = true; acertou(cofre, []); concluir(r); }
      });
      $('cfDentro').appendChild(el);
      if (origem) {   // voa da bandeja até o cofre
        const a = origem.getBoundingClientRect(), b = el.getBoundingClientRect();
        el.style.transition = 'none';
        el.style.transform = `translate(${a.left - b.left}px,${a.top - b.top}px)`;
        requestAnimationFrame(() => { el.style.transition = 'transform .4s cubic-bezier(.3,1.4,.5,1)'; el.style.transform = ''; });
      }
      total += p.valor; mostrar(); sndClick();
      if (total === r.alvo) {
        pronto = true; acertou(cofre, [p.aud, vozNumero(total)]); concluir(r);
      } else if (total > r.alvo) {
        sndWrong(); animar(cofre, 'treme');
        feedback('bad', '🤔 Passou! Toque numa peça do cofre para tirar.');
        falar([vozNumero(total), pick(NO_KEYS)]);
      } else {
        feedback('', ''); falar([p.aud, vozNumero(total)]);
      }
      return true;
    };
    r.pecas.forEach((p, i) => {
      const el = document.createElement('div');
      el.className = 'adesivo cf-peca entra';
      el.style.animationDelay = i * 90 + 'ms';
      el.innerHTML = fig(p.img);
      arrastavel(el, {
        // A peça da bandeja nunca sai dela: o cofre recebe uma cópia.
        soltar: alvo => { el.style.transition = 'none'; el.style.transform = ''; return por(p, el) && false; },
        toque: () => {
          document.querySelectorAll('.cf-peca.sel').forEach(x => x.classList.remove('sel'));
          el.classList.add('sel'); selecionada = { p, el }; falar([p.aud]);
        },
      });
      $('cfPecas').appendChild(el);
    });
    cofre.addEventListener('click', () => {
      if (!selecionada) return;
      selecionada.el.classList.remove('sel');
      por(selecionada.p, selecionada.el); selecionada = null;
    });
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * MASCOTE — o personagem pede; a criança dá a ele o que pediu.
   * {mode:'mascote', q, audio, expAud, mascote:'mascote',
   *  itens:[{img, aud, certo}]}   ← termina quando dá todos os certos
   * ---------------------------------------------------------- */
  M.mascote = (c, r) => {
    gameFrame(c, r, `
      <div class="ms-palco ia">
        <div class="ms-bicho" data-alvo="bicho" id="msBicho">
          ${fig(r.mascote || 'mascote', 'flutua')}
          <div class="ms-balao" id="msBalao">${'<span class="ms-vaga"></span>'.repeat(r.itens.filter(i => i.certo).length)}</div>
        </div>
      </div>
      <div class="cl-itens ia" id="msItens"></div>`);
    const bicho = $('msBicho');
    let faltam = r.itens.filter(i => i.certo).length, selecionado = null;
    const dar = (el, it) => {
      if (!it.certo) {
        errou(el, [it.aud]); bicho.classList.remove('nao'); void bicho.offsetWidth; bicho.classList.add('nao');
        return false;
      }
      el.classList.add('feito'); el.classList.remove('sel');
      const vaga = bicho.querySelector('.ms-vaga:empty');
      el.style.transition = 'transform .35s ease, opacity .35s ease';
      const a = el.getBoundingClientRect(), b = bicho.getBoundingClientRect();
      el.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.2)`;
      el.style.opacity = '0';
      setTimeout(() => { el.style.visibility = 'hidden'; if (vaga) vaga.innerHTML = fig(it.img); }, 360);
      bicho.classList.remove('come'); void bicho.offsetWidth; bicho.classList.add('come');
      acertou(null, [it.aud]);
      if (--faltam === 0) concluir(r);
      return true;
    };
    shuffle(r.itens).forEach((it, i) => {
      const el = document.createElement('div');
      el.className = 'adesivo entra';
      el.style.animationDelay = i * 90 + 'ms';
      el.innerHTML = fig(it.img);
      el._dar = () => dar(el, it);
      arrastavel(el, {
        soltar: () => el._dar(),
        toque: () => {
          document.querySelectorAll('.adesivo.sel').forEach(x => x.classList.remove('sel'));
          el.classList.add('sel'); selecionado = el; falar([it.aud]);
        },
      });
      $('msItens').appendChild(el);
    });
    bicho.addEventListener('click', () => {
      if (selecionado && !selecionado.classList.contains('feito')) {
        const s = selecionado; selecionado = null;
        if (!s._dar()) s.classList.remove('sel');
      } else speakRound();
    });
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * QUEBRA-CABEÇA — montar uma imagem cortada em pedaços.
   * {mode:'quebra', q, audio, expAud, img:'starry-night', grade:2|3}
   * ---------------------------------------------------------- */
  M.quebra = (c, r) => {
    const g = r.grade || 2, n = g * g, url = src(r.img);
    const pos = i => `${(i % g) * 100 / (g - 1)}% ${Math.floor(i / g) * 100 / (g - 1)}%`;
    const peca = i => `background-image:url(${url});background-size:${g * 100}% ${g * 100}%;background-position:${pos(i)}`;
    gameFrame(c, r, `
      <div class="qb-area ia">
        <div class="qb-modelo">${fig(r.img)}</div>
        <div class="qb-tabuleiro" style="grid-template-columns:repeat(${g},1fr)">${
          Array.from({ length: n }, (_, i) => `<div class="qb-vaga" data-alvo="${i}"></div>`).join('')}</div>
      </div>
      <div class="qb-pecas ia" id="qbPecas"></div>`);
    let faltam = n, selecionada = null;
    const tentar = (el, i, vaga) => {
      if (vaga.querySelector('.qb-peca')) return false;
      if (Number(vaga.dataset.alvo) !== i) { errou(el); return false; }
      el.classList.add('feito'); el.classList.remove('sel');
      voarPara(el, vaga); sndClick();
      if (--faltam === 0) {
        document.querySelector('.qb-tabuleiro').classList.add('completo');
        acertou(null, []); concluir(r);
      } else feedback('good', '⭐');
      return true;
    };
    shuffle(Array.from({ length: n }, (_, i) => i)).forEach((i, k) => {
      const el = document.createElement('div');
      el.className = 'qb-peca entra';
      el.style.cssText = peca(i) + `;animation-delay:${k * 70}ms`;
      el._tentar = vaga => tentar(el, i, vaga);
      arrastavel(el, {
        soltar: vaga => el._tentar(vaga),
        toque: () => {
          document.querySelectorAll('.qb-peca.sel').forEach(x => x.classList.remove('sel'));
          el.classList.add('sel'); selecionada = el; sndClick();
        },
      });
      $('qbPecas').appendChild(el);
    });
    document.querySelectorAll('.qb-vaga').forEach(v => v.addEventListener('click', () => {
      if (!selecionada || selecionada.classList.contains('feito')) return;
      const s = selecionada; selecionada = null;
      if (!s._tentar(v)) s.classList.remove('sel');
    }));
    iniciar(r);
  };

  /* ---------------------------------------------------------- *
   * ÁLBUM DE FIGURINHAS — cada jogo terminado dá uma figurinha.
   * Não precisa de nada no módulo: usa a ilustração do card do jogo
   * (GAMES[].figurinha ou a imagem do GAMES[].ico). Vozes opcionais:
   * VOICE.figurinha ("Você ganhou uma figurinha...") e VOICE.album.
   * ---------------------------------------------------------- */
  const CHAVE_ALBUM = 'album:' + location.pathname.replace(/index\.html$/, '');
  const lerAlbum = () => { try { return JSON.parse(localStorage.getItem(CHAVE_ALBUM)) || []; } catch (e) { return []; } };
  const salvarAlbum = a => { try { localStorage.setItem(CHAVE_ALBUM, JSON.stringify(a)); } catch (e) {} };
  const imgDoJogo = g => g.figurinha || (String(g.ico).match(/images\/([\w.-]+?)\.webp/) || [])[1];
  const temVoz = k => typeof VOICE !== 'undefined' && k in VOICE ? k : null;

  function abrirAlbum() {
    const ganhas = lerAlbum(), jogos = GAMES.filter(imgDoJogo);
    shell(`
      <div class="game">
        <h2 class="game-title">📒 Meu Álbum</h2>
        <div class="progress">${ganhas.length} de ${jogos.length} figurinhas</div>
        <div class="ab-grade">${jogos.map(g => {
          const tem = ganhas.includes(g.id);
          return `<button class="ab-fig ${tem ? 'tem' : ''}" onclick="sndClick();startGame('${g.id}')">
            ${fig(imgDoJogo(g))}<span>${tem ? g.nome : '?'}</span></button>`;
        }).join('')}</div>
        <p style="color:#888;font-size:16px">Termine um jogo para ganhar a figurinha dele!</p>
        <button class="next-btn" onclick="sndClick();goHome()">🎮 Jogar</button>
      </div>`);
    falar([temVoz('album')]);
  }
  window.abrirAlbum = abrirAlbum;

  // Os módulos declaram winScreen e goHome no próprio script; aqui eles
  // ganham o álbum por cima, sem o módulo precisar mudar nada.
  addEventListener('DOMContentLoaded', () => {
    if (typeof winScreen !== 'function' || typeof goHome !== 'function' || typeof GAMES === 'undefined') return;
    const vitoria = winScreen, inicio = goHome;
    window.winScreen = function () {
      vitoria.apply(this, arguments);
      const g = GAMES.find(x => x.id === current.id), img = g && imgDoJogo(g);
      if (!img) return;
      const ganhas = lerAlbum(), nova = !ganhas.includes(g.id);
      if (nova) { ganhas.push(g.id); salvarAlbum(ganhas); }
      const win = document.querySelector('.win');
      if (!win) return;
      win.insertAdjacentHTML('afterbegin', `
        <div class="ab-ganhou ${nova ? 'nova' : ''}">
          <div class="ab-carta">${fig(img)}</div>
          <div class="ab-txt">${nova ? '✨ Figurinha nova!' : 'Você já tem esta figurinha'}</div>
        </div>`);
      const t = win.querySelector('.trophy'); if (t) t.remove();
      win.insertAdjacentHTML('beforeend', `<br><button class="next-btn ab-botao" onclick="sndClick();abrirAlbum()">📒 Ver meu álbum (${ganhas.length}/${GAMES.filter(imgDoJogo).length})</button>`);
      // O módulo toca 'win' 250 ms depois; a figurinha entra quando ele acaba.
      if (nova && temVoz('figurinha')) setTimeout(() => {
        if (typeof player !== 'undefined' && /win\.mp3$/.test(player.src) && !player.paused) player.onended = () => falar(['figurinha']);
        else falar(['figurinha']);
      }, 400);
    };
    window.goHome = function () {
      inicio.apply(this, arguments);
      const hero = document.querySelector('.hero');
      if (!hero || !GAMES.some(imgDoJogo)) return;
      const n = lerAlbum().length;
      hero.insertAdjacentHTML('beforeend', `<button class="ab-abrir" onclick="sndClick();abrirAlbum()">📒 Meu álbum <b>${n}/${GAMES.filter(imgDoJogo).length}</b></button>`);
    };
  });

  window.MOTOR_INTERACOES = { versao: 2, modos: Object.keys(M) };
})();
