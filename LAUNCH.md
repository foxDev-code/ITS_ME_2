# Publish your portfolio

The website files are ready for local review. Account setup and production checks below are still required. Nothing has been published by this update.

## 1. Get your public address

1. Open https://vercel.com/drop and sign in to your own account.
2. Upload this portfolio folder, including `build.mjs`, `site.config.json`, `home-template.html`, `vercel.json`, `package.json` and `dist`. Do not upload `.git` or `.openai` folders. The provided `portfolio.zip` excludes those folders; extract it into a fresh folder first.
3. Choose a project name and deploy. Vercel uses `node build.mjs` and publishes `dist`.
4. Open the resulting HTTPS address and check Home, Projects, Contact, the résumé and an invalid URL.
5. Send that address back in this chat. The build uses Vercel's production-domain environment variable when available. If the canonical URL or sitemap entries are missing, set `siteUrl` in `site.config.json` to your final HTTPS address, run `node build.mjs`, and redeploy. You can also set Vercel's `SITE_URL` environment variable.

Do not use localhost, a temporary preview URL or your old portfolio's address as the canonical unless it will actually host this site. A custom domain is optional. Verify HTTP redirects to HTTPS on the deployed address; the local development server deliberately uses HTTP.

Reference: https://vercel.com/docs/deployments and https://vercel.com/docs/environment-variables/system-environment-variables

## 2. Connect Google and Bing

1. Open https://search.google.com/search-console and add a URL-prefix property using your final HTTPS URL.
2. Choose HTML-tag verification. Copy only the `content` value into `googleVerification` in `site.config.json`. Rebuild and redeploy, then select Verify. For an owned custom domain, DNS verification is another option.
3. Submit `sitemap.xml`. Inspect the homepage and key pages with URL Inspection and request indexing. Indexing is not guaranteed or immediate.
4. Open https://www.bing.com/webmasters/ and add the same site, or use its Search Console import. For HTML verification, copy its meta-tag content into `bingVerification`, rebuild and redeploy.
5. Review indexing reports, search queries and backlinks in those dashboards after data appears.

Reference: https://support.google.com/webmasters/answer/9008080

## 3. Optional analytics

In Google Analytics, create a web property/data stream for this address. Copy the public measurement ID (`G-…`) into `googleAnalyticsId`. In Clarity, create a project and copy its project ID into `clarityId`. Leave either blank to keep that service disabled.

Rebuild and redeploy after changes. The consent panel appears only when a service is configured. Neither script loads until the visitor accepts. Privacy settings lets a visitor withdraw consent. In Clarity, keep sensitive-data masking enabled; test recordings without real personal data. Link Search Console from Analytics' product-link settings when both properties are verified. Review the generated privacy notice against your actual hosting and data practices before enabling collection.

Reference: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2

## 4. Direct contact-form delivery

Currently the validated form opens an email draft; the visitor sends it in their mail app. To receive submissions directly, create a Formspree form, verify your recipient address, and paste the public `https://formspree.io/f/…` endpoint into `contactEndpoint`. Rebuild and redeploy. Confirm delivery with a test you send yourself. Enable the provider's spam protection and review quotas. The form includes a `_gotcha` honeypot, browser validation, a length limit, timeout and honest failure states; server-side spam controls belong to the provider.

Never put email passwords or private service keys in this static website.

Reference: https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering

## 5. Final checks after deployment

- Run https://pagespeed.web.dev/ on the homepage and `/projects.html`. Local screenshots are not Core Web Vitals. The readable pages avoid the 3D payload; field data requires real visits.
- Check https://search.google.com/test/rich-results and validate structured data. Valid markup does not guarantee a rich result.
- Check `/robots.txt`, `/sitemap.xml`, canonical tags, social previews, HTTPS, the custom 404 response and redirects on the real host.
- Open the site on a physical phone. Check touch targets, sound controls, portrait/landscape layout and loading on mobile data.
- Test both deployed project links and social links again at launch.
- Set up an uptime-monitoring account for the HTTPS URL and choose your own alert address. No external monitoring or recurring automation has been activated here.
- Add the final URL to your own GitHub, LinkedIn and other bios. No messages or profile edits have been sent on your behalf.
- Search Console reports and Google Alerts can help you monitor searches, links and brand mentions. These need your account.

## What is deliberately not fabricated

No reviews, testimonials, statistics, customer claims, directory listings, Wikipedia pages, Reddit mentions, YouTube videos or Product Hunt launches were created. Business/map listings require a real eligible business and its details. G2/Trustpilot listings and comparison articles are not prerequisites for a personal portfolio. Keyword Planner, Trends, AlsoAsked, Ahrefs and AI search services are research tools, not site plugins. Use them for real research, not artificial checklist completion.

`robots.txt` currently permits OAI-SearchBot and GPTBot. Search and training permissions are separate; edit that policy if you prefer to restrict training. No claim of AI recommendation or search ranking is made.

## Maintenance

Edit personal/project content in `dist/profile.js`; edit the 3D HTML shell in `home-template.html`. Run `node build.mjs` after changing either or `site.config.json`. The build regenerates the static pages, home metadata, sitemap and privacy text. Run `node check-server.mjs` and `node check-client.mjs` before deployment.
