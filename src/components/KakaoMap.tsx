/**
 * KakaoMap.tsx
 *
 * [무엇인가]
 *   카카오 지도(JavaScript SDK)를 한 페이지에 실제로 띄우는 재사용 컴포넌트.
 *   주소(address)를 주면 지오코딩으로 좌표를 찾아 마커+인포윈도를 표시하고,
 *   실패하면 전달된 기본 좌표(lat/lng)로 그린다.
 *
 * [키 운영]
 *   - import.meta.env.VITE_KAKAO_JS_KEY (카카오 JavaScript 키)를 사용.
 *   - 키는 프론트에 노출되는 값이라 "숨기기"가 아니라 "도메인 제한 + 사용량 한도"로 방어한다.
 *     (Kakao Developers → 내 앱 → 플랫폼 → Web 에 배포 도메인 등록 필수)
 *   - 키가 없으면 지도를 그리지 않고, 주소·지도 링크가 담긴 안전한 폴백 박스를 보여준다.
 *     → 키 미설정 환경(클린 빌드/프리뷰)에서도 페이지가 깨지지 않는다.
 *
 * [SDK 로딩]
 *   - autoload=false 로 스크립트만 받고, kakao.maps.load(cb) 콜백 안에서 지도를 만든다.
 *   - 스크립트는 문서당 1번만 주입(중복 방지). 이미 로드됐으면 바로 콜백 실행.
 */
import { useEffect, useRef, useState, type ReactElement } from 'react';

// window.kakao 전역 타입(SDK가 런타임에 주입). 세부 타입은 any로 둔다(SDK 자체 타입 미설치).
declare global {
  interface Window { kakao?: any }
}

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY as string | undefined;
const SCRIPT_ID = 'kakao-maps-sdk';

interface KakaoMapProps {
  /** 표시할 주소(지오코딩 대상). 없으면 lat/lng만으로 그린다. */
  address?: string;
  /** 지오코딩 실패 시(또는 주소 미제공 시) 사용할 기본 좌표 */
  lat?: number;
  lng?: number;
  /** 마커 위 말풍선에 표시할 장소명 */
  placeName?: string;
  /** 지도 확대 레벨(작을수록 확대, 기본 3) */
  level?: number;
  /** 지도 높이(px, 기본 360) */
  height?: number;
}

/**
 * 카카오 SDK 스크립트를 한 번만 주입하고 로드 완료 시 resolve 하는 Promise.
 * 이미 로드돼 있으면 즉시 resolve.
 */
const loadKakaoSdk = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (!KAKAO_JS_KEY) { reject(new Error('NO_KEY')); return; }
    // 이미 SDK가 준비된 경우(다른 지도에서 먼저 로드) — 바로 사용
    if (window.kakao?.maps) { resolve(); return; }

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onReady = () => {
      // autoload=false 이므로 maps.load 로 모듈 로딩을 완료시킨다.
      if (window.kakao?.maps) window.kakao.maps.load(() => resolve());
      else reject(new Error('SDK_NOT_READY'));
    };

    if (existing) {
      // 스크립트는 있는데 아직 로드 중일 수 있음 → load 이벤트를 기다림
      if (window.kakao) onReady();
      else existing.addEventListener('load', onReady, { once: true });
      existing.addEventListener('error', () => reject(new Error('SDK_LOAD_ERROR')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    // services 라이브러리: 주소 → 좌표 지오코딩에 필요
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
    script.addEventListener('load', onReady, { once: true });
    script.addEventListener('error', () => reject(new Error('SDK_LOAD_ERROR')), { once: true });
    document.head.appendChild(script);
  });

const KakaoMap = ({
  address,
  lat = 37.5512,
  lng = 126.9745,
  placeName,
  level = 3,
  height = 360,
}: KakaoMapProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  // 'idle' | 'ok' | 'nokey' | 'error'
  const [status, setStatus] = useState<'idle' | 'ok' | 'nokey' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;

    if (!KAKAO_JS_KEY) { setStatus('nokey'); return; }

    loadKakaoSdk()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const kakao = window.kakao;
        const fallbackCenter = new kakao.maps.LatLng(lat, lng);
        const map = new kakao.maps.Map(containerRef.current, { center: fallbackCenter, level });

        // 마커 + 말풍선을 특정 좌표에 찍는 헬퍼
        const placeMarker = (coords: any) => {
          map.setCenter(coords);
          const marker = new kakao.maps.Marker({ map, position: coords });
          if (placeName) {
            const iw = new kakao.maps.InfoWindow({
              content: `<div style="padding:6px 10px;font-size:13px;font-weight:600;white-space:nowrap;">${placeName}</div>`,
            });
            iw.open(map, marker);
          }
        };

        // 주소가 있으면 지오코딩 시도, 실패하면 기본 좌표 사용
        if (address && kakao.maps.services) {
          const geocoder = new kakao.maps.services.Geocoder();
          geocoder.addressSearch(address, (result: any[], statusCode: string) => {
            if (cancelled) return;
            if (statusCode === kakao.maps.services.Status.OK && result[0]) {
              placeMarker(new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x)));
            } else {
              placeMarker(fallbackCenter);
            }
          });
        } else {
          placeMarker(fallbackCenter);
        }
        setStatus('ok');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, [address, lat, lng, placeName, level]);

  // 키가 없거나 로드 실패 시: 페이지가 깨지지 않도록 안내 폴백
  if (status === 'nokey' || status === 'error') {
    const query = encodeURIComponent(address || placeName || '');
    return (
      <div style={{
        height, borderRadius: '12px', border: '1px dashed var(--border-light, #d1d5db)',
        background: 'var(--bg-light-gray, #f8f9fa)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px', textAlign: 'center', padding: '20px',
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary, #6b7280)' }}>
          {status === 'nokey' ? '지도 키(VITE_KAKAO_JS_KEY)가 설정되지 않았습니다.' : '지도를 불러오지 못했습니다.'}
        </div>
        {address && <div style={{ fontSize: '15px', fontWeight: 600 }}>{address}</div>}
        {query && (
          <a href={`https://map.kakao.com/?q=${query}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13.5px' }}>
            카카오맵에서 열기 →
          </a>
        )}
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height, borderRadius: '12px', overflow: 'hidden' }} />;
};

export default KakaoMap;
