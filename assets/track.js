/* mysa 計測タグ：UTM(utm_source)を保存し、Beds24予約ボタンを redirect-tracker 経由に書き換える。
   各ページで window.MYSA_PROP（物件ID）を設定すると、その物件として計測される。
   予約リンクが無いページ（トップ等）では UTM の保存のみ行う。 */
(function () {
  var RT = "https://redirect-tracker-eta.vercel.app/api/redirect";

  // 1) 着地時のUTM / fbclid を保存（別ページに遷移してもlocalStorageで保持）
  try {
    var q = new URLSearchParams(location.search);
    var s = q.get("utm_source");
    var fb = q.get("fbclid");
    if (s) localStorage.setItem("mysa_src", s);
    if (fb) localStorage.setItem("mysa_fbclid", fb);
  } catch (e) {}

  // 1b) 訪問者ID: page_views と 予約クリック(click_logs) を同一人物として繋ぐ。
  //     100villa から ?rt_vid= 付きで来た場合はそのIDを引き継ぐ（クロスサイトで同一訪問者に）。
  var VID = null;
  try {
    var vq = new URLSearchParams(location.search);
    var rv = vq.get("rt_vid");
    if (rv && /^[0-9a-f-]{16,64}$/i.test(rv)) localStorage.setItem("mysa_vid", rv);
    VID = localStorage.getItem("mysa_vid");
    if (!VID) {
      VID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
      localStorage.setItem("mysa_vid", VID);
    }
  } catch (e) {}

  // 1c) page_view 送信（100villaのビーコンと同じテーブルへ。
  //     これが無いと「到達(landed)」集計で mysa 系だけ実態より過小になる）
  try {
    var pvBody = JSON.stringify({
      visitor_id: VID,
      property_id: window.MYSA_PROP || null,
      page_type: location.pathname === "/" ? "site_top" : "site_page",
      page_url: location.href,
      referrer: document.referrer || null
    });
    var pvUrl = "https://redirect-tracker-eta.vercel.app/api/page-view";
    // 重要: application/json のBlobを渡すとクロスオリジンではCORSプリフライトが必要になり、
    // ビーコンはプリフライト不可のためブラウザが送信自体をブロックする (IG系の閲覧が全滅していた原因)。
    // 文字列(=text/plain扱い)ならプリフライト不要でそのまま届く。サーバ側のJSONパースはContent-Type非依存。
    if (navigator.sendBeacon) {
      navigator.sendBeacon(pvUrl, pvBody);
    } else {
      fetch(pvUrl, { method: "POST", body: pvBody, keepalive: true, mode: "no-cors" });
    }
  } catch (e) {}

  var prop = window.MYSA_PROP;
  if (!prop) return; // 予約リンクの無いページ（UTM保存のみで終了）

  function src() { try { return localStorage.getItem("mysa_src") || "direct"; } catch (e) { return "direct"; } }
  function fbc() { try { return localStorage.getItem("mysa_fbclid") || ""; } catch (e) { return ""; } }

  // トップで選んだ日付（?checkin&checkout）を Beds24 まで引き継ぐ
  function dates() {
    try {
      var q = new URLSearchParams(location.search);
      var ci = q.get("checkin"), co = q.get("checkout");
      return (ci && co) ? ("&checkin=" + encodeURIComponent(ci) + "&checkout=" + encodeURIComponent(co)) : "";
    } catch (e) { return ""; }
  }
  function redirectUrl() {
    var u = RT + "?p=" + encodeURIComponent(prop) +
            "&s=" + encodeURIComponent(src()) +
            "&c=" + encodeURIComponent(prop) + "&m=cpc" + dates();
    var f = fbc();
    if (f) u += "&fbclid=" + encodeURIComponent(f);
    if (VID) u += "&v=" + encodeURIComponent(VID); // クリックを page_views と同一訪問者に紐付け
    return u;
  }

  // 2) Beds24宛の予約リンクを /api/redirect 経由に差し替え
  function rewrite() {
    var dest = redirectUrl();
    var links = document.querySelectorAll('a[href*="beds24.com"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.getAttribute("data-rt")) continue;
      a.setAttribute("href", dest);
      a.setAttribute("data-rt", "1");
      a.addEventListener("click", function () {
        try { var fbq = window.fbq; if (fbq) fbq("track", "InitiateCheckout"); } catch (e) {}
      });
    }
  }

  if (document.readyState !== "loading") rewrite();
  else document.addEventListener("DOMContentLoaded", rewrite);
  setTimeout(rewrite, 1200);
  setTimeout(rewrite, 3000);
})();
