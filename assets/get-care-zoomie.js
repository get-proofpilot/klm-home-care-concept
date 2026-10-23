/* KLM Home Care, request page, Zoomie-style variant */
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

  $$(".svc-add").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = !$('[name="svc"][value="' + b.dataset.svc + '"]', form).checked;
      setSvc(b.dataset.svc, on);
      if (on) toast(SVC[b.dataset.svc] + " added to your request.");
    });
  });


  /* service cards preselect their services in the builder */
  $$("[data-pick]").forEach(function (b) {
    b.addEventListener("click", function () {
      b.dataset.pick.split(",").forEach(function (k) { setSvc(k, true); });
      toRequest(0);
      toast(b.closest("article").querySelector("h3").textContent + " added to your request.");
    });
  });

  /* card deck: drag the top card away, it goes to the back */
  var deck = $("#deck"), cards = $$(".zm-card", deck), TILT = [0, -5, 4, -8];
  function lay() {
    cards.forEach(function (c, i) {
      c.style.zIndex = 10 - i;
      c.style.transform = "translateY(" + (i * -14) + "px) rotate(" + TILT[i] + "deg) scale(" + (1 - i * .03) + ")";
      c.setAttribute("aria-hidden", i ? "true" : "false");
    });
  }
  function cycle(dir) {
    var top = cards[0];
    top.style.transform = "translateX(" + (dir * 130) + "%) rotate(" + (dir * 24) + "deg)";
    top.style.opacity = "0";
    setTimeout(function () { cards.push(cards.shift()); top.style.opacity = ""; lay(); }, reduce ? 0 : 320);
  }
  lay();
  var sx = 0, dx = 0, drag = null;
  deck.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button") || e.target.closest(".zm-card") !== cards[0]) return;
    drag = cards[0]; sx = e.clientX; dx = 0; drag.classList.add("dragging"); drag.setPointerCapture(e.pointerId);
  });
  deck.addEventListener("pointermove", function (e) {
    if (!drag) return; dx = e.clientX - sx;
    drag.style.transform = "translateX(" + dx + "px) rotate(" + (dx / 14) + "deg)";
  });
  function end() {
    if (!drag) return; drag.classList.remove("dragging");
    if (Math.abs(dx) > 90) cycle(dx > 0 ? 1 : -1); else lay();
    drag = null;
  }
  deck.addEventListener("pointerup", end); deck.addEventListener("pointercancel", end);
  $("#deck-next").addEventListener("click", function () { cycle(1); });

  go(0); render();
})();
