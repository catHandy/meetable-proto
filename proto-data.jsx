/* meetAble prototype — shared data + helpers */
window.MA = (function () {
  // demo friends in the room (fictional placeholders; 서연 = 현재 사용자 역할)
  const FRIENDS = [
    { id: '민지', init: '민', color: 'var(--p1)', map: { x: 20, y: 30 } },
    { id: '준호', init: '준', color: 'var(--p2)', map: { x: 80, y: 24 } },
    { id: '서연', init: '서', color: 'var(--p3)', map: { x: 50, y: 84 }, me: true },
  ];
  // preset availability (June 2026); current user (서연) is editable, seeded here
  const PRESET = {
    민지: [6, 7, 13, 14, 20, 21, 27, 28],
    준호: [5, 6, 14, 21, 22, 28, 29],
    서연: [7, 13, 14, 20, 21, 28],
  };
  // June 2026: 1st = Monday → 1 leading blank (Sun-first week)
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const DAYS = 30, LEAD = 1;
  const dow = (d) => (d % 7); // 0=Sun .. with June1(Mon)=1 → d=7 →0(Sun)? compute: index=(LEAD+d-1)%7
  const cellDow = (d) => (LEAD + d - 1) % 7;

  // candidate stations (공정 ON) — transit minutes per person
  const STATIONS = [
    { id: '신도림역', map: { x: 42, y: 52 }, t: { 민지: 22, 준호: 28, 서연: 18 } },
    { id: '사당역',   map: { x: 47, y: 64 }, t: { 민지: 26, 준호: 31, 서연: 24 } },
    { id: '강변역',   map: { x: 64, y: 42 }, t: { 민지: 34, 준호: 13, 서연: 30 } },
  ];

  const fmt = (arr) => arr.slice().sort((a, b) => a - b);
  // straight-line "km" from a map point (0..100) to each friend
  function distances(pt) {
    return FRIENDS.map((f) => {
      const dx = f.map.x - pt.x, dy = f.map.y - pt.y;
      const km = Math.round(Math.sqrt(dx * dx + dy * dy) * 0.62);
      return { id: f.id, color: f.color, km };
    });
  }
  return { FRIENDS, PRESET, WD, DAYS, LEAD, cellDow, STATIONS, fmt, distances };
})();
