import { esc } from './util.mjs';
import * as S from './schema.mjs';
import { RINGLOGO } from '../assets.mjs';

export const ASSET_V = '1';

/**
 * 공통 뼈대.
 *   head  — SEO·GEO 메타 + JSON-LD
 *   발    — 출처·최신성·수집 경로·정보량 + AI 활용 고지
 *
 * ★전화번호는 **callBox() 으로만** 찍는다. 라벨은 '예약 문의' 하나다.
 * ★머리는 둥근 알약 띠 하나. 제목 앞에는 세 겹 원이 CSS로 붙는다.
 */
export function layout(ctx, opts) {
  const { cfg, siteUrl, latestPosts } = ctx;
  const {
    path, title, desc, h1, body, jsonld = [], geo, crumbs = [],
    noindex = false, pageKind = '', pageType = '', about = '', mainList = '',
  } = opts;
  const url = `${siteUrl}${path}`;
  const graph = S.graph([
    S.organization(cfg, siteUrl),
    S.website(cfg, siteUrl),
    crumbs.length ? S.breadcrumb(url, crumbs) : null,
    S.webpage({ url, siteUrl, title, desc, breadcrumbId: crumbs.length ? `${url}#crumb` : null, pageType, about, mainList }),
    ...jsonld,
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
${cfg.naverVerification ? `<meta name="naver-site-verification" content="${esc(cfg.naverVerification)}"/>` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="format-detection" content="telephone=yes">
<meta name="author" content="${esc(cfg.brand.ko)}">
<meta name="theme-color" content="#2A1218">
${geo ? `<meta name="geo.region" content="${esc(geo.iso)}">
<meta name="geo.placename" content="${esc(geo.placename)}">
<meta name="geo.position" content="${geo.lat};${geo.lng}">
<meta name="ICBM" content="${geo.lat}, ${geo.lng}">` : '<meta name="geo.region" content="KR">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(cfg.brand.ko)} 출장마사지">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${siteUrl}/assets/og.svg">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.rssTitle)}" href="${siteUrl}/rss.xml">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/favicon.svg">
<link rel="manifest" href="/site.webmanifest">
<link rel="stylesheet" href="/assets/vh.css?v=${ASSET_V}">
<script type="application/ld+json">${graph}</script>
</head>
<body data-kind="${pageKind}">
<a class="hop" href="#main">본문으로 가기</a>
${header(ctx, path)}
${crumbs.length > 1 ? wayHtml(crumbs) : ''}
<main id="main">
<h1 class="vh-h1">${h1}</h1>
${body}
</main>
${footer(ctx, latestPosts)}
${floatBar(cfg)}
<script src="/assets/vh.js?v=${ASSET_V}" defer></script>
</body>
</html>`;
}

/** 예약 문의 알약. size: s(머리) · m(본문) · l(아래 떠 있는 것) */
export function callBox(cfg, { size = 'm', bar = false } = {}) {
  return `<a class="callbox callbox-${size}${bar ? ' callbox-b' : ''}" href="tel:${cfg.telRaw}">
  <span class="callbox-i" aria-hidden="true"></span>
  <span class="callbox-t"><span class="callbox-k">${esc(cfg.telLabel)}</span><span class="callbox-v">${esc(cfg.tel)}</span></span>
</a>`;
}

function header(ctx, path) {
  const { cfg } = ctx;
  const on = (p) => (path === p || (p !== '/' && path.startsWith(p)) ? ' aria-current="page"' : '');
  const menu = [['/area/', '방문 지역'], ['/course/', '코스'], ['/price/', '비용'], ['/guide/', '시작 전에'], ['/magazine/', '원 메모']];
  return `<header class="vh-bar"><div class="vh-bar-in">
  <a class="vh-brand" href="/" aria-label="${esc(cfg.brand.ko)} 첫 화면">${RINGLOGO()}<b>${esc(cfg.brand.ko)}</b></a>
  <nav aria-label="주요 메뉴"><ul class="vh-nav">${menu.map(([h, t]) => `<li><a href="${h}"${on(h)}>${t}</a></li>`).join('')}</ul></nav>
  ${callBox(cfg, { size: 's' })}
</div></header>`;
}

function wayHtml(crumbs) {
  return `<nav class="vh-way" aria-label="여기까지 온 길"><ol>${crumbs
    .map((c, i) => (i === crumbs.length - 1
      ? `<li><span aria-current="page">${esc(c.name)}</span></li>`
      : `<li><a href="${c.url.replace(/^https?:\/\/[^/]+/, '')}">${esc(c.name)}</a></li>`))
    .join('')}</ol></nav>`;
}

/** 발 — 가운데 정렬 머리말 + 두 칸 + 맨 아래 고지 */
function footer(ctx, latestPosts = []) {
  const { cfg, regions, counts, data, updated } = ctx;
  const b = cfg.business || {};
  const biz = [
    b.name ? `상호 ${esc(b.name)}` : '',
    b.owner ? `대표 ${esc(b.owner)}` : '',
    b.regNo ? `사업자등록번호 ${esc(b.regNo)}` : '',
    b.address ? `주소 ${esc(b.address)}` : '',
    b.privacyOfficer ? `개인정보 담당자 ${esc(b.privacyOfficer)}` : '',
    b.email ? `문의 ${esc(b.email)}` : '',
  ].filter(Boolean).join(' · ');
  const main = regions.filter((r) => r.main);
  const sub = regions.filter((r) => !r.main);

  return `<footer class="vh-foot">
  <div class="vh-foot-top">
    <p class="vh-foot-nm">${esc(cfg.brand.ko)}</p>
    <p class="vh-foot-say">가게 문을 열고 기다리지 않고, 연락을 받으면 관리사가 그 주소로 가요. 시군구 ${counts.gu}곳과 동 ${counts.spot}구역 어디서든 접수 창구는 번호 하나예요.</p>
    ${callBox(cfg, { size: 'm' })}
    <p class="vh-foot-run">${esc(cfg.hours)} · ${esc(cfg.pay)} · 선입금 없음</p>
  </div>
  <div class="vh-foot-grid">
    <nav aria-label="지역 바로가기">
      <p class="s-h">동까지 있는 곳</p>
      <ul class="vh-pills">${main.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="s-h" style="margin-top:15px">시군구까지 있는 곳</p>
      <ul class="vh-pills">${sub.map((r) => `<li><a href="/${r.slug}/">${esc(r.name)}</a></li>`).join('')}</ul>
      <p class="s-sm"><a href="/area/">방문 지역 전체 보기</a> · 읍·면 ${counts.rural}곳은 이름으로만 실었어요</p>
    </nav>
    <div>
      <p class="s-h">문서</p>
      <ul class="s-ul">
        <li><a href="/guide/">시작 전에</a></li>
        <li><a href="/price/">비용</a></li>
        <li><a href="/course/">코스</a></li>
        <li><a href="/company/">소개</a></li>
        <li><a href="/terms/">이용약관</a></li>
        <li><a href="/privacy/">개인정보처리방침</a></li>
      </ul>
      <p class="s-h" style="margin-top:17px">최근 원 메모</p>
      <ul class="s-ul">${latestPosts.slice(0, 3).map((p) => `<li><a href="${p.path}">${esc(p.title)}</a><time datetime="${p.date}">${p.date}</time></li>`).join('')}</ul>
      <p class="s-h" style="margin-top:17px">가져가는 길</p>
      <ul class="vh-pills"><li><a href="/rss.xml">RSS</a></li><li><a href="/sitemap.xml">사이트맵</a></li><li><a href="/llms.txt">llms.txt</a></li></ul>
      <p class="s-sm">마지막으로 만진 날 <time datetime="@@LM@@">@@LM@@</time></p>
    </div>
  </div>
  <div class="vh-foot-end"><div>
    ${biz ? `<p class="s-biz">${biz}</p>` : '<p class="s-biz s-pale">운영자 표기는 확정되는 대로 이 줄에 적어요.</p>'}
    <p class="s-ai">지역 안내문의 점유 값은 공개된 행정동 경계에 원을 겹쳐 기계로 계산한 숫자고, 문장은 <strong>AI 도구로 초안을 쓴 뒤</strong> 사람이 다듬어 올렸어요. 후기·체험담·별점은 받지도 싣지도 않고 인물 사진도 쓰지 않아요. 밑자료: ${esc(data.source)}</p>
    <p class="s-cr">© ${esc(updated.slice(0, 4))} ${esc(cfg.brand.ko)}. 치료를 하는 곳이 아니고 성적인 서비스는 하지 않아요.</p>
  </div></div>
</footer>`;
}

/** 손바닥 화면 아래에 떠 있는 알약 */
function floatBar(cfg) {
  return `<div class="vh-float">
  ${callBox(cfg, { size: 'l' })}
  <span class="vh-float-s">문 앞까지 ${esc(cfg.arrive)}</span>
</div>`;
}

/**
 * 칸 틀 — 가운데 눈썹글, 양쪽으로 머리카락 선이 뻗는 제목, 가운데 부제.
 */
export function frame(id, label, h2, inner, sub, n) {
  return `<section class="vh-sec" id="${id}" aria-labelledby="${id}-h">
  <header class="vh-sec-h">
    <span class="vh-eye" aria-hidden="true" data-eyebrow="${esc(label)}${n ? ` ${n}` : ''}"></span>
    <h2 id="${id}-h">${h2}</h2>
    ${sub ? `<p class="vh-sec-s">${sub}</p>` : ''}
  </header>
  <div class="vh-sec-b">${inner}</div>
</section>`;
}
