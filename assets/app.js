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

  function setMode(mode) {
    state.mode = mode;
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

    for (var w = 0; w < rows; w++) {
      var cls = "cal-week";
      if (mode === "ongoing" && w === rows - 1) cls += " fade";
      html += '<div class="' + cls + '">';
      for (var d = 0; d < 7; d++) {
        var c = "cal-day";
        if (mode === "once") {
          if (w === 0 && d === 2) c += " pick";
        } else if (mode === "weeks" && w >= state.weeks) {
          c += " off";
        } else if (days.indexOf(d) > -1) {
          c += " v";
        }
        html += '<span class="' + c + '" title="' + DAY[d] + '"><i></i></span>';
      }
      html += "</div>";
    }
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

  /* ---------- map: city list <-> dots ---------- */
  $$(".city-list a").forEach(function (a) {
    var g = $('.cities g[data-city="' + a.dataset.city + '"]');
    if (!g) return;
    function on() { g.classList.add("hot"); a.classList.add("hot"); }
    function off() { g.classList.remove("hot"); a.classList.remove("hot"); }
    a.addEventListener("mouseenter", on); a.addEventListener("mouseleave", off);
    a.addEventListener("focus", on); a.addEventListener("blur", off);
  });

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
