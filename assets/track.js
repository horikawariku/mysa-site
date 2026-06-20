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

  var prop = window.MYSA_PROP;
  if (!prop) return; // 予約リンクの無いページ（UTM保存のみで終了）

  function src() { try { return localStorage.getItem("mysa_src") || "direct"; } catch (e) { return "direct"; } }
  function fbc() { try { return localStorage.getItem("mysa_fbclid") || ""; } catch (e) { return ""; } }

  function redirectUrl() {
    var u = RT + "?p=" + encodeURIComponent(prop) +
            "&s=" + encodeURIComponent(src()) +
            "&c=" + encodeURIComponent(prop) + "&m=cpc";
    var f = fbc();
    if (f) u += "&fbclid=" + encodeURIComponent(f);
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
