/* meetAble prototype — Date step (heatmap + drag-paint my availability) */
const { useRef: dUseRef } = React;

function DateHeatmapGrid({ myDays, setMyDays, paint }) {
  const M = window.MA;
  const gridRef = dUseRef(null);
  const drag = dUseRef(null);

  const countOf = (d) => (M.PRESET['민지'].includes(d) ? 1 : 0) + (M.PRESET['준호'].includes(d) ? 1 : 0) + (myDays.has(d) ? 1 : 0);
  const applyDay = (d, adding) => setMyDays((prev) => {
    if (prev.has(d) === adding) return prev;
    const s = new Set(prev); if (adding) s.add(d); else s.delete(d); return s;
  });

  const onDown = (e) => {
    if (!paint) return;
    const cell = e.target.closest('[data-day]'); if (!cell) return;
    const d = +cell.dataset.day; const adding = !myDays.has(d);
    drag.current = { adding };
    applyDay(d, adding);
    try { gridRef.current.setPointerCapture(e.pointerId); } catch (x) {}
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el && el.closest && el.closest('[data-day]');
    if (cell) applyDay(+cell.dataset.day, drag.current.adding);
  };
  const onUp = () => { drag.current = null; };

  const cells = [<div key="b" className="cell blank" />];
  for (let d = 1; d <= M.DAYS; d++) {
    const n = countOf(d);
    const bg = n === 0 ? null : ['var(--r1)', 'var(--r2)', 'var(--r3)'][n - 1];
    cells.push(
      <div key={d} data-day={d}
        className={'cell' + (myDays.has(d) ? ' mine' : '') + (n === 3 ? ' full' : '')}
        style={bg ? { background: bg, color: n === 3 ? '#fff' : 'var(--ink)' } : null}>{d}</div>
    );
  }
  return (
    <div className="hm" ref={gridRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {M.WD.map((w, i) => <div key={w} className={'wd' + (i === 0 ? ' sun' : '')}>{w}</div>)}
      {cells}
    </div>
  );
}

function DateStep({ myDays, setMyDays, onNext }) {
  const M = window.MA;
  const [paint, setPaint] = React.useState(true);
  const allFree = [];
  for (let d = 1; d <= M.DAYS; d++) {
    if (M.PRESET['민지'].includes(d) && M.PRESET['준호'].includes(d) && myDays.has(d)) allFree.push(d);
  }
  const dlabel = allFree.length ? allFree.map((d) => '6/' + d).join(' · ') : '아직 없음 — 더 칠해보세요';

  return (
    <>
      <div className="body fadein">
        <div>
          <div className="title">되는 날을 칠해요</div>
          <div className="sub">내가 가능한 날을 탭하거나 길게 드래그 — 다 같이 되는 날이 진해져요</div>
        </div>
        <div className="mon">
          <b>2026 · 6월</b>
          <div style={{ display: 'flex', gap: 8 }}><button className="nav">‹</button><button className="nav">›</button></div>
        </div>
        <div className="card"><DateHeatmapGrid myDays={myDays} setMyDays={setMyDays} paint={paint} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="legend">적음<i style={{ background: 'var(--r1)' }} /><i style={{ background: 'var(--r2)' }} /><i style={{ background: 'var(--r3)' }} />많음</div>
          <div className="tg" onClick={() => setPaint((p) => !p)}>
            <span className="lab">내 일정</span><span className={'sw' + (paint ? ' on' : '')}><i /></span>
          </div>
        </div>
      </div>
      <div className="foot">
        <div className="qres">
          <span className="qdot" /><b>전원 가능 {allFree.length}일</b>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dlabel}</span>
        </div>
        <div className="divline" />
        <button className="cta" disabled={!allFree.length} onClick={onNext}>겹치는 날로 장소 정하기 →</button>
      </div>
    </>
  );
}
window.DateStep = DateStep;
