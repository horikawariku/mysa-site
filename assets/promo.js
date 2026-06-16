/* mysa 全宿共通 10%OFF ウェルカムポップアップ（1セッション1回） */
(function(){
  try { if (sessionStorage.getItem('mysa_promo')) return; } catch(e){}
  var BOOK = (typeof window.MYSA_BOOK === 'string' && window.MYSA_BOOK) ? window.MYSA_BOOK : null;

  var css = ''
   + '#promoOv{position:fixed;inset:0;z-index:200;background:rgba(15,11,8,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity .3s}'
   + '#promoOv.on{opacity:1}'
   + "#promoOv .promoCard{position:relative;background:#f3ece1;color:#212227;width:100%;max-width:380px;border-radius:22px;padding:36px 26px 24px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,.42);transform:translateY(16px) scale(.98);transition:.35s;font-family:'Zen Kaku Gothic New','Manrope',sans-serif}"
   + '#promoOv.on .promoCard{transform:none}'
   + '.promoX{position:absolute;top:10px;right:12px;width:34px;height:34px;font-size:23px;color:#5b5c50;background:none;border:none;cursor:pointer;line-height:1}'
   + ".promoEy{font-family:'Manrope',sans-serif;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#2f3d31;font-weight:700}"
   + ".promoBig{font-family:'Manrope',sans-serif;font-weight:800;font-size:60px;line-height:1;letter-spacing:-.02em;margin:12px 0 4px;color:#14100c}"
   + '.promoBig span{font-size:32px;font-weight:700;vertical-align:super;margin-left:2px}'
   + '.promoTxt{font-size:13.5px;color:#5b5c50;line-height:1.85;margin:6px 0 22px}'
   + ".promoBtn{display:block;background:#14100c;color:#f3ece1;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;padding:15px;border-radius:13px;text-decoration:none}"
   + ".promoClose{display:block;width:100%;margin-top:12px;background:none;border:none;color:#5b5c50;font-family:'Zen Kaku Gothic New',sans-serif;font-size:12.5px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}";
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ov = document.createElement('div'); ov.id = 'promoOv';
  ov.innerHTML =
      '<div class="promoCard" role="dialog" aria-label="10%OFFのご案内">'
    +   '<button class="promoX" aria-label="閉じる">×</button>'
    +   '<div class="promoEy">Welcome ・ 公式サイト限定</div>'
    +   '<div class="promoBig">10<span>% OFF</span></div>'
    +   '<div class="promoTxt">このサイト経由のご予約が、一番お得。<br>mysa 全宿でご利用いただけます。</div>'
    +   '<a class="promoBtn" href="' + (BOOK || '#stays') + '"' + (BOOK ? ' target="_blank" rel="noopener"' : '') + '>' + (BOOK ? 'この宿を予約する' : '宿を見る') + '</a>'
    +   '<button class="promoClose">あとで見る</button>'
    + '</div>';
  document.body.appendChild(ov);

  function seen(){ try { sessionStorage.setItem('mysa_promo','1'); } catch(e){} }
  function close(){ seen(); ov.classList.remove('on'); setTimeout(function(){ if(ov && ov.parentNode) ov.parentNode.removeChild(ov); }, 320); }
  ov.querySelector('.promoX').addEventListener('click', close);
  ov.querySelector('.promoClose').addEventListener('click', close);
  ov.addEventListener('click', function(e){ if (e.target === ov) close(); });
  ov.querySelector('.promoBtn').addEventListener('click', function(e){
    if (!BOOK){ e.preventDefault(); var t = document.getElementById('stays'); if (t) t.scrollIntoView({behavior:'smooth'}); }
    close();
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });

  setTimeout(function(){ ov.classList.add('on'); }, 700);
})();
