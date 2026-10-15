/**
 * 타이틀·디스크립션 정본.
 *
 * ★토막을 잇는 기호를 앞선 열다섯 사이트와 다르게 둔다. 쓰인 것: 세로줄·줄표·가운뎃점·
 *   쌍점·쉼표·슬래시·괄호·대괄호·꺾쇠. 여기서는 **삼각 화살표(▸)** 를 처음 쓴다.
 *     벨벳핸즈 `{동} 출장마사지 홈타이 ▸ {구} {코스어} ▸ {행동어} 벨벳핸즈`
 * ★'마사지'는 제목에 한 번만 넣는다(스터핑 방지).
 * ★'여성전용마사지'는 쓰지 않는다 — 업소를 싣지 않아 뒷받침할 자료가 없다.
 * ★설명문은 **100자 안쪽**. 가운데 토막은 그 자리에서만 나오는 계산값(찬 몫, 절반 반지름,
 *   빠지는 폭, 모양)으로 채운다.
 */
import { hash, km2, josa } from './util.mjs';
import { fm, shapeName } from '../content/copy.mjs';

const at = (h, arr, slot = 0) => arr[parseInt(h.substr((slot * 3) % 29, 3), 16) % arr.length];

export const BRAND = '벨벳핸즈';
const KEY = '출장마사지 홈타이';

const COURSE_WORD = ['스웨디시', '아로마', '딥티슈', '타이', '경락', '건식', '림프', '지압', '스포츠'];
const ACT = ['오늘 방문', '값 먼저 보기', '밤에도 접수', '통화로 바로', '시각 맞추기'];
const hv = (m, r0 = 500) => (m === 0 ? `${fm(r0)} 미만` : fm(m));

/* ── 제목 ─────────────────────────────────────────────────────────── */
export const title = {
  home: () => `${BRAND} ${KEY} ▸ 서울 인천 경기 부산 동까지 ▸ 24시 후불 접수`,
  areaHub: (c) => `${KEY} 방문 지역 ▸ 동 ${c.spot}구역 시군구 ${c.gu}곳 ▸ ${BRAND}`,
  sido: (sd) => `${sd.name} ${KEY} ▸ ${sd.main ? `동 ${sd.spotCount}구역` : `시군구 ${sd.gu.length}곳`} ▸ ${at(hash(sd.name, 'sdt'), ACT)} ${BRAND}`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gt');
    const unit = g.main && g.spotCount ? `동 ${g.spotCount}구역` : g.main ? `읍면 ${g.ruralCount}구역` : `행정동 ${g.dongCount}구역`;
    return `${g.name} ${KEY} ▸ ${sd.name} ${unit} ▸ ${at(h, ACT, 0)} ${BRAND}`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'st');
    return `${s.name} ${KEY} ▸ ${g.name} ${at(h, COURSE_WORD, 0)} ▸ ${at(h, ACT, 1)} ${BRAND}`;
  },
  course: (c) => `${c.ko} ${KEY} ▸ ${c.min}분 ${c.price.toLocaleString('ko-KR')}원 ▸ 세기 ${c.pressure} ${BRAND}`,
  sidoCourse: (sd, c) => `${sd.name} ${c.ko} ${KEY} ▸ ${sd.name} 방문 ▸ ${at(hash(sd.name, c.slug), ACT)} ${BRAND}`,
  page: (t) => `${t} ▸ ${BRAND} ${KEY}`,
  post: (p) => `${p.title} ▸ ${BRAND} 원 메모`,
};

/* ── 디스크립션 ───────────────────────────────────────────────────── */
function spotMiddle(sd, g, s, h) {
  const frames = [
    () => `반경 500m 안 땅이 ${s.occ[0]}%, 2km에서는 ${s.occ[2]}%예요`,
    () => `절반 선은 ${hv(s.half)}, 모양은 ${shapeName(s.shape)} 땅이에요`,
    () => `원을 키우면 찬 몫이 ${s.drop}%p 빠져요`,
    () => `${g.name}에서 절반 반지름이 ${s.guHalfRank}번째로 길어요`,
    () => `찬 몫이 ${s.occ[0]}%에서 ${s.occ[1]}%, ${s.occ[2]}%로 내려가요`,
    () => `땅 ${km2(s.area)}, ${shapeName(s.shape)} 모양이에요`,
  ];
  return frames[parseInt(h.substr(6, 3), 16) % frames.length]();
}
const TAIL = [
  '값은 마치고 치러요',
  '선입금은 받지 않아요',
  '멀다고 값을 올리지 않아요',
  '밤에도 같은 값이에요',
  '계산은 끝에 한 번뿐이에요',
];
const tailOf = (h) => TAIL[parseInt(h.substr(9, 3), 16) % TAIL.length];

export const desc = {
  home: () =>
    '서울·인천·경기·부산은 동까지, 그 밖 지정 지역은 시군구까지 적은 출장마사지 홈타이 안내. 땅에 원을 그려 얼마나 차는지 구역마다 쟀어요.',
  areaHub: (c) =>
    `출장마사지 홈타이가 찾아가는 동 ${c.spot}구역과 시군구 ${c.gu}곳. 구역마다 원 안에 땅이 얼마나 차는지 적었어요.`,
  sido: (sd) =>
    sd.main
      ? `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳과 동 ${sd.spotCount}구역 안내문이 있고 평균 찬 몫은 ${sd.avgOcc}%예요.`
      : `${sd.name} ${KEY} 방문. 시군구 ${sd.gu.length}곳까지 적었고 동 이름은 그 안에 있어요. 후불이고 밤에도 받아요.`,
  gu: (sd, g) => {
    const h = hash(sd.name, g.name, 'gd');
    const mid = g.main && g.spotCount
      ? [
        `동 ${g.spotCount}구역 안내문이 있고 반경 2.5km 안 땅이 ${g.occ[0]}%예요`,
        `가장 멀리 차는 구역은 ${g.fullSpot}, 가장 일찍 꺼지는 구역은 ${g.leakSpot}이에요`,
        `찬 몫이 ${g.occ[0]}%에서 ${g.occ[2]}%로 내려가는 ${shapeName(g.shape)} 땅이에요`,
        `빠지는 폭이 가장 큰 구역은 ${g.dropSpot}${josa(g.dropSpot, '이에요/예요')}`,
      ][parseInt(h.substr(3, 3), 16) % 4]
      : g.main
        ? [
          `행정동 ${g.dongCount}구역이 모두 읍·면이라 이 한 장에서 받아요`,
          `읍 ${g.eupCount}구역과 면 ${g.myeonCount}구역을 이름으로 올렸어요`,
          `땅 ${km2(g.area)}에 반경 2.5km 안 찬 몫은 ${g.occ[0]}%예요`,
        ][parseInt(h.substr(3, 3), 16) % 3]
        : [
          `행정동 ${g.dongCount}구역이 들어 있고 땅은 ${shapeName(g.shape)} 모양이에요`,
          `찬 몫 ${g.occ[0]}%에 넓이 ${km2(g.area)}짜리 땅이에요`,
          g.ruralCount ? `동과 읍·면 ${g.ruralCount}구역 모두 찾아가요` : `동 ${g.dongNames.length}구역 어디나 한 번호로 받아요`,
        ][parseInt(h.substr(3, 3), 16) % 3];
    return `${sd.name} ${g.name} ${KEY}. ${mid}. ${tailOf(h)}.`;
  },
  spot: (sd, g, s) => {
    const h = hash(sd.name, g.name, s.name, 'sd');
    return `${sd.name} ${g.name} ${s.name} ${KEY}. ${spotMiddle(sd, g, s, h)}. ${tailOf(h)}.`;
  },
  course: (c) =>
    `${c.ko} 출장 방문. ${c.focus}에 시간을 몰아 쓰고 세기는 ${c.pressure}예요. ${c.min}분 ${c.price.toLocaleString('ko-KR')}원, 지역에 따라 달라지지 않아요.`,
  sidoCourse: (sd, c) =>
    `${sd.name} ${c.ko} ${KEY}. ${c.focus}${josa(c.focus, '을/를')} 오래 다뤄요. ${sd.name} 어디서나 ${c.min}분 ${c.price.toLocaleString('ko-KR')}원.`,
  post: (p) => p.summary,
};

/** 설명이 예산을 넘으면 문장 단위로 자른다. */
export function clampDesc(s, limit = 100) {
  if (s.length <= limit) return s;
  const parts = s.split(/(?<=\.)\s+/);
  let out = '';
  for (const p of parts) {
    if ((out + p).length > limit) break;
    out += (out ? ' ' : '') + p;
  }
  return out || s.slice(0, limit - 1) + '…';
}
