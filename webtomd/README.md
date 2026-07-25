# Web to Markdown (WEBTOMD)

Convertisseur 100% statique : tu donnes une URL, il rend la page en Markdown propre.

## Fonctions

- **URL -> Markdown** (Turndown + GFM : tableaux, strikethrough, code fences)
- **2 modes** : *Page intégrale* ou *Article seul* (Readability, vire nav/pubs/footer)
- **URLs relatives résolues** en absolu (liens + images)
- **Copie intégrale** du markdown en un clic
- **Téléchargement .md** (nommé d'après le titre de la page)
- **Export SVG** du rendu markdown
- **Aperçu live** (éditable à la main)
- Partage direct : `index.html?url=https://exemple.com`

## Utilisation locale

Ouvre simplement `index.html` dans un navigateur. Aucune installation.

## Mise en ligne sur https://webiw.github.io/

Deux options.

### Option A - dépôt racine `webiw.github.io` (URL : `https://webiw.github.io/`)

```bash
# depuis le dossier WEBTOMD
git init
git add index.html README.md
git commit -m "Web to Markdown tool"
git branch -M main
git remote add origin https://github.com/webiw/webiw.github.io.git
git push -u origin main
```

Puis GitHub -> repo `webiw.github.io` -> **Settings > Pages** -> Source : `main` / `/root`.

### Option B - sous-dossier d'un repo existant (URL : `https://webiw.github.io/webtomd/`)

Copie `index.html` dans un dossier `webtomd/` du repo `webiw.github.io`, commit, push.

## Notes techniques

- App entièrement côté client (aucun backend), donc hébergeable sur GitHub Pages.
- Le fetch d'URL passe par des **proxys CORS publics** (allorigins, corsproxy.io, thingproxy) avec fallback automatique. Certaines pages qui bloquent tout proxy peuvent échouer : recharge ou change de mode.
- Librairies chargées via CDN jsDelivr : Turndown, turndown-plugin-gfm, Readability, marked, DOMPurify.
- Le SVG utilise `foreignObject` : parfait pour archivage/partage visuel ; certains rendus complexes (polices web exotiques) peuvent varier selon le viewer.
