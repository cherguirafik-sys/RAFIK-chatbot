// Moteur de la scène : une timeline explicite.
//   stateAt(t) -> renvoie l'état complet à l'instant t (inspectable)
//   setTime(t) -> applique cet état à l'écran
// Aucune valeur de contenu ici : tout vient de config.js.
(function () {
  "use strict";
  var C = window.VIDEO_CONFIG;

  // ---------- outils d'animation ----------
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function ramp(t, a, b) { return easeInOut(clamp((t - a) / (b - a), 0, 1)); }

  // Interpolation de clés {t, ...} avec easing par segment.
  function sampleKeys(keys, t, mix) {
    if (t <= keys[0].t) return mix(keys[0], keys[0], 0);
    for (var i = 0; i < keys.length - 1; i++) {
      var a = keys[i], b = keys[i + 1];
      if (t <= b.t) return mix(a, b, easeInOut((t - a.t) / (b.t - a.t || 1)));
    }
    var last = keys[keys.length - 1];
    return mix(last, last, 0);
  }

  // ---------- mesure des blocs réels ----------
  var rects = {};   // positions d'origine des blocs dans la page
  var doc, win;

  function unionRect(names) {
    var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    names.forEach(function (n) {
      var r = rects[n];
      x1 = Math.min(x1, r.x); y1 = Math.min(y1, r.y);
      x2 = Math.max(x2, r.x + r.w); y2 = Math.max(y2, r.y + r.h);
    });
    return { cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
  }

  // ---------- état à l'instant t ----------
  function stateAt(t) {
    var cam = sampleKeys(C.camera, t, function (a, b, k) {
      var pa = unionRect(a.target), pb = unionRect(b.target);
      return {
        fx: lerp(pa.cx, pb.cx, k), fy: lerp(pa.cy, pb.cy, k),
        zoom: lerp(a.zoom, b.zoom, k), tiltX: lerp(a.tiltX, b.tiltX, k),
        tiltZ: lerp(a.tiltZ, b.tiltZ, k), offsetY: lerp(a.offsetY, b.offsetY, k),
      };
    });

    var lift = {};
    Object.keys(C.blocks).forEach(function (n) { lift[n] = 0; });
    C.lifts.forEach(function (L) {
      var v = ramp(t, L.from, L.from + C.liftRamp) * (1 - ramp(t, L.to - C.liftRamp, L.to));
      lift[L.block] = Math.max(lift[L.block], v);
    });

    var dof = sampleKeys(C.dof, t, function (a, b, k) { return lerp(a.v, b.v, k); });

    var d = C.demo;
    var visible = t >= d.appear && t < d.hide + 0.3;
    var demo = {
      cursorOpacity: visible ? ramp(t, d.appear, d.appear + 0.2) * (1 - ramp(t, d.hide, d.hide + 0.3)) : 0,
      cursorTravel: ramp(t, d.moveFrom, d.arrive),          // 0 = départ, 1 = sur la cible
      press: t >= d.click && t < d.click + 0.18 ? 1 : 0,
      ripple: t >= d.click ? clamp((t - d.click) / 0.5, 0, 1) : 0,
      tagActive: t >= d.click && t < d.hide + 0.4,
      bubble: t >= d.bubble,
      bubbleIn: ramp(t, d.bubble, d.bubble + 0.3),
      status: t >= d.status,
    };

    var captions = C.captions.map(function (c) {
      return { text: c.text, opacity: ramp(t, c.from, c.from + 0.3) * (1 - ramp(t, c.to - 0.3, c.to)) };
    });

    var scene = C.scenes.filter(function (s) { return t >= s.start && t < s.end; })[0] || C.scenes[C.scenes.length - 1];

    return {
      t: t, scene: scene.id, camera: cam, lift: lift, dof: dof, demo: demo, captions: captions,
      opacity: lerp(C.fadeFrom, 1, ramp(t, 0, C.fadeIn)),
    };
  }

  // ---------- application à l'écran ----------
  var world, site, capBox, cursor, ripple, bubble, statusEl, statusOrig, tagEl;

  function setTime(t) {
    var s = stateAt(t);
    var c = s.camera;

    world.style.opacity = s.opacity;
    world.style.transform =
      "translate(" + C.width / 2 + "px," + (C.height / 2 + c.offsetY) + "px) " +
      "perspective(" + C.perspective + "px) rotateX(" + c.tiltX + "deg) rotateZ(" + c.tiltZ + "deg) " +
      "scale(" + c.zoom + ") translate(" + -c.fx + "px," + -c.fy + "px)";

    // cartes soulevées + profondeur de champ
    Object.keys(C.blocks).forEach(function (n) {
      if (n === "card") return;
      var el = doc.querySelector(C.blocks[n]);
      var l = s.lift[n];
      el.style.position = "relative";
      el.style.zIndex = l > 0.01 ? 3 : 1;
      el.style.borderRadius = "14px";
      el.style.transform = "translateY(" + (-6 * l) + "px) scale(" + (1 + 0.03 * l) + ")";
      el.style.boxShadow = l > 0.001
        ? "0 0 0 " + (10 * l) + "px rgba(255,255,255," + l + "), 0 " + (18 * l) + "px " + (40 * l) + "px " + C.colors.liftShadow.replace(/[\d.]+\)$/, (0.4 * l) + ")")
        : "none";
      var blur = s.dof * C.maxBlur * (1 - l);
      el.style.filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "none";
    });

    // démo : curseur, clic, bulle, statut
    var d = s.demo;
    // position d'origine du bouton visé (le curseur vise son centre exact)
    var tagsR = rects.tags, tagRel = tagRelative;
    var tx = tagsR.x + tagRel.x + tagRel.w / 2, ty = tagsR.y + tagRel.y + tagRel.h / 2;
    var sx = tx + 120, sy = ty + 150;
    var cx = lerp(sx, tx, d.cursorTravel), cy = lerp(sy, ty, d.cursorTravel);
    cursor.style.opacity = d.cursorOpacity;
    cursor.style.transform = "translate(" + cx + "px," + cy + "px) scale(" + (d.press ? 0.85 : 1) + ")";
    ripple.style.opacity = d.ripple > 0 && d.ripple < 1 ? (1 - d.ripple) * 0.8 : 0;
    ripple.style.transform = "translate(" + tx + "px," + ty + "px) translate(-50%,-50%) scale(" + (0.3 + d.ripple * 1.6) + ")";
    tagEl.style.background = d.tagActive ? C.colors.red : "";
    tagEl.style.color = d.tagActive ? "#fff" : "";
    bubble.style.display = d.bubble ? "" : "none";
    bubble.style.opacity = d.bubbleIn;
    bubble.style.transform = "translateY(" + (12 * (1 - d.bubbleIn)) + "px)";
    statusEl.textContent = d.status ? C.demo.statusText : statusOrig;

    // textes en surimpression (modifiables dans config.js)
    capBox.innerHTML = "";
    s.captions.forEach(function (cp) {
      if (cp.opacity <= 0.001) return;
      var e = document.createElement("div");
      e.className = "caption";
      e.textContent = cp.text;
      e.style.opacity = cp.opacity;
      e.style.fontSize = C.captionStyle.fontSize + "px";
      capBox.appendChild(e);
    });
    return s;
  }

  var tagRelative;

  // ---------- initialisation ----------
  var ready = new Promise(function (resolve) {
    var stage = document.getElementById("stage");
    stage.style.width = C.width + "px";
    stage.style.height = C.height + "px";
    stage.style.background =
      "radial-gradient(1200px 900px at 50% 38%, " + C.colors.stageGlow + ", transparent 70%), " +
      "linear-gradient(160deg, " + C.colors.navy + ", " + C.colors.blue + ")";
    world = document.getElementById("world");
    site = document.getElementById("site");
    capBox = document.getElementById("captions");
    capBox.style.top = C.captionStyle.top + "px";
    site.style.width = C.site.width + "px";
    site.style.height = C.site.height + "px";
    site.onload = function () {
      doc = site.contentDocument; win = site.contentWindow;
      // Désactive toute action réseau de la page pendant le tournage.
      doc.querySelectorAll(".tag, #btn").forEach(function (el) { el.onclick = null; });
      doc.documentElement.style.scrollBehavior = "auto";
      // Les transitions CSS de la page rendraient les images imprévisibles :
      // c'est la timeline qui anime tout.
      var still = doc.createElement("style");
      still.textContent = "*,*::before,*::after{transition:none!important;animation:none!important}";
      doc.head.appendChild(still);

      Object.keys(C.blocks).forEach(function (n) {
        var r = doc.querySelector(C.blocks[n]).getBoundingClientRect();
        rects[n] = { x: r.left, y: r.top, w: r.width, h: r.height };
      });
      tagEl = doc.querySelector(C.demo.target);
      var tr = tagEl.getBoundingClientRect();
      tagRelative = { x: tr.left - rects.tags.x, y: tr.top - rects.tags.y, w: tr.width, h: tr.height };

      // Bulle utilisateur : même classe que celle créée par la page (addMsg).
      bubble = doc.createElement("div");
      bubble.className = "msg user";
      bubble.textContent = tagEl.dataset.q;
      bubble.style.display = "none";
      doc.getElementById("chat").appendChild(bubble);
      statusEl = doc.getElementById("status");
      statusOrig = statusEl.textContent;

      // Curseur et onde de clic, dessinés DANS la page pour rester alignés avec la caméra.
      var layer = doc.createElement("div");
      layer.style.cssText = "position:absolute;left:0;top:0;width:0;height:0;z-index:50;pointer-events:none";
      layer.innerHTML =
        '<div id="v-ripple" style="position:absolute;left:0;top:0;width:44px;height:44px;border-radius:50%;' +
        'border:3px solid ' + C.colors.red + ';opacity:0"></div>' +
        '<svg id="v-cursor" width="22" height="30" viewBox="0 0 22 30" style="position:absolute;left:-3px;top:-2px;opacity:0;transform-origin:3px 2px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">' +
        '<path d="M3 2 L3 24 L8.5 18.5 L12.5 27.5 L16 26 L12 17 L19.5 17 Z" fill="#fff" stroke="#1a1a2e" stroke-width="1.8" stroke-linejoin="round"/></svg>';
      doc.body.appendChild(layer);
      cursor = doc.getElementById("v-cursor");
      ripple = doc.getElementById("v-ripple");

      (doc.fonts ? doc.fonts.ready : Promise.resolve()).then(function () {
        setTime(0);
        resolve(true);
      });
    };
    site.src = C.site.src;
  });

  window.timeline = { config: C, stateAt: stateAt, setTime: setTime, ready: ready };
})();
