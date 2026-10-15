import fs from 'node:fs';
import path from 'node:path';

/**
 * 손으로 쓴 CSS·JS·SVG. 빌드 도구도, 바깥 글꼴도, 바깥 스크립트도 쓰지 않는다.
 *
 * ★무늬는 **동심원**이다. 이 사이트가 재는 값(원 안 점유)이 그대로 화면 장치가 된다.
 *   제목 앞에 세 겹 원, 지역 고르기 칸에는 진하기가 다른 세 겹 원, 접수 칸은 순번 카드.
 *   머리는 둥근 알약 띠, 칸 제목은 양쪽으로 머리카락 선이 뻗는 가운데 정렬이다.
 *     루네사       둥근 점머리 · 알약 버튼 · 밤 네이비+금빛
 *     리바이브모션 눈금 레일 · 각진 판 · 뼈색+녹슨 주황
 *     세린터치     대괄호 머리표 · 점선 가름 · 크림+숲 녹색
 *     벨벳럽       굵은 괘선 · 큰 순번 · 흰 바탕+진홍
 *     마루온       모눈 바탕 · 모서리 꺾쇠 · 회청+파랑
 *     바이탈리즈   세로축 관통 · 동그란 마디 · 연보라+보라
 *     블리스놋     엮인 두 줄 · 어두운 흑연 바탕 · 시트론
 *     레스트펄스   가로 띠 교대 · 세로 막대 셋 · 연둣빛 종이+올리브
 *     어반오아시스 선 없는 둥근 흰 덩어리 · 민트빛 종이+자홍
 *     솔레이스바디 비스듬히 잘린 귀퉁이 · 각진 타일 · 상아+청록
 *     레스토라럭스 가는 겹줄 액자 · 어두운 남보라 바탕 · 남보라+황동
 *     리쥬베나     덩어리 없음 · 흰 바탕 · 굵은 풀빛 밑줄
 *     바이탈리티럽 18도 기울여 자른 머리표 · 짙은 청록 바탕+호박
 *     힐펄스       왼쪽 세로 굵은 막대 · 밝은 회백 바탕+자주
 *     아우라웰니스 네모 테두리 머리표 · 2×2 격자 · 카키빛 종이+남색
 *     벨벳핸즈     양쪽 머리카락 선 가운데 제목 · 동심원 · 짙은 포도주빛 바탕+로즈골드
 * ★스크립트에 무작위가 없다. 같은 주소면 언제 들어와도 같은 화면이어야 한다.
 */
export const THEME = {
  paper: '#2A1218', card: '#38191F', soft: '#44222A',
  ink: '#F4E6E2', dim: '#C7ADA8',
  acc: '#D9A18C', accDk: '#BF8470', accSoft: '#53303A',
  line: '#5E3A44', clay: '#EBCDBE',
  onAcc: '#2A1218',
};

const CSS = (t) => `:root{
  --paper:${t.paper};--card:${t.card};--soft:${t.soft};--ink:${t.ink};--dim:${t.dim};
  --acc:${t.acc};--accDk:${t.accDk};--accSoft:${t.accSoft};--line:${t.line};--clay:${t.clay};--onAcc:${t.onAcc};
  --w:980px;
  --sans:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;
  --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;color-scheme:dark}
body{margin:0;font-family:var(--sans);color:var(--ink);background:var(--paper);
  line-height:1.82;font-size:16.5px;letter-spacing:-.004em;padding-bottom:92px}
@media (min-width:900px){body{padding-bottom:0}}
img,svg{max-width:100%}
a{color:var(--acc);text-decoration:none}
a:hover{text-decoration:underline}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:6px}
strong{color:var(--clay);font-weight:700}
.hop{position:absolute;left:-9999px}
.hop:focus{position:fixed;left:12px;top:12px;z-index:70;background:var(--acc);color:var(--onAcc);padding:10px 16px;border-radius:999px}

/* ── 머리 = 둥근 알약 띠 ───────────────────────────── */
.vh-bar{position:sticky;top:0;z-index:30;padding:10px 14px;background:linear-gradient(var(--paper) 70%,transparent)}
.vh-bar-in{max-width:var(--w);margin:0 auto;background:var(--card);border:1px solid var(--line);border-radius:999px;
  padding:7px 8px 7px 16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.vh-brand{display:inline-flex;align-items:center;gap:10px;color:var(--ink)}
.vh-brand:hover{text-decoration:none}
.vh-mk{width:30px;height:30px;flex:none}
.vh-brand b{font-size:17px;font-weight:800;letter-spacing:-.03em}
.vh-brand i{font-style:normal;font-family:var(--mono);font-size:9px;letter-spacing:.2em;color:var(--clay);margin-left:6px}
.vh-nav{margin:0 0 0 auto;padding:0;list-style:none;display:flex;gap:2px;order:3;width:100%;overflow-x:auto}
@media (min-width:860px){.vh-nav{order:0;width:auto}}
.vh-nav a{display:block;padding:6px 13px;border-radius:999px;font-size:13.5px;font-weight:700;color:var(--dim);white-space:nowrap}
.vh-nav a:hover{text-decoration:none;color:var(--ink);background:var(--soft)}
.vh-nav a[aria-current]{background:var(--accSoft);color:var(--clay)}
.vh-bar .callbox{margin-left:auto}
@media (min-width:860px){.vh-bar .callbox{margin-left:0}}

/* ── 지나온 길 ─────────────────────────────────────── */
.vh-way{max-width:var(--w);margin:0 auto;padding:6px 20px 0}
.vh-way ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;font-size:12px;color:var(--dim)}
.vh-way li+li::before{content:"/";margin-right:6px;color:var(--line)}
.vh-way a{color:var(--dim)}

/* ── 본문 ──────────────────────────────────────────── */
main{max-width:var(--w);margin:0 auto;padding:18px 20px 64px}
.vh-h1{font-size:26px;font-weight:800;letter-spacing:-.04em;line-height:1.3;margin:14px 0 22px;padding-left:54px;position:relative;min-height:42px}
@media (min-width:720px){.vh-h1{font-size:34px;padding-left:62px}}
.vh-h1::before{content:"";position:absolute;left:0;top:2px;width:42px;height:42px;border-radius:50%;
  background:radial-gradient(circle,var(--acc) 0 4px,transparent 4.5px 10px,var(--acc) 10.5px 11.5px,transparent 12px 15px,var(--line) 15.5px 16.5px,transparent 17px 19px,var(--line) 19.5px 20.5px,transparent 21px)}
.vh-h1-s{display:block;margin-top:9px;font-size:14px;font-weight:600;color:var(--dim);letter-spacing:-.006em}
.vh-lead{margin:0 0 34px;max-width:50rem;font-size:17px;padding:2px 0 2px 18px;border-left:2px solid var(--line)}
.vh-lead p{margin:0 0 .95em}
.vh-lead p:last-child{margin-bottom:0}

/* ── 칸 = 가운데 제목 + 양쪽 머리카락 선 ───────────── */
.vh-sec{margin:0 0 44px}
.vh-sec-h{margin:0 0 20px;text-align:center}
.vh-eye{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.24em;color:var(--clay);margin-bottom:6px}
.vh-eye::before{content:attr(data-eyebrow)}
.vh-sec h2{margin:0;display:flex;align-items:center;gap:16px;font-size:20px;font-weight:800;letter-spacing:-.03em;line-height:1.36}
.vh-sec h2::before,.vh-sec h2::after{content:"";flex:1 1 20px;height:1px;background:var(--line)}
@media (min-width:720px){.vh-sec h2{font-size:23px}}
.vh-sec-s{margin:8px auto 0;max-width:40rem;font-size:14px;color:var(--dim)}
.vh-sec-x{margin:16px 0 0;font-size:13.5px;color:var(--dim);text-align:center}

/* ── 사실 = 숫자 타일 ──────────────────────────────── */
.vh-stats{margin:0;display:grid;gap:10px;grid-template-columns:1fr 1fr}
@media (min-width:720px){.vh-stats{grid-template-columns:repeat(4,1fr)}}
.vh-stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:13px 14px;min-width:0}
.vh-stat dt{font-family:var(--mono);font-size:10px;letter-spacing:.14em;color:var(--clay);margin:0 0 5px}
.vh-stat dd{margin:0;font-size:14.5px;font-weight:700;line-height:1.5;overflow-wrap:anywhere}
.vh-stat .vh-rg{float:right;margin:0 0 4px 8px;width:40px;height:40px}
.vh-stat.wide{grid-column:span 2}
.vh-stat dd small{display:block;font-size:12px;font-weight:400;color:var(--dim);margin-top:2px}

/* ── 코스 = 점 줄 메뉴판 + 세기 알 ─────────────────── */
.vh-menu{list-style:none;margin:0;padding:0}
.vh-menu li{padding:11px 0;border-bottom:1px dashed var(--line)}
.vh-menu li:last-child{border-bottom:0}
.vh-menu a{display:flex;align-items:baseline;gap:8px;color:var(--ink)}
.vh-menu a:hover{text-decoration:none}
.vh-menu a:hover .m-n{color:var(--acc)}
.m-n{font-size:17px;font-weight:800;letter-spacing:-.025em;white-space:nowrap}
.m-d{flex:1 1 20px;border-bottom:2px dotted var(--line);transform:translateY(-4px);min-width:16px}
.m-w{font-family:var(--mono);font-size:15px;font-weight:700;color:var(--acc);white-space:nowrap}
.m-s{display:flex;align-items:center;gap:9px;margin-top:4px;font-size:12px;color:var(--dim)}
.m-p{display:inline-flex;gap:3px}
.m-p i{display:block;width:8px;height:8px;border-radius:50%;border:1px solid var(--acc)}
.m-p i.on{background:var(--acc)}
.m-t{margin:8px 0 0;font-size:13.5px;color:var(--dim)}

/* ── 접수 = 순번 카드 ──────────────────────────────── */
.vh-cards{list-style:none;margin:0;padding:0;display:grid;gap:10px;counter-reset:cd}
@media (min-width:640px){.vh-cards{grid-template-columns:1fr 1fr 1fr}}
.vh-cards li{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 15px 15px;counter-increment:cd}
.vh-cards li::before{content:counter(cd);display:grid;place-items:center;width:26px;height:26px;border-radius:50%;
  background:var(--acc);color:var(--onAcc);font-family:var(--mono);font-size:12px;font-weight:700;margin-bottom:9px}
.vh-cards b{display:block;font-size:15.5px;font-weight:800;letter-spacing:-.02em;margin-bottom:4px}
.vh-cards span{display:block;font-size:13.5px;color:var(--dim)}

/* ── 질문 = 접고 펴기 ──────────────────────────────── */
.vh-qa{display:grid;gap:8px}
.vh-qa details{background:var(--card);border:1px solid var(--line);border-radius:14px}
.vh-qa summary{list-style:none;cursor:pointer;padding:13px 44px 13px 16px;position:relative}
.vh-qa summary::-webkit-details-marker{display:none}
.vh-qa summary::after{content:"+";position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:20px;color:var(--acc);font-family:var(--mono)}
.vh-qa details[open] summary::after{content:"−"}
.vh-qa h3{margin:0;font-size:15.5px;font-weight:800;letter-spacing:-.02em;line-height:1.5}
.vh-qa p{margin:0;padding:0 16px 15px;font-size:14.5px;color:var(--dim)}

/* ── 유의 ──────────────────────────────────────────── */
.vh-heed{list-style:none;margin:0;padding:0;display:grid;gap:8px}
@media (min-width:720px){.vh-heed{grid-template-columns:1fr 1fr}}
.vh-heed li{padding:10px 14px 10px 30px;font-size:14px;color:var(--dim);position:relative}
.vh-heed li::before{content:"";position:absolute;left:8px;top:1.05em;width:9px;height:9px;border-radius:50%;border:2px solid var(--acc)}

/* ── 목록·링크 ─────────────────────────────────────── */
.vh-pills{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:7px}
.vh-pills a{display:inline-block;font-size:13.5px;color:var(--ink);border:1px solid var(--line);padding:3px 13px;border-radius:999px;background:var(--card)}
.vh-pills a:hover{border-color:var(--acc);color:var(--acc);text-decoration:none}
.vh-pills a[aria-current]{background:var(--accSoft);border-color:var(--acc)}
.vh-pills span{display:inline-block;font-size:13.5px;color:var(--dim);border:1px dashed var(--line);padding:3px 13px;border-radius:999px}
.vh-pills small{font-family:var(--mono);font-size:10.5px;color:var(--dim);margin-left:6px}
.vh-grp{display:grid;gap:14px}
.vh-grp section{display:grid;gap:8px}
@media (min-width:720px){.vh-grp section{grid-template-columns:8.5em 1fr;align-items:start}}
.vh-grp h3{margin:0;font-size:14px;font-weight:800;color:var(--clay);display:flex;align-items:center;gap:8px}
.vh-grp h3 em{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--dim);font-weight:400}
.vh-grp h3::before{content:"";flex:none;width:12px;height:12px;border-radius:50%;border:2px solid var(--acc);background:radial-gradient(circle,var(--acc) 0 2px,transparent 2.5px)}
.vh-jamo{margin:0;display:grid;gap:8px}
.vh-jamo section{display:flex;gap:12px;align-items:baseline;flex-wrap:wrap}
.vh-jamo h3{margin:0;flex:0 0 2em;font-family:var(--mono);font-size:14px;color:var(--clay)}
.vh-jamo ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:3px 13px;flex:1 1 18em}
.vh-jamo li{font-size:13.5px;color:var(--dim)}
.vh-jamo a{color:var(--ink)}

/* ── 견주기 ────────────────────────────────────────── */
.vs{width:100%;border-collapse:separate;border-spacing:0;font-size:14.5px;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.vs th,.vs td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--line)}
.vs tr:last-child th,.vs tr:last-child td{border-bottom:0}
.vs thead th{font-size:12px;color:var(--clay);background:var(--soft);font-weight:700}
.vs tbody th{font-weight:700}
.vs tbody tr.me th,.vs tbody tr.me td{background:var(--accSoft)}

/* ── 예약 문의 ─────────────────────────────────────── */
.callbox{display:inline-flex;align-items:center;gap:11px;background:var(--acc);color:var(--onAcc);
  padding:8px 20px 8px 10px;border-radius:999px;text-decoration:none}
.callbox:hover{background:var(--clay);text-decoration:none}
.callbox-i{flex:none;display:block;width:26px;height:26px;border-radius:50%;
  background:radial-gradient(circle,var(--onAcc) 0 3px,transparent 3.5px 7px,var(--onAcc) 7.5px 8.5px,transparent 9px)}
.callbox-t{display:flex;flex-direction:column;line-height:1.2;min-width:0}
.callbox-k{font-size:9.5px;letter-spacing:.2em;font-family:var(--mono);opacity:.85}
.callbox-v{font-family:var(--mono);font-weight:800;white-space:nowrap}
.callbox-s .callbox-v{font-size:14.5px}
.callbox-m .callbox-v{font-size:18px}
.callbox-l .callbox-v{font-size:21px}
.callbox-l{padding:11px 26px 11px 13px}
.callbox-b{display:flex;justify-content:center}
.vh-hail{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:22px;margin:0 0 44px;text-align:center}
.vh-hail-p{margin:0 auto 15px;font-size:16px;max-width:42rem}
.vh-hail-s{margin:13px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 대문 ──────────────────────────────────────────── */
.vh-door{padding:6px 0 10px;margin:0 0 40px;text-align:center}
.vh-door-sl{margin:0 auto 14px;font-size:24px;font-weight:800;letter-spacing:-.04em;max-width:19em;line-height:1.38}
@media (min-width:720px){.vh-door-sl{font-size:32px}}
.vh-door-p{margin:0 auto 22px;color:var(--dim);font-size:16px;max-width:42rem}
.vh-door-f{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:22px 0 0;padding:0;list-style:none}
.vh-door-f li{border:1px solid var(--line);border-radius:999px;padding:4px 14px;font-size:12.5px;color:var(--dim)}
.vh-door-f b{color:var(--clay);font-family:var(--mono);font-weight:700;margin-right:6px}

/* ── 지역 고르기 = 세 겹 원 ────────────────────────
   ★시도마다 반지름 세 개의 찬 몫을 겹겹이 놓인 원의 진하기로 그린다.
     가운데가 진하고 바깥이 옅으면 땅이 빨리 얇아지는 곳이다. */
.vh-rings{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:560px){.vh-rings{grid-template-columns:1fr 1fr}}
@media (min-width:880px){.vh-rings{grid-template-columns:1fr 1fr 1fr}}
.vh-rings li{border:1px solid var(--line);background:var(--card);border-radius:18px}
.vh-rings a{display:flex;align-items:center;gap:14px;padding:12px 14px;color:var(--ink);border-radius:18px}
.vh-rings a:hover{text-decoration:none;background:var(--soft)}
.vh-rg{flex:none;width:52px;height:52px}
.vh-ri b{display:block;font-size:16.5px;font-weight:800;letter-spacing:-.03em}
.vh-rings a:hover .vh-ri b{color:var(--acc)}
.vh-ri span{display:block;font-family:var(--mono);font-size:10.5px;color:var(--dim);margin-top:2px}
.vh-rings li.sub{background:transparent}
.vh-rings li.sub .vh-ri b{font-weight:600;color:var(--dim)}
.vh-key{margin:16px 0 0;font-size:13px;color:var(--dim);text-align:center}

/* ── 주제 묶음 링크 ────────────────────────────────── */
/* ── 찬 몫의 결로 묶은 줄 = 왼쪽 이름표 가로줄 ───── */
.vh-lanes{margin:0}
.vh-lanes>div{display:grid;gap:8px;padding:12px 0;border-top:1px solid var(--line)}
@media (min-width:760px){.vh-lanes>div{grid-template-columns:230px 1fr;gap:18px}}
.vh-lanes dt{margin:0;font-size:14px;font-weight:700;line-height:1.45;border-left:3px solid var(--acc);padding-left:10px;color:var(--ink)}
.vh-lanes dd{margin:0}
.vh-routes{display:grid;gap:22px}
@media (min-width:720px){.vh-routes{grid-template-columns:1fr 1fr}}
.vh-route-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--clay)}

/* ── 글 ────────────────────────────────────────────── */
.vh-piece{max-width:44rem;font-size:17px;margin:0 auto}
.vh-piece h2{margin:32px 0 12px;font-size:19px;font-weight:800;padding-left:14px;border-left:3px solid var(--acc)}
.vh-piece p{margin:0 0 1.05em}
.vh-piece ul{margin:0 0 1.05em;padding-left:1.1em;color:var(--dim)}
.vh-slips{list-style:none;margin:0;padding:0;display:grid;gap:10px}
@media (min-width:680px){.vh-slips{grid-template-columns:1fr 1fr}}
.vh-slips li{border:1px solid var(--line);background:var(--card);border-radius:16px}
.vh-slips a{display:block;padding:14px 16px;color:var(--ink);border-radius:16px}
.vh-slips a:hover{text-decoration:none;background:var(--soft)}
.vh-slips b{display:block;font-size:16.5px;font-weight:800;margin-bottom:6px}
.vh-slips a:hover b{color:var(--acc)}
.vh-slips p{margin:0;font-size:13.5px;color:var(--dim)}
.vh-slips time{display:block;margin-top:8px;font-family:var(--mono);font-size:10.5px;color:var(--clay)}
.vh-doc{max-width:44rem;margin:0 auto}
.vh-doc h2{margin:24px 0 9px;font-size:16.5px;font-weight:800;color:var(--clay)}
.vh-doc p,.vh-doc li{font-size:15px;color:var(--dim)}
.vh-dated{margin:0 0 16px;font-size:12px;color:var(--dim);font-family:var(--mono)}

/* ── 발 ────────────────────────────────────────────── */
.vh-foot{margin-top:30px;background:var(--card);border-top:1px solid var(--line)}
.vh-foot-top{max-width:var(--w);margin:0 auto;padding:30px 20px 8px;text-align:center}
.vh-foot-nm{margin:0 0 6px;font-size:19px;font-weight:800;letter-spacing:-.025em}
.vh-foot-say{margin:0 auto 14px;max-width:38rem;font-size:14px;color:var(--dim)}
.vh-foot-run{margin:12px 0 0;font-size:12px;color:var(--dim);font-family:var(--mono)}
.vh-foot-grid{max-width:var(--w);margin:0 auto;padding:18px 20px 22px;display:grid;gap:24px}
@media (min-width:860px){.vh-foot-grid{grid-template-columns:1.2fr 1fr}}
.s-h{margin:0 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.2em;color:var(--clay)}
.s-ul{list-style:none;margin:0;padding:0;display:grid;gap:7px;font-size:14px}
.s-ul time{display:block;font-family:var(--mono);font-size:10px;color:var(--dim)}
.s-sm{margin:10px 0 0;font-size:12px;color:var(--dim)}
.vh-foot-end{border-top:1px solid var(--line)}
.vh-foot-end>div{max-width:var(--w);margin:0 auto;padding:18px 20px 26px}
.s-biz{margin:0 0 8px;font-size:12px;color:var(--dim)}
.s-pale{opacity:.7}
.s-ai{margin:0 0 8px;font-size:12px;color:var(--dim);line-height:1.72}
.s-cr{margin:0;font-size:11.5px;color:var(--dim)}

/* ── 아래 떠 있는 알약 ─────────────────────────────── */
.vh-float{position:fixed;left:0;right:0;bottom:0;z-index:40;padding:0 14px calc(12px + env(safe-area-inset-bottom));
  display:flex;flex-direction:column;align-items:center;gap:5px;pointer-events:none;transition:transform .2s,opacity .2s}
.vh-float>*{pointer-events:auto}
.vh-float.down{transform:translateY(130%);opacity:0}
.vh-float .callbox{box-shadow:0 8px 26px rgba(0,0,0,.5);width:100%;max-width:420px}
.vh-float-s{font-size:11px;color:var(--dim);font-family:var(--mono);background:var(--paper);padding:1px 10px;border-radius:999px}
@media (min-width:900px){.vh-float{display:none}}
@media print{.vh-float,.vh-bar,.vh-hail{display:none}}
`;

const JS = `(function(){
  /* 발이 화면에 들어오면 아래 떠 있는 알약을 내린다. 그 밖의 일은 하지 않는다 —
     화면을 흔드는 무작위를 넣지 않아야 같은 주소에서 같은 화면이 나온다. */
  var bar=document.querySelector('.vh-float'),ft=document.querySelector('.vh-foot');
  if(!bar||!ft||!('IntersectionObserver' in window))return;
  new IntersectionObserver(function(es){
    es.forEach(function(e){bar.classList.toggle('down',e.isIntersecting);});
  },{rootMargin:'0px 0px -40px 0px'}).observe(ft);
})();`;

/* 세 겹 원 — 이 사이트가 재는 반지름 세 개 그대로 */
const RINGS = (a, b, c) => `<circle cx="16" cy="16" r="14" fill="${c}" fill-opacity=".38"/>
<circle cx="16" cy="16" r="9.5" fill="${b}" fill-opacity=".62"/>
<circle cx="16" cy="16" r="5" fill="${a}"/>`;
const FAVICON = (t) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${t.paper}"/>${RINGS(t.acc, t.acc, t.acc)}</svg>`;
const LOGO = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 48"><rect width="270" height="48" fill="${t.paper}"/><g transform="translate(8,8)">${RINGS(t.acc, t.acc, t.acc)}</g><text x="50" y="26" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="${t.ink}">${cfg.brand.ko}</text><text x="50" y="38" font-family="ui-monospace,monospace" font-size="9" letter-spacing="3" fill="${t.clay}">${cfg.brand.en.toUpperCase()}</text></svg>`;

const OG = (t, cfg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${t.paper}"/>
<g transform="translate(860,120) scale(10)">${RINGS(t.acc, t.acc, t.acc)}</g>
<text x="96" y="300" font-family="system-ui,sans-serif" font-size="50" font-weight="800" fill="${t.ink}">${cfg.brand.ko} 출장마사지 홈타이</text>
<text x="96" y="362" font-family="system-ui,sans-serif" font-size="25" fill="${t.dim}">${cfg.brand.slogan}</text>
<text x="96" y="410" font-family="ui-monospace,monospace" font-size="20" fill="${t.clay}">서울 · 인천 · 경기 · 부산 동까지 · ${cfg.hours} · ${cfg.pay}</text>
<rect x="96" y="452" width="420" height="82" rx="41" fill="${t.acc}"/>
<text x="150" y="486" font-family="ui-monospace,monospace" font-size="13" letter-spacing="5" fill="${t.paper}">${cfg.telLabel}</text>
<text x="150" y="518" font-family="ui-monospace,monospace" font-size="28" font-weight="700" fill="${t.paper}">${cfg.tel}</text>
</svg>`;

export function writeAssets(dist, cfg) {
  const dir = path.join(dist, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'vh.css'), CSS(THEME));
  fs.writeFileSync(path.join(dir, 'vh.js'), JS);
  fs.writeFileSync(path.join(dir, 'favicon.svg'), FAVICON(THEME));
  fs.writeFileSync(path.join(dir, 'logo.svg'), LOGO(THEME, cfg));
  fs.writeFileSync(path.join(dir, 'og.svg'), OG(THEME, cfg));
}
export const RINGLOGO = (t = THEME) => `<svg class="vh-mk" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${RINGS(t.acc, t.acc, t.acc)}</svg>`;

/** 시도 칸 글리프 — 반지름 세 개의 찬 몫(0~100)을 원 진하기로 */
export function ringGlyph(occ) {
  const o = occ.map((v) => Math.max(0.08, Math.min(1, v / 100)).toFixed(2));
  return `<svg class="vh-rg" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width=".6"/><circle cx="16" cy="16" r="14" fill="#D9A18C" fill-opacity="${o[2]}"/><circle cx="16" cy="16" r="9.5" fill="#D9A18C" fill-opacity="${o[1]}"/><circle cx="16" cy="16" r="5" fill="#D9A18C" fill-opacity="${o[0]}"/></svg>`;
}
