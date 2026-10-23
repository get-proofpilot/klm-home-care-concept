/* KLM Home Care, request page */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SVC = { shower: "Shower help", bedbath: "Bed bath", brief: "Brief changes", toilet: "Toileting", linens: "Fresh linens", personal: "Personal care" };
  var LEN = { once: "Just once", weeks: "A few weeks", ongoing: "For the long run" };

  /* header + menu */
  var head = $(".site-head");
  addEventListener("scroll", function () { head.classList.toggle("scrolled", scrollY > 8); }, { passive: true });
  var menuBtn = $(".menu-btn"), mnav = $("#mnav");
  mnav.hidden = true;
  menuBtn.addEventListener("click", function () {
    var open = menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", String(!open));
    mnav.hidden = open;
  });
  $$("a", mnav).forEach(function (a) { a.addEventListener("click", function () { menuBtn.setAttribute("aria-expanded", "false"); mnav.hidden = true; }); });

  /* toast for links that are off in the concept */
  var toastEl = $("#toast"), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("show"); }, 2600);
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-preview-off]")) { e.preventDefault(); toast("Preview only. Calls and links are off in this concept."); }
  });

  /* hero: rotating examples in the ask box */
  var ask = $("#ask-text");
  var examples = [
    "Mom needs help showering twice a week",
    "Dad comes home from knee surgery on Friday",
    "Just one bath before the wedding on Saturday",
    "My husband needs bed baths and fresh sheets",
    "Help getting dressed in the mornings"
  ];
  if (!reduce) {
    var ei = 0, ci = 0, del = false;
    (function type() {
      if (document.activeElement === ask || ask.value) { setTimeout(type, 900); return; }
      var full = examples[ei];
      ci += del ? -1 : 1;
      ask.setAttribute("placeholder", full.slice(0, ci) || " ");
      if (!del && ci === full.length) { del = true; return setTimeout(type, 2200); }
      if (del && ci === 0) { del = false; ei = (ei + 1) % examples.length; return setTimeout(type, 350); }
      setTimeout(type, del ? 22 : 48);
    })();
  }

  /* hero: example gc-ticket walks through its states */
  var tkStatus = $("#tk-status"), tkTrack = $$("#tk-track li");
  var states = ["Request sent", "Consult booked", "Caregiver matched"], si = 0;
  if (!reduce) setInterval(function () {
    si = (si + 1) % states.length;
    tkStatus.className = "tk-status" + (si ? " s" + si : "");
    $("b", tkStatus).textContent = states[si];
    tkTrack.forEach(function (li, i) { li.classList.toggle("on", i <= si); });
  }, 2600);

  /* shelf arrows */
  var rail = $("#rail");
  $$(".shelf-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var card = $(".svc-card", rail);
      rail.scrollBy({ left: (+b.dataset.dir) * (card.offsetWidth + 18) * 2, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* story: the step nearest mid-screen drives the stage */
  var steps = $$(".gc-step"), arts = $$(".story-art"), cap = $("#story-caption .script-sm");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var n = en.target.dataset.scene;
        steps.forEach(function (s) { s.classList.toggle("on", s === en.target); });
        arts.forEach(function (a) { a.classList.toggle("on", a.dataset.scene === n); });
        cap.textContent = en.target.dataset.cap;
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  }

  /* builder */
  var form = $("#wiz"), stepEls = $$(".wiz-step"), cur = 0;
  var prev = $("#wiz-prev"), next = $("#wiz-next"), fill = $("#wiz-fill"), count = $("#wiz-count"), err = $("#wiz-error");

  function vals(name) { return $$('[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
  function setDD(id, text) {
    var dd = $("#" + id), was = dd.textContent;
    if (text) { dd.textContent = text; dd.classList.remove("empty"); }
    else { dd.textContent = dd.dataset.empty; dd.classList.add("empty"); }
    if (text && text !== was) { dd.classList.remove("flash"); void dd.offsetWidth; dd.classList.add("flash"); }
  }
  $$(".ticket-rows dd").forEach(function (dd) { dd.dataset.empty = dd.textContent; });

  function render() {
    var svc = vals("svc"), len = vals("len")[0], days = vals("day"), time = vals("time")[0], who = vals("who")[0], city = form.city.value;
    setDD("t-svc", svc.map(function (k) { return SVC[k]; }).join(", "));
    setDD("t-len", len ? LEN[len] : "");
    var when = [days.join(", "), time ? time.toLowerCase() : ""].filter(Boolean).join(", ");
    setDD("t-when", when ? when.charAt(0).toUpperCase() + when.slice(1) : "");
    setDD("t-who", who || "");
    setDD("t-city", city || "");
    var title = svc.length === 1 ? SVC[svc[0]] + " visit" : svc.length > 1 ? svc.length + " kinds of help, one visit" : "A visit at home";
    if (len === "ongoing" && svc.length) title = title.replace(" visit", " visits").replace("one visit", "every visit");
    $("#t-title").textContent = title;
    var order = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    $$("#t-week span").forEach(function (s, i) { s.classList.toggle("on", days.indexOf(order[i]) > -1); });
    $$(".svc-card").forEach(function (c) { c.classList.toggle("added", svc.indexOf(c.dataset.svc) > -1); });
  }
  form.addEventListener("change", render);

  function go(n) {
    cur = Math.max(0, Math.min(stepEls.length - 1, n));
    stepEls.forEach(function (s, i) { s.classList.toggle("on", i === cur); });
    fill.style.width = ((cur + 1) / stepEls.length * 100) + "%";
    count.textContent = "Step " + (cur + 1) + " of " + stepEls.length;
    prev.disabled = cur === 0;
    next.innerHTML = (cur === stepEls.length - 1 ? "Send my request" : "Next") + '<svg class="ico"><use href="#i-arrow"/></svg>';
    err.textContent = "";
  }

  function setSvc(key, on) {
    var box = $('[name="svc"][value="' + key + '"]', form);
    if (box) { box.checked = on; render(); }
  }

  next.addEventListener("click", function () {
    if (cur === 0 && !vals("svc").length) { toast("Pick at least one kind of help to keep going."); return; }
    if (cur < stepEls.length - 1) { go(cur + 1); return; }
    var name = form.name.value.trim(), phone = form.phone.value.trim();
    if (!name || phone.replace(/\D/g, "").length < 10) { err.textContent = "Add your name and a 10-digit number so we can call you."; return; }
    send();
  });
  prev.addEventListener("click", function () { go(cur - 1); });

  function send() {
    var lines = [
      "Name: " + form.name.value.trim(),
      "Phone: " + form.phone.value.trim(),
      "Help with: " + $("#t-svc").textContent,
      "How long: " + $("#t-len").textContent,
      "When: " + $("#t-when").textContent,
      "For: " + $("#t-who").textContent,
      "City: " + $("#t-city").textContent
    ];
    var note = form.note.value.trim(); if (note) lines.push("Notes: " + note);
    location.href = "mailto:klmhomecareservices@gmail.com?subject=" + encodeURIComponent("Care request: " + $("#t-title").textContent) + "&body=" + encodeURIComponent(lines.join("\n"));
    stepEls.forEach(function (s) { s.classList.remove("on"); });
    $("#wiz-nav").hidden = true; count.textContent = "Ready to send"; fill.style.width = "100%";
    $("#wiz-done").hidden = false;
  }
  $("#wiz-restart").addEventListener("click", function () { $("#wiz-done").hidden = true; $("#wiz-nav").hidden = false; go(0); });

  function toRequest(focusStep) {
    var target = $("#request");
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    go(focusStep);
  }

  /* hero ask: guess services from the words, carry the sentence into the notes */
  var KEYS = { shower: /shower|bath(e|ing)?\b|wash/i, bedbath: /bed ?bath|in bed|bedbound|bed-bound/i, brief: /brief|diaper|incontinen|undergarment|depend/i, toilet: /toilet|bathroom trips|restroom/i, linens: /sheet|linen|bedding/i, personal: /dress|groom|teeth|hair|shav/i };
  $("#ask").addEventListener("submit", function (e) {
    e.preventDefault();
    var t = ask.value.trim() || ask.getAttribute("placeholder");
    form.note.value = t;
    Object.keys(KEYS).forEach(function (k) { if (KEYS[k].test(t)) setSvc(k, true); });
    if (/surgery|recover|fall|hospital/i.test(t)) { $('[name="len"][value="weeks"]', form).checked = true; }
    else if (/just one|one bath|once|before the/i.test(t)) { $('[name="len"][value="once"]', form).checked = true; }
    else if (/every|week|daily|mornings/i.test(t)) { $('[name="len"][value="ongoing"]', form).checked = true; }
    $$('[name="day"]', form).forEach(function (d) { if (new RegExp("every " + d.value, "i").test(t)) d.checked = true; });
    if (/twice a week/i.test(t) && !vals("day").length) { ["Tue", "Thu"].forEach(function (d) { $('[name="day"][value="' + d + '"]', form).checked = true; }); }
    if (/\bmom\b|\bdad\b|mother|father|parent/i.test(t)) $('[name="who"][value="A parent"]', form).checked = true;
    else if (/husband|wife|spouse|partner/i.test(t)) $('[name="who"][value="Spouse or partner"]', form).checked = true;
    render();
    toRequest(vals("svc").length ? 1 : 0);
    toast(vals("svc").length ? "We started your request from what you wrote." : "Pick the kind of help to get started.");
  });
  $$(".gc-quick button").forEach(function (b) {
    b.addEventListener("click", function () { setSvc(b.dataset.svc, true); toRequest(0); });
  });
  $$(".svc-add").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = !$('[name="svc"][value="' + b.dataset.svc + '"]', form).checked;
      setSvc(b.dataset.svc, on);
      if (on) toast(SVC[b.dataset.svc] + " added to your request.");
    });
  });

  go(0); render();
})();
