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
  var prizeList = document.getElementById("prize-list");

  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  // Build labels
  prizes.forEach(function (p, i) {
    var deg = i * slice + slice / 2;
    var flip = deg > 90 && deg < 270;
    var light = i % 2 === 0;
    var el = document.createElement("span");
    el.className = "wheel-label " + (light ? "is-light" : "is-dark");
    el.style.transform = "rotate(" + deg + "deg)";
    el.innerHTML = '<span' + (flip ? ' style="transform:rotate(180deg)"' : "") + ">" + p.short + "</span>";
    wheel.appendChild(el);

    var li = document.createElement("li");
    li.dataset.id = p.id;
    li.innerHTML = '<p class="text-xs" style="font-weight:600;margin:0">' + p.label + '</p><p class="text-xs muted" style="margin:0">' + p.value + "</p>";
    prizeList.appendChild(li);
  });

  function targetRotation(index, current) {
    var center = index * slice + slice / 2;
    var normalized = ((current % 360) + 360) % 360;
    // Pointer is at top; wheel rotates clockwise so prize center should land at 0° (top)
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
    winLabel.textContent = pending.label;
    winValue.textContent = pending.value;
    if (pending.book) {
      winBook.hidden = false;
      winBook.href = "book.html?service=" + encodeURIComponent(pending.book);
    } else {
      winBook.hidden = true;
    }
    Array.prototype.forEach.call(prizeList.children, function (li) {
      li.classList.toggle("is-won", li.dataset.id === pending.id);
    });
    spinBtn.textContent = pending.again ? "Spin again" : "Spin";
    C.toast(pending.label + " · " + pending.value);
  }

  wheel.addEventListener("transitionend", function (e) {
    if (e.target === wheel && spinning) finish();
  });

  spinBtn.addEventListener("click", function () {
    if (spinning) return;
    var index = Math.floor(Math.random() * prizes.length);
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
      // force reflow then finish
      void wheel.offsetWidth;
      wheel.style.transition = "";
      finish();
      return;
    }

    rotation = targetRotation(index, rotation);
    wheel.style.transform = "rotate(" + rotation + "deg)";
  });
})();
