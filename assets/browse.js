// Browse & search for the Legal Website of the Month site. No dependencies.
// A hand-written index: every query word must prefix-match a word in the pick (AND);
// matches in the title count most, then headings and publishers, then the description.
// Filter state lives in the URL (?q=…&topic=…&decade=…) so a filtered view can be shared.
(function () {
  "use strict";
  var FACETS = [
    ["topic", "Topic"], ["jur", "Jurisdiction"], ["type", "Resource type"], ["access", "Access"],
    ["status", "Status"], ["link", "Link type"], ["decade", "Decade (estimated posting)"],
    ["hsrc", "Subject headings from"]
  ];
  var LINK_LABEL = {
    "same": "Current address", "same (archived copy)": "Archived copy",
    "successor": "Successor", "equivalent": "Comparable resource", "no link found": "No link found"
  };
  var WEIGHTS = { t: 6, h: 3, pub: 2, topic: 2, place: 2, d: 1 };
  var PAGE = 50;
  var picks = [], shown = PAGE;
  var $ = function (id) { return document.getElementById(id); };

  function fold(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
  }
  function words(s) { return fold(s).match(/[a-z0-9]+/g) || []; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function vals(p, key) { var v = p[key]; return Array.isArray(v) ? v : [v]; }

  function index(p) {
    p._w = {};
    Object.keys(WEIGHTS).forEach(function (f) {
      var text = Array.isArray(p[f]) ? p[f].join(" ") : (p[f] || "");
      p._w[f] = words(text);
    });
    p._id = fold(p.id);
  }

  function score(p, q) {
    if (!q.length) return 1;
    var total = 0;
    for (var i = 0; i < q.length; i++) {
      var best = 0, w = q[i];
      if (p._id.indexOf(w) === 0) best = 6;
      for (var f in WEIGHTS) {
        if (WEIGHTS[f] <= best) continue;
        var ws = p._w[f];
        for (var j = 0; j < ws.length; j++) {
          if (ws[j].indexOf(w) === 0) { best = WEIGHTS[f] + (ws[j] === w ? 0.5 : 0); break; }
        }
      }
      if (!best) return 0;
      total += best;
    }
    return total;
  }

  // ---- state <-> URL
  function readState() {
    var u = new URLSearchParams(location.search), st = { q: u.get("q") || "", sort: u.get("sort") || "", f: {} };
    FACETS.forEach(function (fc) { var a = u.getAll(fc[0]); if (a.length) st.f[fc[0]] = a; });
    return st;
  }
  function writeState(st) {
    var u = new URLSearchParams();
    if (st.q) u.set("q", st.q);
    if (st.sort) u.set("sort", st.sort);
    FACETS.forEach(function (fc) { (st.f[fc[0]] || []).forEach(function (v) { u.append(fc[0], v); }); });
    var s = u.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
  }

  function passes(p, st, except) {
    for (var k in st.f) {
      if (k === except || !st.f[k].length) continue;
      var pv = vals(p, k), ok = false;
      for (var i = 0; i < st.f[k].length; i++) if (pv.indexOf(st.f[k][i]) >= 0) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  }

  function render(resetPage) {
    var st = state;
    if (resetPage) shown = PAGE;
    writeState(st);
    var q = words(st.q);
    var matched = [];
    picks.forEach(function (p) { p._s = score(p, q); if (p._s) matched.push(p); });
    var hits = matched.filter(function (p) { return passes(p, st); });

    var sort = st.sort || (q.length ? "rel" : "new");
    $("sort").value = sort;
    hits.sort(function (a, b) {
      if (sort === "rel" && b._s !== a._s) return b._s - a._s;
      if (sort === "old") return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
      if (sort === "title") return a.t.localeCompare(b.t);
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });

    // facets: counts reflect every other active filter (OR within a facet, AND across facets)
    var html = "";
    FACETS.forEach(function (fc) {
      var key = fc[0], counts = {}, sel = st.f[key] || [];
      matched.forEach(function (p) {
        if (!passes(p, st, key)) return;
        vals(p, key).forEach(function (v) { if (v) counts[v] = (counts[v] || 0) + 1; });
      });
      sel.forEach(function (v) { if (!(v in counts)) counts[v] = 0; });
      var keys = Object.keys(counts).sort(function (a, b) {
        if (key === "decade") return a < b ? -1 : 1;
        return counts[b] - counts[a] || a.localeCompare(b);
      });
      if (!keys.length) return;
      var many = keys.length > 8;
      html += '<fieldset class="facet"><legend>' + esc(fc[1]) + "</legend>";
      keys.forEach(function (v, i) {
        var id = "f-" + key + "-" + i, on = sel.indexOf(v) >= 0;
        var label = key === "link" ? (LINK_LABEL[v] || v) : v;
        html += '<label class="fv' + (many && i >= 8 && !on ? " extra" : "") + '" for="' + id + '">' +
          '<input type="checkbox" id="' + id + '" data-k="' + key + '" value="' + esc(v) + '"' + (on ? " checked" : "") + ">" +
          "<span>" + esc(label) + '</span><span class="n">' + counts[v] + "</span></label>";
      });
      if (many) html += '<button type="button" class="linkish more-f">Show all ' + keys.length + "</button>";
      html += "</fieldset>";
    });
    $("facet-list").innerHTML = html;

    // active filter chips
    var chips = [];
    if (st.q) chips.push('<button type="button" class="chip on" data-clear="q">“' + esc(st.q) + '” ×</button>');
    FACETS.forEach(function (fc) {
      (st.f[fc[0]] || []).forEach(function (v) {
        chips.push('<button type="button" class="chip on" data-k="' + fc[0] + '" data-v="' + esc(v) + '">' +
          esc(fc[1]) + ": " + esc(fc[0] === "link" ? (LINK_LABEL[v] || v) : v) + " ×</button>");
      });
    });
    if (chips.length > 1) chips.push('<button type="button" class="linkish" data-clear="all">Clear all</button>');
    $("active").innerHTML = chips.join(" ");

    $("summary").textContent = hits.length + " of " + picks.length + " picks" +
      (chips.length ? " match" : "") + (chips.length ? " · the address bar now links to this view" : "");

    $("results").innerHTML = hits.slice(0, shown).map(function (p) {
      var d = p.d.length > 260 ? p.d.slice(0, 260) + "…" : p.d;
      return '<li><a class="t" href="pick/' + esc(p.id) + '.html">' + esc(p.t) + "</a> " +
        '<span class="meta">' + esc(p.id) + " · posted ~" + esc(p.date) + " · " + esc(p.status) +
        " · " + esc(LINK_LABEL[p.link] || p.link) + "</span>" +
        "<p>" + esc(d) + "</p>" +
        '<p class="tags">' + p.topic.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join(" ") + "</p></li>";
    }).join("");
    $("more").hidden = hits.length <= shown;
    $("more").textContent = "Show more (" + (hits.length - shown) + " left)";
  }

  var state = readState(), timer;

  function wire() {
    $("q").value = state.q;
    $("q").addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = $("q").value.trim(); render(true); }, 120);
    });
    $("sort").addEventListener("change", function () { state.sort = $("sort").value; render(true); });
    $("facet-list").addEventListener("change", function (e) {
      var t = e.target; if (!t.dataset.k) return;
      var a = state.f[t.dataset.k] = state.f[t.dataset.k] || [];
      if (t.checked) a.push(t.value); else a.splice(a.indexOf(t.value), 1);
      render(true);
    });
    $("facet-list").addEventListener("click", function (e) {
      if (!e.target.classList.contains("more-f")) return;
      e.target.parentNode.classList.add("open"); e.target.remove();
    });
    $("active").addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return;
      if (t.dataset.clear === "q" || t.dataset.clear === "all") { state.q = ""; $("q").value = ""; }
      if (t.dataset.clear === "all") state.f = {};
      if (t.dataset.k) { var a = state.f[t.dataset.k]; a.splice(a.indexOf(t.dataset.v), 1); }
      render(true);
    });
    $("more").addEventListener("click", function () { shown += PAGE; render(false); });
    if (window.matchMedia("(max-width: 760px)").matches) document.querySelector("#facets details").open = false;
  }

  fetch("data/picks.json").then(function (r) { return r.json(); }).then(function (data) {
    picks = data.picks; picks.forEach(index);
    wire(); render(false);
  }).catch(function () {
    $("summary").textContent = "The pick data could not be loaded. Serve the site over http(s), not from a file:// address.";
  });
})();
