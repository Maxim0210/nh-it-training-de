# Official course updates

Scope: factual course titles, durations, languages and explicit schedule/price records from public New Horizons course detail pages. No source marketing paragraphs are copied. New titles enter one useful searchable catalogue, not hundreds of thin SEO pages. Existing detail pages are matched by unique exact normalized H1 or the reviewed title-to-page aliases in scripts/course-aliases.json. Never match solely by a course code: AI-3025 is an example with conflicting local content and is intentionally not linked. Unmatched/ambiguous titles remain in the catalogue with a source link and inquiry path. The official taxonomy feeds all 19 topic filters; unknown categories stop generation for review.

## Weekly workflow

1. Confirm today's date from the task context and robots.txt from the source. Do not crawl disallowed search/location/course query routes. The published German sitemap and public detail paths are used.
2. Supply an installed Playwright module through `PLAYWRIGHT_MODULE` if not on Node's module path. Scripts use the installed Chrome executable on Windows. No paid services.
3. Run `node scripts/collect-official-courses.cjs --date=YYYY-MM-DD`. This is read-only against the source and writes private `.qa` evidence. Same-day cache is reused. Review any errors before proceeding.
4. Run `node --test scripts/course-sync.test.cjs` and `node scripts/render-official-courses.cjs`. The renderer prepares `.qa/course-release.json` from committed HEAD, never the unrelated dirty working tree. It stops on source errors, too few courses or unknown date formats. Inspect coverage and any unexpected large inventory changes.
5. Validate every changed candidate's title, canonical, visible H1, JSON-LD, internal links, asset paths, sitemap membership, exact course/source pairing, money arithmetic and future dates. The owner confirmed on 2026-10-27 that HAM prices apply to their offers and participants can book these schedules. Use HAM records internally without publicly mentioning Hamburg. Virtual and Physical And Virtual become Online-Teilnahme; physical-only records become Durchfuehrungsort auf Anfrage. Never relabel a physical source venue as Munich, Nuremberg or Stuttgart. Do not imply guaranteed seats.
6. Serve the candidate files with all unchanged files from HEAD for desktop/mobile testing. Test search, delivery filter, expiry, missing prices, keyboard focus and inquiry links. Confirm the existing course data has not been replaced.
7. Apply only the generated delta to working copies, preserving prior edits. Stage only reviewed candidate contents and required new assets/scripts/docs, never `git add .`. Commit/push through the existing GitHub Pages workflow; wait for success and check HTTPS output. Do not publish `.qa` evidence or raw snapshots.
8. Report course count, exact matches, unresolved mappings, failures and published URLs. A fetched sitemap count is not a count of distinct courses. Do not claim global completeness if sources failed or other course inventories were not checked.

## Date and price policy

- Date-only starts expire at the beginning of the listed day in Europe/Berlin; this conservatively avoids advertising courses already starting that day. The weekly renderer removes them from HTML, and the client filter handles expiry between updates.
- Amounts are shown only when both net amount and explicitly labelled VAT exist in the same schedule card. Gross is their sum. Otherwise display `Preis auf Anfrage`.
- No old guessed prices, funding guarantees or invented availability. Source date and direct course link accompany the facts.
- Retain no more than six nearest schedule rows per course in static HTML for readability; the official course link provides further published options. The delivery filter includes a separate option for courses with dates on request.
- No email, signup or reservation is performed by the update.
