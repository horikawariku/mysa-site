/* mysa 空室カレンダー
   redirect-tracker の /api/availability/<宿ID> から「予約済み日」を取得し、
   2ヶ月分のカレンダーに空室/満室を表示する。
   各ページで window.MYSA_PROP（宿ID）が設定されている前提。
   設置: <div id="mysa-calendar"></div> があればそこに、無ければ予約ボタン手前に自動挿入。 */
(function () {
  var API = "https://redirect-tracker-eta.vercel.app/api/availability/";
  var prop = window.MYSA_PROP;
  if (!prop) return;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function injectCss() {
    if (document.getElementById("mc-css")) return;
    var css =
      ".mc-wrap{font-family:'Zen Kaku Gothic New','Manrope',sans-serif;background:#f3ece1;color:#212227;border:1px solid rgba(33,34,39,.12);border-radius:18px;padding:22px;max-width:760px;margin:28px auto}" +
      ".mc-title{font-weight:700;font-size:16px;letter-spacing:.04em;margin-bottom:4px}" +
      ".mc-legend{font-size:12px;color:#5b5c50;display:flex;gap:14px;align-items:center;margin-bottom:16px}" +
      ".mc-dot{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:5px;vertical-align:-1px}" +
      ".mc-dot.mc-l-open{background:#cfe0cf}.mc-dot.mc-l-booked{background:#ddd9c6}" +
      ".mc-months{display:flex;flex-wrap:wrap;gap:22px}" +
      ".mc-month{flex:1 1 300px}" +
      ".mc-mhead{font-weight:700;font-size:14px;margin-bottom:8px;text-align:center}" +
      ".mc-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}" +
      ".mc-wd{font-size:10px;color:#9a9684;text-align:center;padding:2px 0}" +
      ".mc-cell{aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font-size:10px;border-radius:7px;line-height:1.05}" +
      ".mc-cell .mc-d{font-size:10px;opacity:.85}" +
      ".mc-cell .mc-mk{font-size:14px;font-weight:700;line-height:1}" +
      ".mc-empty{background:transparent}" +
      ".mc-open{background:rgba(34,150,83,.12);color:#1f7a44}" +
      ".mc-open .mc-mk{color:#1f9d57}" +
      ".mc-booked{background:rgba(200,60,60,.10);color:#b23b3b}" +
      ".mc-booked .mc-mk{color:#cc3b3b}" +
      ".mc-past{color:#c7c3b3;opacity:.45}" +
      ".mc-note{font-size:11px;color:#9a9684;margin-top:14px;text-align:center}" +
      ".mc-loading{font-size:13px;color:#9a9684;padding:20px;text-align:center;width:100%}";
    var st = document.createElement("style");
    st.id = "mc-css";
    st.textContent = css;
    document.head.appendChild(st);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  function buildMonth(y, m, booked, todayStr) {
    var wrap = document.createElement("div"); wrap.className = "mc-month";
    var head = document.createElement("div"); head.className = "mc-mhead";
    head.textContent = y + "年" + (m + 1) + "月"; wrap.appendChild(head);
    var grid = document.createElement("div"); grid.className = "mc-grid";
    ["日", "月", "火", "水", "木", "金", "土"].forEach(function (w) {
      var c = document.createElement("div"); c.className = "mc-wd"; c.textContent = w; grid.appendChild(c);
    });
    var startDow = new Date(y, m, 1).getDay();
    for (var b = 0; b < startDow; b++) { var e = document.createElement("div"); e.className = "mc-cell mc-empty"; grid.appendChild(e); }
    var days = new Date(y, m + 1, 0).getDate();
    for (var dn = 1; dn <= days; dn++) {
      var ds = y + "-" + pad(m + 1) + "-" + pad(dn);
      var cell = document.createElement("div"); cell.className = "mc-cell";
      var mk = "";
      if (ds < todayStr) cell.className += " mc-past";
      else if (booked[ds]) { cell.className += " mc-booked"; mk = "✕"; }
      else { cell.className += " mc-open"; mk = "◯"; }
      cell.innerHTML = '<span class="mc-d">' + dn + '</span>' + (mk ? '<span class="mc-mk">' + mk + '</span>' : '');
      grid.appendChild(cell);
    }
    wrap.appendChild(grid); return wrap;
  }

  function render(host, bookedArr) {
    var booked = {}; (bookedArr || []).forEach(function (x) { booked[x] = 1; });
    var months = host.querySelector("#mc-months");
    months.innerHTML = "";
    var now = new Date(); now.setHours(0, 0, 0, 0);
    var todayStr = ymd(now);
    for (var i = 0; i < 2; i++) {
      var base = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.appendChild(buildMonth(base.getFullYear(), base.getMonth(), booked, todayStr));
    }
  }

  function getHost() {
    // 明示的に <div id="mysa-calendar"> が置かれている場合のみ表示（自動挿入はしない）
    return document.getElementById("mysa-calendar");
  }

  ready(function () {
    var host = getHost();
    if (!host) return;
    injectCss();
    host.innerHTML =
      '<div class="mc-wrap"><div class="mc-title">空室カレンダー</div>' +
      '<div class="mc-legend"><span style="color:#1f9d57;font-weight:700;font-size:14px">◯</span>&nbsp;空室&nbsp;&nbsp;&nbsp;<span style="color:#cc3b3b;font-weight:700;font-size:14px">✕</span>&nbsp;満室</div>' +
      '<div class="mc-months"><div class="mc-loading">空室状況を読み込み中…</div></div>' +
      '<div class="mc-note">最新の空室状況です。ご予約は予約ボタンからお進みください。</div></div>';
    var months = host.querySelector(".mc-months"); months.id = "mc-months";
    fetch(API + encodeURIComponent(prop))
      .then(function (r) { return r.json(); })
      .then(function (d) { render(host, d.booked || []); })
      .catch(function () { months.innerHTML = '<div class="mc-loading">空室情報を取得できませんでした。</div>'; });
  });
})();
