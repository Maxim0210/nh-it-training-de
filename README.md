# nh-it-training.de

Static GitHub Pages deployment for nh-it-training.de.

Forms are sent through FormSubmit to Max.Dilewski@NewHorizons-Muenchen.de. The first submission must be confirmed by email.

## Homepage update, 2026-09-21

- Added a compact caption below the hero image with direct links to AI/Copilot, Cloud and Cybersecurity training.
- Verified desktop and mobile screenshots, links and responsive layout at five viewport widths.

## Homepage update, 2026-09-18

- Reduced the root type size from 98% to 96%, keeping Montserrat and the existing brand colors.
- Shortened homepage headings and descriptions, removed repeated introductory content, and retained the four audience routes.
- Moved the existing enquiry form into a dedicated contact section. In-page links account for the header height.
- Kept the homepage free of visible online/hybrid wording and retained the existing location and course links.
- Verified loaded fonts, images, navigation, search, contact destination and overflow at 320, 390, 768, 1024 and 1440 pixels. No enquiry was submitted.

## Maintenance mode

Maintenance mode is currently disabled with `maintenanceMode = false` at the top of `app.js`.
Set the value to `true` and deploy only when the public website should show the temporary
"Die Seite befindet sich im Aufbau." screen.

## Public location scope

The live site uses the public location pages for Munich, Nuremberg and Stuttgart plus the
neutral hub `standorte.html`. Legacy broad landing pages are kept only as `noindex,follow`
redirects so old links do not break while public wording stays neutral and approval-safe.

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
- Header navigation changed from wider wording to neutral `Standorte`.
- Added `standorte.html` as the neutral location hub for Munich, Nuremberg and Stuttgart.
- Removed previous wider landing pages from `sitemap.xml`; legacy pages now point to `standorte.html` with `noindex,follow`.
- Updated course FAQs, navigation links and visible location blocks for Munich, Nuremberg and Stuttgart.
- Bumped static asset query version to `20260714-1` so browsers fetch the restored `app.js`.
