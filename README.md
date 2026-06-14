# mysa portal site
富士・箱根の貸切サウナ宿 mysa の統合ポータル（静的サイト）。

## Deploy (Cloudflare Pages)
1. このリポジトリを GitHub に push
2. Cloudflare Pages → Create a project → Connect to Git → このリポジトリを選択
3. Framework preset: None / Build command: 空欄 / Build output directory: `/` (ルート)
4. Deploy

カスタムドメインは Pages → Custom domains から割当。割当後、index.html の canonical / og:url、robots.txt・sitemap.xml の URL を本番ドメインに更新すること。
