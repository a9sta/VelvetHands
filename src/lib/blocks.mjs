import { esc, hash, shuffle, won, josa } from './util.mjs';
import { frame, callBox } from './html.mjs';
import { ringGlyph } from '../assets.mjs';
import { ANCHOR, FAQ_POOL, STEP_SETS, NOTICE, SEC, COURSE_ANCHOR, DOC_LINKS, fm, shapeName } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

/** 한글 첫소리 — 동 이름을 묶을 때 쓴다. */
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MERGE = { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ' };
export function choOf(name) {
  const c = name.codePointAt(0) - 0xac00;
  if (c < 0 || c >= 11172) return '#';
  const k = CHO[Math.floor(c / 588)];
  return MERGE[k] || k;
}

const SHAPE_ORDER = ['full', 'solid', 'steady', 'slide', 'sharp', 'rise', 'thin'];
/** 절반 반지름 표기. 0 은 가장 작은 원에서 이미 절반 아래라는 뜻이다. */
export const halfLabel = (m, r0m = 500) => (m === 0 ? `${fm(r0m)} 미만` : fm(m));

/* ── 예약 문의 띠 ───────────────────────────────────────────── */
export function hailStrip(cfg, place, seedKey) {
  const h = hash(seedKey, 'hs');
  const lines = [
    `${place}이라는 말만 주셔도 돼요. 남은 주소는 통화하면서 같이 채워요.`,
    `${place}에 지금 나갈 수 있는지는 통화하는 동안 알려 드려요.`,
    `${place}${josa(place, '으로/로')} 가려면 코스, 시각, 주소 세 가지만 있으면 돼요.`,
    `${place} 접수 창구는 이 번호 하나예요. 다른 길은 따로 만들어 두지 않았어요.`,
  ];
  return `<section class="vh-hail" aria-label="${esc(place)} 예약 문의">
  <p class="vh-hail-p">${esc(at(h, lines))}</p>
  ${callBox(cfg, { size: 'l' })}
  <p class="vh-hail-s">${esc(at(h, SEC.askTail, 2).replace('@A', cfg.arrive).replace('@H', cfg.hours).replace('@P', cfg.pay))}</p>
</section>`;
}

/* ── 코스 = 점 줄 메뉴판 + 세기 알 ─────────────────────────────
   ★안내문마다 아홉 가지를 통째로 되풀이하면 그 덩어리가 본문에서 가장 커진다.
     동·시군구에서는 시드로 고른 셋만 보이고 나머지는 코스 안내문으로 보낸다. */
const PRESS = { '약': 1, '약~중': 2, '중': 3, '중~강': 4, '강': 5 };
function pips(p) {
  const n = PRESS[p] || 3;
  return `<span class="m-p" aria-hidden="true">${[1, 2, 3, 4, 5].map((i) => `<i${i <= n ? ' class="on"' : ''}></i>`).join('')}</span>`;
}
export function courseRoll(courses, seedKey, place, num = '01', { full = true } = {}) {
  const h = hash(seedKey, 'cr');
  const show = full ? courses : shuffle(courses.slice(), h).slice(0, 3);
  const withText = new Set(shuffle(show.map((c) => c.slug), h).slice(0, full ? 2 : 1));
  const list = show.map((c) => {
    const line = at(hash(seedKey, c.slug), c.lines);
    return `<li>
    <a href="/course/${c.slug}/"><span class="m-n">${esc(c.ko)}</span><span class="m-d"></span><span class="m-w">${won(c.price)}원</span></a>
    <div class="m-s">${pips(c.pressure)}<span>${c.min}분 · 세기 ${esc(c.pressure)} · ${c.oil ? '기름 씀' : '기름 안 씀'}</span></div>
    ${withText.has(c.slug) ? `<p class="m-t">${esc(line)}</p>` : ''}
  </li>`;
  }).join('\n');
  const short = [
    `${esc(place)}에서도 아홉 가지를 똑같이 들고 가요. 나머지 여섯은 <a href="/course/">코스 안내문</a>에, 값은 <a href="/price/">비용</a>에 있어요.`,
    `${esc(place)}에서 통화로 자주 나오는 셋만 올렸어요. <a href="/course/">아홉 가지 전부</a>와 <a href="/price/">값만 추린 쪽</a>도 따로 있어요.`,
    `${esc(place)}이라고 고를 수 있는 폭이 줄지 않아요. <a href="/course/">남은 여섯</a>과 <a href="/price/">비용 전체</a>를 같이 걸어 뒀어요.`,
    `세기나 길이가 안 맞으면 <a href="/course/">아홉 가지</a>를 펼쳐 보세요. 어느 구역이든 <a href="/price/">쓰는 표는 하나</a>예요.`,
  ];
  const tail = full
    ? `${esc(at(h, SEC.courseTail, 2))} ${at(h, SEC.courseLink, 5)}`
    : at(h, short, 4);
  return frame('course', 'courses', full ? `${esc(place)}까지 들고 가는 아홉 가지` : `${esc(place)}에서 자주 고르는 셋`,
    `<ul class="vh-menu">\n${list}\n</ul>
     <p class="vh-sec-x">${tail}</p>`,
    esc(at(h, SEC.courseSub, 1)), num);
}

/* ── 접수 흐름 = 순번 카드 ─────────────────────────────────── */
export function stepSet(seedKey) {
  return at(hash(seedKey, 'st'), STEP_SETS);
}
export function stepCards(seedKey, num = '04') {
  const h = hash(seedKey, 'st');
  const steps = at(h, STEP_SETS);
  return frame('step', 'order', esc(at(h, SEC.stepTitle, 1)),
    `<ol class="vh-cards">\n${steps.map((s) => `<li><b>${esc(s.t)}</b><span>${esc(s.d)}</span></li>`).join('\n')}\n</ol>`,
    esc(at(h, SEC.stepSub, 2)), num);
}

/* ── 숫자 타일 — rows: [라벨, 값(HTML), wide?] ─────────────── */
export function statTiles(rows) {
  return `<dl class="vh-stats">\n${rows.map((r) => `<div class="vh-stat${r[2] ? ' wide' : ''}"><dt>${esc(r[0])}</dt><dd>${r[1]}</dd></div>`).join('\n')}\n</dl>`;
}

/* ── 자주 묻는 것 — 접고 펴기. 질문은 summary 안의 h3 ──────── */
export function faqBlock(seedKey, c, n = 5, num = '05') {
  const h = hash(seedKey, 'fq');
  const idx = shuffle(FAQ_POOL.map((_, i) => i), h).slice(0, n);
  const qa = idx.map((i) => {
    const item = FAQ_POOL[i];
    const av = item.a[parseInt(hash(seedKey, 'av', i).substr(0, 3), 16) % item.a.length];
    return { q: item.q(c), a: av(c) };
  });
  const html = frame('faq', 'asked', esc(at(h, SEC.faqTitle, 3)),
    `<div class="vh-qa">\n${qa.map((x, i) => `<details${i === 0 ? ' open' : ''}><summary><h3>${esc(x.q)}</h3></summary><p>${esc(x.a)}</p></details>`).join('\n')}\n</div>`,
    esc(at(h, SEC.faqSub, 4)), num);
  return { html, qa };
}

/* ── 안내/주의 ────────────────────────────────────────────────── */
export function noticeBlock(seedKey, num) {
  const h = hash(seedKey, 'nt');
  const items = shuffle(NOTICE, h).slice(0, 4);
  return frame('notice', 'mind', esc(at(h, SEC.noticeTitle, 5)),
    `<ul class="vh-heed">\n${items.map((t) => `<li>${esc(t)}</li>`).join('\n')}\n</ul>`, null, num);
}

/* ── 롱테일 링크 ──────────────────────────────────────────────── */
export function longtail(pool, seedKey, n, label, heading, sub, num) {
  const h = hash(seedKey, 'lt');
  const picked = shuffle(pool, h).slice(0, n);
  const items = picked.map((p) => {
    const tpl = ANCHOR[parseInt(hash(seedKey, p.label).substr(0, 3), 16) % ANCHOR.length];
    return `<li><a href="${p.href}">${esc(tpl(p.label))}</a></li>`;
  }).join('\n');
  return frame('longtail', label, heading, `<ul class="vh-pills">\n${items}\n</ul>`, sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 롱테일 주제 묶음 ──────────────────────────────────────────
   주제별로 갈라 묶고 묶음마다 앵커 틀을 달리 둔다. */
export function topicLinks(groups, seedKey, num, heading, sub) {
  const h = hash(seedKey, 'tp');
  const body = groups.filter((g) => g.items && g.items.length).map((g, gi) => {
    const picked = (g.pick ? shuffle(g.items, hash(seedKey, 'tp', gi)) : g.items).slice(0, g.pick || g.items.length);
    const li = picked.map((p) => {
      const base = p.labels ? p.labels[parseInt(hash(seedKey, p.href).substr(0, 3), 16) % p.labels.length] : p.label;
      const tpl = g.anchor ? g.anchor[parseInt(hash(seedKey, g.label, base).substr(0, 3), 16) % g.anchor.length] : null;
      return `<li><a href="${p.href}">${esc(tpl ? tpl(base) : base)}</a></li>`;
    }).join('\n');
    return `<div>
      <p class="vh-route-h">${esc(g.label)}</p>
      <ul class="vh-pills">\n${li}\n</ul>
    </div>`;
  }).join('\n');
  return frame('topic', 'ways in', heading, `<div class="vh-routes">${body}</div>`,
    sub || esc(at(h, SEC.ltSub, 6)), num);
}

/* ── 찬 몫의 결로 묶은 줄 ─────────────────────────────────────
   원 안 점유가 닮은 곳을 한 줄씩 모아 건네준다.
   ★후보 윗부분에서 시드로 다시 뽑아, 쪽마다 걸리는 곳이 달라지게 한다. */
export function spotPool(regions, { sidoLabel = false, skipGu = '' } = {}) {
  const out = [];
  for (const r of regions) if (r.main) for (const g of r.gu) {
    if (skipGu && `${r.slug}/${g.slug}` === skipGu) continue;
    for (const s of g.spots) out.push({ href: `/${r.slug}/${g.slug}/${s.slug}/`, label: `${sidoLabel ? `${r.name} ` : ''}${g.name} ${s.name}`, u: s });
  }
  return out;
}
export function guPool(regions, { sidoLabel = false, skip = '' } = {}) {
  const out = [];
  for (const r of regions) for (const g of r.gu) {
    if (skip && `${r.slug}/${g.slug}` === skip) continue;
    out.push({ href: `/${r.slug}/${g.slug}/`, label: `${sidoLabel ? `${r.name} ` : ''}${g.name}`, u: g });
  }
  return out;
}
const SHAPE_HEAD = {
  full: '세 원이 모두 땅 안에 든', solid: '작은 원은 차고 큰 원에서 빠지는', steady: '원을 키워도 찬 몫이 그대로인',
  slide: '원이 커질수록 완만하게 줄어드는', sharp: '원이 커지면 가파르게 떨어지는', rise: '원이 커질수록 찬 몫이 느는',
  thin: '작은 원부터 땅이 드문드문한',
};
function themeDefs(noun) {
  const defs = SHAPE_ORDER.map((sh) => ({
    k: `s${sh}`, t: `${SHAPE_HEAD[sh]} ${noun}`, f: (u) => u.shape === sh,
    sort: (a, b) => b.occ[0] - a.occ[0] || b.half - a.half, m: (u) => `찬 몫 ${u.occ[0]}%`,
  }));
  defs.push({ k: 'wide', t: `절반 선이 가장 먼 ${noun}`, f: (u) => u.half > 0, sort: (a, b) => b.half - a.half, m: (u) => `절반 ${halfLabel(u.half)}` });
  defs.push({ k: 'near', t: `절반 선이 가장 가까운 ${noun}`, f: (u) => u.half > 0, sort: (a, b) => a.half - b.half, m: (u) => `절반 ${halfLabel(u.half)}` });
  defs.push({ k: 'zero', t: `가장 작은 원에서 이미 절반 아래인 ${noun}`, f: (u) => u.half === 0, sort: (a, b) => a.occ[0] - b.occ[0], m: (u) => `찬 몫 ${u.occ[0]}%` });
  defs.push({ k: 'dropbig', t: `큰 원에서 가장 크게 빠지는 ${noun}`, f: (u) => u.drop > 0, sort: (a, b) => b.drop - a.drop, m: (u) => `빠짐 ${u.drop}%` });
  defs.push({ k: 'dropsmall', t: `원을 키워도 거의 안 빠지는 ${noun}`, f: (u) => u.drop <= 25, sort: (a, b) => a.drop - b.drop, m: (u) => `빠짐 ${u.drop}%` });
  defs.push({ k: 'top', t: `가장 작은 원이 가장 꽉 찬 ${noun}`, f: () => true, sort: (a, b) => b.occ[0] - a.occ[0], m: (u) => `찬 몫 ${u.occ[0]}%` });
  defs.push({ k: 'sparse', t: `가장 작은 원이 가장 성긴 ${noun}`, f: () => true, sort: (a, b) => a.occ[0] - b.occ[0], m: (u) => `찬 몫 ${u.occ[0]}%` });
  return defs;
}
export function themeCards({ pool, noun, seedKey, num, heading, sub, cards = 4, per = 4, prefer = [] }) {
  const defs = themeDefs(noun).map((d) => ({ ...d, c: pool.filter((x) => d.f(x.u)) })).filter((d) => d.c.length >= per);
  if (!defs.length) return { html: '', list: [] };
  const order = shuffle(defs, hash(seedKey, 'tc'));
  const first = prefer.map((k) => order.find((d) => d.k === k)).filter(Boolean);
  const chosen = [...first, ...order.filter((d) => !first.includes(d))].slice(0, cards);
  const list = [];
  const body = chosen.map((d) => {
    const win = d.c.slice().sort((a, b) => d.sort(a.u, b.u) || a.label.localeCompare(b.label, 'ko')).slice(0, per * 3);
    const pick = shuffle(win, hash(seedKey, 'tc', d.k)).slice(0, per).sort((a, b) => d.sort(a.u, b.u) || a.label.localeCompare(b.label, 'ko'));
    for (const x of pick) list.push({ name: x.label, href: x.href });
    return `<div><dt>${esc(d.t)}</dt><dd><ul class="vh-pills">${pick.map((x) => `<li><a href="${x.href}">${esc(x.label)}<small>${esc(d.m(x.u))}</small></a></li>`).join('')}</ul></dd></div>`;
  }).join('\n');
  return { html: frame('theme', 'by grain', heading, `<dl class="vh-lanes">${body}</dl>`, sub, num), list };
}

/** 코스 묶음 — 시도별 코스 안내문으로 가는 롱테일. */
export function courseTopic(sd, courses) {
  return courses.map((c) => ({ label: `${sd.name} ${c.ko}`, href: `/${sd.slug}/course/${c.slug}/` }));
}

/* ── 같은 모양의 구역 ─────────────────────────────────────────
   같은 시군구 안에서 땅 모양이 같은 구역부터, 그다음 절반 반지름이 가까운 차례로. */
export function shapeKin(sd, g, s, seedKey, num) {
  const pool = g.spots.filter((x) => x.slug !== s.slug);
  if (!pool.length) return '';
  const rank = (o) => (o.shape === s.shape ? 0 : 1);
  const sorted = pool.slice().sort((a, b) => rank(a) - rank(b) || Math.abs(a.half - s.half) - Math.abs(b.half - s.half) || a.name.localeCompare(b.name, 'ko'));
  const pick = sorted.slice(0, 8);
  return frame('kin', 'same shape', `${esc(g.name)}에서 ${esc(s.name)}${josa(s.name, '과/와')} 모양이 닮은 구역`,
    `<ul class="vh-pills">\n${pick.map((x) => `<li><a href="/${sd.slug}/${g.slug}/${x.slug}/">${esc(x.name)}<small>${esc(shapeName(x.shape))} · ${halfLabel(x.half)}</small></a></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'lk'), SEC.kinSub)), num);
}

/* ── 시군구 안의 구역 목록 — 땅 모양별로 묶는다 ──────────────── */
export function spotIndex(sd, g, seedKey, currentSlug, num) {
  const groups = new Map();
  for (const s of g.spots) {
    if (!groups.has(s.shape)) groups.set(s.shape, []);
    groups.get(s.shape).push(s);
  }
  const body = SHAPE_ORDER.filter((k) => groups.has(k)).map((k) => {
    const list = groups.get(k).slice().sort((a, b) => b.half - a.half || a.name.localeCompare(b.name, 'ko'));
    return `<section><h3>${esc(shapeName(k))}<em>${list.length}</em></h3><ul class="vh-pills">${list
      .map((s) => `<li><a href="/${sd.slug}/${g.slug}/${s.slug}/"${s.slug === currentSlug ? ' aria-current="page"' : ''}>${esc(s.name)}<small>${halfLabel(s.half)}</small></a></li>`).join('')}</ul></section>`;
  }).join('\n');
  return frame('spotidx', 'places', `${esc(g.name)} 쪽이 있는 동 ${g.spotCount}곳`,
    `<div class="vh-grp">${body}</div>`,
    esc(at(hash(seedKey, 'sx'), SEC.spotIdxSub)), num);
}

/* ── 시군구 안의 읍·면 목록 ────────────────────────────────────
   ★읍은 2026-10-13 지시로 안내문을 내지 않는다. 면과 함께 이름만 올린다. */
export function ruralList(g, seedKey, num) {
  if (!g.ruralCount) return '';
  const label = g.eupCount && g.myeonCount ? `읍 ${g.eupCount}·면 ${g.myeonCount}`
    : g.eupCount ? `읍 ${g.eupCount}` : `면 ${g.myeonCount}`;
  return frame('rural', 'rural', `${esc(g.name)}에 있는 ${esc(label)} 이름들`,
    `<ul class="vh-pills">\n${g.rural.map((m) => `<li><span>${esc(m.name)}</span></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'ru'), SEC.ruralSub)), num);
}

/* ── 서브 지역 시군구 안의 동 이름 ──────────────────── */
export function dongNameList(g, seedKey, num) {
  if (!g.dongNames || !g.dongNames.length) return '';
  const names = shuffle(g.dongNames.slice(), hash(seedKey, 'dnl'));
  return frame('dongidx', 'dong', `${esc(g.name)}에 든 동 ${g.dongNames.length}구역`,
    `<ul class="vh-pills">\n${names.map((d) => `<li><span>${esc(d)}</span></li>`).join('\n')}\n</ul>`,
    esc(at(hash(seedKey, 'dn'), SEC.dongSub)), num);
}

/* ── 시도 안의 시군구 목록 ──────────────────────────────────────
   ★깊이 들어온 쪽에서는 시드로 고른 일부만 걸고 나머지는 시도 안내문으로 보낸다. */
export function guIndex(sd, seedKey, currentSlug, num, { pick = 0 } = {}) {
  let list = sd.gu;
  if (pick && sd.gu.length > pick) {
    const keep = new Set(shuffle(sd.gu.map((g) => g.slug), hash(seedKey, 'gi')).slice(0, pick));
    if (currentSlug) keep.add(currentSlug);
    list = sd.gu.filter((g) => keep.has(g.slug));
  }
  list = list.slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const items = list.map((g) => `<li><a href="/${sd.slug}/${g.slug}/"${g.slug === currentSlug ? ' aria-current="page"' : ''}>${esc(g.name)}<small>${g.occ[0]}%</small></a></li>`).join('\n');
  const partial = list.length < sd.gu.length;
  return frame('guidx', 'districts', partial ? `${esc(sd.name)} 시군구 중 ${list.length}곳` : `${esc(sd.name)} 아래 시군구 ${sd.gu.length}곳`,
    `<ul class="vh-pills">\n${items}\n</ul>${partial ? `\n<p class="vh-sec-x">${esc(sd.name)}에 든 시군구는 모두 ${sd.gu.length}곳이에요. <a href="/${sd.slug}/">${esc(sd.name)} 안내문</a>에 전부 펼쳐 뒀어요.</p>` : ''}`,
    esc(at(hash(seedKey, 'gi'), SEC.guIdxSub)), num);
}

/* ── 땅 모양이 닮은 시군구 ────────────────────────────────────── */
export function kinList(sd, g, seedKey, num) {
  if (!g.kinCount) return '';
  const items = g.kin.map((t) => `<li><a href="/${t.sidoSlug}/${t.slug}/">${esc(t.gu)}<small>${halfLabel(t.half, 2500)}${t.same ? '' : ' · 시도 밖'}</small></a></li>`).join('\n');
  return frame('kin2', 'alike', `${esc(g.name)}${josa(g.name, '과/와')} 땅 모양이 닮은 시군구`,
    `<ul class="vh-pills">\n${items}\n</ul>`,
    esc(at(hash(seedKey, 'kl'), SEC.nearSub)), num);
}

/* ── 아래쪽 안내 링크 ─────────────────────────────────────────── */
export function siteLinks(ctx, seedKey) {
  const { regions } = ctx;
  const h = hash(seedKey, 'sl');
  const all = [];
  for (const r of regions) for (const g of r.gu) for (const s of g.spots) all.push({ r, g, s });
  const spots = shuffle(all, h).slice(0, 12);
  return frame('also', 'more', '이어서 볼 곳',
    `<ul class="vh-pills">
      <li><a href="/area/">방문 지역 전부</a></li>
      <li><a href="/guide/">시작하기 전에</a></li>
      <li><a href="/price/">비용</a></li>
      <li><a href="/course/">코스</a></li>
      <li><a href="/magazine/">원 메모</a></li>
      ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      ${spots.map((x) => `<li><a href="/${x.r.slug}/${x.g.slug}/${x.s.slug}/">${esc(x.g.name)} ${esc(x.s.name)}</a></li>`).join('\n')}
    </ul>`,
    '시도 밑에 시군구가 있고, 수도권과 부산만 동이 한 겹 더 있어요. 그 밖 지역의 동과 읍·면은 이름으로만 올렸어요.');
}

/** 문서·글 안내문에 다는 주제 묶음 */
export function docTopics(ctx, seedKey, num, heading, sub) {
  const { regions, courses } = ctx;
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  return topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 12, anchor: COURSE_ANCHOR },
    { label: '시군구로', items: guList, pick: 14, anchor: ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 14, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seedKey, num, heading, sub);
}
