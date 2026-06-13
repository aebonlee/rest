/**
 * emojiIcon.tsx
 *
 * [무엇인가] 콘텐츠/설정 곳곳에 흩어진 "장식용 이모지"를 Font Awesome 아이콘으로
 *   렌더 시점에 자동 치환해 주는 중앙 매핑 유틸리티.
 *
 * [왜 필요한가]
 *   - 데이터(learningData·curriculum 등)에는 이모지가 문자열로 박혀 있다(1,800줄+).
 *     이를 일일이 손으로 고치는 대신, 한 곳(이 파일)에서 이모지→FA 매핑을 정의하고
 *     렌더 시점에 변환하면 데이터는 그대로 두고 표현만 통일할 수 있다.
 *   - 화살표(→ ← ↑ ↓)·체크박스(☐) 같은 "구조 문자"는 다이어그램/체크리스트의 일부라
 *     절대 바꾸면 안 된다. → 매핑에 없는 문자는 원본 그대로 렌더된다(안전).
 *
 * [제공 API]
 *   - <EmojiIcon char="📚" />        : 단일 이모지를 FA 아이콘으로(없으면 원문 그대로)
 *   - withIcons("📚 학습목표")        : 문자열 안의 장식 이모지만 FA로 치환한 ReactNode 반환
 *   - hasIcon("📚")                   : 매핑 존재 여부
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { ReactNode } from 'react';
import {
  faBook, faBookOpen, faSquareCheck, faFlask, faTriangleExclamation, faStar,
  faCircleXmark, faCheck, faXmark, faPenToSquare, faPencil, faBullseye, faBriefcase,
  faRocket, faChartColumn, faChartLine, faThumbtack, faPalette, faRobot, faLightbulb,
  faUsers, faUser, faLink, faGlobe, faClipboard, faCommentDots, faBolt, faLaptopCode,
  faDesktop, faSun, faMoon, faCrown, faFolder, faFolderOpen, faLock, faBrain, faTrophy,
  faShieldHalved, faGraduationCap, faSchool, faPills, faBoxArchive, faMagnifyingGlass,
  faGear, faWrench, faScrewdriverWrench, faBullhorn, faHandshake, faImage,
  faWandMagicSparkles, faPuzzlePiece, faFileLines, faScroll, faKey, faHand, faAtom,
  faPaperclip, faBars, faBuilding, faLandmark, faBox, faPersonDigging, faArrowsRotate,
  faEnvelope, faEnvelopeOpen, faCircle, faHouse, faLocationDot, faCalendarDays,
  faCalendar, faNewspaper, faCircleQuestion, faStopwatch, faSliders, faMobileScreen,
  faBug, faMicrophone, faSackDollar, faGift, faPhone, faPlus, faReceipt, faSeedling,
  faEye, faCompass, faPaintbrush, faDatabase, faCircleInfo, faChalkboardUser,
  faDownload, faUpload, faArrowsLeftRight, faVial, faPenNib, faWater, faTemperatureHalf,
  faBowlFood, faMedal, faFilm, faMusic, faPaw, faUserTie, faHeart, faMoneyBillWave,
  faRulerCombined, faShuffle, faRepeat, faPlug, faHashtag, faFont, faHammer, faMap,
  faCircleExclamation, faSpa, faCalculator, faHandHoldingHeart, faCat, faFlag,
} from '@fortawesome/free-solid-svg-icons';
import { faPython } from '@fortawesome/free-brands-svg-icons';

// 이모지 → FA 아이콘 매핑. 여기에 없는 문자(화살표·체크박스 등)는 변환하지 않는다.
const MAP: Record<string, IconDefinition> = {
  '✅': faSquareCheck, '✓': faCheck, '❌': faCircleXmark, '✗': faXmark, '✕': faXmark,
  '★': faStar, '⭐': faStar, '🌟': faStar,
  '⚠': faTriangleExclamation,
  '🧪': faFlask,
  '📚': faBook, '📖': faBookOpen,
  '📝': faPenToSquare, '✏': faPencil,
  '🎯': faBullseye, '💼': faBriefcase, '🚀': faRocket,
  '📊': faChartColumn, '📈': faChartLine,
  '📌': faThumbtack, '🎨': faPalette, '🤖': faRobot, '💡': faLightbulb,
  '👥': faUsers, '👤': faUser, '👩': faUser, '👨': faUser, '🧑': faUser, '🧓': faUser,
  '🔗': faLink, '🌐': faGlobe, '📋': faClipboard,
  '💬': faCommentDots, '🗨': faCommentDots,
  '⚡': faBolt, '💻': faLaptopCode, '🖥': faDesktop,
  '☀': faSun, '🌙': faMoon, '👑': faCrown,
  '📁': faFolder, '📂': faFolderOpen, '🗂': faBoxArchive, '🗄': faBoxArchive,
  '🔒': faLock, '🔐': faLock, '🔑': faKey,
  '🧠': faBrain, '🏆': faTrophy, '🛡': faShieldHalved,
  '🎓': faGraduationCap, '🏫': faSchool, '💊': faPills,
  '🔍': faMagnifyingGlass, '🔎': faMagnifyingGlass,
  '⚙': faGear, '🔧': faWrench, '🛠': faScrewdriverWrench,
  '📢': faBullhorn, '🤝': faHandshake, '🖼': faImage,
  '✨': faWandMagicSparkles, '🧩': faPuzzlePiece,
  '📄': faFileLines, '📜': faScroll,
  '👋': faHand, '🙋': faHand, '✊': faHand, '👏': faHand,
  '⚛': faAtom, '📎': faPaperclip, '☰': faBars,
  '🏢': faBuilding, '🏛': faLandmark, '🏗': faPersonDigging, '📦': faBox,
  '🔄': faArrowsRotate,
  '📧': faEnvelope, '📤': faEnvelope, '📭': faEnvelopeOpen,
  '⚪': faCircle, '🏠': faHouse, '📍': faLocationDot,
  '🗓': faCalendarDays, '📅': faCalendar, '📰': faNewspaper,
  '❓': faCircleQuestion, '⏱': faStopwatch, '🎚': faSliders, '🎛': faSliders, '📱': faMobileScreen,
  '🐛': faBug, '🎤': faMicrophone, '💰': faSackDollar, '🎁': faGift, '📞': faPhone,
  '➕': faPlus, '🧾': faReceipt, '🌱': faSeedling, '👁': faEye, '🧭': faCompass,
  '🎒': faBookOpen, '🖌': faPaintbrush, '🗃': faDatabase, 'ℹ': faCircleInfo,
  '👩‍🏫': faChalkboardUser, '👨‍🏫': faChalkboardUser, '🧑‍🏫': faChalkboardUser,
  '👩‍💻': faLaptopCode, '👨‍💻': faLaptopCode, '🧑‍💻': faLaptopCode,
  '⬇': faDownload, '⬆': faUpload,
  // 정규과정 토픽/하위메뉴 및 프로젝트 데이터 아이콘 보강 — 미매핑 이모지 일관화
  '↔': faArrowsLeftRight, '⚗': faVial, '✍': faPenNib, '🌊': faWater, '🌡': faTemperatureHalf,
  '🍜': faBowlFood, '🎖': faMedal, '🎬': faFilm, '🎵': faMusic, '🐼': faPaw, '🐱': faCat,
  '👔': faUserTie, '💚': faHeart, '💸': faMoneyBillWave, '📐': faRulerCombined, '🔀': faShuffle,
  '🔁': faRepeat, '🔌': faPlug, '🔢': faHashtag, '🔤': faFont, '🔨': faHammer, '🗺': faMap,
  '🚨': faCircleExclamation, '🧘': faSpa, '🧮': faCalculator, '🫂': faHandHoldingHeart,
  '🐍': faPython, '🇰🇷': faFlag,
};

// 매핑 키들로 정규식을 구성. 뒤따르는 변형 선택자(U+FE0F)는 함께 흡수한다.
//   긴 키 우선 정렬은 단일 코드포인트라 불필요하지만, 안전을 위해 join.
// 긴 시퀀스(ZWJ 조합 등)를 먼저 매칭하도록 길이 내림차순 정렬 — 부분 매칭 방지.
const KEYS = Object.keys(MAP).sort((a, b) => b.length - a.length);
const EMOJI_RE = new RegExp('(' + KEYS.map(escapeRe).join('|') + ')\\uFE0F?', 'g');

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 단일 이모지를 FA 아이콘으로 렌더. 매핑이 없으면 원문 문자열을 그대로 반환. */
export function EmojiIcon({ char, className }: { char?: string; className?: string }): ReactNode {
  if (!char) return null;
  const key = char.replace(/️/g, '').trim();
  const icon = MAP[key];
  if (!icon) return char; // 화살표·체크박스·미매핑 이모지는 원문 유지
  return <FontAwesomeIcon icon={icon} className={className} fixedWidth />;
}

/** 매핑 존재 여부 */
export function hasIcon(char?: string): boolean {
  if (!char) return false;
  return !!MAP[char.replace(/️/g, '').trim()];
}

/**
 * 문자열 안의 "장식 이모지"만 FA 아이콘으로 치환한 ReactNode를 반환.
 *   - 매핑에 없는 문자(→ ☐ 등)는 건드리지 않는다.
 *   - 코드블록 내용에는 절대 적용하지 말 것(호출부에서 제외).
 */
export function withIcons(text?: string): ReactNode {
  if (!text) return text ?? null;
  if (!EMOJI_RE.test(text)) return text;
  EMOJI_RE.lastIndex = 0;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = EMOJI_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const icon = MAP[m[1]];
    out.push(<FontAwesomeIcon key={k++} icon={icon} className="fa-inline" fixedWidth />);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
