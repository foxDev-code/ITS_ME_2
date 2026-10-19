# Satyarth Mishra — 3D Portfolio

Personalized with Satyarth's name, AI/ML biography, skills, eleven projects, GitHub, LinkedIn, X and email. The supplied PDF résumé is included with a download link. Content comes from https://foxdev-portfolio.vercel.app/, the public foxDev-code GitHub repositories, and the supplied résumé. The LinkedIn URL follows the current portfolio; the résumé uses a different spelling.

Edit `dist/profile.js` for the animated title, biography, skill labels and gallery projects. Edit `home-template.html` for the 3D HTML shell and `site.config.json` for your final domain and public integration IDs. Run `node build.mjs` to regenerate the delivered HTML. Tool and asset credits are available in the Credits panel.

On Windows, double-click `Start Portfolio.cmd`. It starts the server on port 4180 (or an available port if 4180 is busy) and opens your browser after the server starts. Keep the command window open while using the site. Node.js must be installed and available on PATH.

Alternatively, run `node serve.mjs` in this folder, then open the URL printed in the terminal. The `PORT` environment variable selects a specific port if needed.

This is a prebuilt static site with 3D scenery, character animations, project cards and audio. Personal content can be edited in the files described above.

Analytics are disabled by default. Google Analytics and Clarity can be configured with public IDs and only load after opt-in consent. Draco decoding files are served locally. The 3D experience loads Zen Dots from Google Fonts and requires WebGL. The About, Projects, FAQ, Contact, Notes, Privacy and Terms pages use system fonts and provide readable HTML without WebGL.

Read `LAUNCH.md` for deployment, Search Console/Bing verification, direct form delivery, analytics and production checks. The contact form currently opens an email draft; direct delivery requires a verified Formspree endpoint. Canonical URLs and sitemap entries are generated once a final domain is supplied, or from Vercel's production-domain environment variable during deployment.

`node serve.mjs --check` runs the static server path checks.
`node check-server.mjs` checks startup with a busy port, the personalized homepage, project images, social links, PDF delivery, a JavaScript asset, and a missing-file response.
It also checks text pages, unique headings/titles, JSON-LD, local links, redirects and the custom 404 page. `node check-client.mjs` checks consent and contact logic without sending external requests.


Project outbound links open verified deployed apps directly. Projects without a verified working deployment retain their description cards and use a details button. Set a project’s `url` in `dist/profile.js` to its live deployment when available; use `null` for no outbound link.
