# nh-it-training.de

Static GitHub Pages deployment for nh-it-training.de.

Forms are sent through FormSubmit to max.dilewski@newhorizons-muenchen.de. The first submission must be confirmed by email.

## Maintenance mode

Maintenance mode is currently disabled with `maintenanceMode = false` at the top of `app.js`.
Set the value to `true` and deploy only when the public website should show the temporary
"Die Seite befindet sich im Aufbau." screen.

## Regional scope

The live site is scoped to Munich/Oberbayern, Nuremberg/Franken, Stuttgart/Baden-Württemberg
and the regional hub `standorte.html`. Legacy regional landing pages are kept only as
`noindex,follow` redirects to preserve old links while the public site focuses on the current
regional communication.

## SEO action log

### 2026-06-29

- Google Search Console property `https://nh-it-training.de/` confirmed with HTML verification file `google8452a4b36c9f62c7.html`.
- Sitemap `https://nh-it-training.de/sitemap.xml` submitted and read successfully by Google.
- Google Search Console detected `338` sitemap URLs.
- Manual indexing requests submitted for:
  - `https://nh-it-training.de/`
  - `https://nh-it-training.de/kurskatalog.html`
  - `https://nh-it-training.de/it-weiterbildung-online-münchen.html`
  - `https://nh-it-training.de/it-weiterbildung-online-nürnberg.html`
  - `https://nh-it-training.de/it-weiterbildung-online-stuttgart.html`
- Bing IndexNow submitted `338` sitemap URLs with status `200`.
- Technical live checks passed for robots.txt, sitemap, canonical tags, structured data and noindex risks on the primary SEO landing pages.
- Google Search Console live inspection on 2026-06-29:
  - Homepage `https://nh-it-training.de/` is reported as indexed and available on Google.
  - Stuttgart page `https://nh-it-training.de/it-weiterbildung-online-stuttgart.html` was initially reported as not known to Google, then passed the live URL test as indexable.
  - Manual indexing request for the Stuttgart page was submitted after the successful live test.
- Bing IndexNow resubmitted `338` sitemap URLs after the cookie banner update with status `200`.

### 2026-07-14

- Full website restored from temporary maintenance mode.
- Header navigation changed from wider regional wording to `Regionen`.
- Added `standorte.html` as the regional hub for Munich, Nuremberg, Stuttgart, Bavaria and Baden-Württemberg.
- Removed previous wider regional landing pages from `sitemap.xml`; legacy pages now point to `standorte.html` with `noindex,follow`.
- Updated course FAQs, navigation links and visible regional blocks to focus on Munich, Nuremberg and Stuttgart.
- Bumped static asset query version to `20260714-1` so browsers fetch the restored `app.js`.
