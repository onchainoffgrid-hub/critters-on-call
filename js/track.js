(function () {
  "use strict";
  var C = window.COC;
  var codeInput = document.getElementById("code-input");
  var lookupForm = document.getElementById("lookup-form");
  var emptyState = document.getElementById("empty-state");
  var liveState = document.getElementById("live-state");
  var demoBtn = document.getElementById("demo-run-btn");

  function render(booking, miss) {
    if (!booking) {
      emptyState.hidden = false;
      liveState.hidden = true;
      var title = document.getElementById("empty-title");
      var desc = document.getElementById("empty-desc");
      if (miss) {
        title.textContent = "No run with that code";
        desc.textContent = "Paste a track code, or run the live demo.";
      } else {
        title.textContent = "Track a run";
        desc.textContent = "Paste a track code, or run the live demo.";
      }
      return;
    }
    emptyState.hidden = true;
    liveState.hidden = false;

    var idx = C.statusIndex(booking.status);
    var st = C.STATUSES[idx];
    var pct = C.progressFor(booking.status);

    document.getElementById("st-tag").textContent = st.tag;
    document.getElementById("st-label").textContent = st.label;
    document.getElementById("st-detail").textContent = st.detail;

    var etaBox = document.getElementById("eta-box");
    if (booking.etaMinutes > 0 && booking.status !== "complete") {
      etaBox.hidden = false;
      document.getElementById("eta-num").textContent = String(booking.etaMinutes);
    } else {
      etaBox.hidden = true;
    }

    document.getElementById("progress-fill").style.width = pct + "%";
    document.getElementById("progress-truck").style.left = pct + "%";
    document.getElementById("progress-meta").textContent =
      booking.serviceName + " · " + booking.id + " · updated " + C.relativeUpdated(booking.statusUpdatedAt);

    var grid = document.getElementById("status-grid");
    grid.innerHTML = "";
    C.STATUSES.forEach(function (s, i) {
      var done = i < idx || booking.status === "complete";
      var now = i === idx && booking.status !== "complete";
      var li = document.createElement("li");
      li.className = "status-cell" + (done ? " is-done" : "") + (now ? " is-now" : "");
      var html = '<span>' + s.label + "</span>";
      if (now) html += '<span class="now-pill">Now</span>';
      else if (done) html += '<span class="done-label">Done</span>';
      li.innerHTML = html;
      grid.appendChild(li);
    });

    var stepBtn = document.getElementById("demo-step-btn");
    if (booking.status === "complete") {
      stepBtn.hidden = true;
      document.getElementById("share-btn").classList.add("btn-block");
    } else {
      stepBtn.hidden = false;
      document.getElementById("share-btn").classList.remove("btn-block");
    }

    document.getElementById("crew-label").textContent =
      booking.crew === "Instructor" ? "Your instructor" : "Your helper";
    document.getElementById("crew-name").textContent = booking.crew;
    document.getElementById("duration-badge").textContent = booking.durationMin + " MIN";

    var chips = document.getElementById("critter-chips");
    chips.innerHTML = "";
    (booking.critters || []).forEach(function (c) {
      var span = document.createElement("span");
      span.className = "chip";
      span.textContent = c;
      chips.appendChild(span);
    });

    document.getElementById("visit-address").textContent = booking.address;
    document.getElementById("visit-meta").textContent =
      booking.city + " · " + booking.guests + " guests · " +
      C.formatDate(booking.date) + " at " + booking.time +
      (booking.price > 0 ? " · " + C.money(booking.price) : "");

    // Keep URL in sync
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("code", booking.id);
      history.replaceState(null, "", url.pathname.split("/").pop() + "?" + url.searchParams.toString());
    } catch (e) { /* file:// ok */ }

    liveState.dataset.code = booking.id;
  }

  function loadFromQuery() {
    var code = C.queryParam("code");
    if (code) {
      codeInput.value = code;
      var b = C.getBooking(code);
      render(b, !!code && !b);
      if (!b && code) C.toast("No run with that code");
    } else {
      render(null);
    }
  }

  lookupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var code = codeInput.value.trim().toUpperCase();
    if (!code) return;
    var b = C.getBooking(code);
    render(b, !b);
    if (!b) C.toast("No run with that code");
  });

  demoBtn.addEventListener("click", function () {
    var b = C.ensureDemoBooking();
    // Reset demo to en_route for a fresh sales walk if already complete
    if (b.status === "complete") {
      b.status = "en_route";
      b.etaMinutes = 22;
      b.statusUpdatedAt = Date.now();
      try {
        var map = JSON.parse(localStorage.getItem("coc_bookings_v1") || "{}");
        map[b.id] = b;
        localStorage.setItem("coc_bookings_v1", JSON.stringify(map));
      } catch (err) {}
    }
    codeInput.value = b.id;
    render(b);
    C.toast("Live demo ready");
  });

  document.getElementById("demo-step-btn").addEventListener("click", function () {
    var code = liveState.dataset.code;
    var before = C.getBooking(code);
    if (!before) return;
    if (before.status === "complete") {
      C.toast("Run complete — book another to restart");
      return;
    }
    var next = C.advanceBooking(code);
    if (!next) return;
    var st = C.STATUSES[C.statusIndex(next.status)];
    C.toast(st.label + "! — " + st.detail);
    render(next);
  });

  document.getElementById("share-btn").addEventListener("click", function () {
    var code = liveState.dataset.code;
    if (!code) return;
    C.copyText(C.trackUrl(code));
  });

  loadFromQuery();
})();
