(function () {
  "use strict";
  var C = window.COC;
  var selectedServiceId = C.queryParam("service") || "mobile";
  if (!C.findService(selectedServiceId) || !C.SERVICES.some(function (s) { return s.id === selectedServiceId; })) {
    selectedServiceId = "mobile";
  }
  var selectedOfferId = C.findService(selectedServiceId).offers[0].id;

  var pkgGrid = document.getElementById("pkg-grid");
  var offerRow = document.getElementById("offer-row");
  var offerNote = document.getElementById("offer-note");
  var estimateEl = document.getElementById("estimate-price");
  var estimateHint = document.getElementById("estimate-hint");
  var addressBlock = document.getElementById("address-block");
  var farmNote = document.getElementById("farm-note");
  var dateInput = document.getElementById("date");
  var timeInput = document.getElementById("time");
  var guestsInput = document.getElementById("guests");
  var addressInput = document.getElementById("address");
  var cityInput = document.getElementById("city");
  var notesInput = document.getElementById("notes");
  var form = document.getElementById("book-form");
  var submitBtn = document.getElementById("confirm-btn");

  var ICONS = {
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>',
    "farm-visit": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/></svg>',
    homeschool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>',
    "mommy-me": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
  };

  function priceRange(svc) {
    return svc.priceMin === svc.priceMax ? C.money(svc.priceMin) : C.money(svc.priceMin) + "–" + C.money(svc.priceMax);
  }

  function renderPackages() {
    pkgGrid.innerHTML = "";
    C.SERVICES.forEach(function (svc) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pkg" + (svc.id === selectedServiceId ? " is-selected" : "");
      btn.innerHTML =
        '<span class="pkg-icon">' + (ICONS[svc.id] || ICONS.mobile) + "</span>" +
        '<span class="pkg-body">' +
          '<span class="pkg-meta"><span class="tag">' + svc.category + '</span>' +
          '<span class="text-xs tabular muted">' + priceRange(svc) + "</span></span>" +
          '<span class="pkg-name">' + svc.name + "</span>" +
          '<span class="pkg-blurb">' + svc.blurb + "</span>" +
        "</span>";
      btn.addEventListener("click", function () {
        selectedServiceId = svc.id;
        selectedOfferId = svc.offers[0].id;
        timeInput.value = C.defaultTime(svc.id);
        guestsInput.value = C.defaultGuests(svc.id, selectedOfferId);
        renderPackages();
        renderOffers();
        syncAddressVisibility();
      });
      pkgGrid.appendChild(btn);
    });
  }

  function renderOffers() {
    var svc = C.findService(selectedServiceId);
    var offer = C.findOffer(svc, selectedOfferId);
    offerRow.innerHTML = "";
    svc.offers.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "offer-btn" + (o.id === selectedOfferId ? " is-selected" : "");
      b.textContent = o.label + " · " + C.money(o.price);
      b.addEventListener("click", function () {
        selectedOfferId = o.id;
        guestsInput.value = C.defaultGuests(selectedServiceId, o.id);
        renderOffers();
      });
      offerRow.appendChild(b);
    });
    offerNote.textContent = offer.note;
    estimateEl.textContent = C.money(offer.price);
    estimateHint.textContent = svc.trackable ? "Tax and travel not included" : "On the farm";
  }

  function syncAddressVisibility() {
    var svc = C.findService(selectedServiceId);
    if (svc.trackable) {
      addressBlock.hidden = false;
      farmNote.hidden = true;
      addressInput.required = true;
    } else {
      addressBlock.hidden = true;
      farmNote.hidden = false;
      addressInput.required = false;
    }
  }

  dateInput.value = C.defaultDate();
  timeInput.value = C.defaultTime(selectedServiceId);
  guestsInput.value = C.defaultGuests(selectedServiceId, selectedOfferId);
  cityInput.value = "Callahan, FL";

  renderPackages();
  renderOffers();
  syncAddressVisibility();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var svc = C.findService(selectedServiceId);
    var offer = C.findOffer(svc, selectedOfferId);
    if (svc.trackable && !addressInput.value.trim()) {
      C.toast("Add a service address");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving";
    var booking = C.saveBooking({
      serviceId: svc.id,
      serviceName: svc.name + " · " + offer.label,
      date: dateInput.value,
      time: timeInput.value,
      durationMin: offer.durationMin,
      guests: Number(guestsInput.value) || 1,
      address: svc.trackable ? addressInput.value.trim() : "Sheehan Homestead",
      city: (cityInput.value || "Callahan, FL").trim(),
      notes: notesInput.value.trim(),
      price: offer.price,
      trackable: svc.trackable
    });
    if (svc.trackable) {
      C.toast("Booked — opening live track");
      window.location.href = "track.html?code=" + encodeURIComponent(booking.id);
    } else {
      C.toast("Request saved — we will confirm · " + booking.id);
      submitBtn.disabled = false;
      submitBtn.textContent = "Confirm";
    }
  });
})();
