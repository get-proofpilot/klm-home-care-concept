/* KLM Home Care, homepage concept */
(function () {
  "use strict";

  // This is a pitch demo: the consult form never emails the real inbox.
  var DEMO = true;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- toast ---------- */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { toastEl.classList.remove("show"); }, 2800);
  }

  /* ---------- intro: butterflies part, the logo opens up, then glides into the header ---------- */
  var root = document.documentElement;
  var intro = $("#intro");
  function heroGo() { root.classList.add("hero-go"); }
  if (!intro || root.classList.contains("intro-seen") || !intro.animate) {
    if (intro) intro.remove();
    heroGo();
  } else {
    runIntro();
  }

  function runIntro() {
    var stage = $("#intro-stage"), logo = $("#intro-logo"), tpl = $("#bfly-tpl");
    var W = innerWidth, H = innerHeight, small = W < 700;
    var cx = W / 2, cy = H / 2;
    var lw = Math.min(W * 0.8, 560), lh = lw / 2;
    var R = Math.hypot(W, H) * 0.62;
    var colors = [["#FD288D", "#FC73B1"], ["#D4096E", "#FD288D"], ["#FC73B1", "#FFD3E6"], ["#B48CF0", "#D6BCFA"], ["#FD288D", "#D6BCFA"], ["#E85AA0", "#FFC2DD"]];
    var n = small ? 16 : 26;
    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var head = function (dx, dy) { return Math.atan2(dy, dx) * 180 / Math.PI + 90; };
    var tf = function (x, y, r) { return "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + r.toFixed(1) + "deg)"; };

    for (var i = 0; i < n; i++) {
      var el = document.createElement("div");
      el.className = "bf";
      el.appendChild(tpl.content.firstElementChild.cloneNode(true));
      var c = colors[i % colors.length];
      el.style.setProperty("--a", c[0]);
      el.style.setProperty("--b", c[1]);
      el.style.setProperty("--s", (small ? rnd(40, 70) : rnd(62, 118)) + "px");
      el.style.setProperty("--fd", rnd(0.13, 0.22) + "s");
      stage.appendChild(el);

      var a0 = (i / n) * Math.PI * 2 + rnd(-0.25, 0.25);
      var sx = cx + Math.cos(a0) * R, sy = cy + Math.sin(a0) * R;
      var hx = cx + rnd(-0.5, 0.5) * lw, hy = cy + rnd(-0.38, 0.5) * lh;
      // the midpoint swings off the straight line, so nobody flies like a dart
      var mx = (sx + hx) / 2 + rnd(-90, 90), my = (sy + hy) / 2 + rnd(-90, 90);
      var h2x = hx + rnd(-14, 14), h2y = hy + rnd(-10, 6);
      var oa = Math.atan2(hy - cy, hx - cx) + rnd(-0.5, 0.5) - 0.35;
      var ex = cx + Math.cos(oa) * R * 1.05, ey = cy + Math.sin(oa) * R * 1.05;
      var qx = (h2x + ex) / 2 + rnd(-70, 70), qy = (h2y + ey) / 2 + rnd(-70, 70);

      el.animate([
        { offset: 0, transform: tf(sx, sy, head(mx - sx, my - sy)) },
        { offset: 0.2, transform: tf(mx, my, head(hx - mx, hy - my)), easing: "cubic-bezier(.3,.7,.4,1)" },
        { offset: 0.4, transform: tf(hx, hy, rnd(-20, 20)) },
        { offset: 0.5, transform: tf(h2x, h2y, rnd(-20, 20)), easing: "cubic-bezier(.5,0,.8,.6)" },
        { offset: 0.74, transform: tf(qx, qy, head(qx - h2x, qy - h2y)) },
        { offset: 1, transform: tf(ex, ey, head(ex - qx, ey - qy)) }
      ], { duration: 2400, delay: rnd(0, 140), fill: "both" });
    }

    var done = false;
    function end(fast) {
      if (done) return;
      done = true;
      try { sessionStorage.setItem("klm_intro", "1"); } catch (e) {}
      var target = $(".site-head .brand img");
      intro.classList.add("out");
      if (target && !fast) {
        // hand the logo to the header: animate from where it sits to the header's logo box
        var from = logo.getBoundingClientRect(), to = target.getBoundingClientRect();
        target.style.visibility = "hidden";
        logo.style.animation = "none";
        logo.style.opacity = "1";
        logo.style.clipPath = "none";
        logo.style.left = from.left + "px";
        logo.style.top = from.top + "px";
        logo.style.width = from.width + "px";
        logo.style.transform = "none";
        logo.animate([
          { transform: "translate(0,0) scale(1)" },
          { transform: "translate(" + (to.left - from.left) + "px," + (to.top - from.top) + "px) scale(" + (to.width / from.width) + ")" }
        ], { duration: 780, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" });
        setTimeout(heroGo, 320);
        setTimeout(function () { target.style.visibility = ""; intro.remove(); }, 820);
      } else {
        heroGo();
        intro.style.transition = "opacity .35s";
        intro.style.opacity = "0";
        setTimeout(function () { intro.remove(); }, 380);
      }
    }
    setTimeout(function () { end(false); }, 2500);
    $(".intro-skip", intro).addEventListener("click", function () { end(true); });
    addEventListener("keydown", function () { end(true); }, { once: true });
  }

  /* ---------- hero video: the right size for the screen, paused when out of view ---------- */
  var vid = $("#hero-video");
  if (vid && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    vid.src = innerWidth < 760 ? vid.dataset.srcSm : vid.dataset.srcLg;
    vid.addEventListener("playing", function () { vid.classList.add("ready"); }, { once: true });
    var tryPlay = function () { var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) tryPlay(); else vid.pause();
      }).observe(vid);
    }
  }

  /* ---------- header ---------- */
  var head = $(".site-head");
  var mbar = $(".mbar");
  var hero = $(".hero");
  function onScroll() {
    var y = window.scrollY;
    head.classList.toggle("scrolled", y > 8);
    if (mbar && hero) mbar.classList.toggle("show", y > hero.offsetHeight * 0.6);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = $(".menu-btn"), mnav = $("#mnav");
  mnav.hidden = true;
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    menuBtn.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    mnav.hidden = open;
  });
  $$("a", mnav).forEach(function (a) {
    a.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", "false"); mnav.hidden = true; });
  });

  // highlight the nav item for the section in view
  var navLinks = $$(".nav a");
  if ("IntersectionObserver" in window) {
    var secIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["care", "plan", "story", "areas"].forEach(function (id) { var el = document.getElementById(id); if (el) secIO.observe(el); });
  }

  /* ---------- planner ---------- */
  var DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var state = { mode: "weeks", days: [0, 3], weeks: 4 };

  var modeBtns = $$(".pl-mode");
  var modesWrap = $(".pl-modes");
  var pill = document.createElement("span");
  pill.className = "pl-mode-pill";
  modesWrap.appendChild(pill);

  var dayInputs = $$("#days input");
  var weeksIn = $("#weeks"), weeksOut = $("#weeks-out");
  var cal = $("#cal"), calMore = $("#cal-more"), sum = $("#plan-sum");

  function services() { return $$(".svc-picks input:checked").map(function (i) { return i.value; }); }

  function listJoin(a) {
    if (a.length < 2) return a.join("");
    return a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
  }

  function placePill() {
    var on = $(".pl-mode[aria-selected='true']");
    if (!on) return;
    pill.style.left = on.offsetLeft + "px";
    pill.style.width = on.offsetWidth + "px";
  }

  var plannerEl = $(".planner");
  function setMode(mode) {
    state.mode = mode;
    plannerEl.dataset.mode = mode;
    modeBtns.forEach(function (b) {
      var on = b.dataset.mode === mode;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    $$("[data-mode-img]").forEach(function (im) { im.classList.toggle("on", im.dataset.modeImg === mode); });
    $$("[data-mode-copy]").forEach(function (d) { d.classList.toggle("on", d.dataset.modeCopy === mode); });
    $$(".pl-field[data-show]").forEach(function (f) { f.hidden = f.dataset.show.split(" ").indexOf(mode) < 0; });
    placePill();
    render();
  }

  function render() {
    var days = state.days.slice().sort();
    var mode = state.mode;
    var rows, html = "";

    if (mode === "once") rows = 2;
    else if (mode === "weeks") rows = Math.min(state.weeks + 1, 5);
    else rows = 4;

    // real dates, starting the coming Monday
    var start = new Date(); start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + ((8 - start.getDay()) % 7 || 7));
    var icons = $$(".svc-picks input:checked").map(function (i) {
      return i.closest(".svc").querySelector("use").getAttribute("href");
    }).slice(0, 2);
    var iconHtml = icons.map(function (h) { return '<svg class="ico"><use href="' + h + '"/></svg>'; }).join("");
    var last = new Date(start);
    for (var w = 0; w < rows; w++) {
      var cls = "cal-week";
      if (mode === "ongoing" && w === rows - 1) cls += " fade";
      html += '<div class="' + cls + '">';
      for (var d = 0; d < 7; d++) {
        var c = "cal-day", inner = "";
        var dt = new Date(start); dt.setDate(start.getDate() + w * 7 + d); last = dt;
        if (mode === "once") {
          if (w === 0 && d === 2) { c += " pick v"; inner = iconHtml; }
        } else if (mode === "weeks" && w >= state.weeks) {
          c += " off";
        } else if (days.indexOf(d) > -1) {
          c += " v"; inner = iconHtml;
        }
        html += '<span class="' + c + '" title="' + dt.toDateString() + '"><em>' + dt.getDate() + "</em>" + inner + "</span>";
      }
      html += "</div>";
    }
    var fmt = function (x) { return x.toLocaleDateString("en-US", { month: "short", day: "numeric" }); };
    $("#sheet-month").textContent = fmt(start) + " \u2013 " + fmt(last);
    cal.innerHTML = html;
    // let the dots scale in
    requestAnimationFrame(function () { cal.classList.add("ready"); });

    var svc = services();
    var svcTxt = svc.length ? listJoin(svc.map(function (s, i) { return i ? s.toLowerCase() : s; })) : "";
    var perWeek = days.length;
    var dayTxt = days.map(function (d) { return DAY[d]; }).join(", ");

    if (mode === "once") {
      calMore.textContent = "One visit, on whatever day suits you.";
      sum.innerHTML = svc.length
        ? "<b>One visit</b> for " + esc(svcTxt.toLowerCase()) + "."
        : "Pick what the visit should include.";
    } else if (!perWeek) {
      calMore.textContent = "";
      sum.textContent = "Pick at least one day that works.";
    } else if (mode === "weeks") {
      var extra = Math.max(0, state.weeks - rows);
      calMore.textContent = extra > 0
        ? "Plus " + extra + " more week" + (extra > 1 ? "s" : "") + " like this, then we step back."
        : "Then we step back, and you're on your own two feet.";
      sum.innerHTML = "<b>" + perWeek + " visit" + (perWeek > 1 ? "s" : "") + " a week</b> (" + dayTxt + ") for <b>" + state.weeks + " week" + (state.weeks > 1 ? "s" : "") + "</b>"
        + (svc.length ? ": " + esc(svcTxt.toLowerCase()) : "") + ". About " + perWeek * state.weeks + " visits in all.";
    } else {
      calMore.textContent = "And it keeps going, week after week, until you tell us otherwise.";
      sum.innerHTML = "<b>" + perWeek + " visit" + (perWeek > 1 ? "s" : "") + " a week</b> (" + dayTxt + "), <b>ongoing</b>"
        + (svc.length ? ": " + esc(svcTxt.toLowerCase()) : "") + ".";
    }
  }

  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function planText() {
    var svc = services();
    var days = state.days.slice().sort().map(function (d) { return DAY[d]; });
    var lines = ["My plan sketch:"];
    if (state.mode === "once") lines.push("- One visit");
    else if (state.mode === "weeks") lines.push("- " + days.length + "x a week (" + days.join(", ") + ") for about " + state.weeks + " weeks");
    else lines.push("- " + days.length + "x a week (" + days.join(", ") + "), ongoing");
    if (svc.length) lines.push("- Each visit: " + svc.join(", "));
    return lines.join("\n");
  }

  modeBtns.forEach(function (b, i) {
    b.addEventListener("click", function () { setMode(b.dataset.mode); });
    b.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowRight") n = modeBtns[(i + 1) % modeBtns.length];
      if (k === "ArrowLeft") n = modeBtns[(i - 1 + modeBtns.length) % modeBtns.length];
      if (n) { e.preventDefault(); n.focus(); setMode(n.dataset.mode); }
    });
  });

  dayInputs.forEach(function (inp) {
    inp.checked = state.days.indexOf(+inp.value) > -1;
    inp.addEventListener("change", function () {
      state.days = dayInputs.filter(function (i) { return i.checked; }).map(function (i) { return +i.value; });
      render();
    });
  });
  $$(".svc-picks input").forEach(function (i) { i.addEventListener("change", render); });

  function syncWeeks() {
    state.weeks = +weeksIn.value;
    weeksOut.textContent = state.weeks + " week" + (state.weeks > 1 ? "s" : "");
    render();
  }
  weeksIn.addEventListener("input", syncWeeks);

  // hero chips jump to the planner preset to that mode
  $$(".hl-chip").forEach(function (a) {
    a.addEventListener("click", function () { setMode(a.dataset.mode); });
  });

  $("#plan-send").addEventListener("click", function () {
    var msg = $("#msg");
    var existing = msg.value.replace(/My plan sketch:[\s\S]*?(\n\n|$)/, "").trim();
    msg.value = planText() + (existing ? "\n\n" + existing : "");
    setTimeout(function () { $("#consult-form input[name='name']").focus({ preventScroll: true }); }, 700);
    toast("Plan added to your consult request");
  });

  window.addEventListener("resize", placePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);
  setMode(state.mode);

  /* ---------- consult form ---------- */
  var form = $("#consult-form"), status = $("#f-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name, phone = form.elements.phone, email = form.elements.email;
    var bad = [];
    [name, phone].forEach(function (f) { f.removeAttribute("aria-invalid"); });
    email.removeAttribute("aria-invalid");
    if (!name.value.trim()) bad.push(name);
    if (phone.value.replace(/\D/g, "").length < 10) bad.push(phone);
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad.push(email);
    if (bad.length) {
      bad.forEach(function (f) { f.setAttribute("aria-invalid", "true"); });
      status.className = "f-status err";
      status.textContent = "Please add your name and a 10-digit phone number" + (bad.indexOf(email) > -1 ? ", and check the email" : "") + ".";
      bad[0].focus();
      return;
    }
    status.className = "f-status ok";
    if (DEMO) {
      status.textContent = "Thanks, " + name.value.trim().split(" ")[0] + ". On the live site this goes straight to KLM, and they call you back to set up your consult.";
      return;
    }
    var body = "Name: " + name.value + "\nPhone: " + phone.value + "\nEmail: " + email.value + "\nCare is for: " + form.elements.who.value + "\n\n" + form.elements.msg.value;
    location.href = "mailto:klmhomecareservices@gmail.com?subject=" + encodeURIComponent("Free consult request") + "&body=" + encodeURIComponent(body);
  });

  /* ---------- questions: tap one, it drops into the chat and KLM "types" the answer ---------- */
  var fqs = $$(".fq"), fas = $$(".fa"), typing = $(".typing");
  if (fqs.length) {
    var showQ = function (btn, animate) {
      fqs.forEach(function (b) { var on = b === btn; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      fas.forEach(function (f) { f.hidden = f !== panel; f.classList.remove("in"); });
      if (!animate) return;
      var ba = $(".ba", panel);
      ba.style.visibility = "hidden";
      panel.classList.add("in");
      typing.classList.add("on");
      clearTimeout(showQ.t);
      showQ.t = setTimeout(function () { typing.classList.remove("on"); ba.style.visibility = ""; }, 650);
      if (innerWidth < 900) {
        var chat = $(".faq-chat"), r = chat.getBoundingClientRect();
        if (r.top > innerHeight - 120 || r.bottom < 0) chat.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    fqs.forEach(function (b, i) {
      b.addEventListener("click", function () { showQ(b, true); });
      b.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowDown" || e.key === "ArrowRight" ? fqs[(i + 1) % fqs.length] : e.key === "ArrowUp" || e.key === "ArrowLeft" ? fqs[(i - 1 + fqs.length) % fqs.length] : null;
        if (n) { e.preventDefault(); n.focus(); showQ(n, true); }
      });
    });
    showQ(fqs[0], false);
  }

  /* ---------- reviews: real ones from reviews.js, invite when empty ---------- */
  var reviews = (window.KLM_REVIEWS || []).filter(function (r) { return r && r.text; });
  if (reviews.length) {
    var total = reviews.reduce(function (s, r) { return s + (+r.stars || 5); }, 0);
    var avg = Math.round(total / reviews.length * 10) / 10;
    $("#g-num").textContent = avg.toFixed(1);
    $("#g-stars").style.setProperty("--pct", (avg / 5 * 100) + "%");
    $("#g-count").textContent = reviews.length + " Google review" + (reviews.length > 1 ? "s" : "");
    $("#rv-cards").innerHTML = reviews.slice(0, 6).map(function (r, i) {
      var stars = +r.stars || 5;
      return '<figure class="rv-q' + (i === 0 ? " rv-q-lead" : "") + '">'
        + '<span class="rv-q-stars" style="--pct:' + (stars / 5 * 100) + '%" role="img" aria-label="' + stars + ' out of 5 stars"></span>'
        + "<blockquote>" + esc(r.text) + "</blockquote>"
        + "<figcaption><b>" + esc(r.name || "Google reviewer") + "</b>" + (r.when ? "<span>" + esc(r.when) + "</span>" : "") + "</figcaption></figure>";
    }).join("");
    $("#rv-wall").hidden = false;
    // the invite stays below the wall, but smaller, as a running ask
    $("#rv-invite").classList.add("rv-invite-compact");
  }

  /* ---------- map: pick a city, the butterfly flies the route from home base ---------- */
  var mapEl = $("#map");
  if (mapEl) {
    var on = $("#rt-on"), bf = $("#map-bf"), card = { n: $("#mc-name"), m: $("#mc-mi") };
    var flight;
    var pick = function (key) {
      $$(".map .city").forEach(function (g) { g.classList.toggle("on", g.dataset.city === key); });
      $$(".city-list a").forEach(function (a) { a.classList.toggle("hot", a.dataset.city === key); });
      var g = $('.map .city[data-city="' + key + '"]');
      if (!g) return;
      card.n.textContent = g.dataset.name;
      if (key === "stv") {
        card.m.innerHTML = "Home base. All seven cities sit within <b>23 miles</b>.";
        on.setAttribute("d", "");
        bf.classList.remove("on");
        return;
      }
      card.m.innerHTML = "About <b>" + g.dataset.mi + " miles</b> from our San Tan Valley home base.";
      var rt = $('.map .rt[data-city="' + key + '"]');
      on.setAttribute("d", rt.getAttribute("d"));
      var len = on.getTotalLength();
      on.style.strokeDasharray = len;
      on.style.strokeDashoffset = len;
      on.getBoundingClientRect();
      on.style.transition = "stroke-dashoffset .45s cubic-bezier(.5,0,.2,1)";
      on.style.strokeDashoffset = 0;
      // the butterfly follows the same curve, turned to face where it is going
      if (flight) cancelAnimationFrame(flight);
      bf.classList.add("on");
      bf.classList.remove("rest");
      var t0 = performance.now(), dur = 460;
      var step = function (now) {
        var t = Math.min(1, (now - t0) / dur), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var p = on.getPointAtLength(e * len), q = on.getPointAtLength(Math.min(len, e * len + 2));
        var ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 90;
        bf.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + (p.y - 16).toFixed(1) + ") rotate(" + (t < 1 ? ang : 12).toFixed(1) + ")");
        if (t < 1) flight = requestAnimationFrame(step);
        else bf.classList.add("rest");
      };
      flight = requestAnimationFrame(step);
    };
    $$(".map .city").forEach(function (g) {
      g.addEventListener("mouseenter", function () { pick(g.dataset.city); });
      g.addEventListener("click", function () { pick(g.dataset.city); });
    });
    $$(".city-list a").forEach(function (a) {
      a.addEventListener("mouseenter", function () { pick(a.dataset.city); });
      a.addEventListener("focus", function () { pick(a.dataset.city); });
    });
    // name plaques: a pill sized to each label, drawn behind it
    var plaques = function () {
      $$(".map .city").forEach(function (g) {
        $$("rect.pq", g).forEach(function (r) { r.remove(); });
        $$("text", g).forEach(function (t) {
          var b = t.getBBox(), padX = 9, padY = 5;
          var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          r.setAttribute("class", "pq" + (t.classList.contains("sub") ? " pq-sub" : ""));
          r.setAttribute("x", (b.x - padX).toFixed(1));
          r.setAttribute("y", (b.y - padY).toFixed(1));
          r.setAttribute("width", (b.width + padX * 2).toFixed(1));
          r.setAttribute("height", (b.height + padY * 2).toFixed(1));
          r.setAttribute("rx", ((b.height + padY * 2) / 2).toFixed(1));
          g.insertBefore(r, t);
        });
      });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(plaques); else plaques();
    addEventListener("resize", function () { clearTimeout(plaques.t); plaques.t = setTimeout(plaques, 200); });

    // on first view, every route draws out from home base and each city's plaque pops in as its route arrives
    var order = ["qc", "gc", "aj", "gil", "cha", "mesa"];
    var tour = function () {
      mapEl.classList.remove("pre");
      order.forEach(function (k, i) {
        var rt = $('.map .rt[data-city="' + k + '"]'), g = $('.map .city[data-city="' + k + '"]');
        var len = rt.getTotalLength(), delay = 120 + i * 140;
        rt.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: 520, delay: delay, easing: "cubic-bezier(.5,0,.2,1)", fill: "backwards" });
        rt.style.strokeDasharray = len;
        var m = (g.getAttribute("transform") || "").match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/);
        var tx = m ? +m[1] : 0, ty = m ? +m[2] : 0;
        g.animate([
          { opacity: 0, transform: "translate(" + tx + "px," + (ty + 10) + "px)" },
          { opacity: 1, transform: "translate(" + tx + "px," + ty + "px)" }
        ], { duration: 420, delay: delay + 420, easing: "cubic-bezier(.3,1.4,.5,1)", fill: "backwards" });
      });
    };
    if ("IntersectionObserver" in window && mapEl.animate) {
      mapEl.classList.add("pre");
      var mio = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { mio.disconnect(); tour(); }
      }, { threshold: .25 });
      mio.observe(mapEl);
    }
  }

  /* ---------- reveal ---------- */
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var groups = [".sec-head", ".bento .tile", ".plan-head", ".visit-steps li", ".story-copy", ".story-photo", ".proof li", ".qa article", ".areas-copy", ".map", ".consult-copy", ".consult-form"];
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    groups.forEach(function (sel) {
      $$(sel).forEach(function (el, i) {
        if (el.getBoundingClientRect().top < innerHeight) return; // already on screen: no animation
        el.classList.add("rv");
        el.style.setProperty("--d", (i % 4) * 0.07 + "s");
        io.observe(el);
      });
    });
  }

  /* preview build: calls, email and outbound links are off */
document.addEventListener("click", function (e) {
  if (e.target.closest("[data-preview-off]")) { e.preventDefault(); toast("Preview only. Calls and links are off in this concept."); }
  }, true);
})();
