import { layout, frame, callBox } from '../lib/html.mjs';
import { esc, hash, won, josa } from '../lib/util.mjs';
import { title, desc, clampDesc } from '../lib/seo.mjs';
import * as S from '../lib/schema.mjs';
import {
  courseRoll, stepCards, stepSet, statTiles, faqBlock, noticeBlock,
  longtail, hailStrip, siteLinks, topicLinks, docTopics, halfLabel, themeCards, spotPool,
} from '../lib/blocks.mjs';
import { ringGlyph } from '../assets.mjs';
import { SEC, ANCHOR, COURSE_ANCHOR, DOC_LINKS, shapeName } from '../content/copy.mjs';
import { POSTS } from '../content/posts.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];
const baseCtx = (cfg, courses, place) => ({
  place, hours: cfg.hours, pay: cfg.pay, arrive: cfg.arrive,
  tel: cfg.tel, telLabel: cfg.telLabel,
  minPrice: won(Math.min(...courses.map((c) => c.price))),
});
const dt = (ctx, key) => docTopics(ctx, key, '11', esc(at(hash(key, 'dt'), SEC.topicHead, 8)), esc(at(hash(key, 'dt'), SEC.topicSub, 3)));

/** 서브 시도는 시도 자체의 원이 없어 시군구 점유율을 평균해 글리프를 그린다. */
function subOcc(r) {
  const k = [0, 0, 0];
  for (const g of r.gu) for (let i = 0; i < 3; i++) k[i] += g.occ[i];
  return k.map((v) => v / r.gu.length);
}

/* ── 대문 ─────────────────────────────────────────────────────── */
export function homePage(ctx) {
  const { cfg, siteUrl, courses, regions, counts, latestPosts } = ctx;
  const seed = 'home';
  const h = hash(seed, 'hm');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  const hero = `<section class="vh-door" aria-label="첫 안내">
  <p class="vh-door-sl">${esc(cfg.brand.slogan)}</p>
  <p class="vh-door-p">가게로 오라는 말은 안 해요. 전화를 주면 관리사가 짐을 들고 그 주소로 가요. 서울·인천·경기·부산은 동마다 안내문을 두었고, 대전·대구·울산과 정한 시·군은 시군구까지만 적었어요.</p>
  ${callBox(cfg, { size: 'l' })}
  <ul class="vh-door-f">
    <li><b>${esc(cfg.hours)}</b>쉬는 시각이 없어요</li>
    <li><b>${esc(cfg.pay)}</b>마친 뒤 한 번만 내요</li>
    <li><b>${esc(cfg.arrive)}</b>보통 이만큼 걸려요</li>
    <li><b>동 ${counts.spot}구역</b>시군구 ${counts.gu}곳 안</li>
  </ul>
</section>`;

  const cells = [...main, ...sub].map((r) => {
    const occ = r.main ? r.occ : subOcc(r);
    const meta = r.main ? `동 ${r.spotCount}구역 · ${shapeName(r.shape)}` : `시군구 ${r.gu.length}곳 · 평균 ${r.avgOcc}%`;
    return `<li class="${r.main ? 'main' : 'sub'}"><a href="/${r.slug}/">${ringGlyph(occ)}<span class="vh-ri"><b>${esc(r.name)}</b><span>${esc(meta)}</span></span></a></li>`;
  }).join('\n');
  const areaBlock = frame('area', 'where', '어느 지역에서 부르나요',
    `<ul class="vh-rings">${cells}</ul>
     <p class="vh-key">겹겹의 원은 그 지역 땅의 무게 중심에 반지름 세 개를 그렸을 때 땅이 차 있는 몫이에요. 진할수록 많이 차요.
       실선 칸은 동까지 안내문이 있는 곳이고, 옅은 칸은 시군구에서 끝나는 곳이에요. 어느 쪽이든 번호와 비용은 같아요.
       <a href="/area/">방문 지역을 한 장에</a> 모아 뒀어요.</p>`,
    '안내문의 깊이가 다를 뿐 가는 지역을 줄인 게 아니에요.', '01');

  const whyBlock = frame('why', 'method', '왜 땅에 원을 그려 두나요',
    `<div class="vh-lead">
      <p>지역 안내문을 열면 그 땅에 원을 그렸을 때 <strong>안이 얼마나 차 있는지</strong> 적혀 있어요. 안내문을 낸 ${counts.spot}구역 가운데 땅이 가장 멀리까지 차는 곳은 ${esc(counts.fullName)}이고, 가장 일찍 꺼지는 곳은 ${esc(counts.leakName)}이에요. 절반 반지름의 한가운데 값은 ${halfLabel(counts.halfMid)}이에요.</p>
      <p>이 수를 적는 이유는 하나예요. 땅이 일찍 얇아지는 동네는 길도 갑자기 끊기고 돌아가야 하는 일이 많아요. 그래서 <strong>주소를 끝자리까지 듣고 나서야 길이 서요.</strong> 반대로 멀리까지 두툼한 동네는 큰길 하나만 기억해도 닿아요. 찬 몫이 가장 가파르게 빠지는 구역은 ${esc(counts.dropName)}이에요.</p>
      <p>전국 행정동 ${counts.featAll}곳의 경계를 원에 대고 잘라 넓이를 그대로 쟀어요. 같은 순서로 다시 돌리면 같은 숫자가 나와요. 어떻게 쟀는지는 <a href="/magazine/how-we-drew-the-circle/">이 메모</a>에 적어 뒀어요.</p>
    </div>`, null, '02');

  const postBlock = frame('note', 'notes', '부르기 전에 읽어 두면 좋은 글',
    `<ul class="vh-slips">${latestPosts.map((p) => `<li><a href="${p.path}"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>
     <p class="vh-sec-x"><a href="/magazine/">메모 전부 보기</a></p>`,
    '체험담은 아니에요. 먼저 보면 통화가 짧아지는 것만 골랐어요.', '05');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '지금 있는 곳'), 6, '06');

  const deep = [];
  for (const r of regions) if (r.main) for (const g of r.gu) for (const s of g.spots) deep.push({ label: `${g.name} ${s.name}`, href: `/${r.slug}/${g.slug}/${s.slug}/` });
  const guList = [];
  for (const r of regions) for (const g of r.gu) guList.push({ label: `${r.name} ${g.name}`, href: `/${r.slug}/${g.slug}/` });
  const courseAll = courses.map((c) => ({ label: c.ko, href: `/course/${c.slug}/` }));
  const sidoCourse = [];
  for (const r of regions) for (const c of courses) sidoCourse.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });
  const steps = stepSet(seed);
  const topics = topicLinks([
    { label: '코스 이름으로', items: courseAll, anchor: COURSE_ANCHOR },
    { label: '지역 + 코스로', items: sidoCourse, pick: 14, anchor: COURSE_ANCHOR },
    { label: '동 이름으로 바로', items: deep, pick: 18, anchor: ANCHOR },
    { label: '시군구로', items: guList, pick: 16, anchor: ANCHOR },
    { label: '먼저 읽을 것', items: DOC_LINKS },
  ], seed, '09', esc(at(h, SEC.topicHead, 8)), esc(at(h, SEC.topicSub, 3)));
  const theme = themeCards({
    pool: spotPool(regions, { sidoLabel: true }), noun: '동', seedKey: seed, num: '08',
    heading: esc(at(h, SEC.themeHead, 4)), sub: esc(at(h, SEC.themeSub, 5)), cards: 6, per: 3,
  });

  const body = [
    hero,
    areaBlock,
    whyBlock,
    courseRoll(courses, seed, '부르는 곳', '03'),
    stepCards(seed, '04'),
    postBlock,
    faqHtml,
    noticeBlock(seed, '07'),
    theme.html,
    topics,
    hailStrip(cfg, '지금 있는 곳', seed),
  ].join('\n');

  return {
    path: '/',
    html: layout(ctx, {
      path: '/',
      title: title.home(),
      desc: clampDesc(desc.home()),
      h1: `${esc(cfg.brand.ko)} 출장마사지 홈타이 <span class="vh-h1-s">서울·인천·경기·부산 동 ${counts.spot}구역 · 시군구 ${counts.gu}곳 방문</span>`,
      body,
      pageKind: 'home',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }],
      jsonld: [
        S.service({
          siteUrl, url: siteUrl + '/', cfg,
          name: `${cfg.brand.ko} 출장마사지 홈타이 방문`,
          desc: clampDesc(desc.home()),
          areaServed: { '@type': 'Country', name: '대한민국' },
          courses,
        }),
        S.itemList(`${siteUrl}/#sidolist`, '찾아가는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.itemList(`${siteUrl}/#themes`, '결이 같은 동 모음', theme.list.map((x) => ({ name: x.name, url: `${siteUrl}${x.href}` }))),
        S.faqPage(`${siteUrl}/`, qa),
        S.howTo(`${siteUrl}/`, '전화 한 통으로 부르는 다섯 걸음', steps, cfg),
      ],
    }),
  };
}

/* ── 지역 허브 ────────────────────────────────────────────────── */
export function areaHub(ctx) {
  const { cfg, siteUrl, regions, counts, courses } = ctx;
  const seed = 'area';

  const open = `<div class="vh-lead">
  <p>안내문이 있는 구역을 한 화면에 모았어요. 시군구 ${counts.gu}곳 안에 동 ${counts.spot}구역이 들어 있어요. 읍·면 ${counts.rural}구역은 안내문이 따로 없지만 가는 것도 받는 것도 같아요.</p>
  <p>수도권과 부산은 시군구를 누르면 동이 하나씩 나와요. 나머지는 시군구 안내문 안에 동 이름을 적어 뒀어요. 깊이가 둘로 갈린 건 문의가 많은 쪽만 한 겹 더 팠기 때문이에요.</p>
</div>`;

  const blocks = regions.map((r, i) => frame(`sd-${r.slug}`, r.main ? 'to dong' : 'to district',
    `<a href="/${r.slug}/">${esc(r.name)}</a> ${r.main ? `동 ${r.spotCount}구역` : `시군구 ${r.gu.length}곳`}`,
    `<ul class="vh-pills">${r.gu.map((g) => `<li><a href="/${r.slug}/${g.slug}/">${esc(g.name)}<small>${g.occ[0]}%</small></a></li>`).join('\n')}</ul>`,
    r.main
      ? `${r.name}은 시군구를 하나 눌러야 그 안의 동이 보여요. 이름 옆 숫자는 시군구 한가운데에 반지름 2.5km 원을 그렸을 때 찬 몫이에요.`
      : `${r.name}${josa(r.name, '은/는')} 시군구에서 끝나요. 행정동 ${r.dongCount}구역의 이름은 시군구 안내문마다 적어 뒀어요.`,
    String(i + 1).padStart(2, '0'))).join('\n');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '있는 곳'), 4, '90');

  const body = [open, hailStrip(cfg, '있는 곳', seed), blocks, faqHtml, stepCards(seed, '91')].join('\n');

  return {
    path: '/area/',
    html: layout(ctx, {
      path: '/area/',
      title: title.areaHub(counts),
      desc: clampDesc(desc.areaHub(counts)),
      h1: `방문 지역 <span class="vh-h1-s">시군구 ${counts.gu}곳, 동 ${counts.spot}구역 목록</span>`,
      body,
      pageKind: 'areahub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '방문 지역', url: `${siteUrl}/area/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/area/`, siteUrl, title: title.areaHub(counts), desc: clampDesc(desc.areaHub(counts)), listId: `${siteUrl}/area/#list` }),
        S.itemList(`${siteUrl}/area/#list`, '찾아가는 시도', regions.map((r) => ({ name: r.name, url: `${siteUrl}/${r.slug}/` }))),
        S.service({ siteUrl, url: `${siteUrl}/area/`, cfg, name: `${cfg.brand.ko} 찾아가는 지역`, desc: clampDesc(desc.areaHub(counts)), areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/area/`, qa),
        S.howTo(`${siteUrl}/area/`, '있는 곳에서 부르는 다섯 걸음', stepSet(seed), cfg),
      ],
    }),
  };
}

/* ── 코스 허브 ────────────────────────────────────────────────── */
export function courseHub(ctx) {
  const { cfg, siteUrl, courses, regions } = ctx;
  const seed = 'coursehub';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);
  const shortest = courses.slice().sort((a, b) => a.min - b.min)[0];
  const longest = courses.slice().sort((a, b) => b.min - a.min)[0];

  const open = `<div class="vh-lead">
  <p>코스는 아홉 가지예요. 고를 건 셋뿐이에요. 세기, 길이, 오일을 쓸지 말지. 나머지는 통화에서 맞춰요.</p>
  <p>가장 짧은 건 ${esc(shortest.ko)} ${shortest.min}분, 가장 긴 건 ${esc(longest.ko)} ${longest.min}분이에요. 오래 받는 것과 깊게 받는 것은 다르고, 비싸다고 더 맞는 것도 아니에요.</p>
</div>`;

  const table = frame('all', 'table', '아홉 가지를 한 표에',
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">길이</th><th scope="col">비용</th><th scope="col">세기</th><th scope="col">결</th><th scope="col">오일</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td>${won(c.price)}원</td><td>${esc(c.pressure)}</td><td>${esc(c.tempo)}</td><td>${c.oil ? '씀' : '안 씀'}</td></tr>`).join('\n')}</tbody></table>`,
    '비용이 낮은 것부터 세웠어요. 어느 구역에서 불러도 같은 표를 써요.', '01');

  const pickBy = frame('bycase', 'choose', '어떤 날 무엇을 고르면 되나요',
    `<ul class="vh-slips">${courses.map((c) => `<li><a href="/course/${c.slug}/"><b>${esc(c.ko)}</b><p>${esc(c.for)}</p></a></li>`).join('\n')}</ul>`,
    '정한 뒤에 바꿔도 돼요. 비용은 마지막에 받은 코스로 매겨요.', '02');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '있는 곳'), 4, '03');

  const pool = [];
  for (const r of regions) for (const c of courses) pool.push({ label: `${r.name} ${c.ko}`, href: `/${r.slug}/course/${c.slug}/` });

  const body = [open, table, pickBy, hailStrip(cfg, '코스 상담', seed), faqHtml, longtail(pool, seed, 24, 'by region', '지역에서 코스 찾기', null, '04')].join('\n');
  const t = title.page(`코스 ${courses.length}가지 출장마사지 홈타이`);
  const d = clampDesc(`출장마사지 홈타이 코스 ${courses.length}가지를 세기·길이·오일 여부로 한 표에 모았어요. ${won(sorted[0].price)}원부터이고 지역에 따라 달라지지 않아요.`);

  return {
    path: '/course/',
    html: layout(ctx, {
      path: '/course/',
      title: t,
      desc: d,
      h1: `코스 ${courses.length}가지 <span class="vh-h1-s">세기 · 길이 · 오일 여부를 한 표에</span>`,
      body,
      pageKind: 'coursehub',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '코스', url: `${siteUrl}/course/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/course/`, siteUrl, title: t, desc: d, listId: `${siteUrl}/course/#list` }),
        S.itemList(`${siteUrl}/course/#list`, '코스', courses.map((c) => ({ name: c.ko, url: `${siteUrl}/course/${c.slug}/` }))),
        S.aggregateOffer(`${siteUrl}/course/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/course/`, cfg, name: `${cfg.brand.ko} 코스 ${courses.length}가지`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/course/`, qa),
      ],
    }),
  };
}

/* ── 비용 ─────────────────────────────────────────────────────── */
export function pricePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'price';
  const sorted = courses.slice().sort((a, b) => a.price - b.price);

  const open = `<div class="vh-lead">
  <p>표 한 장이 전부예요. 여기에 없는 돈은 어떤 이름으로도 받지 않아요.</p>
  <p>횡단보도 하나 건너는 집이든 한 시간 달려야 하는 마을이든 코스가 같으면 비용도 같아요. 멀리 가는 수고는 저희가 맡아요.</p>
</div>`;

  const table = frame('tbl', 'prices', '코스별 기본 길이와 비용',
    `<table class="vs"><thead><tr><th scope="col">코스</th><th scope="col">기본 길이</th><th scope="col">비용</th><th scope="col">1분당</th></tr></thead>
     <tbody>${sorted.map((c) => `<tr><th scope="row"><a href="/course/${c.slug}/">${esc(c.ko)}</a></th><td>${c.min}분</td><td><b>${won(c.price)}원</b></td><td>${won(Math.round(c.price / c.min))}원</td></tr>`).join('\n')}</tbody></table>`,
    '1분당 숫자는 서로 견주라고 넣었어요. 분을 쪼개서 받는 일은 없어요.', '01');

  const noExtra = frame('nox', 'never', '붙지 않는 것',
    `<ul class="vh-heed">
      <li>차비 — 거리가 얼마든 셈에 넣지 않아요.</li>
      <li>심야 할증 — 동트기 전에 불러도 같은 표예요.</li>
      <li>명절·휴일 할증 — 날짜를 보고 올리지 않아요.</li>
      <li>선금 — 예약금도 보증금도 항목 자체가 없어요.</li>
      <li>취소 수수료 — 미루거나 없던 일로 해도 받지 않아요.</li>
      <li>주차비 — 저희가 내요.</li>
    </ul>`,
    '입금부터 하라는 연락이라면 저희 쪽이 아니에요.', '02');

  const pay = frame('how', 'payment', '비용은 어떻게 내나요',
    statTiles([
      ['내는 때', '마치고 그 자리에서'],
      ['수단', '현금이든 카드든 같아요'],
      ['영수증', '말하면 드려요'],
      ['길게 받을 때', '미리 정해 두면 늘어난 분만큼만 더해요', true],
      ['두 분이 받을 때', '사람 수대로 셈해요. 묶음 할인은 없어요', true],
    ]), null, '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '있는 곳'), 4, '04');
  const d = clampDesc(`코스별 기본 길이와 비용이에요. ${won(sorted[0].price)}원부터이고 차비·심야 할증·예약금이 없어요. 마친 뒤 현금이나 카드로 내요.`);

  const body = [open, table, noExtra, pay, hailStrip(cfg, '비용 확인', seed), faqHtml, dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/price/',
    html: layout(ctx, {
      path: '/price/',
      title: title.page(`비용 ${won(sorted[0].price)}원부터`),
      desc: d,
      h1: `비용 <span class="vh-h1-s">${won(sorted[0].price)}원부터 · 표에 없는 돈은 받지 않아요</span>`,
      body,
      pageKind: 'price',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '비용', url: `${siteUrl}/price/` }],
      jsonld: [
        S.aggregateOffer(`${siteUrl}/price/`, courses, cfg),
        S.service({ siteUrl, url: `${siteUrl}/price/`, cfg, name: `${cfg.brand.ko} 코스별 비용`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/price/`, qa),
      ],
    }),
  };
}

/* ── 시작하기 전에 ──────────────────────────────────────────── */
export function guidePage(ctx) {
  const { cfg, siteUrl, courses } = ctx;
  const seed = 'guide';

  const open = `<div class="vh-lead">
  <p>처음 불러 보는 분을 떠올리며 적었어요. 전화 한 통이면 끝나는 일이라 오래 읽을 건 없어요.</p>
</div>`;

  const what = frame('need', 'ready', '무엇을 두고 기다리면 되나요',
    `<ul class="vh-heed">
      <li>누울 자리 — 바닥도 침대도 괜찮아요.</li>
      <li>수건 두 장 — 집에 있는 걸로 충분하고 오일 없는 코스는 한 장이면 넉넉해요.</li>
      <li>방 하나 — 문만 닫히면 가족이 있어도 돼요.</li>
    </ul>
    <p class="vh-sec-x">접이식 매트와 오일, 향은 관리사가 챙겨 가요. 따로 장 볼 건 없어요.</p>`,
    null, '01');

  const timing = frame('when', 'hours', '언제 부를 수 있나요',
    statTiles([
      ['접수', `${esc(cfg.hours)}<small>전화 거는 시각은 따지지 않아요</small>`, true],
      ['문 앞까지', `보통 ${esc(cfg.arrive)}<small>안쪽 골목이면 더 걸려요</small>`, true],
      ['시간 옮기기', '언제든 돼요. 비용은 안 붙어요'],
      ['취소', '이미 문 앞이면 그 사실만 알려 주세요'],
      ['몰리는 때', '금요일과 토요일 밤'],
      ['한가한 때', '주중 낮, 기다림이 거의 없어요'],
    ]), null, '02');

  const refuse = frame('no', 'declined', '못 받는 경우도 있나요',
    `<ul class="vh-heed">
      <li>성적인 말이 끼어들 때 — 그 자리에서 통화를 끝내요.</li>
      <li>열이 오르거나 상처가 부어 있을 때 — 날짜를 다시 잡아요.</li>
      <li>주소 끝자리를 알려 주지 않을 때 — 누구를 어느 길로 보낼지 정할 수 없어요.</li>
      <li>관리사에게 따로 연락할 번호를 달라고 할 때.</li>
      <li>병원부터 가야 할 상태로 보일 때.</li>
      <li>만 19세가 안 됐을 때.</li>
    </ul>`,
    '받지 못한 건에는 어떤 비용도 매기지 않아요.', '03');

  const { html: faqHtml, qa } = faqBlock(seed, baseCtx(cfg, courses, '부르는 곳'), 6, '05');
  const d = clampDesc('처음 부를 때 필요한 것만 모았어요. 준비물, 접수 시각, 못 받는 경우, 비용 내는 법을 차례로 적었어요.');

  const body = [open, what, timing, stepCards(seed, '04'), refuse, hailStrip(cfg, '처음 이용', seed), faqHtml, noticeBlock(seed, '06'), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/guide/',
    html: layout(ctx, {
      path: '/guide/',
      title: title.page('시작하기 전에 — 부르는 법과 내는 법'),
      desc: d,
      h1: `시작하기 전에 <span class="vh-h1-s">통화 한 번이 곧 접수예요</span>`,
      body,
      pageKind: 'guide',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '시작하기 전에', url: `${siteUrl}/guide/` }],
      jsonld: [
        S.howTo(`${siteUrl}/guide/`, '처음 부를 때 거치는 다섯 걸음', stepSet(seed), cfg),
        S.service({ siteUrl, url: `${siteUrl}/guide/`, cfg, name: `${cfg.brand.ko} 이용 안내`, desc: d, areaServed: { '@type': 'Country', name: '대한민국' }, courses }),
        S.faqPage(`${siteUrl}/guide/`, qa),
      ],
    }),
  };
}

/* ── 소개 ─────────────────────────────────────────────────────── */
export function companyPage(ctx) {
  const { cfg, siteUrl, counts, data } = ctx;
  const seed = 'company';
  const sc = counts.shapeCount;
  const shapeLine = data.shapes.map((k, i) => `${shapeName(k)} ${sc[i]}곳`).join(' · ');

  const open = `<div class="vh-lead">
  <p>${esc(cfg.brand.ko)}(${esc(cfg.brand.en)})는 간판 없이 방문만 하는 곳이에요. 업소를 늘어놓고 이어 주는 중개가 아니라 저희가 받고 저희가 찾아가요.</p>
  <p>이름은 벨벳처럼 결이 고운 손길을 떠올려 붙였어요. 땅에도 결이 있다고 보고 지역마다 그 결을 숫자로 적어 뒀어요.</p>
</div>`;

  const line = frame('line', 'limits', '하는 일과 하지 않는 일',
    `<ul class="vh-heed">
      <li>해요 — 손으로 굳은 데를 풀어 드리는 일.</li>
      <li>안 해요 — 성적인 서비스. 어떤 형태로도 두지 않아요.</li>
      <li>안 해요 — 진단과 치료. 의료기관이 할 일이에요.</li>
      <li>안 받아요 — 만 19세가 안 된 분.</li>
      <li>안 실어요 — 후기와 별점. 지어 쓴 글을 가릴 길이 없어요.</li>
      <li>안 올려요 — 인물 사진. 본 사진과 다른 사람이 가는 일이 생겨요.</li>
      <li>안 받아요 — 선금. 앞서 받는 돈이 없어요.</li>
    </ul>`, null, '01');

  const how = frame('data', 'sources', '원 안의 땅은 어떻게 쟀나요',
    `<div class="vh-lead">
      <p>공개된 행정동 경계를 전국 ${counts.featAll}곳 모두 읽어, 시도마다 하나의 평평한 좌표에 올렸어요. 땅의 무게 중심을 넓이로 가중해 구하고 <strong>그 점에 원을 세 개 그렸어요.</strong> 원 안에 든 땅의 넓이를 경계선을 잘라 그대로 쟀어요.</p>
      <p>점을 뿌려 세면 작은 구역에서 숫자가 거칠어져요. 그래서 경계 고리를 원에 대고 잘라 넓이를 바로 계산했고, 안쪽 구멍은 음수로 빼서 더했어요. 반지름을 조금씩 키우며 찬 몫이 처음 50% 밑으로 내려가는 지점을 절반 반지름으로 적었고, 한가운데 값은 ${halfLabel(counts.halfMid)}이에요.</p>
      <p>땅 모양은 일곱 가지로 갈랐어요. ${esc(shapeLine)}. 찬 몫이 가장 가파르게 꺼지는 곳은 ${esc(counts.dropName)}이고, 폭은 ${counts.dropMax}%p예요.</p>
      <p>이 값은 행정 경계의 생김새일 뿐 집이 실제로 어디에 있는지는 보지 않아요. 땅이 많이 찬다고 사람이 많이 사는 건 아니에요. 그 점을 알고 읽어 주세요.</p>
    </div>
    ${statTiles([
      ['밑자료', esc(data.source), true],
      ['경계 자료 판번호', esc(data.version)],
      ['구하는 값', esc(data.axis), true],
      ['셈하는 절차', esc(data.method), true],
      ['안내문을 내는 기준', esc(data.coverageFrom), true],
      ['쪽이 있는 곳', `시도 ${counts.sido}곳, 시군구 ${counts.gu}곳, 동 ${counts.spot}곳`],
      ['안내문이 없는 단위', `읍 ${counts.eup}구역 · 면 ${counts.myeon}구역<small>목록에 이름으로만</small>`],
      ['가장 멀리 차는 구역', esc(counts.fullName)],
      ['가장 일찍 꺼지는 구역', esc(counts.leakName)],
    ])}`, null, '02');

  const d = clampDesc(`${cfg.brand.ko}가 하는 일과 하지 않는 일, 그리고 지역 안내문의 원 안 땅 숫자를 어떤 자료로 쟀는지 적었어요.`);
  const body = [open, line, how, hailStrip(cfg, '문의', seed), dt(ctx, seed), siteLinks(ctx, seed)].join('\n');

  return {
    path: '/company/',
    html: layout(ctx, {
      path: '/company/',
      title: title.page(`${cfg.brand.ko}가 어떤 곳인지`),
      desc: d,
      h1: `${esc(cfg.brand.ko)} 소개 <span class="vh-h1-s">지키는 선과 재는 방법</span>`,
      body,
      pageKind: 'company',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '소개', url: `${siteUrl}/company/` }],
      jsonld: [S.aboutPage({ url: `${siteUrl}/company/`, siteUrl, title: title.page(`${cfg.brand.ko}가 어떤 곳인지`), desc: d })],
    }),
  };
}

/* ── 이용약관 ─────────────────────────────────────────────────── */
const TERMS = [
  ['제1조 (이 약관을 두는 이유)', '이 약관은 벨벳핸즈(이하 "저희")가 손님이 계신 곳으로 찾아가 해 드리는 방문 관리에서, 이용 조건과 절차 그리고 저희와 손님이 각자 맡는 책임을 미리 정해 두려고 마련했어요.'],
  ['제2조 (접수하는 방법)', '접수는 화면에 적힌 번호로 걸어 주는 전화로만 받아요. 이 번호는 안심 번호여서 손님 번호가 관리사에게 그대로 넘어가지 않아요. 채팅, 게시판, 전자우편으로는 접수하지 않아요.'],
  ['제3조 (해 드리는 일)', '저희는 손님이 정한 장소로 관리사를 보내 뭉친 근육을 손으로 풀어 드려요. 병을 가려내거나 고치는 일은 하지 않고, 성적인 서비스도 하지 않아요.'],
  ['제4조 (나이)', '만 19세가 넘은 분만 이용할 수 있어요. 보호자가 함께 있어도 나이가 모자라면 접수되지 않아요.'],
  ['제5조 (원 안 점유 숫자의 성격)', '화면에 적힌 찬 몫, 절반 반지름, 빠지는 폭, 땅 모양은 공개된 행정동 경계를 원에 대고 잘라 계산한 값이에요. 도로 사정이나 실제 이동 시간을 보장하지 않으며, 그 동네 땅이 어떤 결인지 가늠하는 참고 자료예요.'],
  ['제6조 (비용과 셈)', '비용은 비용표와 같고 지역에 따라 달라지지 않아요. 셈은 관리를 마친 자리에서 현금이나 카드로 해요. 예약금이나 보증금처럼 미리 받는 돈은 어떤 이름으로도 두지 않아요.'],
  ['제7조 (일정 바꾸기와 취소)', '관리사가 출발하기 전이면 언제든 시간을 바꾸거나 취소할 수 있고 위약금이 없어요. 이미 문 앞에 도착했다면 그 사실만 바로 알려 주세요.'],
  ['제8조 (접수를 거절하거나 멈추는 경우)', '다음 가운데 하나라면 접수를 거절하거나 진행 중인 관리를 멈출 수 있어요. 1. 성적인 서비스를 바라는 경우. 2. 관리사에게 거친 말이나 힘을 쓰거나 사적인 연락처를 요구하는 경우. 3. 찾아갈 주소를 끝자리까지 알려 주지 않는 경우. 4. 열이 있거나 아물지 않은 상처가 있어 관리가 맞지 않는 경우.'],
  ['제9조 (손님이 준비할 것)', '관리를 받을 공간과 수건을 마련해 주시고, 진행에 영향을 줄 수 있는 건강 상태는 접수 통화에서 알려 주세요. 멍이 잘 드는 체질이라면 경락을 고르기 전에 먼저 말해 주세요.'],
  ['제10조 (후기와 평점)', '저희는 후기와 평점을 모으지 않고 화면에 올리지도 않아요. 이 화면의 어떤 문장도 특정 손님의 경험을 옮겨 적은 게 아니에요.'],
  ['제11조 (중간에 멈춘 경우의 비용)', '손님의 요청이나 건강 상태로 멈추면 지난 시간만큼만 셈해요. 시작하고 10분이 안 지났다면 받지 않아요. 제8조 제1호로 멈춘 경우에는 그때까지를 셈해요.'],
  ['제12조 (책임의 한계)', '관리 중 저희 과실로 손해가 생기면 저희가 배상해요. 미리 알리지 않은 건강 상태에서 생긴 손해와, 천재지변이나 통신 장애로 늦어진 일은 책임지지 않아요.'],
  ['제13조 (약관을 고칠 때)', '약관을 고치면 화면에 먼저 올리고 올린 날부터 적용해요. 고친 뒤에 접수하면 바뀐 내용에 동의한 것으로 봐요.'],
];

export function termsPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="vh-lead"><p>아래는 ${esc(cfg.brand.ko)} 이용약관 전문이에요. 접수 전화를 건 때부터 아래 내용을 따르기로 한 것으로 봐요.</p></div>`,
    frame('terms', 'terms', '전문', `<div class="vh-doc">${TERMS.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '약관 문의', 'terms'),
    dt(ctx, 'terms'),
    siteLinks(ctx, 'terms'),
  ].join('\n');
  return {
    path: '/terms/',
    html: layout(ctx, {
      path: '/terms/',
      title: title.page('이용약관'),
      desc: clampDesc(`${cfg.brand.ko} 출장 방문 관리 이용약관 전문이에요. 접수 방법, 해 드리는 일, 비용과 셈, 변경과 취소를 ${TERMS.length}개 조문으로 정했어요.`),
      h1: `이용약관 <span class="vh-h1-s">전문 ${TERMS.length}개 조</span>`,
      body,
      pageKind: 'terms',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '이용약관', url: `${siteUrl}/terms/` }],
    }),
  };
}

/* ── 개인정보처리방침 ─────────────────────────────────────────── */
const PRIVACY = [
  ['1. 적어 두는 것', '접수 통화에서 적는 건 네 가지예요. 찾아갈 주소, 연락 닿는 번호, 고른 코스, 원하는 시각. 이름과 생년월일, 주민등록번호는 받지 않아요.'],
  ['2. 어디에 쓰나요', '적어 둔 내용은 관리사를 정하고 출발과 도착을 알려 드리는 데에만 써요. 그 뒤로 광고 문자를 보내거나 저희가 먼저 연락하는 일은 없어요.'],
  ['3. 번호는 어떻게 다루나요', '화면의 번호는 안심 번호예요. 그래서 손님 번호가 관리사 화면에 그대로 뜨지 않아요.'],
  ['4. 얼마나 두나요', '방문이 별 탈 없이 끝나면 그날 안에 지워요. 다툼이 있었던 건만 마무리될 때까지 따로 둬요.'],
  ['5. 다른 곳에 넘기나요', '외부 업체에 넘기거나 맡기지 않아요. 법령에 따른 수사기관의 적법한 요청이 있을 때만 예외예요.'],
  ['6. 자동으로 모으는 것', '이 사이트는 미리 만들어 둔 파일을 내보내기만 해요. 로그인도 장바구니도 댓글도 없고, 광고 추적이나 방문 분석 스크립트를 넣지 않았으며 쿠키도 쓰지 않아요.'],
  ['7. 손님이 가진 권리', '저희가 가진 내용을 보여 달라거나 지워 달라고 요청할 수 있어요. 화면의 번호로 연락하면 그 통화에서 바로 처리해요.'],
  ['8. 담당자 표기', '운영자 표기가 확정되면 이 항목과 화면 맨 아래에 함께 올려요. 그때까지는 화면의 번호가 창구예요.'],
];

export function privacyPage(ctx) {
  const { cfg, siteUrl } = ctx;
  const body = [
    `<div class="vh-lead"><p>길지 않아요. 받아 적는 항목이 네 가지뿐이기 때문이에요.</p></div>`,
    frame('pp', 'privacy', '전문', `<div class="vh-doc">${PRIVACY.map(([t, d]) => `<section><h2>${esc(t)}</h2><p>${esc(d)}</p></section>`).join('')}</div>`, null, '01'),
    hailStrip(cfg, '개인정보 문의', 'privacy'),
    dt(ctx, 'privacy'),
    siteLinks(ctx, 'privacy'),
  ].join('\n');
  return {
    path: '/privacy/',
    html: layout(ctx, {
      path: '/privacy/',
      title: title.page('개인정보처리방침'),
      desc: clampDesc('접수 통화에서 적어 두는 항목과 쓰임, 보관 기간을 정리했어요. 쿠키와 추적 스크립트를 쓰지 않는 정적 사이트예요.'),
      h1: `개인정보처리방침 <span class="vh-h1-s">받아 적는 건 네 가지예요</span>`,
      body,
      pageKind: 'privacy',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '개인정보처리방침', url: `${siteUrl}/privacy/` }],
    }),
  };
}

/* ── 메모 목록 ────────────────────────────────────────────────── */
export function magazineIndex(ctx) {
  const { cfg, siteUrl } = ctx;
  const list = POSTS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const body = [
    `<div class="vh-lead"><p>부르기 전에 알아 두면 통화가 줄어드는 것만 적어요. 소감이나 평점은 싣지 않아요.</p></div>`,
    frame('list', 'notes', `적어 둔 글 ${list.length}편`,
      `<ul class="vh-slips">${list.map((p) => `<li><a href="/magazine/${p.slug}/"><b>${esc(p.title)}</b><p>${esc(p.summary)}</p><time datetime="${p.date}">${p.date}</time></a></li>`).join('\n')}</ul>`,
      '새 글은 RSS로도 나가요.', '01'),
    hailStrip(cfg, '접수', 'magazine'),
    dt(ctx, 'magazine'),
    siteLinks(ctx, 'magazine'),
  ].join('\n');
  const d = clampDesc(`부르기 전에 정해 두면 편한 것들을 ${list.length}편으로 적었어요. 후기와 체험담은 두지 않아요.`);
  return {
    path: '/magazine/',
    html: layout(ctx, {
      path: '/magazine/',
      title: title.page('원 메모'),
      desc: d,
      h1: `원 메모 <span class="vh-h1-s">글 ${list.length}편</span>`,
      body,
      pageKind: 'magazine',
      crumbs: [{ name: '처음', url: `${siteUrl}/` }, { name: '메모', url: `${siteUrl}/magazine/` }],
      jsonld: [
        S.collectionPage({ url: `${siteUrl}/magazine/`, siteUrl, title: title.page('원 메모'), desc: d, listId: `${siteUrl}/magazine/#list` }),
        S.itemList(`${siteUrl}/magazine/#list`, '원 메모', list.map((p) => ({ name: p.title, url: `${siteUrl}/magazine/${p.slug}/` }))),
      ],
    }),
  };
}

export function postPage(ctx, p) {
  const { cfg, siteUrl } = ctx;
  const path = `/magazine/${p.slug}/`;
  const url = `${siteUrl}${path}`;
  const html = p.body.map((b) => {
    if (typeof b === 'string') return `<p>${b.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    if (b[0] === 'h3') return `<h2>${esc(b[1])}</h2>`;
    if (b[0] === 'ul') return `<ul>${b[1].map((x) => `<li>${esc(x)}</li>`).join('\n')}</ul>`;
    return '';
  }).join('\n');

  const others = POSTS.filter((x) => x.slug !== p.slug).slice(0, 4);
  const body = [
    `<p class="vh-dated"><time datetime="${p.date}">${p.date}</time> · ${esc(cfg.brand.ko)} 원 메모</p>`,
    `<article class="vh-piece">${html}</article>`,
    hailStrip(cfg, '접수', p.slug),
    frame('more', 'next', '함께 읽을 글',
      `<ul class="vh-slips">${others.map((x) => `<li><a href="/magazine/${x.slug}/"><b>${esc(x.title)}</b><p>${esc(x.summary)}</p><time datetime="${x.date}">${x.date}</time></a></li>`).join('\n')}</ul>`,
      null, '01'),
    dt(ctx, p.slug),
    siteLinks(ctx, p.slug),
  ].join('\n');

  return {
    path,
    html: layout(ctx, {
      path,
      title: title.post(p),
      desc: clampDesc(desc.post(p)),
      h1: esc(p.title),
      body,
      pageKind: 'post',
      crumbs: [
        { name: '처음', url: `${siteUrl}/` },
        { name: '메모', url: `${siteUrl}/magazine/` },
        { name: p.title, url },
      ],
      jsonld: [S.article({ url, siteUrl, title: p.title, desc: p.summary, date: p.date, cfg })],
    }),
  };
}

/* ── 404 ──────────────────────────────────────────────────────── */
export function notFound(ctx) {
  const { cfg, siteUrl, regions } = ctx;
  const body = [
    `<div class="vh-lead"><p>그 주소에는 안내문이 없어요. 주소가 바뀌었거나 처음부터 없던 곳이에요. 아래에서 다시 골라 주세요.</p></div>`,
    frame('back', 'back', '여기서 다시',
      `<ul class="vh-pills">
        <li><a href="/">처음</a></li>
        <li><a href="/area/">방문 지역</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/price/">비용</a></li>
        <li><a href="/guide/">시작하기 전에</a></li>
        ${regions.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('\n')}
      </ul>`, null, '01'),
    hailStrip(cfg, '바로 접수', '404'),
  ].join('\n');
  return {
    path: '/404.html',
    html: layout(ctx, {
      path: '/404.html',
      title: title.page('없는 주소예요'),
      desc: '그 주소로 만든 안내문이 없어요. 아래에서 다시 골라 주세요.',
      h1: '없는 주소예요',
      body,
      noindex: true,
      pageKind: '404',
    }),
  };
}
