# meetAble

친구들끼리 약속 **날짜와 장소**를 한 번에 정하는 모바일 웹 프로토타입.

## 플로우
1. **날짜** — 캘린더 히트맵에 각자 되는 날을 칠하면 전원 겹치는 날이 진해집니다.
2. **장소** — "공정" 모드는 모두에게 이동시간이 공정한 역 후보를 추천하고, 끄면 지도에 직접 찍은 지점까지 각자 거리를 보여줍니다.
3. **추천** — 확정된 날짜·장소를 기준으로 동네 추천 (준비중).

## 실행
정적 파일이라 별도 빌드가 없습니다. 로컬에서는 아무 정적 서버로 `index.html`을 열면 됩니다.

```bash
python3 -m http.server
# → http://localhost:8000
```

GitHub Pages: 저장소 Settings → Pages → 브랜치 루트(`/`)로 배포하면 `index.html`이 진입점이 됩니다.

## 구성
- `index.html` — 진입점
- `proto.css` — 디자인 시스템
- `proto-data.jsx` — 공유 데모 데이터
- `proto-date.jsx` / `proto-place.jsx` / `proto-app.jsx` — 화면 컴포넌트

React 18 + 브라우저 Babel 트랜스파일, 폰트는 Pretendard. 데이터는 모두 데모용 가상 값입니다.
