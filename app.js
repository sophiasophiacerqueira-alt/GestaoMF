/*
 * Michelle Farias · Gestão (protótipo B)
 * Lógica do aplicativo: dados, telas, formulários e ações.
 * Autora: Hanna Sophia Aragão Cerqueira, 2026.
 *
 * O código fica todo dentro de um bloco { ... } para não criar variáveis globais.
 * Dentro do Claude, os dados vão para o banco do Claude (window.claude.use('db')).
 * Em qualquer outro lugar (GitHub Pages, arquivo aberto no computador), vão para o
 * localStorage do navegador.
 */
{
  const $ = (s) => document.querySelector(s);
  const COLS = [
    "config",
    "servicos",
    "materiais",
    "clientes",
    "atendimentos",
    "agenda",
    "despesas",
    "movs",
  ];
  const S = {};
  COLS.forEach((c) => {
    S[c] = [];
  });
  const DEF = {
    nome: "Michelle Farias",
    sub: "Piercing",
    zap: "",
    insta: "",
    meta: 10,
    premio: "1 aplicação grátis",
    modo: "atend",
    porValor: 100,
  };
  const CATS = ["Joias", "Agulhas", "Descartáveis", "Assepsia", "Acessórios"],
    UNS = ["un", "par", "pct", "cx", "frasco"],
    PAGS = ["Pix", "Crédito", "Débito", "Dinheiro"],
    DCATS = ["Material", "Aluguel", "Contas", "Marketing", "Equipamentos", "Outros"];
  const TABS = ["hoje", "clientes", "fidelidade", "materiais", "caixa", "ajustes"];
  const HP =
    "M12 21.2c-.4 0-.8-.2-1.1-.4C7.3 18.2 2 14.3 2 9.1 2 6 4.4 3.6 7.4 3.6c1.9 0 3.6 1 4.6 2.5 1-1.5 2.7-2.5 4.6-2.5 3 0 5.4 2.4 5.4 5.5 0 5.2-5.3 9.1-8.9 11.7-.3.2-.7.4-1.1.4z";
  const GP = "M7 4h10l4 5.5L12 20 3 9.5z",
    BP =
      "M12.6 4.4c4-.2 7.4 2.6 7.5 6.4.1 3.9-2.7 7.6-6.8 8.3-4.2.7-8.1-1.8-8.6-5.7-.5-4 3.6-8.8 7.9-9z",
    AP = "M5.1 9.6c-1.5 2.7-1.1 6.1 1.2 8.1 2.3 2 5.7 2.4 8.6 1.2";
  const ROT = [
    0, 38, -24, 71, 15, -52, 104, -8, 60, -35, 22, -70, 48, -15, 85, 5, -44, 30, -60, 12,
  ];
  let db = null,
    ready = false,
    canW = null,
    ro = false,
    slowT = 0,
    slowNote = false,
    F = null,
    SH = null,
    DL = null,
    raf = 0,
    tT = 0,
    adjT = 0;
  const STK = [],
    got = new Set(),
    fresh = new Set(),
    PADJ = {},
    Q = {};
  const U = {
    tab: "hoje",
    dia: "",
    mes: "",
    qCli: "",
    qMat: "",
    cat: "Todas",
    qFid: "",
    fid: "",
    pop: "",
  };

  /* ---------- funções de apoio: texto, números, datas, ícones ---------- */
  const h = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const num = (v) => {
    const n = Number(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const brl = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const brl0 = (v) =>
    (Number(v) || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  const pad = (n) => String(n).padStart(2, "0");
  const dkey = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hoje = () => dkey(new Date());
  const pD = (s) => {
    const p = String(s).split("-").map(Number);
    return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
  };
  const addD = (s, n) => {
    const d = pD(s);
    d.setDate(d.getDate() + n);
    return dkey(d);
  };
  const addM = (k, n) => {
    const d = pD(k + "-01");
    d.setMonth(d.getMonth() + n);
    return dkey(d).slice(0, 7);
  };
  const dTs = (ts) => dkey(new Date(ts));
  const mTs = (ts) => dTs(ts).slice(0, 7);
  const ddmm = (s) => (s ? String(s).slice(8, 10) + "/" + String(s).slice(5, 7) : "");
  const hhmm = (ts) => {
    const d = new Date(ts);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const longDia = (s) =>
    cap(
      pD(s).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
    ).replace("-feira", "");
  const mesNome = (k) =>
    cap(pD(k + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
  const mesCurto = (k) => pD(k + "-01").toLocaleDateString("pt-BR", { month: "long" });
  const diasAte = (s) => Math.round((pD(s) - pD(hoje())) / 864e5);
  const pl = (n, a, b) => n + " " + (n === 1 ? a : b);
  const tel = (t) => {
    const d = String(t || "").replace(/\D/g, "");
    return d.length === 11
      ? "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7)
      : d.length === 10
        ? "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6)
        : d;
  };
  const wa = (t, msg) => {
    let d = String(t || "").replace(/\D/g, "");
    if (d.length === 10 || d.length === 11) d = "55" + d;
    return "https://wa.me/" + d + "?text=" + encodeURIComponent(msg);
  };
  const idade = (n) => {
    if (!n) return null;
    const b = pD(n),
      t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate()))
      a--;
    return a >= 0 && a < 120 ? a : null;
  };
  const ini = (n) =>
    String(n || "?")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  const first = (n) =>
    String(n || "")
      .trim()
      .split(/\s+/)[0] || "";
  const slug = (s) =>
    String(s || "cliente")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cliente";
  const byNome = (a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR");
  const get = (c, id) => S[c].find((x) => x.id === id);
  const cfg = () => {
    const c = { ...DEF, ...(get("config", "estudio") || {}) };
    c.meta = Math.min(20, Math.max(3, Math.round(num(c.meta)) || 10));
    return c;
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isLow = (m) => num(m.qtd) <= num(m.min);
  const isVenc = (m) => !!m.val && diasAte(m.val) <= 60;
  const qtdTxt = (m) => num(m.qtd) + " " + (m.un || "un");
  const ic = (n, c) =>
    '<svg class="i' + (c ? " " + c : "") + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  const spotI = (cls, r) =>
    "<svg" +
    (cls ? ' class="' + cls + '"' : "") +
    ' viewBox="0 0 24 24" aria-hidden="true"><use href="#i-spot"' +
    (r ? ' transform="rotate(' + r + ' 12 12)"' : "") +
    "/></svg>";
  const monoSVG = (n) =>
    '<svg class="mono" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle class="md" cx="3" cy="24" r="1.7"/><circle class="md" cx="45" cy="24" r="1.7"/><text x="24" y="30.6" text-anchor="middle">' +
    h(ini(n).slice(0, 2)) +
    "</text></svg>";
  const xBtn =
    '<button type="button" class="ico" data-act="fechar" aria-label="Fechar">' +
    ic("x") +
    "</button>";
  const vazio = (t, s) => `<div class="vazio">${spotI()}<b>${h(t)}</b><span>${h(s)}</span></div>`;
  const gone = () =>
    `<header class="shh"><h2>Registro removido</h2>${xBtn}</header><p class="sub">Este item não existe mais.</p>`;
  const regra = (c) =>
    (c.modo === "valor"
      ? "1 selo a cada " + brl0(c.porValor) + " gastos"
      : "1 selo por atendimento") +
    " · " +
    c.meta +
    " selos = " +
    c.premio;
  const itensTxt = (a) =>
    (a.itens || []).map((i) => (num(i.q) > 1 ? num(i.q) + "× " : "") + i.nome).join(" + ") || "—";
  const kitTxt = (kit, mult) =>
    (kit || [])
      .map((k) => {
        const m = get("materiais", k.m);
        const q = num(k.q) * (mult || 1);
        return m ? (q > 1 ? q + "× " : "") + m.nome : "";
      })
      .filter(Boolean)
      .join(", ");
  function cliStats() {
    const m = {};
    S.atendimentos.forEach((a) => {
      if (!a.cli) return;
      const s = m[a.cli] || (m[a.cli] = { n: 0, tot: 0, ult: 0 });
      s.n++;
      s.tot += num(a.total);
      if (a.ts > s.ult) s.ult = a.ts;
    });
    return m;
  }
  function usoDe(a) {
    const u = new Map();
    (a.kit || []).forEach((k) => u.set(k.m, (u.get(k.m) || 0) + num(k.q)));
    (a.itens || []).forEach((i) => {
      if (i.t === "p") u.set(i.ref, (u.get(i.ref) || 0) + num(i.q));
    });
    return u;
  }

  /* ---------- fora do Claude: os dados ficam salvos no navegador (localStorage) ---------- */
  let local = false,
    semSalvar = false;
  const LKEY = "michelle-farias-plano-b";
  function exemplosDeHoje(ex) {
    const t = new Date(),
      dd = Math.round(
        (Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) - Date.UTC(2026, 10, 24)) / 864e5,
      ),
      ms = dd * 864e5,
      o = JSON.parse(JSON.stringify(ex || {}));
    const dia = (x) => {
      if (!x) return x;
      const [y, mo, d] = x.split("-").map(Number);
      return new Date(Date.UTC(y, mo - 1, d) + ms).toISOString().slice(0, 10);
    };
    ["atendimentos", "despesas", "movs"].forEach((c) =>
      Object.values(o[c] || {}).forEach((v) => {
        if (v.ts) v.ts += ms;
      }),
    );
    Object.values(o.clientes || {}).forEach((v) => {
      if (v.desde) v.desde += ms;
    });
    Object.values(o.agenda || {}).forEach((v) => {
      v.dia = dia(v.dia);
    });
    Object.values(o.materiais || {}).forEach((v) => {
      if (v.val) v.val = dia(v.val);
    });
    return o;
  }
  function abrirLocal() {
    local = true;
    let d = null;
    try {
      d = JSON.parse(localStorage.getItem(LKEY) || "null");
    } catch (e) {}
    if (!d) d = exemplosDeHoje(window.EXEMPLOS);
    COLS.forEach((c) => {
      S[c] = Object.entries(d[c] || {}).map(([id, v]) => ({ ...v, id }));
    });
    salvarLocal();
  }
  function salvarLocal() {
    if (!local) return;
    try {
      localStorage.setItem(
        LKEY,
        JSON.stringify(
          Object.fromEntries(
            COLS.map((c) => [c, Object.fromEntries(S[c].map(({ id, ...v }) => [id, v]))]),
          ),
        ),
      );
    } catch (e) {
      if (!semSalvar) {
        semSalvar = true;
        note(
          "Este navegador não está deixando salvar os dados: o que você fizer agora some quando a página fechar.",
        );
      }
    }
  }
  /* ---------- dados: banco do Claude ou, fora dele, o próprio navegador ---------- */
  const st = {
    nid(col) {
      return db
        ? db.collection(col).doc().id
        : "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    },
    async set(col, id, data) {
      if (ro) throw { code: "ro" };
      if (db) return db.collection(col).doc(id).set(data);
      const a = S[col],
        i = a.findIndex((x) => x.id === id),
        o = { ...data, id };
      if (i < 0) a.push(o);
      else a[i] = o;
      salvarLocal();
      changed();
    },
    async upd(col, id, p) {
      if (ro) throw { code: "ro" };
      if (db) return db.collection(col).doc(id).update(p);
      const o = get(col, id);
      if (o) {
        Object.assign(o, p);
        salvarLocal();
        changed();
      }
    },
    async del(col, id) {
      if (ro) throw { code: "ro" };
      if (db) return db.collection(col).doc(id).delete();
      S[col] = S[col].filter((x) => x.id !== id);
      salvarLocal();
      changed();
    },
  };
  const add = async (col, data, id) => {
    id = id || st.nid(col);
    await st.set(col, id, data);
    return id;
  };
  const seq = (k, fn) => {
    const p = (Q[k] || Promise.resolve()).then(fn);
    Q[k] = p.catch(() => {});
    return p;
  };
  function note(t) {
    const n = $("#note");
    n.textContent = t || "";
    n.hidden = !t;
  }
  function setRO() {
    ro = true;
    document.body.classList.add("ro");
    note(
      "Você está só visualizando e não vê os dados das clientes. Para usar o app, peça acesso de edição a quem administra.",
    );
  }
  function falha(e) {
    const c = e && e.code;
    console.warn(e);
    if (c === "ro") return toast("Seu acesso é só de leitura.");
    if (c === "invalid_argument" && canW !== true) {
      setRO();
      return toast("Seu acesso não permite salvar alterações.");
    }
    if (c === "quota_exceeded")
      return toast("O banco de dados do app está cheio: apague registros antigos.");
    if (c === "resource_exhausted")
      return toast("Muitas alterações seguidas. Espere uns segundos e tente de novo.");
    toast("Não deu para salvar agora. Confira a internet e tente de novo.");
  }
  function toast(msg, undo) {
    const t = $("#toast");
    t.innerHTML = "<span></span>" + (undo ? '<button type="button">Desfazer</button>' : "");
    t.firstChild.textContent = msg;
    t.hidden = false;
    if (undo)
      t.querySelector("button").onclick = () => {
        t.hidden = true;
        undo();
      };
    clearTimeout(tT);
    tT = setTimeout(
      () => {
        t.hidden = true;
      },
      undo ? 7000 : 3600,
    );
  }
  function ask(msg, ok) {
    return new Promise((res) => {
      const a = $("#ask");
      a.querySelector("p").textContent = msg;
      const b = a.querySelector("[data-ok]");
      b.textContent = ok || "Confirmar";
      a.hidden = false;
      b.focus();
      a.onclick = (e) => {
        const v = e.target.closest("[data-ok]")
          ? true
          : e.target.closest("[data-no]") || e.target === a
            ? false
            : null;
        if (v === null) return;
        a.hidden = true;
        res(v);
      };
    });
  }
  function busy(f, on) {
    const b = f.querySelector("button[type=submit],button:not([type])");
    if (b) b.disabled = on !== 0;
  }

  /* ---------- janelas (fichas que sobem da parte de baixo) ---------- */
  function openSh(kind, render, push) {
    if (push && SH) STK.push(SH);
    else STK.length = 0;
    SH = { kind, render };
    showSh();
  }
  function showSh() {
    const b = $("#shBody");
    b.innerHTML = SH.render();
    $("#sheet").hidden = false;
    document.body.classList.add("lock");
    $(".sh").scrollTop = 0;
    const f = b.querySelector("[autofocus]");
    if (f && matchMedia("(hover:hover)").matches) f.focus();
  }
  function closeSh(all) {
    F = null;
    if (!all && STK.length) {
      SH = STK.pop();
      showSh();
      return;
    }
    STK.length = 0;
    SH = null;
    $("#sheet").hidden = true;
    document.body.classList.remove("lock");
  }

  /* ---------- telas: Hoje, Clientes, Fidelidade, Materiais, Caixa, Ajustes ---------- */
  function changed() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      paint();
      if (SH && SH.kind === "view") {
        const s = $(".sh"),
          y = s.scrollTop;
        $("#shBody").innerHTML = SH.render();
        s.scrollTop = y;
      }
    });
  }
  const RO = new ResizeObserver(() => drawChart());
  function paint() {
    document.querySelectorAll(".tabs a").forEach((a) => {
      if (a.dataset.tab === U.tab) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    $("#aj").classList.toggle("on", U.tab === "ajustes");
    document.body.dataset.tab = U.tab;
    const c = cfg();
    $("#bNome").textContent = c.nome;
    $("#bSub").textContent = (c.sub ? c.sub + " · " : "") + "gestão";
    if (paint.n !== c.nome) {
      paint.n = c.nome;
      $("#bMono").innerHTML = monoSVG(c.nome);
    }
    const m = $("#main");
    if (!ready) {
      m.innerHTML = '<div class="load">' + monoSVG(c.nome) + "<p>Carregando o estúdio…</p></div>";
      return;
    }
    const a = document.activeElement,
      id = a && a !== document.body && m.contains(a) ? a.id : "";
    let s0 = null,
      s1 = null;
    try {
      s0 = a.selectionStart;
      s1 = a.selectionEnd;
    } catch (e) {}
    const ex = U.tab !== "ajustes" && COLS.some((k) => S[k].some((x) => x.ex));
    m.innerHTML =
      (ex
        ? '<p class="exl">Os dados que aparecem agora são de exemplo. Quando for usar de verdade, apague em <a href="#ajustes">Ajustes</a>.</p>'
        : "") + V[U.tab]();
    if (id) {
      const n = document.getElementById(id);
      if (n) {
        n.focus({ preventScroll: true });
        try {
          if (s0 != null) n.setSelectionRange(s0, s1);
        } catch (e) {}
      }
    }
    RO.disconnect();
    const f = $("#chart");
    if (f) {
      RO.observe(f);
      drawChart();
    }
  }
  const V = {};

  /* Hoje */
  V.hoje = () => {
    const d = U.dia || hoje(),
      hj = hoje();
    const ag = S.agenda
      .filter((a) => a.dia === d)
      .sort((a, b) => (a.hora || "99").localeCompare(b.hora || "99"));
    const atD = S.atendimentos.filter((a) => dTs(a.ts) === d),
      fatD = atD.reduce((s, a) => s + num(a.total), 0);
    const mk = d.slice(0, 7),
      fatM = S.atendimentos.filter((a) => mTs(a.ts) === mk).reduce((s, a) => s + num(a.total), 0);
    const fe = ag.filter((a) => a.st === "feito").length,
      ma = ag.filter((a) => a.st === "marcado").length;
    return `<section class="head"><div><h1>${h(longDia(d))}</h1><p class="sub">${h(pl(atD.length, "atendimento", "atendimentos"))} · ${h(brl0(fatD))} ${d === hj ? "hoje" : "no dia"} · ${h(brl0(fatM))} em ${h(mesCurto(mk))}</p></div>
<div class="dnav"><button type="button" class="ico" data-act="dia" data-d="-1" aria-label="Dia anterior">${ic("left")}</button><button type="button" class="btn sm${d === hj ? " on" : ""}" data-act="dia" data-d="0">Hoje</button><button type="button" class="ico" data-act="dia" data-d="1" aria-label="Próximo dia">${ic("right")}</button></div></section>
<div class="cols"><section class="panel"><div class="ph"><div><h2>Agenda</h2><p class="sub sm">${ag.length ? h(pl(ag.length, "horário", "horários")) + " · " + fe + (fe === 1 ? " atendido" : " atendidos") + " · " + ma + " a atender" : "Nenhum horário marcado"}</p></div><button type="button" class="btn sm w" data-act="novoAg">${ic("plus")}Agendar</button></div>${ag.length ? '<ol class="sched">' + ag.map(rowAg).join("") + "</ol>" : vazio("Dia livre", "Nenhum horário neste dia. Toque em Agendar para marcar.")}</section>
<aside class="panel"><h2>Atenção</h2>${alertas()}</aside></div>`;
  };
  function rowAg(a) {
    const cl = get("clientes", a.cli),
      sv = get("servicos", a.serv),
      nome = cl ? cl.nome : a.nome || "Cliente",
      sn = sv ? sv.nome : "";
    const t = a.hora
      ? "<time>" + h(a.hora) + "</time>"
      : '<time class="tbd">horário a combinar</time>';
    const msg =
      "Oi, " +
      first(nome) +
      "! Aqui é do estúdio " +
      cfg().nome +
      ". Confirmando seu horário " +
      (a.dia === hoje() ? "hoje" : "dia " + ddmm(a.dia)) +
      (a.hora ? " às " + a.hora : "") +
      (sn ? " para " + sn : "") +
      ". Podemos confirmar?";
    const tag =
      a.st === "feito"
        ? '<span class="tag">' + ic("check") + "Atendido</span>"
        : a.st === "faltou"
          ? '<span class="tag bad">Faltou</span>'
          : "";
    const bt =
      a.st === "marcado"
        ? `<button type="button" class="btn sm pri w" data-act="atenderAg" data-id="${h(a.id)}">Atender</button>${cl && cl.tel ? `<a class="btn sm" href="${h(wa(cl.tel, msg))}" target="_blank" rel="noopener">${ic("chat")}Confirmar</a>` : ""}`
        : "";
    return `<li class="${h(a.st)}">${t}<div class="who"><b>${h(nome)}</b><span>${h(sn)}${sv ? " · " + h(brl(sv.preco)) : ""}${a.obs ? " · " + h(a.obs) : ""}</span></div><div class="ra">${tag}${bt}<button type="button" class="ico" data-act="agMais" data-id="${h(a.id)}" aria-label="Mais opções">${ic("dots")}</button></div></li>`;
  }
  function alertas() {
    const c = cfg(),
      out = [],
      hj = hoje();
    const low = S.materiais
      .filter(isLow)
      .sort((a, b) => num(a.qtd) / Math.max(1, num(a.min)) - num(b.qtd) / Math.max(1, num(b.min)));
    const ven = S.materiais
      .filter(isVenc)
      .sort((a, b) => String(a.val).localeCompare(String(b.val)));
    const prem = S.clientes.filter((x) => num(x.selos) >= c.meta).sort(byNome);
    const aniv = S.clientes
      .filter((x) => x.nasc && x.nasc.slice(5, 7) === hj.slice(5, 7))
      .sort((a, b) => a.nasc.slice(8).localeCompare(b.nasc.slice(8)));
    const go = ic("right", "sm");
    if (low.length)
      out.push(
        "<h3>Repor estoque</h3>" +
          low
            .slice(0, 3)
            .map(
              (m) =>
                `<button type="button" class="arow" data-act="verMat" data-id="${h(m.id)}"><span class="dot bad"></span><span class="rm"><b>${h(m.nome)}</b><small>${h(qtdTxt(m))} · mínimo ${h(num(m.min))}</small></span>${go}</button>`,
            )
            .join("") +
          (low.length > 3
            ? '<button type="button" class="more" data-act="irRepor">Ver os ' +
              low.length +
              " itens para repor</button>"
            : ""),
      );
    if (ven.length)
      out.push(
        "<h3>Validade</h3>" +
          ven
            .map((m) => {
              const n = diasAte(m.val);
              return `<button type="button" class="arow" data-act="verMat" data-id="${h(m.id)}"><span class="dot ${n < 0 ? "bad" : "mid"}"></span><span class="rm"><b>${h(m.nome)}</b><small>${n < 0 ? "Venceu em " + h(ddmm(m.val)) : "Vence " + h(ddmm(m.val)) + " · em " + h(pl(n, "dia", "dias"))}${m.lote ? " · lote " + h(m.lote) : ""}</small></span>${go}</button>`;
            })
            .join(""),
      );
    if (prem.length)
      out.push(
        "<h3>Prêmio liberado</h3>" +
          prem
            .map(
              (x) =>
                `<button type="button" class="arow" data-act="verCli" data-id="${h(x.id)}"><span class="dot ok"></span><span class="rm"><b>${h(x.nome)}</b><small>${h(Math.min(num(x.selos), c.meta))}/${c.meta} selos · ${h(c.premio)}</small></span>${go}</button>`,
            )
            .join(""),
      );
    if (aniv.length)
      out.push(
        "<h3>Aniversários do mês</h3>" +
          aniv
            .map((x) => {
              const n = idade(x.nasc),
                dd = x.nasc.slice(8),
                hd = hj.slice(8),
                txt =
                  n == null
                    ? ""
                    : dd === hd
                      ? " · faz " + n + " anos hoje"
                      : dd < hd
                        ? " · fez " + n + " anos"
                        : " · faz " + (n + 1) + " anos";
              return `<div class="arow"><span class="dot"></span><span class="rm"><b>${h(x.nome)}</b><small>${h(ddmm(x.nasc))}${h(txt)}</small></span>${x.tel ? `<a class="btn sm" href="${h(wa(x.tel, "Feliz aniversário, " + first(x.nome) + "! Um beijo do estúdio " + c.nome + "."))}" target="_blank" rel="noopener">Parabéns</a>` : ""}</div>`;
            })
            .join(""),
      );
    return (
      out.join("") || vazio("Tudo em ordem", "Estoque acima do mínimo e nenhuma validade perto.")
    );
  }

  /* Clientes */
  V.clientes = () => {
    const c = cfg(),
      n = S.clientes.length,
      q = S.clientes.filter((x) => num(x.selos) >= c.meta - 2).length;
    return `<section class="head"><div><h1>Clientes</h1><p class="sub">${h(pl(n, "cadastro", "cadastros"))} · ${q} perto do prêmio ou com prêmio liberado</p></div><button type="button" class="btn pri w" data-act="novoCli">${ic("plus")}Cadastrar</button></section>
<div class="srch">${ic("search")}<input id="qCli" type="search" placeholder="Buscar por nome ou telefone" value="${h(U.qCli)}" autocomplete="off" aria-label="Buscar cliente"></div>
<ul class="list" id="cliList">${listaCli()}</ul>`;
  };
  const prog = (x) => {
    const m = cfg().meta,
      n = Math.min(num(x.selos), m);
    return `<span class="prog${n >= m ? " full" : ""}" aria-label="${n} de ${m} selos">${spotI("", 15)}<b>${n}</b>/${m}</span>`;
  };
  function listaCli() {
    const q = U.qCli.trim().toLowerCase(),
      qd = q.replace(/\D/g, ""),
      st2 = cliStats();
    const L = S.clientes
      .filter(
        (x) =>
          !q ||
          String(x.nome || "")
            .toLowerCase()
            .includes(q) ||
          (qd.length > 2 && String(x.tel || "").includes(qd)),
      )
      .sort(byNome);
    if (!L.length)
      return (
        "<li>" +
        vazio(
          q ? "Ninguém encontrado" : "Nenhum cadastro ainda",
          q
            ? "Confira a grafia ou busque pelo telefone."
            : "Cadastre a primeira cliente para começar o cartão fidelidade.",
        ) +
        "</li>"
      );
    return L.map((x) => {
      const s = st2[x.id];
      return `<li><button type="button" class="row" data-act="verCli" data-id="${h(x.id)}"><span class="av">${h(ini(x.nome))}</span><span class="rm"><b>${h(x.nome)}</b><small>${x.tel ? h(tel(x.tel)) : "Sem telefone"}${s ? " · última visita " + h(ddmm(dTs(s.ult))) : ""}</small></span>${prog(x)}</button></li>`;
    }).join("");
  }
  function cardHTML(x, big) {
    const c = cfg(),
      m = c.meta,
      n = Math.min(num(x.selos), m);
    const sl = Array.from({ length: m }, (_, i) => {
      const g = i === m - 1;
      return `<i class="sp${i < n ? " on" : ""}${g ? " gift" : ""}${U.pop === x.id + ":" + i ? " pop" : ""}">${g ? '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-gem" transform="translate(3 3) scale(.75)"/></svg>' : spotI("", ROT[i % ROT.length])}</i>`;
    }).join("");
    return `<div class="arch${big ? " big" : ""}" role="img" aria-label="${h("Cartão de " + x.nome + ": " + n + " de " + m + " selos")}"><div class="ar-in">${monoSVG(c.nome)}<span class="ar-sc">${h(c.nome)}</span><span class="ar-lbl">cartão fidelidade</span><div class="spots ${m - 1 <= 9 ? "c3" : "c4"}">${sl}</div><b class="ar-cli">${h(x.nome)}</b><span class="ar-pr">${n >= m ? "Prêmio liberado: " + h(c.premio) : n + " de " + m + " · " + (m - n === 1 ? "falta 1" : "faltam " + (m - n)) + " para " + h(c.premio)}</span><span class="ar-tag">Toda musa usa piercing</span></div></div>`;
  }
  function cardMsg(x) {
    const c = cfg(),
      n = Math.min(num(x.selos), c.meta),
      f = c.meta - n;
    return (
      "Oi, " +
      first(x.nome) +
      "! Aqui é do estúdio " +
      c.nome +
      ".\nSeu cartão fidelidade: " +
      "♥".repeat(n) +
      "♡".repeat(f) +
      " (" +
      n +
      " de " +
      c.meta +
      " selos)\n" +
      (f <= 0
        ? "Cartão completo! Você ganhou: " + c.premio + ". É só agendar."
        : (f > 1 ? "Faltam " : "Falta ") + f + " para ganhar: " + c.premio + ".") +
      "\nToda musa usa piercing ♡"
    );
  }
  function cardActs(x) {
    const full = num(x.selos) >= cfg().meta;
    return `<div class="cacts"><button type="button" class="btn w" data-act="selo" data-id="${h(x.id)}" data-d="-1">− Selo</button><button type="button" class="btn pri w" data-act="selo" data-id="${h(x.id)}" data-d="1">+ Selo</button>${full ? `<button type="button" class="btn w" data-act="resgatar" data-id="${h(x.id)}">Resgatar prêmio</button>` : ""}<a class="btn" href="${h(wa(x.tel, cardMsg(x)))}" target="_blank" rel="noopener">${ic("chat")}Enviar no WhatsApp</a><button type="button" class="btn" data-act="png" data-id="${h(x.id)}">${ic("down")}Imagem</button></div>`;
  }
  function shCli(id) {
    return () => {
      const x = get("clientes", id);
      if (!x) return gone();
      const s = cliStats()[id] || { n: 0, tot: 0, ult: 0 },
        ida = idade(x.nasc),
        hist = S.atendimentos.filter((a) => a.cli === id).sort((a, b) => b.ts - a.ts);
      return `<header class="shh"><h2>${h(x.nome)}</h2>${xBtn}</header>
<p class="sub">${x.tel ? `<a href="${h(wa(x.tel, "Oi, " + first(x.nome) + "!"))}" target="_blank" rel="noopener">${h(tel(x.tel))}</a>` : "Sem telefone"}${ida != null ? " · " + ida + " anos" : ""}${x.nasc ? " · aniversário " + h(ddmm(x.nasc)) : ""}${x.desde ? " · cliente desde " + h(mesNome(mTs(x.desde)).toLowerCase()) : ""}</p>
${ida != null && ida < 18 ? `<p class="callout bad"><b>Menor de idade.</b> Atender só com autorização do responsável${x.resp ? ": " + h(x.resp) : " (não informado)"}.</p>` : ""}${x.obs ? `<p class="callout">${h(x.obs)}</p>` : ""}
<div class="fcard">${cardHTML(x)}${cardActs(x)}</div>
<div class="figs three"><div><b>${s.n}</b><span>${s.n === 1 ? "visita" : "visitas"}</span></div><div><b>${brl0(s.tot)}</b><span>gasto total</span></div><div><b>${s.ult ? h(ddmm(dTs(s.ult))) : "—"}</b><span>última visita</span></div></div>
<h3>Histórico</h3>${hist.length ? '<ul class="hist">' + hist.map((a) => `<li><button type="button" class="hrow" data-act="verAt" data-id="${h(a.id)}"><span class="d">${h(ddmm(dTs(a.ts)))}</span><span class="rm"><b>${h(itensTxt(a))}</b><small>${h(a.pag || "")}${a.selos ? " · +" + h(a.selos) + " selo" : ""}${a.premio ? " · prêmio usado" : ""}</small></span><span class="v">${h(brl(a.total))}</span></button></li>`).join("") + "</ul>" : '<p class="sub">Nenhum atendimento registrado.</p>'}
<div class="foot"><button type="button" class="btn pri w" data-act="novoAt" data-cli="${h(id)}">Atender</button><button type="button" class="btn w" data-act="novoAg" data-cli="${h(id)}">Agendar</button><button type="button" class="btn w" data-act="editCli" data-id="${h(id)}">Editar</button><button type="button" class="btn ghost danger w" data-act="delCli" data-id="${h(id)}">Excluir</button></div>`;
    };
  }
  function fCli(id, push) {
    const x = id ? get("clientes", id) : null;
    F = { k: "cli", id: id || "" };
    openSh(
      "form",
      () => `<form class="fm" data-form="cli"><header class="shh"><h2>${x ? "Editar cadastro" : "Novo cadastro"}</h2>${xBtn}</header>
<label>Nome completo<input name="nome" required autofocus autocomplete="off" value="${h(x ? x.nome : "")}"></label>
<div class="g2"><label>WhatsApp<input name="tel" inputmode="tel" value="${h(x ? tel(x.tel) : "")}" placeholder="(12) 99999-9999"></label><label>Nascimento<input name="nasc" type="date" value="${h(x ? x.nasc || "" : "")}"></label></div>
<label>Responsável, se for menor de idade<input name="resp" value="${h(x ? x.resp || "" : "")}" placeholder="Nome e parentesco"></label>
<label>Observações<input name="obs" value="${h(x ? x.obs || "" : "")}" placeholder="Ex.: alergia a níquel, só titânio"></label>
${x ? "" : `<label>Selos que já tem no cartão de papel<input name="selos" type="number" min="0" max="${cfg().meta}" step="1" value="0"></label>`}
<button type="submit" class="btn pri wide w">${x ? "Salvar" : "Cadastrar"}</button></form>`,
      push,
    );
  }

  /* Fidelidade */
  function fidSorted() {
    const m = cfg().meta;
    return [...S.clientes].sort(
      (a, b) => Math.min(num(b.selos), m) - Math.min(num(a.selos), m) || byNome(a, b),
    );
  }
  function listaFid() {
    const q = U.qFid.trim().toLowerCase(),
      m = cfg().meta,
      L = fidSorted().filter(
        (x) =>
          !q ||
          String(x.nome || "")
            .toLowerCase()
            .includes(q),
      );
    if (!L.length) return '<li class="pad sub">Ninguém encontrado.</li>';
    return L.map((x) => {
      const n = Math.min(num(x.selos), m);
      return `<li><button type="button" class="prow${x.id === U.fid ? " on" : ""}" data-act="fidSel" data-id="${h(x.id)}"><span class="rm"><b>${h(x.nome)}</b><span class="mh">${Array.from({ length: m }, (_, i) => spotI(i < n ? "on" : "", ROT[i % ROT.length])).join("")}</span></span><span class="pn${n >= m ? " full" : ""}">${n >= m ? "Prêmio" : n + "/" + m}</span></button></li>`;
    }).join("");
  }
  V.fidelidade = () => {
    const c = cfg(),
      L = fidSorted(),
      sel = get("clientes", U.fid) || L[0];
    if (sel) U.fid = sel.id;
    const mk = hoje().slice(0, 7),
      sm = S.atendimentos.filter((a) => mTs(a.ts) === mk).reduce((s, a) => s + num(a.selos), 0);
    const at = S.clientes.filter((x) => num(x.selos) > 0 && num(x.selos) < c.meta).length,
      lib = S.clientes.filter((x) => num(x.selos) >= c.meta).length,
      res = S.clientes.reduce((s, x) => s + num(x.resgates), 0);
    return `<section class="head"><div><h1>Cartão fidelidade</h1><p class="sub">${h(regra(c))} · <a href="#ajustes">mudar a regra</a></p></div></section>
<div class="fid"><div class="fcard">${sel ? cardHTML(sel, true) + cardActs(sel) : vazio("Sem cartões ainda", "Cadastre uma cliente para criar o cartão dela.")}</div>
<section class="panel"><h2>Cartões</h2><div class="srch">${ic("search")}<input id="qFid" type="search" placeholder="Buscar cliente" value="${h(U.qFid)}" autocomplete="off" aria-label="Buscar cartão"></div><ul class="plist" id="fidList">${listaFid()}</ul></section></div>
<div class="figs"><div><b>${at}</b><span>cartões em andamento</span></div><div><b>${sm}</b><span>selos dados em ${h(mesCurto(mk))}</span></div><div><b>${lib}</b><span>${lib === 1 ? "prêmio liberado" : "prêmios liberados"}</span></div><div><b>${res}</b><span>${res === 1 ? "prêmio resgatado" : "prêmios resgatados"}</span></div></div>`;
  };
  function selo(id, d) {
    if (ro) return toast("Seu acesso é só de leitura.");
    const x = get("clientes", id),
      m = cfg().meta;
    if (!x) return;
    if (d > 0 && num(x.selos) >= m)
      return toast("Cartão completo: resgate o prêmio antes de dar outro selo.");
    if (d < 0 && num(x.selos) <= 0) return;
    if (d > 0) {
      U.pop = id + ":" + num(x.selos);
      setTimeout(() => {
        U.pop = "";
      }, 800);
    }
    seq("c:" + id, () => {
      const y = get("clientes", id);
      return y ? st.upd("clientes", id, { selos: Math.max(0, Math.min(m, num(y.selos) + d)) }) : 0;
    }).catch(falha);
  }
  async function resgatar(id) {
    const x = get("clientes", id),
      c = cfg();
    if (!x) return;
    if (
      !(await ask(
        "Resgatar o prêmio de " +
          first(x.nome) +
          " (" +
          c.premio +
          ")? O cartão volta para o começo.",
        "Resgatar",
      ))
    )
      return;
    const mv = (s, r) =>
      seq("c:" + id, () => {
        const y = get("clientes", id);
        return y
          ? st.upd("clientes", id, {
              selos: Math.max(0, num(y.selos) + s),
              resgates: Math.max(0, num(y.resgates) + r),
            })
          : 0;
      });
    try {
      await mv(-c.meta, 1);
      toast("Prêmio resgatado. Cartão novo começando!", () => mv(c.meta, -1).catch(falha));
    } catch (e) {
      falha(e);
    }
  }
  async function baixar(filename, data) {
    try {
      DL = DL || (window.claude && window.claude.use ? await window.claude.use("downloads") : null);
    } catch (e) {}
    if (!DL) {
      if (window.claude) return toast("Download indisponível aqui. Abra o app pelo navegador.");
      try {
        const b =
            data instanceof Blob
              ? data
              : new Blob([data], {
                  type: /\.json$/.test(filename) ? "application/json" : "text/csv;charset=utf-8",
                }),
          u = URL.createObjectURL(b),
          a = document.createElement("a");
        a.href = u;
        a.download = filename;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(u), 4000);
      } catch (e) {
        toast("Não foi possível baixar o arquivo.");
      }
      return;
    }
    try {
      await DL.save({ filename, data });
    } catch (e) {
      const c = e && e.code;
      if (c === "declined") return;
      if (c === "host_unavailable")
        return toast("Este aparelho não salva arquivos pelo app. Abra pelo navegador.");
      if (c === "rate_limited") return toast("Espere um instante e tente de novo.");
      toast("Não foi possível baixar o arquivo.");
    }
  }
  async function cardPNG(id) {
    const x = get("clientes", id);
    if (!x) return;
    const c = cfg(),
      m = c.meta,
      n = Math.min(num(x.selos), m);
    toast("Preparando a imagem…");
    try {
      await Promise.all(
        [
          '500 58px "Cormorant Garamond"',
          '600 60px "Cormorant Garamond"',
          "400 84px Allura",
          "400 30px Jost",
        ].map((f) => document.fonts.load(f)),
      );
    } catch (e) {}
    const W = 1080,
      H = 1350,
      cv = document.createElement("canvas");
    cv.width = W;
    cv.height = H;
    const g = cv.getContext("2d"),
      mx = W / 2;
    const fit = (t, y, max) => {
      let s = String(t);
      while (g.measureText(s).width > max && s.length > 3) s = s.slice(0, -2) + "…";
      g.fillText(s, mx, y);
    };
    const arch = (x0, y0, w, hh, rb) => {
      const r = w / 2;
      g.beginPath();
      g.moveTo(x0, y0 + r);
      g.arc(x0 + r, y0 + r, r, Math.PI, 0);
      g.lineTo(x0 + w, y0 + hh - rb);
      g.arcTo(x0 + w, y0 + hh, x0 + w - rb, y0 + hh, rb);
      g.lineTo(x0 + rb, y0 + hh);
      g.arcTo(x0, y0 + hh, x0, y0 + hh - rb, rb);
      g.closePath();
    };
    g.fillStyle = "#F8F3F2";
    g.fillRect(0, 0, W, H);
    const aw = 780,
      ax = (W - aw) / 2,
      ay = 60,
      ah = 1190;
    arch(ax, ay, aw, ah, 60);
    g.fillStyle = "#EDE3E3";
    g.fill();
    arch(ax + 22, ay + 22, aw - 44, ah - 44, 42);
    g.strokeStyle = "#BDA197";
    g.lineWidth = 2;
    g.stroke();
    const my = ay + 160;
    g.strokeStyle = "#60412F";
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(mx, my, 60, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "#60412F";
    [-60, 60].forEach((dx) => {
      g.beginPath();
      g.arc(mx + dx, my, 4.6, 0, Math.PI * 2);
      g.fill();
    });
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = '600 60px "Cormorant Garamond", Georgia, serif';
    g.fillText(ini(c.nome).slice(0, 2), mx, my + 21);
    g.font = "400 84px Allura, cursive";
    fit(c.nome, my + 160, aw - 140);
    g.fillStyle = "#836150";
    g.font = "400 30px Jost, sans-serif";
    g.fillText("cartão fidelidade", mx, my + 212);
    const cols = m - 1 <= 9 ? 3 : 4,
      s = cols === 3 ? 92 : 76,
      gap = cols === 3 ? 28 : 22,
      y0 = my + 262,
      bp = new Path2D(BP),
      ap = new Path2D(AP),
      gp = new Path2D(GP);
    for (let i = 0; i < m; i++) {
      const r = Math.floor(i / cols),
        inRow = Math.min(cols, m - r * cols),
        cx = mx - (inRow * s + (inRow - 1) * gap) / 2 + (i % cols) * (s + gap) + s / 2,
        cy = y0 + r * (s + gap) + s / 2,
        on = i < n,
        gift = i === m - 1;
      g.save();
      g.translate(cx, cy);
      if (gift) {
        g.scale((s / 24) * 0.75, (s / 24) * 0.75);
        g.translate(-12, -12);
        if (on) {
          g.fillStyle = "#CD7787";
          g.fill(gp);
        }
        g.strokeStyle = on ? "#60412F" : "#BDA197";
        g.lineWidth = 1.4;
        g.lineJoin = "round";
        g.stroke(gp);
        g.beginPath();
        g.moveTo(3, 9.5);
        g.lineTo(21, 9.5);
        g.moveTo(9.5, 4);
        g.lineTo(8, 9.5);
        g.lineTo(12, 20);
        g.lineTo(16, 9.5);
        g.lineTo(14.5, 4);
        g.stroke();
      } else {
        g.rotate((ROT[i % ROT.length] * Math.PI) / 180);
        g.scale(s / 24, s / 24);
        g.translate(-12, -12);
        if (on) {
          g.fillStyle = "#CD7787";
          g.fill(bp);
          g.strokeStyle = "#60412F";
          g.lineWidth = 1.9;
          g.lineCap = "round";
          g.stroke(ap);
        } else {
          g.setLineDash([2.2, 2.2]);
          g.strokeStyle = "#BDA197";
          g.lineWidth = 1.1;
          g.stroke(bp);
          g.setLineDash([]);
        }
      }
      g.restore();
    }
    const yN = y0 + Math.ceil(m / cols) * (s + gap) + 58;
    g.fillStyle = "#60412F";
    g.font = '500 58px "Cormorant Garamond", Georgia, serif';
    fit(x.nome, yN, aw - 150);
    g.fillStyle = "#836150";
    g.font = "400 30px Jost, sans-serif";
    fit(
      n >= m
        ? "Prêmio liberado: " + c.premio
        : n +
            " de " +
            m +
            " selos · " +
            (m - n === 1 ? "falta 1" : "faltam " + (m - n)) +
            " para " +
            c.premio,
      yN + 50,
      aw - 150,
    );
    g.fillStyle = "#CD7787";
    g.font = "400 60px Allura, cursive";
    g.fillText("Toda musa usa piercing", mx, yN + 126);
    const ct = [c.insta, c.zap ? tel(c.zap) : ""].filter(Boolean).join("   ·   ");
    if (ct) {
      g.fillStyle = "#836150";
      g.font = "400 28px Jost, sans-serif";
      fit(ct, H - 40, W - 120);
    }
    const blob = await new Promise((r) => cv.toBlob(r, "image/png"));
    if (!blob) return toast("Não foi possível gerar a imagem.");
    $("#toast").hidden = true;
    await baixar("cartao-" + slug(x.nome) + ".png", blob);
  }

  /* Materiais */
  V.materiais = () => {
    const tot = S.materiais.reduce((s, m) => s + Math.max(0, num(m.qtd)) * num(m.custo), 0),
      vd = S.materiais.reduce((s, m) => s + Math.max(0, num(m.qtd)) * num(m.preco), 0),
      low = S.materiais.filter(isLow).length,
      ven = S.materiais.filter(isVenc).length;
    return `<section class="head"><div><h1>Materiais</h1><p class="sub">${h(pl(S.materiais.length, "item", "itens"))} no estoque · baixa sozinha a cada atendimento</p></div><div class="dnav"><button type="button" class="btn" data-act="csvMat">${ic("down")}Planilha</button><button type="button" class="btn pri w" data-act="novoMat">${ic("plus")}Material</button></div></section>
<div class="figs"><div><b>${brl0(tot)}</b><span>em estoque, pelo custo</span></div><div><b>${brl0(vd)}</b><span>em joias e acessórios, pelo preço de venda</span></div><div><b class="${low ? "bad" : ""}">${low}</b><span>abaixo do mínimo</span></div><div><b>${ven}</b><span>vencem em até 60 dias</span></div></div>
<div class="filt"><div class="chips">${["Todas", ...CATS, "Repor"].map((k) => `<button type="button" class="chip${U.cat === k ? " on" : ""}" data-act="cat" data-k="${h(k)}">${h(k)}</button>`).join("")}</div><div class="srch">${ic("search")}<input id="qMat" type="search" placeholder="Buscar material, lote ou fornecedor" value="${h(U.qMat)}" autocomplete="off" aria-label="Buscar material"></div></div>
<div id="matList">${listaMat()}</div>`;
  };
  function listaMat() {
    const q = U.qMat.trim().toLowerCase();
    const L = S.materiais.filter(
      (m) =>
        (U.cat === "Todas" || (U.cat === "Repor" ? isLow(m) : m.cat === U.cat)) &&
        (!q ||
          [m.nome, m.det, m.lote, m.forn].some((v) =>
            String(v || "")
              .toLowerCase()
              .includes(q),
          )),
    );
    if (!L.length)
      return vazio(
        q ? "Nada encontrado" : "Nenhum material aqui",
        "Cadastre agulhas, joias e descartáveis para controlar o estoque.",
      );
    const G = (U.cat === "Todas" ? [...CATS, "Outros"] : [U.cat])
      .map((g) => [
        g,
        L.filter(
          (m) => U.cat !== "Todas" || (g === "Outros" ? !CATS.includes(m.cat) : m.cat === g),
        ).sort(byNome),
      ])
      .filter((x) => x[1].length);
    return G.map(
      ([g, a]) =>
        (U.cat === "Todas" ? `<h3 class="gh">${h(g)} <span>${a.length}</span></h3>` : "") +
        '<ul class="list">' +
        a.map(rowMat).join("") +
        "</ul>",
    ).join("");
  }
  const lvl = (m) =>
    Math.max(4, Math.min(100, (num(m.qtd) / Math.max(1, num(m.min) * 2)) * 100)).toFixed(0);
  function rowMat(m) {
    const lw = isLow(m),
      vn = isVenc(m);
    return `<li class="mrow"><button type="button" class="mm" data-act="verMat" data-id="${h(m.id)}"><b>${h(m.nome)}</b><small>${h(m.det || m.cat || "")}${num(m.preco) ? " · " + h(brl(m.preco)) : ""}${vn ? ` · <em class="${diasAte(m.val) < 0 ? "bad" : "mid"}">${diasAte(m.val) < 0 ? "venceu" : "vence"} ${h(ddmm(m.val))}</em>` : ""}</small><span class="meter${lw ? " low" : ""}"><i style="width:${lvl(m)}%"></i></span></button>
<span class="mq${lw ? " bad" : ""}"><b>${h(num(m.qtd))}</b>${h(m.un || "un")}</span><span class="mb w"><button type="button" class="ico" data-act="adj" data-id="${h(m.id)}" data-d="-1" aria-label="Tirar 1 de ${h(m.nome)}">−</button><button type="button" class="ico" data-act="adj" data-id="${h(m.id)}" data-d="1" aria-label="Pôr 1 em ${h(m.nome)}">+</button></span></li>`;
  }
  function matHist(id) {
    const out = [];
    S.movs
      .filter((v) => v.m === id)
      .forEach((v) =>
        out.push({
          ts: v.ts,
          q: num(v.q),
          t: v.tipo || "Ajuste",
          s: [v.lote ? "lote " + v.lote : "", v.obs || ""].filter(Boolean).join(" · "),
        }),
      );
    S.atendimentos.forEach((a) => {
      let q = 0;
      (a.kit || []).forEach((k) => {
        if (k.m === id) q += num(k.q);
      });
      (a.itens || []).forEach((i) => {
        if (i.t === "p" && i.ref === id) q += num(i.q);
      });
      if (q) out.push({ ts: a.ts, q: -q, t: "Atendimento", s: a.nome || "Venda de balcão" });
    });
    return out.sort((a, b) => b.ts - a.ts);
  }
  function shMat(id) {
    return () => {
      const m = get("materiais", id);
      if (!m) return gone();
      const pr = num(m.preco),
        cu = num(m.custo),
        hs = matHist(id).slice(0, 15),
        dv = m.val ? diasAte(m.val) : null;
      return `<header class="shh"><h2>${h(m.nome)}</h2>${xBtn}</header><p class="sub">${h(m.cat || "")}${m.det ? " · " + h(m.det) : ""}</p>
<div class="mbig"><div><b class="${isLow(m) ? "bad" : ""}">${h(num(m.qtd))}</b> ${h(m.un || "un")}</div><span class="sub">mínimo ${h(num(m.min))} ${h(m.un || "un")}${isLow(m) ? " · hora de repor" : ""}</span><span class="meter${isLow(m) ? " low" : ""}"><i style="width:${lvl(m)}%"></i></span></div>
<dl class="dl"><div><dt>Custo</dt><dd>${h(brl(cu))}</dd></div>${pr ? `<div><dt>Venda</dt><dd>${h(brl(pr))}</dd></div><div><dt>Margem</dt><dd>${Math.round(((pr - cu) / pr) * 100)}%</dd></div>` : ""}<div><dt>Fornecedor</dt><dd>${h(m.forn || "—")}</dd></div><div><dt>Lote</dt><dd>${h(m.lote || "—")}</dd></div><div><dt>Validade</dt><dd class="${dv != null && dv <= 60 ? (dv < 0 ? "bad" : "mid") : ""}">${m.val ? h(ddmm(m.val) + "/" + String(m.val).slice(0, 4)) + (dv < 0 ? " · vencido" : " · " + h(pl(dv, "dia", "dias"))) : "—"}</dd></div></dl>
<div class="cacts"><button type="button" class="btn pri w" data-act="entrada" data-id="${h(id)}">${ic("plus")}Entrada</button><button type="button" class="btn w" data-act="baixa" data-id="${h(id)}">Baixa ou perda</button><button type="button" class="btn w" data-act="editMat" data-id="${h(id)}">Editar</button><button type="button" class="btn ghost danger w" data-act="delMat" data-id="${h(id)}">Excluir</button></div>
<h3>Movimentações</h3>${hs.length ? '<ul class="hist">' + hs.map((r) => `<li class="hl"><span class="d">${h(ddmm(dTs(r.ts)))}</span><span class="rm"><b>${h(r.t)}</b>${r.s ? "<small>" + h(r.s) + "</small>" : ""}</span><span class="v${r.q < 0 ? " neg" : ""}">${r.q > 0 ? "+" : "−"}${h(Math.abs(r.q))}</span></li>`).join("") + "</ul>" : '<p class="sub">Sem movimentações registradas.</p>'}`;
    };
  }
  function fMat(id, push) {
    const m = id ? get("materiais", id) : null;
    F = { k: "mat", id: id || "" };
    const o = (arr, v) =>
      arr.map((x) => `<option${x === v ? " selected" : ""}>${h(x)}</option>`).join("");
    openSh(
      "form",
      () => `<form class="fm" data-form="mat"><header class="shh"><h2>${m ? "Editar material" : "Novo material"}</h2>${xBtn}</header>
<label>Nome<input name="nome" required autofocus autocomplete="off" value="${h(m ? m.nome : "")}" placeholder="Ex.: Labret com zircônia"></label>
<div class="g2"><label>Categoria<select name="cat">${o(CATS, m ? m.cat : U.cat !== "Todas" && U.cat !== "Repor" ? U.cat : "Joias")}</select></label><label>Unidade<select name="un">${o(UNS, m ? m.un : "un")}</select></label></div>
<label>Detalhe<input name="det" value="${h(m ? m.det || "" : "")}" placeholder="Ex.: Titânio F136 · 8 mm"></label>
<div class="g2"><label>Quantidade<input name="qtd" type="number" step="1" value="${h(m ? num(m.qtd) : 0)}"></label><label>Mínimo<input name="min" type="number" min="0" step="1" value="${h(m ? num(m.min) : 0)}"></label></div>
<div class="g2"><label>Custo (R$)<input name="custo" type="number" min="0" step="0.01" inputmode="decimal" value="${h(m ? num(m.custo) : "")}"></label><label>Venda (R$), se vende<input name="preco" type="number" min="0" step="0.01" inputmode="decimal" value="${h(m && num(m.preco) ? num(m.preco) : "")}"></label></div>
<div class="g2"><label>Lote<input name="lote" value="${h(m ? m.lote || "" : "")}"></label><label>Validade<input name="val" type="date" value="${h(m ? m.val || "" : "")}"></label></div>
<label>Fornecedor<input name="forn" value="${h(m ? m.forn || "" : "")}"></label>
<button type="submit" class="btn pri wide w">${m ? "Salvar" : "Cadastrar material"}</button></form>`,
      push,
    );
  }
  function fEntrada(id) {
    const m = get("materiais", id);
    if (!m) return;
    F = { k: "en", id };
    openSh(
      "form",
      () => `<form class="fm" data-form="entrada"><header class="shh"><h2>Entrada de ${h(m.nome)}</h2>${xBtn}</header>
<div class="g2"><label>Quantidade (${h(m.un || "un")})<input name="q" type="number" min="1" step="1" required autofocus></label><label>Custo unitário (R$)<input name="custo" type="number" min="0" step="0.01" inputmode="decimal" value="${h(num(m.custo))}"></label></div>
<div class="g2"><label>Lote<input name="lote" value="${h(m.lote || "")}"></label><label>Validade<input name="val" type="date" value="${h(m.val || "")}"></label></div>
<label>Fornecedor<input name="forn" value="${h(m.forn || "")}"></label>
<label class="ck"><input type="checkbox" name="desp" checked> Lançar a compra no caixa como despesa</label>
<button type="submit" class="btn pri wide w">Registrar entrada</button></form>`,
      true,
    );
  }
  function fBaixa(id) {
    const m = get("materiais", id);
    if (!m) return;
    F = { k: "bx", id };
    openSh(
      "form",
      () => `<form class="fm" data-form="bx"><header class="shh"><h2>Baixa de ${h(m.nome)}</h2>${xBtn}</header>
<div class="g2 st"><label>Quantidade (${h(m.un || "un")})<input name="q" type="number" min="1" step="1" required autofocus></label><label>Motivo<select name="tipo">${["Perda", "Vencido", "Uso interno", "Ajuste de inventário"].map((x) => "<option>" + x + "</option>").join("")}</select></label></div>
<label>Observação<input name="obs" placeholder="Ex.: embalagem violada"></label>
<button type="submit" class="btn pri wide w">Registrar baixa</button></form>`,
      true,
    );
  }
  function adj(id, d) {
    if (ro) return toast("Seu acesso é só de leitura.");
    if (!get("materiais", id)) return;
    seq("m:" + id, () => {
      const m = get("materiais", id);
      return m ? st.upd("materiais", id, { qtd: num(m.qtd) + d }) : 0;
    }).catch(falha);
    PADJ[id] = (PADJ[id] || 0) + d;
    clearTimeout(adjT);
    adjT = setTimeout(flushAdj, 1500);
  }
  async function flushAdj() {
    for (const id of Object.keys(PADJ)) {
      const q = PADJ[id];
      delete PADJ[id];
      if (!q) continue;
      const m = get("materiais", id);
      try {
        await add("movs", {
          ts: Date.now(),
          m: id,
          nome: m ? m.nome : "",
          q,
          tipo: "Ajuste",
          lote: (m && m.lote) || "",
          obs: "Ajuste rápido",
        });
      } catch (e) {
        falha(e);
      }
    }
  }

  /* Atendimento */
  function novoAt(pre) {
    pre = pre || {};
    F = {
      k: "at",
      cli: pre.cli || "",
      novo: null,
      avulso: false,
      q: "",
      itens: [],
      desc: "",
      pag: "Pix",
      premio: false,
      obs: "",
      ret: null,
      ag: pre.ag || "",
    };
    if (pre.serv) addServ(pre.serv);
    openSh("form", atHTML, pre.push);
  }
  function addServ(id) {
    const s = get("servicos", id);
    if (!s) return;
    const e = F.itens.find((i) => i.t === "s" && i.ref === id);
    if (e) e.q++;
    else F.itens.push({ t: "s", ref: id, nome: s.nome, q: 1, v: num(s.preco) });
  }
  function addProd(id) {
    const m = get("materiais", id);
    if (!m) return;
    const e = F.itens.find((i) => i.t === "p" && i.ref === id);
    if (e) e.q++;
    else
      F.itens.push({
        t: "p",
        ref: id,
        nome: m.nome,
        det: m.det || "",
        q: 1,
        v: num(m.preco),
        lote: m.lote || "",
      });
  }
  function atHTML() {
    const SV = [...S.servicos].sort(byNome),
      P = S.materiais.filter((m) => num(m.preco) > 0);
    const og = [...CATS, "Outros"]
      .map((g) => {
        const a = P.filter((m) => (g === "Outros" ? !CATS.includes(m.cat) : m.cat === g)).sort(
          byNome,
        );
        return a.length
          ? `<optgroup label="${h(g)}">${a.map((m) => `<option value="${h(m.id)}">${h(m.nome)}${m.det ? " · " + h(m.det) : ""} · ${h(brl(m.preco))} (${h(num(m.qtd))} em estoque)</option>`).join("")}</optgroup>`
          : "";
      })
      .join("");
    return `<form class="fm" data-form="at"><header class="shh"><h2>Novo atendimento</h2>${xBtn}</header>
<fieldset><legend>Cliente</legend><div id="pk">${pickHTML()}</div></fieldset>
<fieldset><legend>Serviços e joias</legend><select id="atServ" aria-label="Adicionar serviço"><option value="">+ Adicionar serviço…</option>${SV.map((s) => `<option value="${h(s.id)}">${h(s.nome)} · ${h(brl(s.preco))}</option>`).join("")}</select><select id="atProd" aria-label="Adicionar joia ou produto"><option value="">+ Adicionar joia ou produto…</option>${og}</select><ul class="its" id="atIts">${itsHTML()}</ul></fieldset>
<fieldset><legend>Pagamento</legend><div class="pills">${PAGS.map((p) => `<label class="pill"><input type="radio" name="pag" value="${p}"${F.pag === p ? " checked" : ""}><span>${p}</span></label>`).join("")}</div>
<div class="g2 st"><label>Desconto (R$)<input id="atDesc" type="number" min="0" step="0.01" inputmode="decimal" value="${h(F.desc)}"></label><label>Observação<input id="atObs" value="${h(F.obs)}" placeholder="Ex.: joia de 8 mm"></label></div></fieldset>
<div id="atTot" class="fm">${totHTML()}</div></form>`;
  }
  function pickHTML() {
    const c = cfg();
    if (F.cli) {
      const x = get("clientes", F.cli);
      if (x) {
        const ida = idade(x.nasc);
        return `<div class="pk-on"><span class="av">${h(ini(x.nome))}</span><span class="rm"><b>${h(x.nome)}</b><small>${x.tel ? h(tel(x.tel)) + " · " : ""}${Math.min(num(x.selos), c.meta)}/${c.meta} selos</small></span><button type="button" class="btn sm" data-act="pkClear">Trocar</button></div>${ida != null && ida < 18 ? `<p class="callout bad"><b>Menor de idade.</b> Confirme a autorização do responsável${x.resp ? " (" + h(x.resp) + ")" : ""}.</p>` : ""}${x.obs ? `<p class="callout">${h(x.obs)}</p>` : ""}`;
      }
    }
    if (F.novo)
      return `<div class="g2 st"><label>Nome<input id="pkNome" value="${h(F.novo.nome)}" autocomplete="off"></label><label>WhatsApp<input id="pkTel" inputmode="tel" value="${h(F.novo.tel)}" placeholder="(12) 99999-9999"></label></div><div class="pkx"><button type="button" class="btn sm ghost" data-act="pkClear">Escolher um cadastro existente</button></div>`;
    if (F.avulso)
      return `<div class="pk-on"><span class="av">—</span><span class="rm"><b>Venda de balcão</b><small>Sem cadastro, não ganha selo</small></span><button type="button" class="btn sm" data-act="pkClear">Trocar</button></div>`;
    return `<div class="srch">${ic("search")}<input id="pkQ" type="search" placeholder="Buscar por nome ou telefone" value="${h(F.q)}" autocomplete="off" aria-label="Buscar cliente"></div><div id="pkRes" class="pkres">${pkRes()}</div>`;
  }
  function pkRes() {
    const q = F.q.trim().toLowerCase(),
      qd = q.replace(/\D/g, ""),
      st2 = cliStats();
    let L;
    if (q)
      L = S.clientes
        .filter(
          (x) =>
            String(x.nome || "")
              .toLowerCase()
              .includes(q) ||
            (qd.length > 2 && String(x.tel || "").includes(qd)),
        )
        .sort(byNome)
        .slice(0, 6);
    else
      L = [...S.clientes]
        .sort((a, b) => ((st2[b.id] || {}).ult || 0) - ((st2[a.id] || {}).ult || 0))
        .slice(0, 4);
    return (
      (!q && L.length ? '<p class="pkh">Recentes</p>' : "") +
      L.map(
        (x) =>
          `<button type="button" class="pkr" data-act="pk" data-id="${h(x.id)}"><b>${h(x.nome)}</b><small>${x.tel ? h(tel(x.tel)) : ""}</small></button>`,
      ).join("") +
      (q && !L.length ? '<p class="pkh">Nenhum cadastro com esse nome.</p>' : "") +
      `<div class="pkx"><button type="button" class="btn sm" data-act="pkNovo">${ic("plus")}${q ? "Cadastrar “" + h(F.q.trim()) + "”" : "Novo cadastro"}</button>${F.k === "at" ? '<button type="button" class="btn sm ghost" data-act="pkAvulso">Venda de balcão</button>' : ""}</div>`
    );
  }
  function itsHTML() {
    if (!F.itens.length)
      return '<li class="sub">Nenhum item ainda. Escolha o serviço e a joia nas listas acima.</li>';
    return F.itens
      .map((i, k) => {
        let s = "";
        if (i.t === "s") {
          const sv = get("servicos", i.ref);
          s = sv && sv.kit && sv.kit.length ? "Sai do estoque: " + kitTxt(sv.kit, i.q) : "";
        } else {
          const m = get("materiais", i.ref),
            em = m ? num(m.qtd) : 0;
          s = [
            i.det,
            i.lote ? "lote " + i.lote : "",
            m ? (em < i.q ? "só " + em + " em estoque" : em + " em estoque") : "",
          ]
            .filter(Boolean)
            .join(" · ");
        }
        return `<li><span class="rm"><b>${i.q > 1 ? i.q + "× " : ""}${h(i.nome)}</b>${s ? "<small>" + h(s) + "</small>" : ""}</span><span class="v">${h(brl(i.q * i.v))}</span><button type="button" class="ico" data-act="atDel" data-i="${k}" aria-label="Remover ${h(i.nome)}">${ic("x")}</button></li>`;
      })
      .join("");
  }
  function tots() {
    const c = cfg(),
      sub = F.itens.reduce((s, i) => s + i.q * i.v, 0),
      sv = F.itens.filter((i) => i.t === "s"),
      maxS = sv.length ? Math.max(...sv.map((i) => i.v)) : 0;
    const x = F.cli ? get("clientes", F.cli) : null,
      cur = x ? num(x.selos) : 0,
      canP = !!x && cur >= c.meta && maxS > 0,
      pd = canP && F.premio ? maxS : 0;
    const ds = Math.min(Math.max(0, num(F.desc)), sub - pd),
      total = Math.max(0, sub - pd - ds),
      temCli = !!(x || F.novo);
    const ganha =
      !temCli || pd
        ? 0
        : c.modo === "valor"
          ? Math.floor(total / Math.max(1, num(c.porValor)))
          : total > 0
            ? 1
            : 0;
    const retD = sv.length
      ? Math.max(...sv.map((i) => num((get("servicos", i.ref) || {}).ret)))
      : 0;
    return { sub, pd, ds, total, ganha, cur, canP, x, retD, maxS };
  }
  function totHTML() {
    const t = tots(),
      c = cfg();
    let fb = "";
    if (t.x || F.novo) {
      const dep = t.pd ? Math.max(0, t.cur - c.meta) : Math.min(c.meta, t.cur + t.ganha);
      fb = `<div class="fbox">${spotI("", 20)}<div><b>${t.ganha ? "+" + t.ganha + (t.ganha > 1 ? " selos" : " selo") + " no cartão" : t.pd ? "Prêmio usado neste atendimento" : "Sem selo neste atendimento"}</b><small>${t.x ? h(first(t.x.nome)) : "A nova cliente"} fica com ${dep}/${c.meta}${dep >= c.meta ? " · prêmio liberado" : ""}</small></div></div>${t.canP ? `<label class="ck"><input type="checkbox" id="atPremio"${F.premio ? " checked" : ""}> Usar o prêmio agora: ${h(c.premio)} (desconto de ${h(brl(t.maxS))})</label>` : ""}`;
    }
    const rOn = F.ret === null ? t.retD > 0 : F.ret;
    const rb =
      t.retD > 0 && (t.x || F.novo)
        ? `<label class="ck"><input type="checkbox" id="atRet"${rOn ? " checked" : ""}> Marcar retorno para troca de haste em ${t.retD} dias (${h(ddmm(addD(hoje(), t.retD)))})</label>`
        : "";
    return `${fb}${rb}<dl class="tot"><div><dt>Subtotal</dt><dd>${h(brl(t.sub))}</dd></div>${t.pd ? `<div><dt>Prêmio do cartão</dt><dd>− ${h(brl(t.pd))}</dd></div>` : ""}${t.ds ? `<div><dt>Desconto</dt><dd>− ${h(brl(t.ds))}</dd></div>` : ""}<div class="big"><dt>Total</dt><dd>${h(brl(t.total))}</dd></div></dl><button type="submit" class="btn pri wide w"${F.itens.length ? "" : " disabled"}>Concluir atendimento</button>`;
  }
  function reAt() {
    $("#atIts").innerHTML = itsHTML();
    $("#atTot").innerHTML = totHTML();
  }
  function rePk() {
    $("#pk").innerHTML = pickHTML();
    const t = $("#atTot");
    if (t) t.innerHTML = totHTML();
  }
  async function estornar(id, doc) {
    const a = get("atendimentos", id) || doc;
    if (!a) return;
    const c = cfg();
    try {
      for (const [m, q] of usoDe(a))
        await seq("m:" + m, () => {
          const mm = get("materiais", m);
          return mm ? st.upd("materiais", m, { qtd: num(mm.qtd) + q }) : 0;
        });
      if (a.cli)
        await seq("c:" + a.cli, () => {
          const x = get("clientes", a.cli);
          if (!x) return 0;
          let s = num(x.selos) - num(a.selos),
            r = num(x.resgates);
          if (a.premio) {
            s += c.meta;
            r = Math.max(0, r - 1);
          }
          return st.upd("clientes", a.cli, {
            selos: Math.max(0, Math.min(c.meta, s)),
            resgates: r,
          });
        });
      if (a.ag && get("agenda", a.ag)) await st.upd("agenda", a.ag, { st: "marcado" });
      if (a.ret && get("agenda", a.ret)) await st.del("agenda", a.ret);
      await st.del("atendimentos", id);
      toast("Atendimento desfeito: estoque e cartão voltaram ao que eram.");
    } catch (e) {
      falha(e);
    }
  }
  function shAt(id) {
    return () => {
      const a = get("atendimentos", id);
      if (!a) return gone();
      return `<header class="shh"><h2>${h(a.nome || "Venda de balcão")}</h2>${xBtn}</header><p class="sub">${h(longDia(dTs(a.ts)))} · ${h(hhmm(a.ts))} · ${h(a.pag || "")}</p>
<ul class="its ro">${(a.itens || []).map((i) => `<li><span class="rm"><b>${num(i.q) > 1 ? num(i.q) + "× " : ""}${h(i.nome)}</b>${i.t === "p" ? "<small>" + h([i.det, i.lote ? "lote " + i.lote : ""].filter(Boolean).join(" · ")) + "</small>" : ""}</span><span class="v">${h(brl(num(i.q) * num(i.v)))}</span></li>`).join("")}</ul>
<dl class="tot">${num(a.pdesc) ? `<div><dt>Prêmio do cartão</dt><dd>− ${h(brl(a.pdesc))}</dd></div>` : ""}${num(a.desc) ? `<div><dt>Desconto</dt><dd>− ${h(brl(a.desc))}</dd></div>` : ""}<div class="big"><dt>Total</dt><dd>${h(brl(a.total))}</dd></div></dl>
${
  (a.kit || []).length
    ? '<h3>Materiais usados</h3><ul class="kl">' +
      a.kit
        .map((k) => {
          const m = get("materiais", k.m);
          return (
            "<li>" +
            h(num(k.q)) +
            "× " +
            h(m ? m.nome : "Material removido") +
            (k.lote ? " · lote " + h(k.lote) : "") +
            "</li>"
          );
        })
        .join("") +
      "</ul>"
    : ""
}
<p class="sub">${num(a.selos) ? "+" + h(a.selos) + " selo no cartão" : "Sem selo"}${a.premio ? " · prêmio do cartão usado" : ""}${a.obs ? " · " + h(a.obs) : ""}</p>
<div class="foot"><button type="button" class="btn ghost danger w" data-act="delAt" data-id="${h(id)}">Excluir e devolver ao estoque</button></div>`;
    };
  }

  /* Agenda */
  function novoAg(pre) {
    pre = pre || {};
    const a = pre.id ? get("agenda", pre.id) : null;
    F = {
      k: "ag",
      id: a ? a.id : "",
      cli: a ? a.cli : pre.cli || "",
      novo: null,
      avulso: false,
      q: "",
    };
    openSh(
      "form",
      () => `<form class="fm" data-form="ag"><header class="shh"><h2>${a ? "Editar horário" : "Agendar"}</h2>${xBtn}</header>
<fieldset><legend>Cliente</legend><div id="pk">${pickHTML()}</div></fieldset>
<div class="g2"><label>Dia<input name="dia" type="date" required value="${h(a ? a.dia : U.tab === "hoje" && U.dia ? U.dia : hoje())}"></label><label>Horário<input name="hora" type="time" value="${h(a ? a.hora : "")}"></label></div>
<label>Serviço<select name="serv"><option value="">Sem serviço definido</option>${[...S.servicos]
        .sort(byNome)
        .map(
          (s) =>
            `<option value="${h(s.id)}"${a && a.serv === s.id ? " selected" : ""}>${h(s.nome)} · ${h(brl(s.preco))}</option>`,
        )
        .join("")}</select></label>
<label>Observação<input name="obs" value="${h(a ? a.obs || "" : "")}" placeholder="Ex.: vem com a mãe"></label>
<button type="submit" class="btn pri wide w">${a ? "Salvar" : "Agendar"}</button></form>`,
      pre.push,
    );
  }
  function shAg(id) {
    return () => {
      const a = get("agenda", id);
      if (!a) return gone();
      const cl = get("clientes", a.cli),
        sv = get("servicos", a.serv);
      return `<header class="shh"><h2>${h(cl ? cl.nome : a.nome || "Cliente")}</h2>${xBtn}</header><p class="sub">${h(longDia(a.dia))}${a.hora ? " · " + h(a.hora) : " · horário a combinar"}${sv ? " · " + h(sv.nome) : ""}${a.st === "feito" ? " · atendido" : a.st === "faltou" ? " · faltou" : ""}</p>${a.obs ? '<p class="callout">' + h(a.obs) + "</p>" : ""}
<div class="cacts">${a.st === "marcado" ? `<button type="button" class="btn pri w" data-act="atenderAg" data-id="${h(id)}">Atender</button>` : ""}<button type="button" class="btn w" data-act="editAg" data-id="${h(id)}">Editar</button>${a.st === "feito" ? "" : `<button type="button" class="btn w" data-act="falta" data-id="${h(id)}">${a.st === "faltou" ? "Desfazer falta" : "Marcar falta"}</button>`}${cl ? `<button type="button" class="btn" data-act="verCli" data-id="${h(cl.id)}" data-push="1">Ver cadastro</button>` : ""}<button type="button" class="btn ghost danger w" data-act="delAg" data-id="${h(id)}">Excluir</button></div>`;
    };
  }

  /* Caixa */
  function dayTot(mk, at) {
    const p = mk.split("-").map(Number),
      n = new Date(p[0], p[1], 0).getDate(),
      D = Array.from({ length: n }, (_, i) => ({ d: mk + "-" + pad(i + 1), v: 0 }));
    at.forEach((a) => {
      const i = Number(dTs(a.ts).slice(8)) - 1;
      if (D[i]) D[i].v += num(a.total);
    });
    return D;
  }
  const niceMax = (v) => {
    if (v <= 0) return 100;
    const p = 10 ** Math.floor(Math.log10(v)),
      n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  };
  function drawChart() {
    const f = $("#chart");
    if (!f) return;
    const W = f.clientWidth,
      H = f.clientHeight;
    if (!W || !H) return;
    const mk = U.mes || hoje().slice(0, 7),
      D = dayTot(
        mk,
        S.atendimentos.filter((a) => mTs(a.ts) === mk),
      ),
      top = niceMax(Math.max(0, ...D.map((x) => x.v)));
    const ml = 4,
      mr = 4,
      mt = 24,
      mb = 26,
      cw = (W - ml - mr) / D.length,
      bw = Math.max(3, Math.min(22, cw * 0.62)),
      y = (v) => mt + (H - mt - mb) * (1 - v / top),
      hj = hoje(),
      step = W < 520 ? 10 : 5;
    let s =
      '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Entradas por dia do mês">';
    [0, 0.5, 1].forEach((r) => {
      const yy = y(top * r).toFixed(1);
      s +=
        '<line class="gl" x1="' + ml + '" x2="' + (W - mr) + '" y1="' + yy + '" y2="' + yy + '"/>';
      if (r)
        s += '<text class="tk" x="' + ml + '" y="' + (yy - 6) + '">' + h(brl0(top * r)) + "</text>";
    });
    D.forEach((x, i) => {
      const cx = ml + cw * i + cw / 2;
      if (x.v > 0)
        s +=
          '<rect class="bar' +
          (x.d === hj ? " hj" : "") +
          '" x="' +
          (cx - bw / 2).toFixed(1) +
          '" y="' +
          y(x.v).toFixed(1) +
          '" width="' +
          bw.toFixed(1) +
          '" height="' +
          Math.max(1, y(0) - y(x.v)).toFixed(1) +
          '" rx="' +
          Math.min(4, bw / 2).toFixed(1) +
          '"><title>' +
          h(ddmm(x.d) + ": " + brl(x.v)) +
          "</title></rect>";
      const dn = i + 1;
      if (dn === 1 || dn % step === 0)
        s +=
          '<text class="tk" text-anchor="middle" x="' +
          cx.toFixed(1) +
          '" y="' +
          (H - 6) +
          '">' +
          dn +
          "</text>";
    });
    f.innerHTML = s + "</svg>";
  }
  V.caixa = () => {
    const hm = hoje().slice(0, 7),
      mk = U.mes || hm,
      cur = mk === hm,
      at = S.atendimentos.filter((a) => mTs(a.ts) === mk),
      dp = S.despesas.filter((d) => mTs(d.ts) === mk);
    const ent = at.reduce((s, a) => s + num(a.total), 0),
      sai = dp.reduce((s, d) => s + num(d.valor), 0),
      n = at.filter((a) => num(a.total) > 0).length;
    const pk = addM(mk, -1),
      lim = cur ? Number(hoje().slice(8)) : 31,
      prev = S.atendimentos
        .filter((a) => mTs(a.ts) === pk && Number(dTs(a.ts).slice(8)) <= lim)
        .reduce((s, a) => s + num(a.total), 0),
      vr = prev > 0 ? Math.round(((ent - prev) / prev) * 100) : null;
    const pm = PAGS.map((p) => [
        p,
        at.filter((a) => a.pag === p).reduce((s, a) => s + num(a.total), 0),
      ]),
      pmax = Math.max(1, ...pm.map((x) => x[1]));
    const tp = {};
    at.forEach((a) =>
      (a.itens || []).forEach((i) => {
        const o = tp[i.nome] || (tp[i.nome] = { n: i.nome, q: 0, v: 0 });
        o.q += num(i.q);
        o.v += num(i.q) * num(i.v);
      }),
    );
    const top = Object.values(tp)
      .sort((a, b) => b.q - a.q || b.v - a.v)
      .slice(0, 5);
    const D = dayTot(mk, at),
      best = D.reduce((b, x) => (x.v > (b ? b.v : 0) ? x : b), null);
    const L = [
      ...at.map((a) => ({
        ts: a.ts,
        k: "verAt",
        id: a.id,
        t: a.nome || "Venda de balcão",
        s: itensTxt(a) + " · " + (a.pag || ""),
        v: num(a.total),
      })),
      ...dp.map((d) => ({
        ts: d.ts,
        k: "verDesp",
        id: d.id,
        t: d.desc,
        s: d.cat || "Despesa",
        v: -num(d.valor),
      })),
    ].sort((a, b) => b.ts - a.ts);
    return `<section class="head"><div><h1>Caixa</h1><p class="sub">${h(mesNome(mk))}${vr != null ? " · entradas " + (vr >= 0 ? "+" : "") + vr + "% sobre " + h(mesCurto(pk)) + (cur ? " no mesmo período" : "") : ""}</p></div>
<div class="dnav"><button type="button" class="ico" data-act="mes" data-d="-1" aria-label="Mês anterior">${ic("left")}</button><button type="button" class="btn sm${cur ? " on" : ""}" data-act="mes" data-d="0">Este mês</button><button type="button" class="ico" data-act="mes" data-d="1" aria-label="Próximo mês">${ic("right")}</button><button type="button" class="btn pri w" data-act="novaDesp">${ic("plus")}Despesa</button></div></section>
<div class="figs"><div><b>${brl0(ent)}</b><span>entradas · ${h(pl(n, "atendimento", "atendimentos"))}</span></div><div><b>${brl0(sai)}</b><span>saídas · ${h(pl(dp.length, "despesa", "despesas"))}</span></div><div><b class="${ent - sai < 0 ? "bad" : ""}">${brl0(ent - sai)}</b><span>saldo do mês</span></div><div><b>${brl0(n ? ent / n : 0)}</b><span>ticket médio</span></div></div>
<div class="cols"><div class="side"><section class="panel"><h2>${best ? "Melhor dia: " + h(ddmm(best.d)) + ", " + h(brl0(best.v)) : "Sem entradas neste mês"}</h2><p class="sub">Entradas por dia${cur ? "; hoje em destaque" : ""}</p><div class="fig" id="chart"></div></section>
<section class="panel"><div class="ph"><h2>Lançamentos</h2><button type="button" class="btn sm" data-act="csvCx">${ic("down")}Planilha</button></div>${L.length ? '<ul class="ledger">' + L.map((r) => `<li><button type="button" class="lrow" data-act="${r.k}" data-id="${h(r.id)}"><span class="d">${h(ddmm(dTs(r.ts)))}</span><span class="rm"><b>${h(r.t)}</b><small>${h(r.s)}</small></span><span class="v${r.v < 0 ? " neg" : ""}">${r.v < 0 ? "− " : ""}${h(brl(Math.abs(r.v)))}</span></button></li>`).join("") + "</ul>" : vazio("Sem lançamentos", "Os atendimentos e as despesas do mês aparecem aqui.")}</section></div>
<div class="side sticky"><section class="panel"><h2>Formas de pagamento</h2><div class="bars">${pm.map(([p, v]) => `<div class="br"><span>${p}</span><span class="track"><i style="width:${((v / pmax) * 100).toFixed(1)}%"></i></span><b>${h(brl0(v))}</b></div>`).join("")}</div></section>
<section class="panel"><h2>Mais pedidos</h2>${top.length ? '<ol class="rank">' + top.map((x) => `<li><span class="rm"><b>${h(x.n)}</b><small>${h(pl(x.q, "vez", "vezes"))}</small></span><b class="nw">${h(brl0(x.v))}</b></li>`).join("") + "</ol>" : '<p class="sub">Nada vendido neste mês.</p>'}</section></div></div>`;
  };
  function fDesp() {
    F = { k: "dp" };
    openSh(
      "form",
      () => `<form class="fm" data-form="dp"><header class="shh"><h2>Nova despesa</h2>${xBtn}</header>
<label>Descrição<input name="desc" required autofocus autocomplete="off" placeholder="Ex.: aluguel, conta de luz, compra de joias"></label>
<div class="g2"><label>Valor (R$)<input name="valor" type="number" min="0" step="0.01" inputmode="decimal" required></label><label>Data<input name="dia" type="date" value="${h(hoje())}"></label></div>
<label>Categoria<select name="cat">${DCATS.map((c) => "<option>" + c + "</option>").join("")}</select></label>
<button type="submit" class="btn pri wide w">Lançar despesa</button></form>`,
    );
  }

  /* Ajustes */
  V.ajustes = () => {
    const c = cfg(),
      ex = COLS.filter((k) => k !== "config").reduce(
        (s, k) => s + S[k].filter((x) => x.ex).length,
        0,
      );
    return `<section class="head"><div><h1>Ajustes</h1><p class="sub">Estúdio, regra do cartão, serviços e dados</p></div></section>
<div class="cols"><form class="panel fm" data-form="cfg"><h2>Estúdio</h2>
<label>Nome<input name="nome" required value="${h(c.nome)}"></label><label>Subtítulo<input name="sub" value="${h(c.sub)}" placeholder="Ex.: Piercing"></label>
<div class="g2 st"><label>WhatsApp do estúdio<input name="zap" inputmode="tel" value="${h(tel(c.zap))}" placeholder="(12) 99999-9999"></label><label>Instagram<input name="insta" value="${h(c.insta)}" placeholder="@estudio"></label></div>
<h2>Cartão fidelidade</h2>
<div class="g2 st"><label>Selos para o prêmio<input name="meta" type="number" min="3" max="20" step="1" value="${h(c.meta)}"></label><label>Como ganha selo<select name="modo"><option value="atend"${c.modo !== "valor" ? " selected" : ""}>1 por atendimento</option><option value="valor"${c.modo === "valor" ? " selected" : ""}>1 a cada valor gasto</option></select></label></div>
<div class="g2 st"><label>Valor por selo (R$), se for por valor<input name="porValor" type="number" min="1" step="1" value="${h(num(c.porValor))}"></label><label>Prêmio<input name="premio" value="${h(c.premio)}"></label></div>
<button type="submit" class="btn pri wide w">Salvar ajustes</button></form>
<div class="side"><section class="panel"><div class="ph"><h2>Serviços</h2><button type="button" class="btn sm w" data-act="novoServ">${ic("plus")}Serviço</button></div>
<ul class="list">${
      [...S.servicos]
        .sort(byNome)
        .map(
          (s) =>
            `<li><button type="button" class="row" data-act="editServ" data-id="${h(s.id)}"><span class="rm"><b>${h(s.nome)}</b><small>${s.kit && s.kit.length ? "Usa: " + h(kitTxt(s.kit)) : "Não mexe no estoque"}${num(s.ret) ? " · retorno em " + num(s.ret) + " dias" : ""}</small></span><b class="nw">${h(brl(s.preco))}</b></button></li>`,
        )
        .join("") ||
      "<li>" +
        vazio("Nenhum serviço", "Cadastre os serviços e o que cada um gasta do estoque.") +
        "</li>"
    }</ul></section>
<section class="panel"><h2>Dados</h2><p class="sub">${local ? "Tudo fica salvo neste navegador, só neste aparelho. Limpar os dados do navegador apaga tudo, então baixe a cópia de segurança de vez em quando." : "Tudo fica salvo no próprio app. Quem tem acesso de edição vê e altera; quem só visualiza não vê os dados das clientes."}</p>
<div class="cacts"><button type="button" class="btn" data-act="backup">${ic("down")}Baixar cópia de segurança</button></div>
${ex ? `<p class="sub">Ainda há ${h(pl(ex, "registro de exemplo", "registros de exemplo"))} no app. Quando for usar de verdade, apague:</p><div class="cacts"><button type="button" class="btn ghost danger w" data-act="limpaEx" data-k="mov">Apagar clientes, agenda e caixa de exemplo</button><button type="button" class="btn ghost danger w" data-act="limpaEx" data-k="cat">Apagar serviços e materiais de exemplo</button></div>` : ""}</section></div></div>`;
  };
  function fServ(id) {
    const s = id ? get("servicos", id) : null;
    F = {
      k: "sv",
      id: id || "",
      kit: s && s.kit ? s.kit.map((k) => ({ m: k.m, q: num(k.q) || 1 })) : [],
    };
    openSh(
      "form",
      () => `<form class="fm" data-form="sv"><header class="shh"><h2>${s ? "Editar serviço" : "Novo serviço"}</h2>${xBtn}</header>
<label>Nome<input name="nome" required autofocus autocomplete="off" value="${h(s ? s.nome : "")}" placeholder="Ex.: Helix"></label>
<div class="g2"><label>Preço da aplicação (R$)<input name="preco" type="number" min="0" step="0.01" inputmode="decimal" value="${h(s ? num(s.preco) : "")}"></label><label>Retorno para troca (dias)<input name="ret" type="number" min="0" step="1" value="${h(s ? num(s.ret) : 0)}"></label></div>
<fieldset><legend>Sai do estoque a cada aplicação</legend><div id="kitR" class="fm">${kitRows()}</div><div><button type="button" class="btn sm" data-act="kitAdd">${ic("plus")}Material</button></div></fieldset>
<div class="row2"><button type="submit" class="btn pri wide w">${s ? "Salvar" : "Cadastrar serviço"}</button>${s ? `<button type="button" class="btn ghost danger w" data-act="delServ" data-id="${h(id)}">Excluir serviço</button>` : ""}</div></form>`,
    );
  }
  function kitRows() {
    const M = [...S.materiais].sort(byNome);
    return (
      F.kit
        .map(
          (k, i) =>
            `<div class="kr"><select data-kit="m" aria-label="Material"><option value="">Escolher material…</option>${M.map((m) => `<option value="${h(m.id)}"${k.m === m.id ? " selected" : ""}>${h(m.nome)}</option>`).join("")}</select><input data-kit="q" type="number" min="1" step="1" value="${h(num(k.q) || 1)}" aria-label="Quantidade"><button type="button" class="ico" data-act="kitDel" data-i="${i}" aria-label="Remover material">${ic("x")}</button></div>`,
        )
        .join("") || '<p class="sub">Nenhum material: este serviço não mexe no estoque.</p>'
    );
  }
  function readKit() {
    F.kit = [...document.querySelectorAll("#kitR .kr")].map((r) => ({
      m: r.querySelector("[data-kit=m]").value,
      q: Math.max(1, Math.round(num(r.querySelector("[data-kit=q]").value))),
    }));
  }
  async function limpaEx(k) {
    const cols =
      k === "cat"
        ? ["servicos", "materiais"]
        : ["atendimentos", "agenda", "despesas", "movs", "clientes"];
    const L = [];
    cols.forEach((c) =>
      S[c].forEach((x) => {
        if (x.ex) L.push([c, x.id]);
      }),
    );
    if (!L.length) return;
    if (
      !(await ask(
        k === "cat"
          ? "Apagar " +
              L.length +
              " serviços e materiais de exemplo? O que vocês cadastraram continua."
          : "Apagar " +
              L.length +
              " registros de exemplo (clientes, agenda, atendimentos e despesas)? O que vocês cadastraram continua.",
        "Apagar",
      ))
    )
      return;
    let i = 0;
    try {
      for (const [c, id] of L) {
        await st.del(c, id);
        i++;
        if (i % 10 === 0) toast("Apagando… " + i + " de " + L.length);
        await sleep(70);
      }
      toast("Exemplos apagados.");
    } catch (e) {
      falha(e);
    }
  }
  const csvCel = (v) => {
    const s = typeof v === "number" ? String(v).replace(".", ",") : String(v ?? "");
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const csv = (rows) => "﻿" + rows.map((r) => r.map(csvCel).join(";")).join("\r\n");

  /* ---------- ações dos botões (data-act) ---------- */
  const A = {
    dia: (d) => {
      U.dia = d.d === "0" ? hoje() : addD(U.dia || hoje(), Number(d.d));
      paint();
    },
    mes: (d) => {
      U.mes = d.d === "0" ? hoje().slice(0, 7) : addM(U.mes || hoje().slice(0, 7), Number(d.d));
      paint();
    },
    cat: (d) => {
      U.cat = d.k;
      paint();
    },
    irRepor: () => {
      U.cat = "Repor";
      location.hash = "materiais";
    },
    fechar: () => closeSh(),
    novoAt: (d) => novoAt({ cli: d.cli || "", push: !!SH }),
    atenderAg: (d) => {
      const a = get("agenda", d.id);
      if (a) novoAt({ cli: a.cli, serv: a.serv, ag: a.id, push: !!SH });
    },
    agMais: (d) => openSh("view", shAg(d.id)),
    editAg: (d) => novoAg({ id: d.id, push: true }),
    falta: async (d) => {
      const a = get("agenda", d.id);
      if (!a) return;
      try {
        await st.upd("agenda", a.id, { st: a.st === "faltou" ? "marcado" : "faltou" });
      } catch (e) {
        falha(e);
      }
    },
    delAg: async (d) => {
      if (!(await ask("Excluir este horário da agenda?", "Excluir"))) return;
      try {
        await st.del("agenda", d.id);
        closeSh(true);
        toast("Horário excluído");
      } catch (e) {
        falha(e);
      }
    },
    novoAg: (d) => novoAg({ cli: d.cli || "", push: !!SH }),
    novoCli: () => fCli(""),
    verCli: (d) => openSh("view", shCli(d.id), !!d.push),
    editCli: (d) => fCli(d.id, true),
    delCli: async (d) => {
      const x = get("clientes", d.id);
      if (
        !x ||
        !(await ask(
          "Excluir o cadastro de " + x.nome + "? Os atendimentos dela continuam no caixa.",
          "Excluir",
        ))
      )
        return;
      try {
        await st.del("clientes", x.id);
        closeSh(true);
        toast("Cadastro excluído");
      } catch (e) {
        falha(e);
      }
    },
    selo: (d) => selo(d.id, Number(d.d)),
    resgatar: (d) => resgatar(d.id),
    png: (d) => cardPNG(d.id),
    fidSel: (d) => {
      U.fid = d.id;
      paint();
      const c = $(".fcard");
      if (c && c.getBoundingClientRect().top < 0)
        c.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    verMat: (d) => openSh("view", shMat(d.id)),
    novoMat: () => fMat(""),
    editMat: (d) => fMat(d.id, true),
    delMat: async (d) => {
      const m = get("materiais", d.id);
      if (
        !m ||
        !(await ask(
          "Excluir " +
            m.nome +
            " do estoque? Os serviços que usam este material deixam de descontá-lo.",
          "Excluir",
        ))
      )
        return;
      try {
        await st.del("materiais", m.id);
        closeSh(true);
        toast("Material excluído");
      } catch (e) {
        falha(e);
      }
    },
    entrada: (d) => fEntrada(d.id),
    baixa: (d) => fBaixa(d.id),
    adj: (d) => adj(d.id, Number(d.d)),
    novaDesp: () => fDesp(),
    verAt: (d) => openSh("view", shAt(d.id), !!SH),
    delAt: async (d) => {
      if (
        !(await ask(
          "Excluir este atendimento? O estoque e os selos voltam a ser como antes.",
          "Excluir",
        ))
      )
        return;
      closeSh();
      await estornar(d.id);
    },
    verDesp: async (d) => {
      const x = get("despesas", d.id);
      if (
        !x ||
        !(await ask('Excluir a despesa "' + x.desc + '" de ' + brl(x.valor) + "?", "Excluir"))
      )
        return;
      try {
        await st.del("despesas", x.id);
        toast("Despesa excluída");
      } catch (e) {
        falha(e);
      }
    },
    novoServ: () => fServ(""),
    editServ: (d) => fServ(d.id),
    delServ: async (d) => {
      const s = get("servicos", d.id);
      if (!s || !(await ask("Excluir o serviço " + s.nome + "?", "Excluir"))) return;
      try {
        await st.del("servicos", s.id);
        closeSh(true);
        toast("Serviço excluído");
      } catch (e) {
        falha(e);
      }
    },
    kitAdd: () => {
      readKit();
      F.kit.push({ m: "", q: 1 });
      $("#kitR").innerHTML = kitRows();
    },
    kitDel: (d) => {
      readKit();
      F.kit.splice(Number(d.i), 1);
      $("#kitR").innerHTML = kitRows();
    },
    atDel: (d) => {
      F.itens.splice(Number(d.i), 1);
      reAt();
    },
    pk: (d) => {
      F.cli = d.id;
      F.novo = null;
      F.avulso = false;
      F.premio = false;
      rePk();
    },
    pkClear: () => {
      F.cli = "";
      F.novo = null;
      F.avulso = false;
      F.premio = false;
      F.q = "";
      rePk();
      const q = $("#pkQ");
      if (q && matchMedia("(hover:hover)").matches) q.focus();
    },
    pkNovo: () => {
      F.novo = { nome: F.q.trim(), tel: "" };
      rePk();
      const n = $("#pkNome");
      if (n) n.focus();
    },
    pkAvulso: () => {
      F.avulso = true;
      rePk();
    },
    csvMat: () =>
      baixar(
        "estoque-" + hoje() + ".csv",
        csv([
          [
            "Nome",
            "Categoria",
            "Detalhe",
            "Quantidade",
            "Unidade",
            "Mínimo",
            "Custo",
            "Venda",
            "Lote",
            "Validade",
            "Fornecedor",
          ],
          ...[...S.materiais]
            .sort(byNome)
            .map((m) => [
              m.nome,
              m.cat,
              m.det || "",
              num(m.qtd),
              m.un || "un",
              num(m.min),
              num(m.custo),
              num(m.preco),
              m.lote || "",
              m.val ? ddmm(m.val) + "/" + String(m.val).slice(0, 4) : "",
              m.forn || "",
            ]),
        ]),
      ),
    csvCx: () => {
      const mk = U.mes || hoje().slice(0, 7);
      const r = [
        ...S.atendimentos
          .filter((a) => mTs(a.ts) === mk)
          .map((a) => [
            a.ts,
            "Entrada",
            (a.nome || "Venda de balcão") + ": " + itensTxt(a),
            a.pag || "",
            num(a.total),
          ]),
        ...S.despesas
          .filter((x) => mTs(x.ts) === mk)
          .map((x) => [x.ts, "Saída", x.desc, x.cat || "", -num(x.valor)]),
      ]
        .sort((a, b) => a[0] - b[0])
        .map((x) => [ddmm(dTs(x[0])) + "/" + mk.slice(0, 4), ...x.slice(1)]);
      baixar(
        "caixa-" + mk + ".csv",
        csv([["Data", "Tipo", "Descrição", "Pagamento ou categoria", "Valor"], ...r]),
      );
    },
    backup: () =>
      baixar(
        "michelle-farias-plano-b-" + hoje() + ".json",
        JSON.stringify(
          {
            app: "Michelle Farias Plano B",
            em: new Date().toISOString(),
            dados: Object.fromEntries(COLS.map((c) => [c, S[c]])),
          },
          null,
          1,
        ),
      ),
    limpaEx: (d) => limpaEx(d.k),
  };

  /* ---------- formulários (data-form) ---------- */
  const FORMS = {
    async at(f) {
      const t = tots(),
        c = cfg();
      if (!F.itens.length) return toast("Adicione um serviço ou produto.");
      if (!F.cli && !F.avulso && !F.novo)
        return toast("Escolha a cliente ou marque venda de balcão.");
      if (F.novo && !F.novo.nome.trim()) return toast("Escreva o nome da nova cliente.");
      busy(f);
      const G = F;
      try {
        const ts = Date.now();
        let cli = G.cli,
          nome = "Venda de balcão";
        if (G.novo) {
          nome = G.novo.nome.trim();
          cli = await add("clientes", {
            nome,
            tel: String(G.novo.tel || "").replace(/\D/g, ""),
            nasc: "",
            resp: "",
            obs: "",
            selos: 0,
            resgates: 0,
            desde: ts,
          });
        } else if (cli) nome = (get("clientes", cli) || {}).nome || "";
        const kit = [];
        G.itens
          .filter((i) => i.t === "s")
          .forEach((i) => {
            const sv = get("servicos", i.ref);
            ((sv && sv.kit) || []).forEach((k) => {
              const m = get("materiais", k.m);
              if (m) kit.push({ m: k.m, q: num(k.q) * i.q, lote: m.lote || "" });
            });
          });
        const rOn = !!cli && t.retD > 0 && (G.ret === null ? true : G.ret),
          retId = rOn ? st.nid("agenda") : "",
          sv1 = G.itens.find((i) => i.t === "s");
        const doc = {
          ts,
          cli: cli || "",
          nome,
          itens: G.itens.map((i) => ({ ...i })),
          kit,
          desc: t.ds,
          pdesc: t.pd,
          premio: t.pd > 0,
          total: t.total,
          pag: G.pag,
          selos: t.ganha,
          obs: G.obs.trim(),
          ag: G.ag || "",
          ret: retId,
        };
        const id = await add("atendimentos", doc);
        for (const [m, q] of usoDe(doc))
          await seq("m:" + m, () => {
            const mm = get("materiais", m);
            return mm ? st.upd("materiais", m, { qtd: num(mm.qtd) - q }) : 0;
          });
        if (cli)
          await seq("c:" + cli, () => {
            const x = get("clientes", cli) || { selos: 0, resgates: 0 };
            let s = num(x.selos) + t.ganha,
              r = num(x.resgates);
            if (t.pd) {
              s = Math.max(0, s - c.meta);
              r++;
            }
            return st.upd("clientes", cli, { selos: Math.min(c.meta, s), resgates: r });
          });
        if (G.ag && get("agenda", G.ag)) await st.upd("agenda", G.ag, { st: "feito" });
        if (retId) {
          const tr = S.servicos.find((s) => /troca/i.test(s.nome || ""));
          await st.set("agenda", retId, {
            dia: addD(hoje(), t.retD),
            hora: "",
            cli,
            nome,
            serv: tr ? tr.id : "",
            obs: "Retorno · troca de haste" + (sv1 ? " do " + sv1.nome.toLowerCase() : ""),
            st: "marcado",
          });
        }
        closeSh();
        toast(
          "Atendimento salvo · " + brl(t.total) + (t.ganha ? " · +" + t.ganha + " selo" : ""),
          () => estornar(id, doc),
        );
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async ag(f, fd) {
      if (!F.cli && !F.novo) return toast("Escolha a cliente.");
      if (F.novo && !F.novo.nome.trim()) return toast("Escreva o nome da nova cliente.");
      busy(f);
      const G = F;
      try {
        let cli = G.cli,
          nome = (get("clientes", cli) || {}).nome || "";
        if (G.novo) {
          nome = G.novo.nome.trim();
          cli = await add("clientes", {
            nome,
            tel: String(G.novo.tel || "").replace(/\D/g, ""),
            nasc: "",
            resp: "",
            obs: "",
            selos: 0,
            resgates: 0,
            desde: Date.now(),
          });
        }
        const d = {
          dia: String(fd.get("dia") || hoje()),
          hora: String(fd.get("hora") || ""),
          cli,
          nome,
          serv: String(fd.get("serv") || ""),
          obs: String(fd.get("obs") || "").trim(),
        };
        if (G.id) await st.upd("agenda", G.id, d);
        else await add("agenda", { ...d, st: "marcado" });
        if (U.tab === "hoje") U.dia = d.dia;
        closeSh();
        toast(
          G.id
            ? "Horário atualizado"
            : "Marcado para " + ddmm(d.dia) + (d.hora ? " às " + d.hora : ""),
        );
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async cli(f, fd) {
      const nome = String(fd.get("nome") || "").trim();
      if (!nome) return toast("Escreva o nome.");
      const d = {
          nome,
          tel: String(fd.get("tel") || "").replace(/\D/g, ""),
          nasc: String(fd.get("nasc") || ""),
          resp: String(fd.get("resp") || "").trim(),
          obs: String(fd.get("obs") || "").trim(),
        },
        id = F.id;
      busy(f);
      try {
        if (id) {
          await st.upd("clientes", id, d);
          closeSh();
          toast("Cadastro atualizado");
        } else {
          const nid = await add("clientes", {
            ...d,
            selos: Math.min(cfg().meta, Math.max(0, Math.round(num(fd.get("selos"))))),
            resgates: 0,
            desde: Date.now(),
          });
          closeSh();
          openSh("view", shCli(nid));
          toast("Cadastro criado");
        }
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async mat(f, fd) {
      const g = (k) => String(fd.get(k) || "").trim(),
        id = F.id;
      const d = {
        nome: g("nome"),
        cat: g("cat"),
        un: g("un"),
        det: g("det"),
        qtd: Math.round(num(g("qtd"))),
        min: Math.max(0, Math.round(num(g("min")))),
        custo: num(g("custo")),
        preco: num(g("preco")),
        lote: g("lote"),
        val: g("val"),
        forn: g("forn"),
      };
      if (!d.nome) return toast("Escreva o nome do material.");
      busy(f);
      try {
        if (id) {
          const m = get("materiais", id),
            dif = d.qtd - num(m && m.qtd);
          await seq("m:" + id, () => st.upd("materiais", id, d));
          if (dif)
            await add("movs", {
              ts: Date.now(),
              m: id,
              nome: d.nome,
              q: dif,
              tipo: "Ajuste",
              lote: d.lote,
              obs: "Correção no cadastro",
            });
          closeSh();
          toast("Material atualizado");
        } else {
          const nid = await add("materiais", d);
          if (d.qtd)
            await add("movs", {
              ts: Date.now(),
              m: nid,
              nome: d.nome,
              q: d.qtd,
              tipo: "Entrada",
              lote: d.lote,
              obs: "Cadastro inicial",
            });
          closeSh();
          toast("Material cadastrado");
        }
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async entrada(f, fd) {
      const m = get("materiais", F.id);
      if (!m) return closeSh();
      const q = Math.round(num(fd.get("q")));
      if (q <= 0) return toast("Informe a quantidade.");
      const cu = num(fd.get("custo")),
        lote = String(fd.get("lote") || "").trim(),
        val = String(fd.get("val") || ""),
        forn = String(fd.get("forn") || "").trim(),
        un = m.un || "un";
      busy(f);
      try {
        const ts = Date.now();
        await add("movs", {
          ts,
          m: m.id,
          nome: m.nome,
          q,
          tipo: "Entrada",
          lote,
          obs: forn ? "Fornecedor: " + forn : "",
        });
        await seq("m:" + m.id, () => {
          const x = get("materiais", m.id);
          return x
            ? st.upd("materiais", m.id, { qtd: num(x.qtd) + q, custo: cu, lote, val, forn })
            : 0;
        });
        if (fd.get("desp") && cu * q > 0)
          await add("despesas", {
            ts,
            desc: "Compra: " + m.nome,
            cat: "Material",
            valor: Math.round(cu * q * 100) / 100,
          });
        closeSh();
        toast("Entrada registrada: +" + q + " " + un);
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async bx(f, fd) {
      const m = get("materiais", F.id),
        q = Math.round(num(fd.get("q")));
      if (!m) return closeSh();
      if (q <= 0) return toast("Informe a quantidade.");
      busy(f);
      try {
        await add("movs", {
          ts: Date.now(),
          m: m.id,
          nome: m.nome,
          q: -q,
          tipo: String(fd.get("tipo") || "Perda"),
          lote: m.lote || "",
          obs: String(fd.get("obs") || "").trim(),
        });
        await seq("m:" + m.id, () => {
          const x = get("materiais", m.id);
          return x ? st.upd("materiais", m.id, { qtd: num(x.qtd) - q }) : 0;
        });
        closeSh();
        toast("Baixa registrada: −" + q + " " + (m.un || "un"));
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async dp(f, fd) {
      const desc = String(fd.get("desc") || "").trim(),
        valor = Math.round(num(fd.get("valor")) * 100) / 100;
      if (!desc || valor <= 0) return toast("Preencha a descrição e o valor.");
      const dia = String(fd.get("dia") || hoje()),
        ts = dia === hoje() ? Date.now() : pD(dia).getTime() + 12 * 36e5;
      busy(f);
      try {
        await add("despesas", { ts, desc, cat: String(fd.get("cat") || "Outros"), valor });
        closeSh();
        toast("Despesa lançada");
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async sv(f, fd) {
      readKit();
      const nome = String(fd.get("nome") || "").trim();
      if (!nome) return toast("Escreva o nome do serviço.");
      const d = {
          nome,
          preco: num(fd.get("preco")),
          ret: Math.max(0, Math.round(num(fd.get("ret")))),
          kit: F.kit.filter((k) => k.m),
        },
        id = F.id;
      busy(f);
      try {
        if (id) await st.upd("servicos", id, d);
        else await add("servicos", d);
        closeSh();
        toast(id ? "Serviço atualizado" : "Serviço cadastrado");
      } catch (e) {
        falha(e);
        busy(f, 0);
      }
    },
    async cfg(f, fd) {
      const g = (k) => String(fd.get(k) || "").trim();
      const d = {
        ...cfg(),
        nome: g("nome") || DEF.nome,
        sub: g("sub"),
        zap: g("zap").replace(/\D/g, ""),
        insta: g("insta"),
        meta: Math.min(20, Math.max(3, Math.round(num(g("meta"))) || 10)),
        modo: g("modo") === "valor" ? "valor" : "atend",
        porValor: Math.max(1, num(g("porValor")) || 100),
        premio: g("premio") || DEF.premio,
      };
      delete d.id;
      busy(f);
      try {
        await st.set("config", "estudio", d);
        toast("Ajustes salvos");
      } catch (e) {
        falha(e);
      }
      busy(f, 0);
    },
  };

  /* ---------- eventos: cliques, envio de formulários, troca de aba ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const fn = A[t.dataset.act];
    if (!fn) return;
    e.preventDefault();
    fn(t.dataset, t);
  });
  document.addEventListener("submit", (e) => {
    const f = e.target;
    if (!f.dataset || !f.dataset.form) return;
    e.preventDefault();
    const fn = FORMS[f.dataset.form];
    if (fn) fn(f, new FormData(f));
  });
  document.addEventListener("input", (e) => {
    const t = e.target,
      id = t.id;
    if (id === "qCli") {
      U.qCli = t.value;
      $("#cliList").innerHTML = listaCli();
      return;
    }
    if (id === "qMat") {
      U.qMat = t.value;
      $("#matList").innerHTML = listaMat();
      return;
    }
    if (id === "qFid") {
      U.qFid = t.value;
      $("#fidList").innerHTML = listaFid();
      return;
    }
    if (!F) return;
    if (id === "pkQ") {
      F.q = t.value;
      $("#pkRes").innerHTML = pkRes();
    } else if (id === "pkNome" && F.novo) {
      F.novo.nome = t.value;
      const x = $("#atTot");
      if (x) x.innerHTML = totHTML();
    } else if (id === "pkTel" && F.novo) F.novo.tel = t.value;
    else if (id === "atDesc") {
      F.desc = t.value;
      $("#atTot").innerHTML = totHTML();
    } else if (id === "atObs") F.obs = t.value;
  });
  document.addEventListener("change", (e) => {
    const t = e.target;
    if (!F || F.k !== "at") return;
    if (t.name === "pag") F.pag = t.value;
    else if (t.id === "atPremio") {
      F.premio = t.checked;
      $("#atTot").innerHTML = totHTML();
    } else if (t.id === "atRet") F.ret = t.checked;
    else if (t.id === "atServ" && t.value) {
      addServ(t.value);
      t.value = "";
      reAt();
    } else if (t.id === "atProd" && t.value) {
      addProd(t.value);
      t.value = "";
      reAt();
    }
  });
  $("#sheet").addEventListener("click", (e) => {
    if (e.target.id === "sheet") closeSh(true);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const a = $("#ask");
    if (!a.hidden) {
      a.querySelector("[data-no]").click();
      return;
    }
    if (SH) closeSh(true);
  });
  addEventListener("hashchange", () => {
    const t = location.hash.slice(1);
    U.tab = TABS.includes(t) ? t : "hoje";
    if (SH) closeSh(true);
    paint();
    scrollTo(0, 0);
  });

  /* ---------- início: abre o banco e desenha a tela ---------- */
  U.dia = hoje();
  U.mes = hoje().slice(0, 7);
  {
    const t = location.hash.slice(1);
    U.tab = TABS.includes(t) ? t : "hoje";
  }
  paint();
  (async () => {
    let d = null;
    try {
      d = window.claude && window.claude.use ? await window.claude.use("db") : null;
    } catch (e) {
      d = null;
    }
    if (!d) {
      abrirLocal();
      ready = true;
      changed();
      return;
    }
    db = d;
    try {
      const u = await window.claude.use("user");
      const w = u ? await u.can("data.write") : null;
      canW = w;
      if (w === false) setRO();
    } catch (e) {}
    COLS.forEach((c) => {
      try {
        db.collection(c).onSnapshot(
          (s) => {
            S[c] = s.docs.map((x) => ({ ...x.data(), id: x.id }));
            got.add(c);
            if (!s.metadata.fromCache) fresh.add(c);
            if (got.size === COLS.length) ready = true;
            if (fresh.size === COLS.length) {
              clearTimeout(slowT);
              if (slowNote) {
                slowNote = false;
                if (!ro) note("");
              }
            }
            changed();
          },
          (err) => {
            got.add(c);
            fresh.add(c);
            ready = true;
            note(
              err && err.code === "revoked"
                ? "O acesso a este app mudou. Recarregue a página."
                : "Parte dos dados não carregou. Recarregue mais tarde.",
            );
            changed();
          },
        );
      } catch (e) {
        console.error(e);
      }
    });
    slowT = setTimeout(() => {
      if (fresh.size < COLS.length) {
        slowNote = true;
        ready = true;
        note(
          got.size
            ? "Os dados podem estar desatualizados: o servidor ainda não respondeu."
            : "Ainda não foi possível carregar os dados. Confira a internet.",
        );
        changed();
      }
    }, 10000);
  })();
}
