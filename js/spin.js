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
  var AGAIN_LINES = [
    "Isn't spinning again the best?",
    "Spinning again is priceless — don't ever forget that.",
    "Free spin. How sweet it is."
  ];

  var wheel = document.getElementById("prize-wheel");
  var spinBtn = document.getElementById("spin-btn");
  var winCard = document.getElementById("win-card");
  var winLabel = document.getElementById("win-label");
  var winValue = document.getElementById("win-value");
  var winNote = document.getElementById("win-note");
  var winBook = document.getElementById("win-book");
  var winGold = document.getElementById("win-gold");
  var prizeList = document.getElementById("prize-list");
  var earnBanner = document.getElementById("earn-banner");
  var activeEarn = null;
  var spinningEarn = false;

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

  function grantEarn(dog) {
    dog = String(dog || "").toLowerCase();
    if (dog !== "gus" && dog !== "betty") return null;
    var earns = readEarns();
    for (var i = 0; i < earns.length; i++) {
      if (earns[i] && earns[i].dog === dog) return earns[i];
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
    return dog === "gus" ? "Gus" : dog === "betty" ? "Betty" : "a guardian";
  }

  function showEarnBanner(earn) {
    activeEarn = earn;
    if (!earnBanner) return;
    if (!earn) {
      earnBanner.hidden = true;
      earnBanner.textContent = "";
      return;
    }
    earnBanner.hidden = false;
    earnBanner.textContent =
      "Play reward: free spin from unlocking " + dogDisplayName(earn.dog);
    if (spinBtn && !spinning) {
      spinBtn.textContent = "Claim free spin";
    }
  }

  function resolveEarnFromQuery() {
    var dog = "";
    try {
      dog = (new URLSearchParams(location.search).get("earn") || "").toLowerCase();
    } catch (e) {}
    if (dog === "gus" || dog === "betty") {
      /* Deep link from Play — grant even if storage write raced */
      grantEarn(dog);
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
    if (!hasSpunBefore()) {
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
    spinBtn.disabled = false;
    if (!pending) return;
    markSpun();
    if (spinningEarn && activeEarn) {
      markEarnClaimed(activeEarn);
      spinningEarn = false;
      showEarnBanner(findUnclaimed(null));
      if (spinBtn && (!activeEarn)) spinBtn.textContent = pending.again ? "Spin again" : "Spin";
    }
    winCard.hidden = false;

    if (pending.again) {
      var line = AGAIN_LINES[Math.floor(Math.random() * AGAIN_LINES.length)];
      winLabel.textContent = "How sweet it is";
      winValue.textContent = "Priceless";
      setNote(line);
      spinBtn.textContent = "Spin again";
      C.toast(line);
    } else {
      winLabel.textContent = pending.label;
      winValue.textContent = pending.value;
      spinBtn.textContent = "Spin";
      C.toast(pending.label + " · " + pending.value);
    }

    if (winBook) {
      if (pending.book) {
        winBook.hidden = false;
        winBook.href = "book.html?service=" + encodeURIComponent(pending.book);
        if (pending.id === "poker") winBook.textContent = "Claim 2-person ticket";
        else if (pending.id === "goatee") winBook.textContent = "Book farm visit (in stack)";
        else winBook.textContent = "Book farm tour";
      } else {
        winBook.hidden = true;
      }
    }

    if (winGold) {
      if (pending.claim === "goatee") {
        winGold.hidden = false;
        winGold.href = "gold.html";
        winGold.textContent = "Claim Golden Goatee";
        setNote("Golden Goatee = Gold membership + free 2-person ticket + free $25 farm tour/gift. Claim the stack in person.");
      } else if (pending.claim === "gold") {
        winGold.hidden = false;
        winGold.href = "gold.html";
        winGold.textContent = "Claim Gold Card";
        setNote("Gold membership — claim in person at Sheehan Homestead.");
      } else if (pending.claim === "app") {
        winGold.hidden = false;
        winGold.href = "index.html";
        winGold.textContent = "Open the app";
        setNote("Early access / early promos — try Book, Track, Games. No review homework to claim this slice.");
      } else if (pending.claim === "pro") {
        winGold.hidden = false;
        winGold.href = "gold.html";
        winGold.textContent = "Tell us who to nominate";
        setNote("Nominate a programmer or org for Gold Pro. Open Gold and tell us who.");
      } else {
        winGold.hidden = true;
        if (!pending.again) {
          if (pending.id === "poker") {
            setNote("Poker chip = free 2-person farm ticket. Claim in person or book below.");
          } else if (pending.book) {
            setNote("Claim in person at Sheehan Homestead — or book your tour below.");
          } else {
            setNote("Claim in person at Sheehan Homestead.");
          }
        }
      }
    } else if (!pending.again) {
      if (pending.book) {
        setNote("Claim in person at Sheehan Homestead — or book your tour below.");
      } else if (!pending.claim) {
        setNote("Claim in person at Sheehan Homestead.");
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
    spinningEarn = !!activeEarn;
    var index = pickIndex();
    pending = prizes[index];
    winCard.hidden = true;
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
  resolveEarnFromQuery();
})();
