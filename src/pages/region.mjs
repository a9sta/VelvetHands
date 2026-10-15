import { layout, frame } from '../lib/html.mjs';
import { esc, hash, km2, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepCards, stepSet, statTiles, faqBlock, noticeBlock,
  shapeKin, spotIndex, ruralList, dongNameList, guIndex, kinList, hailStrip,
  topicLinks, courseTopic, halfLabel,
} from '../lib/blocks.mjs';
import { ringGlyph } from '../assets.mjs';
import {
  SPOT_LEAD_A, SPOT_LEAD_B, SPOT_LEAD_C,
  GU_LEAD, SIDO_LEAD_MAIN, SIDO_LEAD_SUB, SEC,
  shapeName, shapeTalk, occWord, halfWord, dropWord,
  ANCHOR, COURSE_ANCHOR, NEAR_ANCHOR, DOC_LINKS,
} from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const R_SPOT = ['500m', '1km', '2km'];
const R_GU = ['2.5km', '5km', '10km'];
const R_SIDO = ['10km', '20km', '40km'];

/** 리드·FAQ 틀에 넘기는 값 꾸러미. 전부 원을 겹쳐 넓이로 구한 숫자다. */
function spotCtx(ctx, sd, g, s) {
  const { cfg, courses, counts } = ctx;
  const n = g.shapeCount[s.shape] || 1;
  return {
    sd, g, s,
    nm: s.name, gu: g.name, sido: sd.name, area: km2(s.area),
    o0: s.occ[0], o1: s.occ[1], o2: s.occ[2],
    r0: R_SPOT[0], r1: R_SPOT[1], r2: R_SPOT[2],
    half: s.half, halfTxt: halfLabel(s.half), halfNote: halfWord(s.half),
    drop: s.drop, dropNote: dropWord(s.drop),
    shapeW: shapeName(s.shape), shapeNote: shapeTalk(s.shape), occNote: occWord(s.occ[0]),
    guHalfRank: s.guHalfRank, halfRank: s.halfRank, dropRank: s.dropRank,
    fullSpot: g.fullSpot, fullSpotV: g.fullSpotV, leakSpot: g.leakSpot, leakSpotV: g.leakSpotV,
    dropSpot: g.dropSpot, dropSpotV: g.dropSpotV, sparseSpot: g.sparseSpot, sparseSpotV: g.sparseSpotV,
    guShapeW: shapeName(g.shape), guO0: g.occ[0], guO1: g.occ[1], guO2: g.occ[2],
    guHalfTxt: halfLabel(g.half, 2500), guDrop: g.drop,
    sameNote: n > 1
      ? `${g.name}에서 ${shapeName(s.shape)} 땅으로 나뉜 구역은 ${n}곳이고 ${s.name}도 그중 하나예요.`
      : `${g.name}에서 ${shapeName(s.shape)} 땅은 ${s.name} 하나뿐이에요.`,
    allSpots: counts.spot, guSpotCount: g.spotCount,
    place: `${g.name} ${s.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((c) => c.price))),
  };
}

/* ── 동 안내문 — 메인 네 시도에서만 낸다 ─────────────────────── */
export function spotPage(ctx, sd, g, s) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/${s.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}/${s.name}`;
  const h = hash(seed, 'spot');
  const c = spotCtx(ctx, sd, g, s);

  const open = `<div class="vh-lead">
  <p>${at(h, SPOT_LEAD_A, 0)(c)}</p>
  <p>${at(h, SPOT_LEAD_B, 1)(c)}</p>
  <p>${at(h, SPOT_LEAD_C, 2)(c)}</p>
</div>`;

  const facts = frame('fact', 'measured', `${esc(s.name)} 땅에 원을 그리면`,
    statTiles([
      ['위치', `<a href="/${sd.slug}/">${esc(sd.full)}</a> › <a href="/${sd.slug}/${g.slug}/">${esc(g.name)}</a>`, true],
      [`찬 몫 · 반경 ${R_SPOT[0]}`, `${s.occ[0]}%`],
      [`찬 몫 · 반경 ${R_SPOT[1]}`, `${s.occ[1]}%`],
      [`찬 몫 · 반경 ${R_SPOT[2]}`, `${s.occ[2]}%`],
      ['절반 반지름', `${esc(c.halfTxt)}<small>${esc(c.halfNote)}</small>`],
      ['빠지는 폭', `${s.drop}%p<small>${esc(c.dropNote)}</small>`],
      ['땅 모양', `${ringGlyph(s.occ)}${esc(c.shapeW)}<small>${esc(c.shapeNote)}</small>`, true],
      ['넓이', km2(s.area)],
      ['순위', `${esc(g.name)} 안 ${s.guHalfRank}번째<small>안내문 ${ctx.counts.spot}구역 중 ${s.halfRank}번째</small>`],
    ]),
    esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    if (r.main) for (const x of r.gu) for (const y of x.spots) far.push({ label: `${x.name} ${y.name}`, href: `/${r.slug}/${x.slug}/${y.slug}/` });
    else for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const sameSido = [];
  for (const x of sd.gu) {
    if (x.slug === g.slug) continue;
    for (const y of x.spots) sameSido.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  }
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: `${sd.name} 안 다른 구역`, items: sameSido, pick: 18, anchor: ANCHOR },
    { label: '땅 모양이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    { label: '다른 시도', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    courseRoll(courses, seed, s.name, '02', { full: false }),
    hailStrip(cfg, `${g.name} ${s.name}`, seed),
    shapeKin(sd, g, s, seed, '03'),
    stepCards(seed, '04'),
    faqHtml,
    spotIndex(sd, g, seed, s.slug, '05'),
    guIndex(sd, seed, g.slug, '07', { pick: 12 }),
    noticeBlock(seed, '08'),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.spot(sd, g, s),
      desc: clampDesc(desc.spot(sd, g, s)),
      h1: `${esc(g.name)} ${esc(s.name)} <span class="vh-h1-s">출장마사지 홈타이 · 반경 ${R_SPOT[0]} 안 땅이 ${s.occ[0]}%인 ${esc(c.shapeW)} 땅</span>`,
      body,
      pageKind: 'spot',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name} ${s.name}`, lat: s.lat, lng: s.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` },
        { name: s.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name} ${s.name}`, { lat: s.lat, lng: s.lng },
          { area: s.area, containedIn: { '@type': 'AdministrativeArea', name: `${sd.full} ${g.name}` } }),
        S.service({
          siteUrl, url, cfg,
          name: `${g.name} ${s.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.spot(sd, g, s)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.faqPage(url, qa),
        S.howTo(url, `${g.name} ${s.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}

/* ── 시군구 안내문 ────────────────────────────────────────────── */
export function guPage(ctx, sd, g) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/${g.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = `${sd.name}/${g.name}`;
  const h = hash(seed, 'gu');

  /* ★읍을 뺀 뒤로 '행정동이 전부 읍·면인 군'이 생겼다. 안내문을 낼 구역이 0이므로 갈래를 나눈다. */
  const mode = g.main ? (g.spotCount ? 'spot' : 'rural') : 'list';
  let topShape = '', topN = 0;
  for (const [k, v] of Object.entries(g.shapeCount || {})) if (v > topN) { topShape = k; topN = v; }
  const c = {
    sido: sd.name, name: g.name, gu: g.name, mainSite: g.main, mode,
    unitN: mode === 'spot' ? g.spotCount : mode === 'rural' ? g.ruralCount : g.dongNames.length,
    spotCount: g.spotCount, dongCount: g.dongCount,
    ruralCount: g.ruralCount, eupCount: g.eupCount, myeonCount: g.myeonCount,
    area: km2(g.area),
    o0: g.occ[0], o1: g.occ[1], o2: g.occ[2],
    r0: R_GU[0], r1: R_GU[1], r2: R_GU[2],
    halfTxt: halfLabel(g.half, 2500), halfNote: halfWord(g.half),
    drop: g.drop, shapeW: shapeName(g.shape), shapeNote: shapeTalk(g.shape),
    fullSpot: g.fullSpot || '', fullSpotV: g.fullSpotV || 0,
    leakSpot: g.leakSpot || '', leakSpotV: g.leakSpotV || 0,
    dropSpot: g.dropSpot || '', dropSpotV: g.dropSpotV || 0,
    sameNote: g.spotCount
      ? `${g.name}에서 가장 많은 땅 모양은 ${shapeName(topShape)}이고 ${topN}곳이에요.`
      : `${g.name}${josa(g.name, '은/는')} 안내문을 낸 구역이 없어 한 장에서 받아요.`,
    kinCount: g.kinCount,
    place: `${sd.name} ${g.name}`,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const i0 = parseInt(h.substr(0, 3), 16) % GU_LEAD.length;
  const i1 = (i0 + 1 + (parseInt(h.substr(9, 3), 16) % (GU_LEAD.length - 1))) % GU_LEAD.length;
  const open = `<div class="vh-lead">
  <p>${GU_LEAD[i0](c)}</p>
  <p>${GU_LEAD[i1](c)}</p>
</div>`;

  const rows = [
    ['위치', `<a href="/${sd.slug}/">${esc(sd.full)}</a>`],
    ['행정동 합', `${g.dongCount}구역`],
    mode === 'spot' ? ['안내문을 낸 동', `${g.spotCount}구역`]
      : mode === 'rural' ? ['안내문을 낸 동', '없음<small>읍·면만 있는 군이에요</small>']
        : ['끊은 겹', '시군구<small>동 이름은 아래 목록에 있어요</small>'],
    ['읍·면', g.ruralCount ? `${g.ruralCount}구역<small>이름으로만 적음 · 읍 ${g.eupCount} 면 ${g.myeonCount}</small>` : '없음'],
    [`찬 몫 · 반경 ${R_GU[0]}`, `${g.occ[0]}%`],
    [`찬 몫 · 반경 ${R_GU[1]}`, `${g.occ[1]}%`],
    [`찬 몫 · 반경 ${R_GU[2]}`, `${g.occ[2]}%`],
    ['절반 반지름', `${esc(c.halfTxt)}<small>${esc(c.halfNote)}</small>`],
    ['땅 모양', `${ringGlyph(g.occ)}${esc(c.shapeW)}<small>빠지는 폭 ${g.drop}%p</small>`, true],
    ['닮은 시군구', g.kin.length ? `${esc(g.kin[0].gu)} · ${esc(g.kin[1].gu)}<small>외 ${g.kinCount - 2}곳</small>` : '없음'],
    ['넓이', km2(g.area)],
  ];
  if (mode === 'spot' && g.fullSpot) {
    rows.splice(9, 0,
      ['가장 멀리 차는 구역', `<a href="/${sd.slug}/${g.slug}/${g.fullSpotSlug}/">${esc(g.fullSpot)}</a><small>절반 반지름 ${halfLabel(g.fullSpotV)}</small>`],
      ['가장 일찍 꺼지는 구역', `<a href="/${sd.slug}/${g.slug}/${g.leakSpotSlug}/">${esc(g.leakSpot)}</a><small>절반 반지름 ${halfLabel(g.leakSpotV)}</small>`]);
  }
  const facts = frame('fact', 'measured', `${esc(g.name)} 땅에 그린 원`, statTiles(rows), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 5, '06');

  const far = [];
  for (const r of regions) for (const x of r.gu) {
    if (r.slug === sd.slug && x.slug === g.slug) continue;
    far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const steps = stepSet(seed);
  const sidoDeep = [];
  for (const x of sd.gu) for (const y of x.spots) if (x.slug !== g.slug) sidoDeep.push({ label: `${x.name} ${y.name}`, href: `/${sd.slug}/${x.slug}/${y.slug}/` });
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '땅 모양이 닮은 시군구', items: g.kin.map((t) => ({ label: t.gu, href: `/${t.sidoSlug}/${t.slug}/` })), anchor: NEAR_ANCHOR },
    ...(sidoDeep.length ? [{ label: `${sd.name} 동으로 바로`, items: sidoDeep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시군구', items: far, pick: 18, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '10', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    mode === 'spot' ? spotIndex(sd, g, seed, null, '02') : mode === 'list' ? dongNameList(g, seed, '02') : '',
    ruralList(g, seed, '03'),
    hailStrip(cfg, `${sd.name} ${g.name}`, seed),
    courseRoll(courses, seed, g.name, '04', { full: false }),
    kinList(sd, g, seed, '05'),
    stepCards(seed, '06'),
    faqHtml,
    noticeBlock(seed, '08'),
    guIndex(sd, seed, g.slug, '09', { pick: 20 }),
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.gu(sd, g),
      desc: clampDesc(desc.gu(sd, g)),
      h1: `${esc(sd.name)} ${esc(g.name)} <span class="vh-h1-s">출장마사지 홈타이 · ${mode === 'spot' ? `동 ${g.spotCount}구역 안내문` : mode === 'rural' ? `읍·면 ${g.ruralCount}구역까지 찾아가요` : `행정동 ${g.dongCount}구역 전부 찾아가요`}</span>`,
      body,
      pageKind: 'gu',
      geo: { iso: sd.iso, placename: `${sd.full} ${g.name}`, lat: g.lat, lng: g.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url: `${siteUrl}/${sd.slug}/` },
        { name: g.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, `${sd.full} ${g.name}`, { lat: g.lat, lng: g.lng },
          { area: g.area, containedIn: { '@type': 'AdministrativeArea', name: sd.full } }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} ${g.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.gu(sd, g)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        g.spots.length
          ? S.itemList(`${url}#spotlist`, `${g.name} 동`, g.spots.map((s) => ({ name: s.name, url: `${siteUrl}/${sd.slug}/${g.slug}/${s.slug}/` })))
          : null,
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name} ${g.name}에서 부르는 다섯 걸음`, steps, cfg),
      ].filter(Boolean),
    }),
  };
}

/* ── 시도 안내문 ──────────────────────────────────────────────── */
export function sidoPage(ctx, sd) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const path = `/${sd.slug}/`;
  const url = `${siteUrl}${path}`;
  const seed = sd.name;
  const h = hash(seed, 'sd');
  const byHalf = sd.gu.slice().sort((a, b) => b.half - a.half || a.name.localeCompare(b.name, 'ko'));

  const o = sd.occ || [sd.avgOcc, sd.avgOcc, sd.avgOcc];
  const c = {
    name: sd.name, full: sd.full, guCount: sd.gu.length,
    spotCount: sd.spotCount, dongCount: sd.dongCount, ruralCount: sd.ruralCount,
    r0: R_SIDO[0], r1: R_SIDO[1], r2: R_SIDO[2],
    o0: o[0], o1: o[1], o2: o[2], avgOcc: sd.avgOcc,
    fullName: sd.fullName, leakName: sd.leakName,
    place: sd.name,
    hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
    tel: cfg.tel, telLabel: cfg.telLabel,
    minPrice: won(Math.min(...courses.map((x) => x.price))),
  };

  const open = `<div class="vh-lead"><p>${at(h, sd.main ? SIDO_LEAD_MAIN : SIDO_LEAD_SUB, 0)(c)}</p></div>`;

  const link = (nm, slug) => (sd.main ? esc(nm) : `<a href="/${sd.slug}/${slug}/">${esc(nm)}</a>`);
  const facts = frame('fact', 'measured', `${esc(sd.name)} 땅에 그린 원`,
    statTiles([
      ['행정 명칭', esc(sd.full)],
      ['안내문을 낸 겹', sd.main ? '시군구 밑에 동까지' : '시군구에서 끊음'],
      ['시군구', `${sd.gu.length}곳`],
      ['행정동 합', `${sd.dongCount}구역`],
      sd.main ? ['안내문을 낸 동', `${sd.spotCount}구역`] : ['동 이름', '아래 시군구 쪽 목록에 있어요'],
      ['읍·면', sd.ruralCount ? `${sd.ruralCount}구역<small>시군구 안내문에 이름으로만</small>` : '없음'],
      ...(sd.main
        ? [
          [`찬 몫 · 반경 ${R_SIDO[0]}`, `${sd.occ[0]}%`],
          [`찬 몫 · 반경 ${R_SIDO[1]}`, `${sd.occ[1]}%`],
          [`찬 몫 · 반경 ${R_SIDO[2]}`, `${sd.occ[2]}%`],
          ['땅 모양', `${ringGlyph(sd.occ)}${esc(shapeName(sd.shape))}<small>빠지는 폭 ${sd.drop}%p</small>`, true],
          ['동 평균 찬 몫', `${sd.avgOcc}%<small>반경 500m 기준</small>`],
        ]
        : [
          ['시군구 평균 찬 몫', `${sd.avgOcc}%<small>반경 2.5km 기준</small>`, true],
          ['평균 절반 반지름', `${halfLabel(sd.avgHalf, 2500)}`],
          ['받는 시각', `${esc(cfg.hours)}<small>${esc(cfg.pay)}</small>`],
        ]),
      ['가장 멀리 차는 곳', `${link(sd.fullName, sd.fullSlug)}<small>절반 반지름 ${halfLabel(sd.fullV)}</small>`],
      ['가장 일찍 꺼지는 곳', `${link(sd.leakName, sd.leakSlug)}<small>절반 반지름 ${halfLabel(sd.leakV, 500)}</small>`],
    ]), esc(at(h, SEC.factSub, 7)), '01');

  const { html: faqHtml, qa } = faqBlock(seed, c, 4, '06');

  const csLinks = frame('sidocourse', 'courses', `${esc(sd.name)}에서 고르는 코스`,
    `<ul class="vh-pills">\n${courses.map((x) => `<li><a href="/${sd.slug}/course/${x.slug}/">${esc(sd.name)} ${esc(x.ko)}</a></li>`).join('\n')}\n</ul>`,
    `코스가 달라지면 손이 오래 머무는 자리도 달라져요. 비용표는 ${esc(sd.name)} 전체가 한 장이에요.`, '04');

  let pickBlock = '';
  if (sd.main) {
    const all = [];
    for (const g of sd.gu) for (const s of g.spots) all.push({ g, s });
    all.sort((a, b) => b.s.drop - a.s.drop || a.s.name.localeCompare(b.s.name, 'ko'));
    pickBlock = frame('dropped', 'steepest', `${esc(sd.name)}에서 찬 몫이 가장 가파르게 빠지는 동`,
      `<ul class="vh-pills">\n${all.slice(0, 18).map((x) => `<li><a href="/${sd.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}<small>${x.s.drop}%p</small></a></li>`).join('\n')}\n</ul>`,
      '원을 키울수록 땅이 급하게 줄어드는 구역이에요. 이런 곳은 주소를 끝까지 들어야 길이 서요. 여기 없는 구역은 시군구를 거쳐 들어가 주세요.', '03');
  } else {
    pickBlock = frame('halfpick', 'far reach', `${esc(sd.name)}에서 땅이 가장 멀리 이어지는 시군구`,
      `<ul class="vh-pills">\n${byHalf.slice(0, 12).map((g) => `<li><a href="/${sd.slug}/${g.slug}/">${esc(g.name)}<small>${halfLabel(g.half, 2500)}</small></a></li>`).join('\n')}\n</ul>`,
      '절반 반지름이 길수록 땅이 멀리까지 두툼하게 이어지는 시군구예요.', '03');
  }

  const far = [];
  for (const r of regions) {
    if (r.slug === sd.slug) continue;
    for (const x of r.gu) far.push({ label: `${r.name} ${x.name}`, href: `/${r.slug}/${x.slug}/` });
  }
  const deep = [];
  for (const g of sd.gu) for (const x of g.spots) deep.push({ label: `${g.name} ${x.name}`, href: `/${sd.slug}/${g.slug}/${x.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: `${sd.name} + 코스로`, items: courseTopic(sd, courses), anchor: COURSE_ANCHOR },
    { label: '코스 한 장씩', items: courses.map((x) => ({ label: x.ko, href: `/course/${x.slug}/` })), anchor: COURSE_ANCHOR },
    ...(deep.length ? [{ label: `${sd.name} 동으로 바로`, items: deep, pick: 16, anchor: ANCHOR }] : []),
    { label: '다른 시도', items: far, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '08', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));

  const body = [
    open,
    facts,
    hailStrip(cfg, sd.name, seed),
    guIndex(sd, seed, null, '02'),
    pickBlock,
    csLinks,
    courseRoll(courses, seed, sd.name, '05', { full: false }),
    stepCards(seed, '06'),
    faqHtml,
    topics,
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.sido(sd),
      desc: clampDesc(desc.sido(sd)),
      h1: `${esc(sd.name)} <span class="vh-h1-s">출장마사지 홈타이 · ${sd.main ? `동 ${sd.spotCount}구역 · 땅 모양 ${esc(shapeName(sd.shape))}` : `시군구 ${sd.gu.length}곳 · 평균 찬 몫 ${sd.avgOcc}%`}</span>`,
      body,
      pageKind: 'sido',
      geo: { iso: sd.iso, placename: sd.full, lat: sd.lat, lng: sd.lng },
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '방문 지역', url: `${siteUrl}/area/` },
        { name: sd.name, url },
      ],
      jsonld: [
        S.place(`${url}#place`, sd.full, { lat: sd.lat, lng: sd.lng }, { area: sd.area, alternateName: sd.alias }),
        S.service({
          siteUrl, url, cfg,
          name: `${sd.name} 방문 관리 — 출장마사지 홈타이`,
          desc: clampDesc(desc.sido(sd)),
          areaServed: { '@id': `${url}#place` },
          courses,
        }),
        S.itemList(`${url}#gulist`, `${sd.name} 시군구`, sd.gu.map((g) => ({ name: g.name, url: `${siteUrl}/${sd.slug}/${g.slug}/` }))),
        S.itemList(`${url}#courselist`, `${sd.name} 코스`, courses.map((cc) => ({ name: `${sd.name} ${cc.ko}`, url: `${siteUrl}/${sd.slug}/course/${cc.slug}/` }))),
        S.faqPage(url, qa),
        S.howTo(url, `${sd.name}에서 부르는 다섯 걸음`, steps, cfg),
      ],
    }),
  };
}
