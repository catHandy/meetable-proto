/* meetAble prototype — app shell, routing, scaling, state */
const { useState, useEffect, useRef } = React;
const LS = 'meetable-proto-v1';

const MY_COLORS = ['#9b6fc4', '#e0a73c', '#e8506b'];

function load() {
  try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; }
}

function App() {
  const M = window.MA;
  const saved = useRef(load()).current;
  const [screen, setScreen] = useState(saved.screen || 'entry');
  const [step, setStep] = useState(saved.step || 'date');
  const [name, setName] = useState(saved.name || '서연');
  const [myColor, setMyColor] = useState(saved.myColor || MY_COLORS[0]);
  const [myDays, setMyDays] = useState(new Set(saved.myDays || M.PRESET['서연']));
  const [fairness, setFairness] = useState(saved.fairness !== undefined ? saved.fairness : true);
  const [dateDone, setDateDone] = useState(saved.dateDone || false);
  const [placeDone, setPlaceDone] = useState(saved.placeDone || false);
  const [toast, setToast] = useState(null);
  const [scale, setScale] = useState(1);

  // persist
  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify({
      screen, step, name, myColor, myDays: [...myDays], fairness, dateDone, placeDone,
    }));
  }, [screen, step, name, myColor, myDays, fairness, dateDone, placeDone]);

  // scale to fit viewport
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 430, window.innerHeight / 884, 1.08));
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  const flash = (msg) => { setToast(msg); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 1800); };

  const friends = M.FRIENDS;
  const allFree = [];
  for (let d = 1; d <= M.DAYS; d++) if (M.PRESET['민지'].includes(d) && M.PRESET['준호'].includes(d) && myDays.has(d)) allFree.push(d);
  const chosenDate = allFree.length ? allFree[0] : 14;
  const DOW = ['월','화','수','목','금','토','일'][(M.LEAD + chosenDate - 1 + 6) % 7];

  const goPlace = () => { setDateDone(true); setStep('place'); flash('겹치는 날 확정 · 장소 단계 열림'); };
  const goReco = () => { setPlaceDone(true); setStep('reco'); flash('약속이 확정됐어요 🎉'); };

  const Avatars = () => (
    <div className="avs">{friends.map((f) => <div key={f.id} className="av" style={{ background: f.color }}>{f.init}</div>)}</div>
  );

  // ENTRY
  if (screen === 'entry') {
    return (
      <Stage scale={scale} rootStyle={{ '--p3': myColor }}>
        <div className="mesh" />
        <div className="statusbar"><span>9:41</span><span className="ic"><i /><i /><i /></span></div>
        <div className="entry fadein">
          <div style={{ marginTop: 24 }}>
            <div className="brand">meetAble</div>
            <div className="tag">친구들이랑 약속 날짜·장소, 한 번에</div>
          </div>
          <div style={{ flex: 1 }} />
          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--soft)' }}>초대받은 약속</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 900 }}>졸업 여행</div>
              <div className="avs">
                <div className="av" style={{ background: 'var(--p1)' }}>민</div>
                <div className="av" style={{ background: 'var(--p2)' }}>준</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--soft)', marginTop: 4 }}>이미 2명 참여 중 · meetable.app/r/3f9a2b</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>이름</div>
          <div className="field" style={{ marginBottom: 18 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름을 입력하세요" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>내 색</div>
          <div className="swatches" style={{ marginBottom: 28 }}>
            {MY_COLORS.map((c) => (
              <div key={c} className={'swatch' + (c === myColor ? ' sel' : '')} style={{ background: c }} onClick={() => setMyColor(c)} />
            ))}
            <span style={{ fontSize: 12.5, color: 'var(--soft)', fontWeight: 600 }}>캘린더·지도에서 나를 표시</span>
          </div>
          <div className="foot" style={{ padding: '0 0 30px' }}>
            <button className="cta" disabled={!name.trim()} onClick={() => { setScreen('room'); setStep('date'); }}>들어가기 →</button>
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </Stage>
    );
  }

  // ROOM
  const Tab = ({ id, label, enabled }) => (
    <button className={step === id ? 'on' : ''} disabled={!enabled}
      onClick={() => enabled && setStep(id)}>
      {label}{!enabled && <span className="lock"> 🔒</span>}
    </button>
  );

  return (
    <Stage scale={scale} rootStyle={{ '--p3': myColor }}>
      <div className="mesh" />
      <div className="glass">
        <div className="statusbar"><span>9:41</span><span className="ic"><i /><i /><i /></span></div>
        <div className="topbar">
          <div className="room"><b>졸업 여행</b><span>친구 {friends.length}명 · 6월 약속</span></div>
          <div className="topbar-r"><Avatars /><button className="iconbtn" onClick={() => flash('초대 링크 복사됨')}>↗</button></div>
        </div>
        <div className="seg">
          <Tab id="date" label="날짜" enabled />
          <Tab id="place" label="장소" enabled={dateDone} />
          <Tab id="reco" label="추천" enabled={placeDone} />
        </div>
      </div>

      {step === 'date' && <DateStep myDays={myDays} setMyDays={setMyDays} onNext={goPlace} />}
      {step === 'place' && <PlaceStep fairness={fairness} setFairness={setFairness} onNext={goReco} />}
      {step === 'reco' && <RecoStep date={'6/' + chosenDate} dow={DOW} onShare={() => flash('초대 링크 복사됨')} onReset={() => { setScreen('entry'); setStep('date'); setDateDone(false); setPlaceDone(false); }} />}

      {toast && <div className="toast">{toast}</div>}
    </Stage>
  );
}

function RecoStep({ date, dow, onShare, onReset }) {
  const cats = [['맛집', '도보 5분 이내 3곳'], ['카페', '조용한 곳 2곳'], ['놀거리', '실내 위주'], ['주차', '근처 공영 2곳']];
  return (
    <>
      <div className="body fadein">
        <div className="card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--soft)' }}>약속 확정</span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <b style={{ fontSize: 22, fontWeight: 900 }}>{date}({dow}) · 신도림역</b>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--pri)' }}>전원 27분 이내</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="title" style={{ fontSize: 24 }}>이 동네 갈 만한 곳</div>
          <span className="ribbon">다음 업데이트</span>
        </div>
        {cats.map(([t, d]) => (
          <div key={t} className="reccard">
            <div className="thumb">img</div>
            <div><b style={{ fontSize: 15.5, fontWeight: 800 }}>{t} 추천</b><div style={{ fontSize: 12.5, color: 'var(--soft)', fontWeight: 600 }}>{d}</div></div>
            <span className="ribbon">준비중</span>
          </div>
        ))}
        <div style={{ fontSize: 13, color: 'var(--soft)', fontWeight: 600, textAlign: 'center', marginTop: 4 }}>약속이 확정되면 그 동네 갈 곳을 추천해요</div>
      </div>
      <div className="foot">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cta ghost" style={{ flex: '0 0 auto', width: 120 }} onClick={onReset}>처음부터</button>
          <button className="cta" onClick={onShare}>친구에게 공유 ↗</button>
        </div>
      </div>
    </>
  );
}

function Stage({ children, scale, rootStyle }) {
  return (
    <div id="stage">
      <div className="scaler" style={{ transform: `scale(${scale})` }}>
        <div className="phone">
          <div className="screen" style={rootStyle}>{children}</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
