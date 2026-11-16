/* Semente Tardia - animals, part 2: Margarida (the cow), Nuvem (the lamb)
 * and the three hens. Loads after animals.js, which provides defineAnimal().
 *
 * Every animal faces right. Pass flip to S.Sprites.draw() for left-facing.
 * The anchor sits on the ground under the body, so an animal stands on (x, y).
 *
 *   margarida     28 x 22, anchor (12, 22)   poses: walk | idle | shift
 *                 shift = the short flinch after a missed stroke
 *   nuvem         16 x 13, anchor (7, 13)    poses: walk | idle | lie
 *                 sick = true from Day 13: head low, ears down, quicker breathing
 *   hen_brown     10 x 10, anchor (5, 10)    poses: walk | idle | peck
 *   hen_white     same size and poses
 *   hen_speckled  same size and poses
 *
 * Frames 0-3 drive the walk cycle when an animal walks. In other poses the same
 * frames drive breathing, head bobs, tail swishes and chewing. Unknown poses are
 * drawn as idle.
 */
window.Semente = window.Semente || {};

(function (S) {
  "use strict";

  var K = S.Sprites.kit;
  var rect = K.rect, dot = K.dot, canvas = K.canvas;
  var C = K.colors;
  var INK = C.ink, RED = C.red;

  // ---- Margarida, the cow ----------------------------------------------------
  // Legs stand on row 21. The belly stays on row 14 even when she breathes.

  var COW = {
    white: C.white,
    far: "#cfc8b4",          // far-side legs, a little darker
    shade: C.wool,
    patch: "#2f2620",        // black Holstein-style patches
    muzzle: "#e6a6a0",
    udder: "#e7a09a",
    hoof: "#3a2a20",
    horn: "#f2ead8",
    tag: "#f2d24b"           // yellow ear tag
  };

  // One cow leg: a three-pixel shank and a hoof. A lift shortens the shank by one row.
  function cowLeg(g, x, lift, color) {
    rect(g, x, 15, 3, 6 - lift, color);
    rect(g, x, 21 - lift, 3, 1, COW.hoof);
  }

  function cow(pose, f) {
    var c = canvas(28, 22, 12, 22), g = c.getContext("2d");
    var walk = pose === "walk";
    var shift = pose === "shift";
    var idle = !walk && !shift;
    var step = S.Sprites.gaitFor("walk", f);      // shared gait: stride and lifts
    var sa = walk ? step.a : 0;                   // stride moves the legs forward or back
    var sb = walk ? step.b : 0;
    var la = (walk || shift) ? step.la : 0;       // lifts: a foot comes off the ground
    var lb = (walk || shift) ? step.lb : 0;
    var up = ((shift && f < 2) || (idle && f === 2)) ? 1 : 0;   // startled, or breathing
    var oy = -up;                                 // back and head rise together
    var nod = walk ? (f & 1) : 0;                 // head drops on each step
    var sway = [0, -1, 0, 1][f];                  // tail swish
    var top = 6 + oy;                             // top row of the barrel
    var head = 3 + oy + nod;                      // top row of the head

    cowLeg(g, 4 + sa, la, COW.far);               // far hind
    cowLeg(g, 16 + sb, lb, COW.far);              // far fore

    rect(g, 5, top, 15, 15 - top, COW.white);     // barrel
    rect(g, 3, top + 1, 19, 13 - top, COW.white); // rounded rump and chest
    rect(g, 5, 14, 15, 1, COW.shade);             // belly shade
    rect(g, 7, top + 1, 6, 4, COW.patch);         // patches on the back
    rect(g, 15, top + 3, 4, 3, COW.patch);
    rect(g, 3, top + 3, 3, 3, COW.patch);
    rect(g, 11, 14, 4, 2, COW.udder);             // udder, between the legs
    dot(g, 12, 16, COW.udder);                    // teats
    dot(g, 14, 16, COW.udder);

    if (shift) {
      rect(g, 2, 2, 1, 6, COW.white);             // tail up while she shifts
      rect(g, 1, 1, 2, 1, COW.hoof);
    } else {
      rect(g, 2 + sway, 7, 1, 8, COW.white);      // tail hangs at the rump
      rect(g, 1 + sway, 14, 2, 2, COW.hoof);      // dark tuft
    }

    rect(g, 18, 4 + oy, 4, 5, COW.white);         // neck
    rect(g, 18, 4 + oy, 2, 2, COW.patch);
    rect(g, 21, head, 6, 5, COW.white);           // head
    rect(g, 21, head, 3, 2, COW.patch);
    rect(g, 24, head + 3, 4, 3, COW.muzzle);      // muzzle
    dot(g, 26, head + 4, INK);                    // nostril
    dot(g, 23, head + 1, INK);                    // eye
    rect(g, 19, head, 2, 2, COW.patch);           // ear
    rect(g, 19, head + 2, 1, 2, COW.tag);         // ear tag
    dot(g, 22, head - 1, COW.horn);               // small horn
    dot(g, 23, head - 2, COW.horn);
    if (idle && (f & 1)) dot(g, 25, head + 6, INK);   // chewing

    cowLeg(g, 7 + sb, lb, COW.white);             // near hind
    cowLeg(g, 19 + sa, la, COW.white);            // near fore
    return c;
  }

  // ---- Nuvem, the lamb -------------------------------------------------------
  // Legs stand on row 12. The fleece covers rows 3-9; the belly rests on row 9.

  var LAMB = {
    fleece: C.white,
    fleeceSick: "#e6e1d6",   // greyer, duller wool when she is ill
    shade: C.wool,
    face: "#d7c9b8",
    faceSick: "#b9aa98",
    ear: "#b9ab9a",
    nose: "#6e5a52",
    leg: "#7a756a",          // near legs
    legFar: "#5e5a52",       // far legs sit in shadow
    hoof: INK
  };

  // One thin leg: a one-pixel shank and a hoof. The hoof rises one row when lifted.
  function lambLeg(g, x, lift, color) {
    rect(g, x, 10, 1, 2 - lift, color);
    dot(g, x, 12 - lift, LAMB.hoof);
  }

  // Standing lamb, walking or idle.
  function lambStand(walk, f, sick) {
    var c = canvas(16, 13, 7, 13), g = c.getContext("2d");
    var step = S.Sprites.gaitFor("walk", f);
    var sa = walk ? step.a : 0, sb = walk ? step.b : 0;
    var la = walk ? step.la : 0, lb = walk ? step.lb : 0;
    var rise = sick ? ((f === 1 || f === 2) ? 1 : 0) : ((!walk && f === 2) ? 1 : 0);   // breathing
    var nod = sick ? 0 : (walk ? (f & 1) : ((f & 1) ? -1 : 0));                        // head bob
    var hd = sick ? 2 : 0;                        // sick: the head hangs low
    var top = 3 - rise;                           // top of the fleece; the belly stays on row 9
    var head = 2 + hd + nod;                      // top row of the head
    var fleece = sick ? LAMB.fleeceSick : LAMB.fleece;
    var face = sick ? LAMB.faceSick : LAMB.face;

    lambLeg(g, 4 + sa, la, LAMB.legFar);          // far hind
    lambLeg(g, 10 + sb, lb, LAMB.legFar);         // far fore

    rect(g, 4, top, 8, 10 - top, fleece);         // barrel
    rect(g, 2, top + 2, 12, 3, fleece);           // rounded back and chest
    rect(g, 3, 9, 10, 1, LAMB.shade);             // belly shade
    dot(g, 5, top + 1, LAMB.shade);               // wool curls
    dot(g, 8, top + 2, LAMB.shade);
    dot(g, 3, top + 3, LAMB.shade);
    dot(g, 10, top + 3, LAMB.shade);
    dot(g, 6, 8, LAMB.shade);

    rect(g, 10, head + 2, 2, 3, fleece);          // neck
    rect(g, 11, head, 4, 4, face);                // head
    if (sick) {
      rect(g, 9, head + 1, 2, 2, LAMB.ear);       // ear droops
      rect(g, 13, head + 1, 2, 1, INK);           // eye half shut
    } else {
      rect(g, 9, head, 2, 1, LAMB.ear);           // ear up
      dot(g, 13, head + 1, INK);                  // eye
    }
    dot(g, 14, head + 2, LAMB.nose);

    lambLeg(g, 6 + sb, lb, LAMB.leg);             // near hind
    lambLeg(g, 12 + sa, la, LAMB.leg);            // near fore
    if (!sick) dot(g, 1, 5 + (f & 1), LAMB.shade);   // tail flicks
    return c;
  }

  // Lamb lying down. Breathing lifts the back; sick breathing is quicker.
  function lambLie(f, sick) {
    var c = canvas(16, 13, 7, 13), g = c.getContext("2d");
    var rise = sick ? (f !== 0 ? 1 : 0) : (f === 2 ? 1 : 0);
    var top = 8 - rise;                           // top row of the back; the body rests on row 11
    var fleece = sick ? LAMB.fleeceSick : LAMB.fleece;
    var face = sick ? LAMB.faceSick : LAMB.face;

    rect(g, 4, top, 6, 1, fleece);                // back ridge
    rect(g, 2, top + 1, 11, 11 - top, fleece);    // body
    rect(g, 2, 11, 11, 1, LAMB.shade);            // underside
    rect(g, 3, 12, 3, 1, LAMB.hoof);              // legs folded under her
    rect(g, 9, 12, 3, 1, LAMB.hoof);
    rect(g, 10, 9, 2, 1, LAMB.ear);               // ear lying flat
    rect(g, 12, 9, 3, 3, face);                   // head on the ground
    if (sick) {
      dot(g, 13, 10, INK);                        // eye open but dull
    } else {
      rect(g, 13, 10, 2, 1, INK);                 // eye shut, asleep
    }
    dot(g, 14, 11, LAMB.nose);
    return c;
  }

  function nuvem(pose, f, view, sick) {
    if (pose === "lie") return lambLie(f, sick);
    return lambStand(pose === "walk", f, sick);
  }

  // ---- Hens ----------------------------------------------------------------------
  // Ground on row 9. The head's top row is 2 when standing and 7 when pecking.

  var HENS = {
    hen_brown: { body: "#b06a3c", dark: "#7d4424", wing: "#8a4a2a", spots: null },
    hen_white: { body: C.white, dark: "#c9c2b0", wing: "#e0d8c6", spots: null },
    hen_speckled: { body: "#e6dccb", dark: "#b8ad98", wing: "#c9b79a", spots: "#3a302a" }
  };
  var HEN_LEG = "#e0a040", HEN_FOOT = "#b5731e", HEN_BEAK = "#e8a03a";
  var SPECKS = [[2, 5], [4, 4], [6, 5], [3, 7], [5, 6], [7, 6]];

  // A hen leg: one pixel up to the body, and a foot on the ground unless the leg is lifted.
  function henLeg(g, x, lift) {
    dot(g, x, 8, HEN_LEG);
    if (!lift) dot(g, x, 9, HEN_FOOT);
  }

  // Returns a drawing function for one hen colour.
  function hen(kind) {
    var P = HENS[kind];
    return function (pose, f) {
      var c = canvas(10, 10, 5, 10), g = c.getContext("2d");
      var walk = pose === "walk", peck = pose === "peck";
      var step = S.Sprites.gaitFor("walk", f);
      var sa = walk ? step.a : 0, sb = walk ? step.b : 0;
      var la = walk ? step.la : 0, lb = walk ? step.lb : 0;
      var head;
      if (peck) head = [5, 7, 7, 5][f];          // the head dips to the ground and back
      else if (walk) head = 2 + (f & 1);         // the head nods on each step
      else head = f === 2 ? 3 : 2;               // idle: a small look around

      henLeg(g, 3 + sa, la);
      henLeg(g, 6 + sb, lb);

      rect(g, 0, 2, 2, 3, P.dark);               // tail
      rect(g, 3, 4, 4, 4, P.body);               // body
      rect(g, 2, 5, 6, 2, P.body);
      rect(g, 3, 5, 3, 2, P.wing);               // wing
      rect(g, 3, 7, 4, 1, P.dark);               // belly shade
      if (P.spots) {
        for (var i = 0; i < SPECKS.length; i++) dot(g, SPECKS[i][0], SPECKS[i][1], P.spots);
      }

      rect(g, 6, head - 1, 2, 1, RED);           // comb
      dot(g, 7, head - 2, RED);
      rect(g, 6, head, 3, 3, P.body);            // head
      dot(g, 7, head + 1, INK);                  // eye
      dot(g, 9, head + 1, HEN_BEAK);             // beak
      dot(g, 8, head + 2, RED);                  // wattle
      return c;
    };
  }

  S.Sprites.defineAnimal("margarida", cow);
  S.Sprites.defineAnimal("nuvem", nuvem);
  S.Sprites.defineAnimal("hen_brown", hen("hen_brown"));
  S.Sprites.defineAnimal("hen_white", hen("hen_white"));
  S.Sprites.defineAnimal("hen_speckled", hen("hen_speckled"));
})(window.Semente);
