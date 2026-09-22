/* Critters on Call — shared helpers (localStorage bookings) */
(function (global) {
  "use strict";

  var STORE_KEY = "coc_bookings_v1";
  var STATUSES = [
    { id: "confirmed", label: "Confirmed", detail: "You're on the board — we locked it in!", tag: "Locked in" },
    { id: "prepping", label: "Prepping", detail: "Helper and herd loading up", tag: "Loading critters" },
    { id: "en_route", label: "En Route", detail: "Your helper is rolling your way", tag: "On the road" },
    { id: "arrived", label: "Arrived", detail: "Trailer at your place — setup time", tag: "At your door" },
    { id: "live", label: "Live", detail: "Critters out · party is on", tag: "Party mode" },
    { id: "complete", label: "Complete", detail: "Pack-up done · see you next time", tag: "All done" }
  ];

  var SERVICES = [
    {
      id: "mobile",
      name: "Mobile Petting Zoo",
      blurb: "We come to you. Tax and travel not included.",
      category: "Mobile",
      trackable: true,
      priceMin: 225,
      priceMax: 499,
      offers: [
        { id: "90", label: "90 min", durationMin: 90, price: 499, note: "At least 9 animals — goats, bunnies, and specialty fowl. Helper included." },
        { id: "75", label: "75 min", durationMin: 75, price: 325, note: "At least 5 animals delivered to your door." },
        { id: "60", label: "60 min", durationMin: 60, price: 225, note: "At least 3 bunnies. Smaller events and baby birthdays." }
      ]
    },
    {
      id: "farm-visit",
      name: "Farm Visit",
      blurb: "Come to Sheehan Homestead in Callahan. Check-in, a short program, then the herd.",
      category: "On-farm",
      trackable: false,
      priceMin: 25,
      priceMax: 50,
      offers: [
        { id: "two", label: "2 people", durationMin: 60, price: 25, note: "60 min · 2-person ticket." },
        { id: "car", label: "Whole car", durationMin: 60, price: 50, note: "60 min · one car of visitors." }
      ]
    },
    {
      id: "homeschool",
      name: "Homeschool",
      blurb: "Farm & STEM on the homestead. First Tuesday, second Wednesday, third Monday.",
      category: "Class",
      trackable: false,
      priceMin: 40,
      priceMax: 40,
      offers: [
        { id: "class", label: "90 min class", durationMin: 90, price: 40, note: "Composting, gardening, building, animal care. $40 per learner." }
      ]
    },
    {
      id: "mommy-me",
      name: "Mommy & Me",
      blurb: "Visit us. Parent and little one, one hour with the herd.",
      category: "Visit us",
      trackable: false,
      priceMin: 25,
      priceMax: 25,
      offers: [
        { id: "visit", label: "60 min", durationMin: 60, price: 25, note: "On the farm in Callahan. Parent + little one." }
      ]
    }
  ];

  /* How Sweet It Is — exactly 8 visual slices */
  var PRIZES = [
    { id: "again-1", label: "How Sweet It Is — Spin again", short: "SWEET", value: "Priceless", again: true },
    { id: "gold", label: "Gold Membership", short: "GOLD", value: "$50", claim: "gold" },
    { id: "farm-gift", label: "Free farm gift", short: "FARM", value: "$25" },
    { id: "thrift-gift", label: "Free thrift gift", short: "THRIFT", value: "$25" },
    { id: "farm-tour", label: "Free farm tour", short: "TOUR", value: "$25", book: "farm-visit" },
    { id: "gold-2", label: "Gold Membership", short: "GOLD", value: "$50", claim: "gold" },
    { id: "again-2", label: "How Sweet It Is — Spin again", short: "AGAIN", value: "Priceless", again: true },
    { id: "gold-pro", label: "Gold Pro nomination", short: "PRO", value: "$299", claim: "pro" }
  ];

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function readStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(map) {
    localStorage.setItem(STORE_KEY, JSON.stringify(map));
  }

  function makeCode() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var out = "";
    for (var i = 0; i < 4; i++) {
      out += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return "COC-" + out;
  }

  function defaultDate() {
    var d = new Date();
    d.setDate(d.getDate() + 2);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function defaultTime(serviceId) {
    if (serviceId === "homeschool") return "09:00";
    if (serviceId === "mommy-me" || serviceId === "farm-visit") return "10:00";
    return "14:00";
  }

  function defaultGuests(serviceId, offerId) {
    if (serviceId === "mobile") return 12;
    if (serviceId === "farm-visit" && offerId === "car") return 6;
    if (serviceId === "homeschool") return 1;
    return 2;
  }

  function findService(id) {
    for (var i = 0; i < SERVICES.length; i++) {
      if (SERVICES[i].id === id) return SERVICES[i];
    }
    return SERVICES[0];
  }

  function findOffer(service, offerId) {
    for (var i = 0; i < service.offers.length; i++) {
      if (service.offers[i].id === offerId) return service.offers[i];
    }
    return service.offers[0];
  }

  function statusIndex(id) {
    for (var i = 0; i < STATUSES.length; i++) {
      if (STATUSES[i].id === id) return i;
    }
    return 0;
  }

  function progressFor(status) {
    var idx = statusIndex(status);
    var last = STATUSES.length - 1;
    if (status === "complete") return 100;
    return Math.min(98, Math.max(6, ((idx + 0.45) / last) * 100));
  }

  function etaFor(status) {
    var map = { confirmed: 55, prepping: 40, en_route: 22, arrived: 5, live: 0, complete: 0 };
    return map[status] != null ? map[status] : 0;
  }

  function crittersFor(serviceId) {
    if (serviceId === "mobile") return ["Goats", "Bunnies", "Birds"];
    if (serviceId === "homeschool") return ["Goats", "Hens", "Garden"];
    return ["Goats", "Bunnies", "Herd"];
  }

  function saveBooking(data) {
    var map = readStore();
    var code = makeCode();
    while (map[code]) code = makeCode();
    var now = Date.now();
    var booking = {
      id: code,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      date: data.date,
      time: data.time,
      durationMin: data.durationMin,
      guests: data.guests,
      address: data.address,
      city: data.city,
      notes: data.notes || "",
      price: data.price,
      status: "confirmed",
      createdAt: now,
      statusUpdatedAt: now,
      crew: data.serviceId === "homeschool" ? "Instructor" : "Helper",
      critters: crittersFor(data.serviceId),
      etaMinutes: etaFor("confirmed"),
      trackable: !!data.trackable
    };
    map[code] = booking;
    writeStore(map);
    return booking;
  }

  function getBooking(code) {
    if (!code) return null;
    var key = String(code).trim().toUpperCase();
    var map = readStore();
    return map[key] || null;
  }

  function updateBooking(booking) {
    var map = readStore();
    map[booking.id] = booking;
    writeStore(map);
    return booking;
  }

  function advanceBooking(code) {
    var b = getBooking(code);
    if (!b) return null;
    var idx = statusIndex(b.status);
    if (idx >= STATUSES.length - 1) return b;
    b.status = STATUSES[idx + 1].id;
    b.statusUpdatedAt = Date.now();
    b.etaMinutes = etaFor(b.status);
    return updateBooking(b);
  }

  function ensureDemoBooking() {
    var existing = getBooking("COC-DEMO");
    if (existing) return existing;
    var map = readStore();
    var now = Date.now();
    var booking = {
      id: "COC-DEMO",
      serviceId: "mobile",
      serviceName: "Mobile Petting Zoo · 90 min",
      date: "2026-08-02",
      time: "14:00",
      durationMin: 90,
      guests: 18,
      address: "A backyard in Callahan",
      city: "Callahan, FL",
      notes: "Backyard setup",
      price: 499,
      status: "en_route",
      createdAt: now,
      statusUpdatedAt: now,
      crew: "Helper",
      critters: ["Goats", "Bunnies", "Birds"],
      etaMinutes: 22,
      trackable: true
    };
    map["COC-DEMO"] = booking;
    writeStore(map);
    return booking;
  }

  function formatDate(iso) {
    try {
      var parts = String(iso).split("-");
      var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    } catch (e) {
      return iso;
    }
  }

  function relativeUpdated(ts) {
    var mins = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (mins < 1) return "just now";
    if (mins === 1) return "1 min ago";
    if (mins < 60) return mins + " min ago";
    var hrs = Math.round(mins / 60);
    return hrs + (hrs === 1 ? " hr ago" : " hrs ago");
  }

  function queryParam(name) {
    try {
      var q = new URLSearchParams(window.location.search);
      return q.get(name);
    } catch (e) {
      return null;
    }
  }

  function trackUrl(code) {
    var base = window.location.href.split("?")[0];
    // Prefer track.html sibling
    if (/track\.html$/i.test(base)) {
      return base + "?code=" + encodeURIComponent(code);
    }
    var dir = base.replace(/[^/]*$/, "");
    return dir + "track.html?code=" + encodeURIComponent(code);
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("is-on");
    }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        toast("Link copied — anyone with it can watch this run");
      }).catch(function () {
        toast(text);
      });
    }
    toast(text);
    return Promise.resolve();
  }

  global.COC = {
    SERVICES: SERVICES,
    STATUSES: STATUSES,
    PRIZES: PRIZES,
    money: money,
    defaultDate: defaultDate,
    defaultTime: defaultTime,
    defaultGuests: defaultGuests,
    findService: findService,
    findOffer: findOffer,
    statusIndex: statusIndex,
    progressFor: progressFor,
    saveBooking: saveBooking,
    getBooking: getBooking,
    advanceBooking: advanceBooking,
    ensureDemoBooking: ensureDemoBooking,
    formatDate: formatDate,
    relativeUpdated: relativeUpdated,
    queryParam: queryParam,
    trackUrl: trackUrl,
    toast: toast,
    copyText: copyText
  };
})(window);
