(function () {
  "use strict";
  var C = window.COC;
  var prizes = C.PRIZES;
  var slice = 360 / prizes.length;
  var rotation = 0;
  var spinning = false;
  var reduceMotion = false;
  var pending = null;
  var SPUN_KEY = "coc_wheel_spun";
  var EARN_KEY = "coc_earned_wheel_spins_v1";
  var VALID_EARN = { gus: true, betty: true, elon: true };
  var AGAIN_LINES = [
    "Isn't spinning again the best?",
    "Spinning again is priceless — don't ever forget that.",
    "Free spin. How sweet it is."
  ];
  var SERVICES_URL = "https://www.sheehanhomestead.com/services";
  var BOOK_HELP = "https://www.sheehanhomestead.com/booking-help";
  var FB_URL = "https://www.facebook.com/profile.php?id=61556795506312";
  var SMS_HIGH_SCORE = "sms:9142631311?&body=" + encodeURIComponent("HIGH SCORE");
  var CAPS_KEY = "coc_play_caps_v1";
  var SPIN_CLAIMS_PER_DAY = 1;

  var wheel = document.getElementById("prize-wheel");
  var spinBtn = document.getElementById("spin-btn");
  var winCard = document.getElementById("win-card");
  var winLabel = document.getElementById("win-label");
  var winValue = document.getElementById("win-value");
  var winNote = document.getElementById("win-note");
  var winServices = document.getElementById("win-services");
  var winSms = document.getElementById("win-sms");
  var winBook = document.getElementById("win-book");
  var winGold = document.getElementById("win-gold");
  var prizeList = document.getElementById("prize-list");
  var earnBanner = document.getElementById("earn-banner");
  var messageDoors = document.getElementById("message-doors");
  var activeEarn = null;
  var spinningEarn = false;
  var lastSpinWasEarn = false;

  function readEarns() {
    try {
      var raw = localStorage.getItem(EARN_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeEarns(arr) {
    try {
      localStorage.setItem(EARN_KEY, JSON.stringify(arr));
    } catch (e) {}
  }


  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function readCaps() {
    try {
      var raw = localStorage.getItem(CAPS_KEY);
      var obj = raw ? JSON.parse(raw) : null;
      if (!obj || typeof obj !== "object") obj = {};
      if (obj.date !== todayKey()) {
        obj = { date: todayKey(), plays: {}, spinClaims: 0 };
        try { localStorage.setItem(CAPS_KEY, JSON.stringify(obj)); } catch (e2) {}
      }
      if (typeof obj.spinClaims !== "number") obj.spinClaims = 0;
      return obj;
    } catch (e) {
      return { date: todayKey(), plays: {}, spinClaims: 0 };
    }
  }

  function canClaimSpinToday() {
    return (readCaps().spinClaims || 0) < SPIN_CLAIMS_PER_DAY;
  }

  function recordSpinClaimToday() {
    var caps = readCaps();
    caps.spinClaims = (caps.spinClaims || 0) + 1;
    try { localStorage.setItem(CAPS_KEY, JSON.stringify(caps)); } catch (e) {}
  }

  function grantEarn(dog, opts) {
    dog = String(dog || "").toLowerCase();
    if (!VALID_EARN[dog]) return null;
    var earns = readEarns();
    for (var i = 0; i < earns.length; i++) {
      if (earns[i] && earns[i].dog === dog) {
        if (opts && opts.fresh && earns[i].claimed) {
          earns[i].claimed = false;
          earns[i].at = new Date().toISOString();
          writeEarns(earns);
        }
        return earns[i];
      }
    }
    var rec = {
      id: dog + "-" + Date.now(),
      dog: dog,
      at: new Date().toISOString(),
      claimed: false
    };
    earns.push(rec);
    writeEarns(earns);
    return rec;
  }

  function findUnclaimed(preferDog) {
    var earns = readEarns();
    var dog = preferDog ? String(preferDog).toLowerCase() : "";
    if (dog) {
      for (var i = 0; i < earns.length; i++) {
        if (earns[i] && earns[i].dog === dog && !earns[i].claimed) return earns[i];
      }
    }
    for (var j = 0; j < earns.length; j++) {
      if (earns[j] && !earns[j].claimed) return earns[j];
    }
    return null;
  }

  function markEarnClaimed(earn) {
    if (!earn || !earn.id) return;
    var earns = readEarns();
    for (var i = 0; i < earns.length; i++) {
      if (earns[i] && earns[i].id === earn.id) {
        earns[i].claimed = true;
        writeEarns(earns);
        return;
      }
    }
  }

  function dogDisplayName(dog) {
    if (dog === "gus") return "Gus";
    if (dog === "betty") return "Betty";
    if (dog === "elon") return "Evade Elon";
    return "Play";
  }

  function showMessageDoors(show) {
    if (!messageDoors) return;
    messageDoors.hidden = !show;
  }

  function lockSpinAfterEarn() {
    if (!spinBtn) return;
    spinBtn.disabled = true;
    spinBtn.textContent = "Earned spin used";
    spinBtn.setAttribute("aria-disabled", "true");
    spinBtn.classList.add("is-earn-spent");
  }

  function showEarnBanner(earn) {
    activeEarn = earn;
    if (!earnBanner) return;
    if (!earn) {
      earnBanner.hidden = true;
      earnBanner.textContent = "";
      return;
    }
    if (!canClaimSpinToday()) {
      activeEarn = null;
      earnBanner.hidden = false;
      earnBanner.textContent =
        "Play reward from " + dogDisplayName(earn.dog) + " waiting — daily spin claim used. See our services, text HIGH SCORE, or come back tomorrow.";
      if (spinBtn && !spinning) {
        spinBtn.disabled = true;
        spinBtn.textContent = "Come back tomorrow";
        spinBtn.classList.add("is-earn-spent");
        spinBtn.setAttribute("aria-disabled", "true");
      }
      return;
    }
    earnBanner.hidden = false;
    earnBanner.textContent =
      "Play reward: one free spin from " + dogDisplayName(earn.dog) + " — claim once (1/day, honor-system). Soft digital prizes.";
    if (spinBtn && !spinning && !lastSpinWasEarn) {
      spinBtn.disabled = false;
      spinBtn.textContent = "Claim free spin";
      spinBtn.classList.remove("is-earn-spent");
      spinBtn.removeAttribute("aria-disabled");
    }
  }

  function resolveEarnFromQuery() {
    var dog = "";
    var demo = false;
    try {
      var params = new URLSearchParams(location.search);
      dog = (params.get("earn") || "").toLowerCase();
      demo = params.get("demo") === "1";
    } catch (e) {}
    if (VALID_EARN[dog]) {
      grantEarn(dog, demo ? { fresh: true } : null);
    }
    showEarnBanner(findUnclaimed(dog || null));
  }

  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function hasSpunBefore() {
    try {
      return localStorage.getItem(SPUN_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markSpun() {
    try {
      localStorage.setItem(SPUN_KEY, "1");
    } catch (e) {}
  }

  function labelMarkup(p) {
    if (p.again) return p.short;
    return p.short + "<br>" + p.value;
  }

  prizes.forEach(function (p, i) {
    var deg = i * slice + slice / 2;
    var flip = deg > 90 && deg < 270;
    var light = i % 2 === 0;
    var el = document.createElement("span");
    el.className = "wheel-label " + (light ? "is-light" : "is-dark");
    el.style.transform = "rotate(" + deg + "deg)";
    el.innerHTML = '<span' + (flip ? ' style="transform:rotate(180deg)"' : "") + ">" + labelMarkup(p) + "</span>";
    wheel.appendChild(el);

    if (prizeList) {
      var li = document.createElement("li");
      li.dataset.id = p.id;
      li.innerHTML = '<p class="text-xs" style="font-weight:600;margin:0">' + p.label + '</p><p class="text-xs muted" style="margin:0">' + p.value + "</p>";
      prizeList.appendChild(li);
    }
  });

  /* First spin ever → again-slice bias; earned extras + later spins → fair */
  function pickIndex() {
    if (!hasSpunBefore() && !activeEarn) {
      var againIdx = [];
      for (var i = 0; i < prizes.length; i++) {
        if (prizes[i].again) againIdx.push(i);
      }
      if (againIdx.length) {
        return againIdx[Math.floor(Math.random() * againIdx.length)];
      }
    }
    return Math.floor(Math.random() * prizes.length);
  }

  function targetRotation(index, current) {
    var center = index * slice + slice / 2;
    var normalized = ((current % 360) + 360) % 360;
    var needed = ((360 - center) % 360 - normalized + 360) % 360;
    var spins = 5 + Math.floor(Math.random() * 3);
    return current + 360 * spins + needed;
  }

  function setNote(text) {
    if (!winNote) return;
    if (text) {
      winNote.hidden = false;
      winNote.textContent = text;
    } else {
      winNote.hidden = true;
      winNote.textContent = "";
    }
  }

  function finish() {
    spinning = false;
    wheel.classList.remove("is-spinning");
    if (!pending) {
      spinBtn.disabled = false;
      return;
    }
    markSpun();

    var wasEarn = spinningEarn && activeEarn;
    if (wasEarn) {
      markEarnClaimed(activeEarn);
      recordSpinClaimToday();
      spinningEarn = false;
      lastSpinWasEarn = true;
      activeEarn = null;
      showEarnBanner(null);
      lockSpinAfterEarn();
    } else {
      spinBtn.disabled = false;
    }

    winCard.hidden = false;
    /* Earned play path also surfaces message doors; all wins push Services first */
    showMessageDoors(!!wasEarn);

    if (pending.again) {
      var line = AGAIN_LINES[Math.floor(Math.random() * AGAIN_LINES.length)];
      winLabel.textContent = "How sweet it is";
      winValue.textContent = "Priceless";
      if (wasEarn) {
        setNote("Spin claimed — soft digital win. See our services, then text HIGH SCORE. No free re-spin today.");
        C.toast("Spin claimed · See our services");
      } else {
        setNote(line);
        spinBtn.textContent = "Spin again";
        C.toast(line);
      }
    } else {
      winLabel.textContent = pending.label;
      winValue.textContent = pending.value;
      if (!wasEarn) spinBtn.textContent = "Spin";
      C.toast(pending.label + " · " + pending.value);
    }

    /* Primary CTA always: See our services (real website) */
    if (winServices) {
      winServices.hidden = false;
      winServices.href = SERVICES_URL;
      winServices.textContent = "See our services";
      winServices.target = "_blank";
      winServices.rel = "noopener";
    }
    if (winSms) {
      winSms.hidden = false;
      winSms.href = SMS_HIGH_SCORE;
      winSms.textContent = "Text HIGH SCORE to 914-263-1311";
    }

    /* Optional tertiary — booking help for visit-themed slices; hide Gold for soft path */
    if (winBook) {
      if (!pending.again && (pending.theme === "betty" || pending.id === "farm-invite" || pending.claim === "services")) {
        winBook.hidden = false;
        winBook.href = BOOK_HELP;
        winBook.textContent = "Booking help (optional)";
        winBook.target = "_blank";
        winBook.rel = "noopener";
      } else {
        winBook.hidden = true;
      }
    }
    if (winGold) {
      winGold.hidden = true;
    }

    if (!pending.again) {
      if (pending.claim === "services" || pending.theme) {
        setNote(
          "Soft digital prize · limited · honor-system. Entertaining + learn a little — parents, See our services on the real website."
          + (wasEarn ? " Or tap a door below." : "")
        );
      } else if (wasEarn) {
        setNote("Nice land! Soft prize — See our services, or text HIGH SCORE with a screenshot.");
      }
    }

    if (prizeList) {
      Array.prototype.forEach.call(prizeList.children, function (li) {
        li.classList.toggle("is-won", li.dataset.id === pending.id);
      });
    }
  }

  wheel.addEventListener("transitionend", function (e) {
    if (e.target === wheel && spinning) finish();
  });

  spinBtn.addEventListener("click", function () {
    if (spinning) return;
    if (lastSpinWasEarn || spinBtn.classList.contains("is-earn-spent")) return;
    if (activeEarn && !canClaimSpinToday()) {
      showEarnBanner(activeEarn);
      return;
    }
    spinningEarn = !!activeEarn;
    var index = pickIndex();
    pending = prizes[index];
    winCard.hidden = true;
    showMessageDoors(false);
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = "Spinning";
    wheel.classList.add("is-spinning");

    if (reduceMotion) {
      var needed = ((360 - (index * slice + slice / 2)) - (rotation % 360) + 360) % 360;
      rotation = rotation + needed;
      wheel.style.transition = "none";
      wheel.style.transform = "rotate(" + rotation + "deg)";
      void wheel.offsetWidth;
      wheel.style.transition = "";
      finish();
      return;
    }

    rotation = targetRotation(index, rotation);
    wheel.style.transform = "rotate(" + rotation + "deg)";
  });

  /* Wire door hrefs if present */
  var doorServices = document.getElementById("door-services");
  var doorBook = document.getElementById("door-book");
  var doorSms = document.getElementById("door-sms");
  var doorFb = document.getElementById("door-fb");
  if (doorServices) doorServices.href = SERVICES_URL;
  if (doorBook) doorBook.href = BOOK_HELP;
  if (doorSms) doorSms.href = SMS_HIGH_SCORE;
  if (doorFb) doorFb.href = FB_URL;

  resolveEarnFromQuery();
})();
