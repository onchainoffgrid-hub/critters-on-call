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

  /* Money SKUs — mirrored from pricing.html / homestead sellables (site JS-heavy). */
  var SERVICES = [
    {
      id: "farm-visit",
      name: "Farm Visit (come here)",
      blurb: "Sheehan Homestead · Callahan. Cheapest cash path on the board.",
      category: "On-farm",
      trackable: false,
      priceMin: 25,
      priceMax: 50,
      offers: [
        { id: "two", label: "2-person ticket", durationMin: 60, price: 25, note: "60 min · 2 people. Poker-chip wheel prize lands here." },
        { id: "car", label: "Whole car", durationMin: 60, price: 50, note: "60 min · up to 5 guests in one car." }
      ]
    },
    {
      id: "gold-club",
      name: "Gold / Critter Club",
      blurb: "Membership that discounts services and travel.",
      category: "Membership",
      trackable: false,
      priceMin: 50,
      priceMax: 50,
      offers: [
        { id: "gold", label: "Gold card", durationMin: 0, price: 50, note: "25% off services · 50% off travel · free 2-person farm + $25 gift · deposit toward mobile." }
      ]
    },
    {
      id: "field",
      name: "Field / group on farm",
      blurb: "Bigger groups on the homestead.",
      category: "On-farm",
      trackable: false,
      priceMin: 299,
      priceMax: 499,
      offers: [
        { id: "small", label: "Small group", durationMin: 75, price: 299, note: "≤5 cars or ≤20 people · ~75 min." },
        { id: "large", label: "Large group", durationMin: 90, price: 499, note: "≤10 cars or ≤40 people · ~90 min." }
      ]
    },
    {
      id: "mommy-me",
      name: "Mommy & Me",
      blurb: "Parent + little one with the herd.",
      category: "Class",
      trackable: false,
      priceMin: 25,
      priceMax: 25,
      offers: [
        { id: "visit", label: "Per hour", durationMin: 60, price: 25, note: "On the farm in Callahan." }
      ]
    },
    {
      id: "homeschool",
      name: "Homeschool",
      blurb: "Scheduled STEM / farm class.",
      category: "Class",
      trackable: false,
      priceMin: 40,
      priceMax: 40,
      offers: [
        { id: "class", label: "90 min class", durationMin: 90, price: 40, note: "$40 per learner · composting, gardening, building, animal care." }
      ]
    },
    {
      id: "mobile",
      name: "Mobile Petting Zoo",
      blurb: "We come to you. Weekday / weekend. Tax and travel not included.",
      category: "Mobile",
      trackable: true,
      priceMin: 150,
      priceMax: 699,
      offers: [
        { id: "bunny", label: "Bunny Haven", durationMin: 60, price: 150, note: "60 min · bunnies, goats & friends. Weekend $235." },
        { id: "mini", label: "Mini", durationMin: 75, price: 299, note: "75 min · ≥6 animals. Weekend $359." },
        { id: "standard", label: "Standard", durationMin: 90, price: 359, note: "90 min · full backyard. Weekend $549." },
        { id: "standard-full", label: "Standard + Full Side", durationMin: 90, price: 499, note: "Extra critters. Weekend $699." },
        { id: "fullside", label: "Full Side add-on", durationMin: 0, price: 150, note: "Add more animals to Standard." }
      ]
    }
  ];

  /* How Sweet It Is — 8 soft digital slices (Phase 1). Align with play aptitude prizes + parent favor / visit farm.
     Honest soft labels · honor-system · no fake paid coupon codes. Win CTA → sheehanhomestead.com/services */
  var PRIZES = [
    { id: "free-spin", label: "Free spin", short: "SPIN", value: "Priceless", again: true },
    { id: "farm-favor", label: "Farm Favor tip", short: "FAVOR", value: "Sophie · parent tip", claim: "services", theme: "sophie" },
    { id: "scout-badge", label: "Mobile party scout badge", short: "SCOUT", value: "Gus · mobile zoo", claim: "services", theme: "gus" },
    { id: "visit-pass", label: "Barn Queen visit pass", short: "VISIT", value: "Betty · Visit Us", claim: "services", theme: "betty" },
    { id: "stem-spark", label: "Grain Guard STEM spark", short: "STEM", value: "Elon · learn on farm", claim: "services", theme: "elon" },
    { id: "parent-favor", label: "Parent favor unlocked", short: "PARENT", value: "Wholesome tip", claim: "services" },
    { id: "farm-invite", label: "Visit the farm invite", short: "FARM", value: "Experiences · Services", claim: "services" },
    { id: "sweet-again", label: "How sweet it is", short: "SWEET", value: "Spin again", again: true }
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
