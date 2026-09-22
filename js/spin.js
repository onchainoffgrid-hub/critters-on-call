(function () {
  "use strict";
  var C = window.COC;
  var prizes = C.PRIZES;
  var slice = 360 / prizes.length;
  var rotation = 0;
  var spinning = false;
  var reduceMotion = false;
  var pending = null;

  var wheel = document.getElementById("prize-wheel");
  var spinBtn = document.getElementById("spin-btn");
  var winCard = document.getElementById("win-card");
  var winLabel = document.getElementById("win-label");
  var winValue = document.getElementById("win-value");
  var winBook = document.getElementById("win-book");
  var winGold = document.getElementById("win-gold");
  var prizeList = document.getElementById("prize-list");

  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  prizes.forEach(function (p, i) {
    var deg = i * slice + slice / 2;
    var flip = deg > 90 && deg < 270;
    var light = i % 2 === 0;
    var el = document.createElement("span");
    el.className = "wheel-label " + (light ? "is-light" : "is-dark");
    el.style.transform = "rotate(" + deg + "deg)";
    el.innerHTML = '<span' + (flip ? ' style="transform:rotate(180deg)"' : "") + ">" + p.short + "</span>";
    wheel.appendChild(el);

    if (prizeList) {
      var li = document.createElement("li");
      li.dataset.id = p.id;
      li.innerHTML = '<p class="text-xs" style="font-weight:600;margin:0">' + p.label + '</p><p class="text-xs muted" style="margin:0">' + p.value + "</p>";
      prizeList.appendChild(li);
    }
  });

  function weightOf(p) {
    return p.weight != null ? Number(p.weight) : 1;
  }

  function weightedIndex() {
    var total = 0;
    for (var i = 0; i < prizes.length; i++) total += weightOf(prizes[i]);
    var r = Math.random() * total;
    for (var j = 0; j < prizes.length; j++) {
      r -= weightOf(prizes[j]);
      if (r <= 0) return j;
    }
    return prizes.length - 1;
  }

  function targetRotation(index, current) {
    var center = index * slice + slice / 2;
    var normalized = ((current % 360) + 360) % 360;
    var needed = ((360 - center) % 360 - normalized + 360) % 360;
    var spins = 5 + Math.floor(Math.random() * 3);
    return current + 360 * spins + needed;
  }

  function finish() {
    spinning = false;
    wheel.classList.remove("is-spinning");
    spinBtn.disabled = false;
    if (!pending) return;
    winCard.hidden = false;
    if (pending.again) {
      winLabel.textContent = "How sweet it is";
      winValue.textContent = "Spinning again beats any prize.";
      spinBtn.textContent = "Spin again";
      C.toast("How sweet it is — spinning again beats any prize.");
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
      } else {
        winBook.hidden = true;
      }
    }
    if (winGold) {
      winGold.hidden = !(pending.id && String(pending.id).indexOf("gold") === 0);
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
    var index = weightedIndex();
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
})();
