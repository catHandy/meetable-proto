/* meetAble prototype — Place step (공정 ON: fair stations / OFF: manual + distance) */
const { useRef: pUseRef } = React;

function MapView({ target, label, lines, onTap, manual, height = 248 }) {
  const M = window.MA;
  const ref = pUseRef(null);
  const handle = (e) => {
    if (!onTap) return;
    const r = ref.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - r.top) / r.height) * 100));
    onTap({ x, y, name: '선택 지점' });
  };
  return (
    <div className="map" style={{ height, cursor: onTap ? 'crosshair' : 'default' }} ref={ref} onClick={handle}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M-2 60 Q24 52 47 62 T102 58 L102 72 Q70 66 45 74 T-2 72 Z" fill="#d7e6ea" stroke="#bcd6da" strokeWidth=".5" />
        <g stroke="#d9d2cb" strokeWidth=".8" fill="none" strokeLinecap="round">
          <path d="M9 -2 Q14 30 27 48 T41 102" /><path d="M-2 26 Q40 20 72 31 T102 41" />
          <path d="M70 -2 Q66 30 79 52 T87 102" /><path d="M-2 86 Q40 80 102 90" />
        </g>
        {lines && target && M.FRIENDS.map((f) => (
          <line key={f.id} x1={f.map.x} y1={f.map.y} x2={target.x} y2={target.y}
            stroke={f.color} strokeWidth=".8" strokeDasharray="2.4 1.8" opacity=".85" />
        ))}
        {M.FRIENDS.map((f) => (
          <g key={f.id}>
            <circle cx={f.map.x} cy={f.map.y} r="5.2" fill="none" stroke={f.color} strokeWidth=".6" opacity=".4" />
            <circle cx={f.map.x} cy={f.map.y} r="2.7" fill={f.color} stroke="#fff" strokeWidth=".9" />
          </g>
        ))}
        {target && !manual && <circle cx={target.x} cy={target.y} r="3.4" fill="#2a1a22" stroke="#fff" strokeWidth="1" />}
        {target && manual && (
          <g>
            <circle cx={target.x} cy={target.y} r="3.6" fill="none" stroke="#2a1a22" strokeWidth="1.1" />
            <line x1={target.x - 3} y1={target.y - 3} x2={target.x + 3} y2={target.y + 3} stroke="#2a1a22" strokeWidth="1.1" />
            <line x1={target.x + 3} y1={target.y - 3} x2={target.x - 3} y2={target.y + 3} stroke="#2a1a22" strokeWidth="1.1" />
          </g>
        )}
      </svg>
      {M.FRIENDS.map((f) => (
        <div key={f.id} className="mlabel" style={{ left: f.map.x + '%', top: (f.map.y - 9) + '%', borderBottom: '2px solid ' + f.color }}>{f.id}</div>
      ))}
      {target && label && <div className="mlabel tgt" style={{ left: target.x + '%', top: (target.y - 9) + '%' }}>{label}</div>}
    </div>
  );
}

function PlaceStep({ fairness, setFairness, onNext }) {
  const M = window.MA;
  const ranked = M.STATIONS.map((s) => ({ ...s, max: Math.max(...M.FRIENDS.map((f) => s.t[f.id])) }))
    .sort((a, b) => a.max - b.max);
  const [sel, setSel] = React.useState(ranked[0].id);
  const cur = ranked.find((s) => s.id === sel) || ranked[0];
  const [pt, setPt] = React.useState({ x: 34, y: 40, name: '홍대입구' });

  const dists = M.distances(pt);
  const far = dists.reduce((a, b) => (b.km > a.km ? b : a), dists[0]);
  const maxKm = Math.max(...dists.map((d) => d.km));

  return (
    <>
      <div className="body fadein">
        <div>
          <div className="title">어디서 만날까</div>
          <div className="sub">{fairness ? '모두에게 공정한 — 실제 역 후보를 가까운 순으로' : '직접 찍은 지점까지 각자 직선거리를 확인'}</div>
        </div>

        <div style={{ position: 'relative' }}>
          <MapView
            target={fairness ? cur.map : pt}
            label={fairness ? cur.id : pt.name}
            lines manual={!fairness}
            onTap={fairness ? null : setPt} />
          <div className="pill" style={{ position: 'absolute', top: 12, left: 12 }} onClick={() => setFairness((v) => !v)}>
            <span>공정</span><span className={'sw' + (fairness ? ' on' : '')}><i /></span>
          </div>
        </div>

        {fairness ? (
          <div className="rail">
            {ranked.map((s, i) => (
              <div key={s.id} className={'cand' + (s.id === sel ? ' on' : '')} onClick={() => setSel(s.id)}>
                <div className="hd"><b>{i + 1} · {s.id}</b><span className="mx">최대 {s.max}분</span></div>
                {M.FRIENDS.map((f) => (
                  <div key={f.id} className="bar">
                    <span className="nm">{f.id}</span>
                    <span className="track"><i style={{ width: Math.min(100, (s.t[f.id] / 40) * 100) + '%', background: f.color }} /></span>
                    <span className="v">{s.t[f.id]}분</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="dmodal">
            <div className="hd"><b>{pt.name}</b><span>직선거리</span></div>
            {dists.map((d) => (
              <div key={d.id} className="bar" style={{ marginTop: 7 }}>
                <span className="nm">{d.id}</span>
                <span className="track"><i style={{ width: (d.km / maxKm * 100) + '%', background: d.km === maxKm ? 'var(--accent)' : d.color }} /></span>
                <span className="v" style={{ color: d.km === maxKm ? 'var(--accent)' : 'var(--ink)' }}>{d.km}km</span>
              </div>
            ))}
            <div className="warn">⚠ {far.id}님이 가장 멀어요 — {far.km}km{maxKm > 42 ? ', 혼자 고생할 수도' : ''}</div>
          </div>
        )}
      </div>
      <div className="foot">
        <div className="qres">
          <span className="qdot" />
          <b>{fairness ? cur.id : pt.name}</b>
          <span>{fairness ? `전원 ${cur.max}분 이내` : `최대 ${maxKm}km`}</span>
        </div>
        <div className="divline" />
        <button className="cta" onClick={onNext}>이 장소로 약속 확정 →</button>
      </div>
    </>
  );
}
window.PlaceStep = PlaceStep;
