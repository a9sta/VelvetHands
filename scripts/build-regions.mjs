/**
 * 행정동 경계(admdongkor, CC BY 4.0) → data/regions.json
 *
 * 커버리지는 두 층이다.
 *   **메인** 서울·인천·경기·부산 — 동마다 쪽을 낸다.
 *   **서브** 대전·대구·울산 전역 + 광주 광산구 + 지정 시·군 — 시군구까지만.
 *   ★★읍과 면은 어느 층에서도 쪽을 내지 않는다(2026-10-13 지시). 시군구 쪽에
 *     이름만 올리고 접수와 방문은 똑같이 받는다.
 *
 * ★★이 사이트가 쓰는 값은 **원 안 점유**다. 땅의 무게 중심에 원을 하나 그리고,
 *   그 원이 얼마나 그 땅 안에 들어 있는지를 퍼센트로 잰다. 반지름을 세 번 바꿔 가며
 *   잰 값이 한 벌이고, 거기서 두 가지가 더 나온다.
 *     점유 곡선 : 반지름 세 개에서의 점유율(100이면 원이 통째로 땅 안에 있다)
 *     반만 차는 반지름 : 점유율이 처음 50 밑으로 내려가는 반지름(m)
 *     떨어지는 폭 : 가장 작은 원과 가장 큰 원의 점유율 차
 *   같은 넓이라도 원 밖으로 빨리 새는 땅은 길쭉하거나 구불구불하고, 오래 차 있는
 *   땅은 둥글게 뭉쳐 있다. 가운데에서 바깥 어디로든 비슷하게 닿는다는 뜻이다.
 *
 *   ★원은 72각형으로 근사하고, 땅 고리 하나하나를 그 다각형에 **서덜랜드–호지먼으로
 *     잘라** 넓이를 그대로 구한다(구멍은 음수). 점을 뿌려 세지 않는다.
 *   ★점유율은 근사 72각형 넓이로 나눈다. 그래서 통째로 안에 든 원은 정확히 100이다.
 *   앞선 열일곱 사이트는 중심점 거리·방위·면적순위·행정동 수·끝과 끝·경계 맞닿음·
 *   가로세로·둘레·뭉침 정도·안쪽 깊이·매듭점·시도 바깥선까지의 거리·이름 세기·
 *   해의 자리·테두리의 결·다리 수·누운 방향·테두리 분담·쏠림을 썼다. 원을 그려
 *   점유율로 재는 축은 처음이다.
 *
 *   node scripts/build-regions.mjs [경로/HangJeongDong.geojson]
 */
import fs from 'node:fs';
import path from 'node:path';
import { adminSlug } from './romanize.mjs';

const VERSION = 'HangJeongDong_ver20260701';
const SRC = process.argv[2] || '/tmp/hjd.geojson';
const OUT = path.join(process.cwd(), 'data', 'regions.json');

/* ── 커버리지 ──────────────────────────────────────────────── */
const MAIN = {
  서울: { full: '서울특별시', alias: '서울시', slug: 'seoul', iso: 'KR-11', src: '서울특별시' },
  인천: { full: '인천광역시', alias: '인천시', slug: 'incheon', iso: 'KR-28', src: '인천광역시' },
  경기: { full: '경기도', alias: '경기', slug: 'gyeonggi', iso: 'KR-41', src: '경기도' },
  부산: { full: '부산광역시', alias: '부산시', slug: 'busan', iso: 'KR-26', src: '부산광역시' },
};
const SUB = {
  대전: { full: '대전광역시', alias: '대전시', slug: 'daejeon', iso: 'KR-30', src: '대전광역시', all: true },
  대구: { full: '대구광역시', alias: '대구시', slug: 'daegu', iso: 'KR-27', src: '대구광역시', all: true },
  울산: { full: '울산광역시', alias: '울산시', slug: 'ulsan', iso: 'KR-31', src: '울산광역시', all: true },
  광주: { full: '광주광역시', alias: '광주시', slug: 'gwangju', iso: 'KR-29', src: '전남광주통합특별시', only: ['광산구'] },
  충남: { full: '충청남도', alias: '충남', slug: 'chungnam', iso: 'KR-44', src: '충청남도', only: ['천안시', '당진시', '공주시', '논산시'] },
  충북: { full: '충청북도', alias: '충북', slug: 'chungbuk', iso: 'KR-43', src: '충청북도', only: ['청주시', '제천시', '진천군', '증평군', '옥천군'] },
  강원: { full: '강원특별자치도', alias: '강원', slug: 'gangwon', iso: 'KR-42', src: '강원특별자치도', only: ['강릉시'] },
  전북: { full: '전북특별자치도', alias: '전북', slug: 'jeonbuk', iso: 'KR-45', src: '전북특별자치도', only: ['전주시', '군산시', '익산시', '정읍시'] },
  전남: { full: '전라남도', alias: '전남', slug: 'jeonnam', iso: 'KR-46', src: '전남광주통합특별시', only: ['여수시', '순천시', '광양시', '나주시', '함평군', '영광군'] },
  경북: { full: '경상북도', alias: '경북', slug: 'gyeongbuk', iso: 'KR-47', src: '경상북도', only: ['포항시', '구미시', '김천시', '성주군', '경주시', '영천시', '경산시'] },
  경남: { full: '경상남도', alias: '경남', slug: 'gyeongnam', iso: 'KR-48', src: '경상남도', only: ['양산시', '김해시'] },
};
const GWANGJU_GU = new Set(['광산구', '남구', '동구', '북구', '서구']);
const DROP_GU = new Set(['인천|옹진군', '대구|군위군']);

/* ── 기하 ──────────────────────────────────────────────────── */
const rad = (d) => (d * Math.PI) / 180;
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r1 = (v) => Math.round(v * 10) / 10;
const r2 = (v) => Math.round(v * 100) / 100;
const pretty = (n) => n.replace(/^(.+?시)(.+구)$/, '$1 $2');
const kindOf = (n) => (/읍$/.test(n) ? '읍' : /면$/.test(n) ? '면' : '동');

function signedArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** 반지름별 반경 — 단위 층마다 잰다. */
const RADII = {
  spot: [500, 1000, 2000],
  gu: [2500, 5000, 10000],
  sido: [10000, 20000, 40000],
};
const LADDER = { spot: [150, 1.14], gu: [600, 1.16], sido: [2500, 1.2] };
const SIDES = 72;
const COS_IN = Math.cos(Math.PI / SIDES);
const DISC_AREA = (r) => 0.5 * SIDES * r * r * Math.sin((2 * Math.PI) / SIDES);

/** 볼록 다각형(반시계)에 대한 서덜랜드–호지먼 */
function clipConvex(pts, clip) {
  let out = pts;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    const ex = b[0] - a[0], ey = b[1] - a[1];
    const side = (p) => ex * (p[1] - a[1]) - ey * (p[0] - a[0]);
    const next = [];
    for (let j = 0; j < out.length; j++) {
      const p = out[j], q = out[(j + 1) % out.length];
      const sp = side(p), sq = side(q);
      if (sp >= 0) next.push(p);
      if ((sp >= 0) !== (sq >= 0)) {
        const t = sp / (sp - sq);
        next.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
    out = next;
  }
  return out;
}
const discCache = new Map();
function disc(cx, cy, r) {
  const key = r;
  let u = discCache.get(key);
  if (!u) {
    u = [];
    for (let i = 0; i < SIDES; i++) u.push([Math.cos((2 * Math.PI * i) / SIDES), Math.sin((2 * Math.PI * i) / SIDES)]);
    discCache.set(key, u);
  }
  return u.map((p) => [cx + p[0] * r, cy + p[1] * r]);
}

/** 원 안에 든 땅 넓이 비율(%) */
function occAt(rings, cx, cy, r) {
  const poly = disc(cx, cy, r);
  const ri = r * COS_IN;
  let inside = 0;
  for (const g of rings) {
    const sgn = g.outer ? 1 : -1;
    const dx = Math.max(g.minX - cx, 0, cx - g.maxX), dy = Math.max(g.minY - cy, 0, cy - g.maxY);
    if (dx * dx + dy * dy >= r * r) continue;
    const fx = Math.max(Math.abs(g.minX - cx), Math.abs(g.maxX - cx)), fy = Math.max(Math.abs(g.minY - cy), Math.abs(g.maxY - cy));
    if (fx * fx + fy * fy <= ri * ri) { inside += sgn * g.area; continue; }
    const cl = clipConvex(g.pts, poly);
    if (cl.length >= 3) inside += sgn * Math.abs(signedArea(cl));
  }
  return Math.max(0, Math.min(100, (inside / DISC_AREA(r)) * 100));
}

/** 점유율이 처음 50 밑으로 내려가는 반지름(m). 처음부터 50 밑이면 0. */
function halfRadius(rings, cx, cy, tier) {
  const [base, f] = LADDER[tier];
  let prevR = 0, prevO = 100, r = base;
  for (let k = 0; k < 60; k++, r *= f) {
    const o = occAt(rings, cx, cy, r);
    if (o < 50) {
      if (k === 0) return 0;
      const t = (prevO - 50) / (prevO - o || 1);
      return Math.round(prevR + (r - prevR) * t);
    }
    prevR = r; prevO = o;
  }
  return Math.round(prevR);
}

/** 곡선 모양을 한 낱말로 */
function shapeOf(o) {
  const [a, , c] = o;
  if (a < 20) return 'thin';
  if (c - a >= 3) return 'rise';
  if (c >= 99.5) return 'full';
  if (a >= 99.5) return 'solid';
  const drop = a - c;
  if (drop < 25) return 'steady';
  if (drop < 55) return 'slide';
  return 'sharp';
}

/**
 * 고리 묶음(바깥 +, 구멍 −)에서 원 안 점유를 잰다.
 * 반환: 넓이(km²) · 중심 · 반지름 세 개의 점유율 · 반만 차는 반지름 · 떨어지는 폭 · 곡선 모양
 */
function discOf(rings, tier) {
  let A = 0, X = 0, Y = 0;
  for (const r of rings) {
    const sgn = r.outer ? 1 : -1;
    const sa = signedArea(r.pts);
    const a = Math.abs(sa);
    if (!a) continue;
    let sx = 0, sy = 0;
    for (let i = 0, n = r.pts.length; i < n; i++) {
      const p = r.pts[i], o = r.pts[(i + 1) % n];
      const f = p[0] * o[1] - o[0] * p[1];
      sx += (p[0] + o[0]) * f; sy += (p[1] + o[1]) * f;
    }
    A += sgn * a; X += sgn * a * (sx / (6 * sa)); Y += sgn * a * (sy / (6 * sa));
  }
  if (A <= 0) return null;
  const gx = X / A, gy = Y / A;
  const occ = RADII[tier].map((r) => Math.round(occAt(rings, gx, gy, r) * 10) / 10);
  const half = halfRadius(rings, gx, gy, tier);
  return {
    area: A / 1e6, gx, gy,
    occ, half,
    drop: Math.round((occ[0] - occ[2]) * 10) / 10,
    shape: shapeOf(occ),
  };
}

function ringsOf(geom, lat0) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const kx = Math.cos(rad(lat0)) * 111320, ky = 110574;
  const rings = [];
  for (const poly of polys) {
    poly.forEach((ring, idx) => {
      const pts = ring.slice(0, -1).map((c) => [c[0] * kx, c[1] * ky]);
      if (pts.length < 3) return;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
      }
      rings.push({ pts, outer: idx === 0, minX, maxX, minY, maxY, area: Math.abs(signedArea(pts)) });
    });
  }
  return { rings, kx, ky };
}

/* ── 읽기 ─────────────────────────────────────────────────── */
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));

function sidoOf(p) {
  for (const [short, m] of Object.entries(MAIN)) {
    if (m.src !== p.sidonm) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) return [null, null, false];
    return [short, m, true];
  }
  for (const [short, m] of Object.entries(SUB)) {
    if (m.src !== p.sidonm) continue;
    if (m.src === '전남광주통합특별시') {
      const isGwangju = GWANGJU_GU.has(p.sggnm);
      if (short === '광주' && !isGwangju) continue;
      if (short === '전남' && isGwangju) continue;
    }
    if (m.only && !m.only.some((x) => p.sggnm.startsWith(x))) continue;
    if (DROP_GU.has(`${short}|${p.sggnm}`)) continue;
    return [short, m, false];
  }
  return [null, null, false];
}

/* ── 시도별 투영 기준 위도 — 한 시도 안은 같은 평면을 쓴다 ──────
   ★동마다 기준 위도를 달리 두면 이웃 동의 가로 좌표가 수 km 어긋난다. */
const LAT0 = new Map();
{
  const acc = new Map();
  for (const ft of geo.features) {
    const p = ft.properties;
    const [sidoKey] = sidoOf(p);
    if (!sidoKey) continue;
    const g = ft.geometry;
    const first = g.type === 'Polygon' ? g.coordinates[0][0] : g.coordinates[0][0][0];
    const a = acc.get(sidoKey) || [0, 0];
    a[0] += first[1]; a[1] += 1;
    acc.set(sidoKey, a);
  }
  for (const [k, [s, n]] of acc) LAT0.set(k, s / n);
}

/* ── 레코드 ────────────────────────────────────────────────── */
const buckets = new Map();
for (const ft of geo.features) {
  const p = ft.properties;
  const [sidoKey, m, isMain] = sidoOf(p);
  if (!sidoKey) continue;
  const name = String(p.adm_nm).trim().split(/\s+/).pop();
  const lat0 = LAT0.get(sidoKey);
  const { rings, kx, ky } = ringsOf(ft.geometry, lat0);
  const kind = kindOf(name);
  const wantSpot = isMain && kind === '동';
  const t = wantSpot ? discOf(rings, 'spot') : null;
  let areaOnly = 0, X = 0, Y = 0;
  if (!t) {
    for (const r of rings) {
      const sgn = r.outer ? 1 : -1;
      areaOnly += sgn * r.area;
    }
  }
  const rec = {
    code: String(p.adm_cd2), name, kind, sidoKey, isMain, sggnm: p.sggnm,
    rings, kx, ky, wantSpot,
  };
  if (t) {
    Object.assign(rec, {
      lat: r6(t.gy / ky), lng: r6(t.gx / kx), area: r2(t.area),
      occ: t.occ, half: t.half, drop: t.drop, shape: t.shape,
    });
  }
  const k = `${sidoKey}|${p.sggnm}`;
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(rec);
}

/* ── 시군구 묶기 ──────────────────────────────────────────── */
const guAll = [];
const spotAll = [];
for (const [k, list] of buckets) {
  const [sidoKey, rawName] = k.split('|');
  const isMain = !!MAIN[sidoKey];
  const name = pretty(rawName);
  const dongs = list.filter((d) => d.kind === '동');
  const rural = list.filter((d) => d.kind !== '동')
    .map((d) => ({ name: d.name, kind: d.kind }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const allRings = [];
  for (const d of list) for (const r of d.rings) allRings.push(r);
  const gt = discOf(allRings, 'gu');
  const ky = 110574, kx = list[0].kx;
  if (!gt) continue;

  const g = {
    sidoKey, main: isMain, name, raw: rawName, slug: adminSlug(name),
    lat: r6(gt.gy / ky), lng: r6(gt.gx / kx),
    area: r1(gt.area),
    dongCount: list.length,
    plainCount: dongs.length,
    rural, ruralCount: rural.length,
    eupCount: rural.filter((x) => x.kind === '읍').length,
    myeonCount: rural.filter((x) => x.kind === '면').length,
    spots: [],
    dongNames: isMain ? [] : dongs.map((d) => d.name).sort((a, b) => a.localeCompare(b, 'ko')),
    occ: gt.occ, half: gt.half, drop: gt.drop, shape: gt.shape,
  };
  if (isMain) {
    const used = new Set();
    for (const d of dongs) {
      if (!d.occ) continue;
      let sl = adminSlug(d.name);
      if (used.has(sl)) { let i = 2; while (used.has(`${sl}-${i}`)) i++; sl = `${sl}-${i}`; }
      used.add(sl);
      const s = {
        name: d.name, kind: d.kind, slug: sl, code: d.code,
        lat: d.lat, lng: d.lng, area: d.area,
        occ: d.occ, half: d.half, drop: d.drop, shape: d.shape,
      };
      g.spots.push(s); spotAll.push(s);
    }
  }
  g.spotCount = g.spots.length;
  g._list = list;
  guAll.push(g);
}

/* ── 시군구 안 차례 ───────────────────────────────────────── */
const byName = (a, b) => a.name.localeCompare(b.name, 'ko');
for (const g of guAll) {
  if (!g.spots.length) continue;
  const byFull = g.spots.slice().sort((a, b) => b.half - a.half || byName(a, b));
  byFull.forEach((s, i) => { s.guHalfRank = i + 1; });
  g.fullSpot = byFull[0].name; g.fullSpotSlug = byFull[0].slug; g.fullSpotV = byFull[0].half;
  const last = byFull[byFull.length - 1];
  g.leakSpot = last.name; g.leakSpotSlug = last.slug; g.leakSpotV = last.half;
  const byDrop = g.spots.slice().sort((a, b) => b.drop - a.drop || byName(a, b));
  g.dropSpot = byDrop[0].name; g.dropSpotSlug = byDrop[0].slug; g.dropSpotV = byDrop[0].drop;
  const byMid = g.spots.slice().sort((a, b) => b.occ[1] - a.occ[1] || byName(a, b));
  g.midSpot = byMid[0].name; g.midSpotSlug = byMid[0].slug; g.midSpotV = byMid[0].occ[1];
  g.sparseSpot = byMid[byMid.length - 1].name; g.sparseSpotSlug = byMid[byMid.length - 1].slug; g.sparseSpotV = byMid[byMid.length - 1].occ[1];
  const cnt = {};
  for (const s of g.spots) cnt[s.shape] = (cnt[s.shape] || 0) + 1;
  g.shapeCount = cnt;
  g.fullCount = g.spots.filter((s) => s.occ[0] >= 99.5).length;
  g.thinCount = g.spots.filter((s) => s.shape === 'thin').length;
}

/* ── 점유 곡선이 닮은 시군구 — 이 사이트의 '옆 동네' ──────── */
{
  const sidoSlug = (key) => (MAIN[key] || SUB[key]).slug;
  for (const g of guAll) {
    const pool = guAll.filter((o) => o !== g).map((o) => ({
      o, same: o.sidoKey === g.sidoKey,
      gap: Math.round(Math.abs(o.occ[0] - g.occ[0]) + Math.abs(o.occ[1] - g.occ[1]) + Math.abs(o.occ[2] - g.occ[2])),
    }));
    pool.sort((a, b) => (a.same === b.same ? (a.gap - b.gap || a.o.name.localeCompare(b.o.name, 'ko')) : a.same ? -1 : 1));
    g.kin = pool.slice(0, 8).map(({ o, same, gap }) => ({
      sidoSlug: sidoSlug(o.sidoKey), gu: o.name, slug: o.slug, same, gap, shape: o.shape, half: o.half,
    }));
    g.kinCount = g.kin.length;
  }
}

/* ── 전국 차례 ────────────────────────────────────────────── */
spotAll.slice().sort((a, b) => b.half - a.half || byName(a, b)).forEach((s, i) => { s.halfRank = i + 1; });
spotAll.slice().sort((a, b) => b.drop - a.drop || byName(a, b)).forEach((s, i) => { s.dropRank = i + 1; });

/* ── 시도 묶기 ────────────────────────────────────────────── */
const sido = [];
for (const [key, m] of [...Object.entries(MAIN), ...Object.entries(SUB)]) {
  const gus = guAll.filter((g) => g.sidoKey === key);
  if (!gus.length) continue;
  const isMain = !!MAIN[key];
  let st = null;
  const kx = gus[0]._list[0].kx, ky = 110574;
  if (isMain) {
    const allRings = [];
    for (const g of gus) for (const d of g._list) for (const r of d.rings) allRings.push(r);
    st = discOf(allRings, 'sido');
  }
  gus.sort(byName);
  const allSpots = [];
  for (const g of gus) for (const s of g.spots) allSpots.push(s);
  for (const g of gus) {
    g.spots.sort(byName);
    delete g.sidoKey; delete g._list;
  }
  const units = isMain ? allSpots : gus;
  const cnt = {};
  for (const s of units) cnt[s.shape] = (cnt[s.shape] || 0) + 1;
  const byHalf = units.slice().sort((a, b) => b.half - a.half || byName(a, b));
  const full = byHalf[0], leak = byHalf[byHalf.length - 1];
  const avg = (f) => Math.round((units.reduce((s, x) => s + f(x), 0) / units.length) * 10) / 10;
  sido.push({
    name: key, full: m.full, alias: m.alias, slug: m.slug, iso: m.iso, main: isMain,
    lat: st ? r6(st.gy / ky) : r6(gus.reduce((s, g) => s + g.lat, 0) / gus.length),
    lng: st ? r6(st.gx / kx) : r6(gus.reduce((s, g) => s + g.lng, 0) / gus.length),
    area: st ? r1(st.area) : r1(gus.reduce((s, g) => s + g.area, 0)),
    dongCount: gus.reduce((s, g) => s + g.dongCount, 0),
    spotCount: gus.reduce((s, g) => s + g.spotCount, 0),
    ruralCount: gus.reduce((s, g) => s + g.ruralCount, 0),
    eupCount: gus.reduce((s, g) => s + g.eupCount, 0),
    myeonCount: gus.reduce((s, g) => s + g.myeonCount, 0),
    occ: st ? st.occ : null, half: st ? st.half : null, drop: st ? st.drop : null, shape: st ? st.shape : null,
    shapeCount: cnt,
    avgOcc: avg((x) => x.occ[1]), avgHalf: Math.round(avg((x) => x.half)),
    fullName: full.name, fullV: full.half, leakName: leak.name, leakV: leak.half,
    fullSlug: full.slug, leakSlug: leak.slug,
    unitKind: isMain ? '동' : '시군구',
    gu: gus,
  });
}

const hh = spotAll.map((s) => s.half).sort((a, b) => a - b);
const dd = spotAll.map((s) => s.drop).sort((a, b) => a - b);
const cntAll = {};
for (const s of spotAll) cntAll[s.shape] = (cntAll[s.shape] || 0) + 1;
const SHAPES = ['full', 'solid', 'steady', 'slide', 'sharp', 'rise', 'thin'];
const out = {
  version: VERSION,
  source: '경계 자료는 admdongkor 행정동 경계(CC BY 4.0)를 썼어요. 국가공간정보포털 원본을 이 저장소에서 다듬어 둔 판이에요.',
  built: new Date().toISOString().slice(0, 10),
  axis: '원 안 점유 — 땅의 무게 중심에 원을 그렸을 때 그 원이 땅 안에 얼마나 들어 있는가',
  method: '행정동 경계를 시도마다 하나로 맞춘 미터 평면에 옮기고 넓이로 가중한 무게 중심을 구했다. 그 중심에 72각형으로 근사한 원을 반지름 세 개로 그려, 땅 고리를 하나씩 그 다각형에 잘라(서덜랜드–호지먼) 안에 든 넓이를 그대로 구했다. 구멍은 음수로 뺐다. 점유율은 근사 72각형 넓이로 나눠 통째로 든 원이 정확히 100이 되게 했고, 반지름을 조금씩 키우며 점유율이 처음 50 밑으로 내려가는 반지름을 반만 차는 반지름으로 적었다.',
  coverageFrom: '동마다 쪽을 두는 곳은 서울·인천·경기·부산이고, 대전·대구·울산과 광주 광산구, 고른 시·군은 시군구 쪽 하나로 받아요. 읍·면은 쪽 없이 시군구 목록에 이름만 올려 뒀어요.',
  radii: RADII,
  shapes: SHAPES,
  counts: {
    sido: sido.length,
    sidoMain: sido.filter((s) => s.main).length,
    gu: guAll.length,
    guMain: guAll.filter((g) => g.main).length,
    spot: spotAll.length,
    rural: guAll.reduce((s, g) => s + g.ruralCount, 0),
    eup: guAll.reduce((s, g) => s + g.eupCount, 0),
    myeon: guAll.reduce((s, g) => s + g.myeonCount, 0),
    admin: guAll.reduce((s, g) => s + g.dongCount, 0),
    halfMin: hh[0], halfMid: hh[hh.length >> 1], halfMax: hh[hh.length - 1],
    dropMin: dd[0], dropMid: dd[dd.length >> 1], dropMax: dd[dd.length - 1],
    fullName: spotAll.slice().sort((a, b) => b.half - a.half || byName(a, b))[0].name,
    leakName: spotAll.slice().sort((a, b) => a.half - b.half || byName(a, b))[0].name,
    dropName: spotAll.slice().sort((a, b) => b.drop - a.drop || byName(a, b))[0].name,
    shapeCount: SHAPES.map((q) => cntAll[q] || 0),
    allFull: spotAll.filter((s) => s.occ[2] >= 99.5).length,
    featAll: geo.features.length,
  },
  sido,
};
fs.writeFileSync(OUT, JSON.stringify(out, (k, v) => (k === 'rings' ? undefined : v)));
const C = out.counts;
console.log(`시도 ${C.sido}(메인 ${C.sidoMain}) · 시군구 ${C.gu}(메인 ${C.guMain}) · 거점(동) ${C.spot} · 이름만 ${C.rural}(읍 ${C.eup}·면 ${C.myeon})`);
console.log(`반만 차는 반지름 min ${C.halfMin} · 중앙 ${C.halfMid} · max ${C.halfMax}(${C.fullName}) · 가장 일찍 새는 칸 ${C.leakName}`);
console.log(`떨어지는 폭 min ${C.dropMin} · 중앙 ${C.dropMid} · max ${C.dropMax}(${C.dropName}) · 세 원 다 통째로 든 동 ${C.allFull}`);
console.log(`곡선 모양 ${SHAPES.map((q, i) => `${q} ${C.shapeCount[i]}`).join(' · ')}`);
for (const s of sido) console.log(`   ${s.main ? '■' : '□'} ${s.name.padEnd(3)} 시군구 ${String(s.gu.length).padStart(2)} · 동 ${String(s.spotCount).padStart(4)} · 읍면 ${String(s.ruralCount).padStart(3)} · 점유 ${s.occ ? s.occ.join('/') : '-'} · 평균 ${s.avgOcc}`);
