# ITXOPS — Company Website

Multi-page marketing website for ITXOPS (IT × Operations). Plain HTML, CSS, and
JavaScript — no build step and no framework. Everything is served from the site
itself apart from Firebase Analytics.

Positioning: **practical IT infrastructure, deployment, automation, and technical
support services for growing businesses.**
Location: **Remote (100% Remote-First Operations — Serving Clients Worldwide).**

## Structure

```
index.html                       Home: Hero / Marquee / Overview / Why / Process / Contact preview
services.html                    Services: Deep-dive on all 6 service lines, deliverables, engagement tiers
technologies.html                Technologies: Full breakdown across OS, Web Servers, Runtimes, CI/CD, Cloud
about.html                       About: Philosophy, Remote Operations Model, 4-step process, core values
contact.html                     Contact: Location: Remote spotlight, direct inquiry form, SLA & onboarding
404.html                         Branded not-found page with multi-page navigation
firebase.json, .firebaserc       Firebase Hosting config, cleanUrls enabled
robots.txt, sitemap.xml          Crawler basics with full multi-page XML sitemap
site.webmanifest                 icons + theme colour
assets/
  css/styles.css                 all styling + subpage and remote badge components
  js/main.js                     nav, scroll state, reveals, canvas, query param pre-select, contact form
  js/vendor/gsap.min.js          GSAP 3.15.0 (self-hosted)
  js/vendor/ScrollTrigger.min.js GSAP ScrollTrigger 3.15.0 (self-hosted)
  fonts/inter-var-latin.woff2    self-hosted Inter (SIL OFL), latin subset, 47 KB
  img/
    itxops-wordmark.png          header logo (trimmed from the source artwork)
    itxops-wordmark-light.png    footer logo, reversed for the dark background
    itxops-logo.png              full lockup with the IT × OPERATIONS tagline
    itxops-social.png            1200×630 link-preview image
    icon-180.png, icon-512.png   app icons
    favicon.svg                  browser tab icon
    platforms/*.svg              original downloads for the platform marks
ChatGPT Image ... .png           original logo artwork (excluded from deploys)
```

Brand colours are sampled directly from the logo artwork and defined once at the
top of `styles.css`: navy `#1C253B`, accent blue `#1860C5`.

## Local preview

Any static server works, for example:

```bash
npx serve .
```

Opening `index.html` over `file://` mostly works, but the self-hosted font and
the SVG icon sprite behave better over HTTP.

## Page sections

1. **Hero** — "IT That Works. Operations That Scale.", animated network background
2. **Technology marquee** — Linux, Nginx, Apache, Node.js, Jenkins, MySQL,
   WordPress, cPanel, Google Workspace, Microsoft 365
3. **Services** — six services, each with a checklist of concrete tasks
4. **Why ITXOPS** — four cards: no unnecessary complexity, hands-on support,
   business-focused, flexible
5. **How We Work** — Understand → Assess → Implement → Support
6. **Technologies** — thirteen chips with real brand marks
7. **Who We Help** — SMBs, agencies, startups, website owners
8. **About** — "Technology Behind Your Business Should Just Work."
9. **FAQ** — eight questions, native <details> accordion (works with no JS)
10. **CTA band** — "Need help with your IT infrastructure?"
11. **Contact** — email plus a form with an enquiry-type dropdown
12. **Footer** — services, technologies, contact columns

## Animation

GSAP + ScrollTrigger are self-hosted in `assets/js/vendor/`. What moves:

- Hero intro: eyebrow, headline lines, text, buttons and diagram stagger in
- Hero background: a canvas network of drifting nodes and links, drawn in
  `main.js`, masked so it stays quiet behind the headline
- Diagram: travelling light pulses along the bus lines, a pulsing status ring,
  and a scanning monitoring waveform (all CSS)
- Diagram parallax: tilts slightly toward the cursor on fine-pointer devices
- Section reveals: elements fade and rise as they enter view, siblings staggered
- "Why" rail: fills as the list scrolls past (ScrollTrigger scrub)
- Service cards: a spotlight follows the cursor; cards lift on hover
- Marquee: continuous scroll, pauses on hover or keyboard focus
- Scroll progress bar, and a header that hides going down / returns going up

**Reveals do not depend on ScrollTrigger or IntersectionObserver.** They are
driven by a rect test polled on GSAP's ticker whenever the scroll offset
changes, so an element cannot be stranded at `opacity: 0` by stale cached
positions. Anything at or above the fold is revealed — including content an
anchor jump skipped over — and a failsafe reveals anything still hidden a few
seconds after load. All of it is disabled under `prefers-reduced-motion`, where
the page renders fully visible and static.

To remove the animation entirely, delete the two `vendor/` script tags from
`index.html`; the page stays fully functional and visible.

## Platform marks

The Linux, Apache, Nginx, Jenkins, Node.js, PHP, MySQL, WordPress, cPanel,
Google, Microsoft, Cloudflare and GoDaddy marks come from
[Simple Icons](https://simpleicons.org) (CC0). Originals are kept in
`assets/img/platforms/`; the page itself uses an inline `<symbol>` sprite at the
top of `index.html` so each path is defined once. The VPS and DNS marks are drawn in-house. The sprite is
rebuilt by the script kept with the project notes, not edited by hand.
These logos indicate platforms worked with — each remains the trademark of its
owner.

## Contact form

The site is static, so the form does not post to a server. On submit it
validates the fields and hands the message to the visitor's email client,
pre-addressed to **info@itxops.com** with the name, company, email, phone,
enquiry type, and message filled in. The address is also shown as a plain link.

To deliver without opening a mail client, edit the submit handler in
`assets/js/main.js` and replace the `window.location.href = href` line:

```js
fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: new FormData(form)
});
```

Any POST endpoint works the same way. Firebase Cloud Functions would require the
Blaze plan; a form service does not.

## Deploying (when you want it live)

Nothing is deployed yet — the site runs locally. The Firebase CLI is installed
and `.firebaserc` already points at project `itxops-1f1fc`. When you are ready:

```bash
firebase login:add                       # sign in as itxops.com@gmail.com
firebase login:use itxops.com@gmail.com
firebase deploy --only hosting
```

Note: the stored token for that account went stale once before and had to be
re-authorised. If a command returns `401`, run `firebase login:add` again and
allow all requested permissions. If the first deploy reports a missing hosting
site, run `firebase hosting:sites:create itxops-1f1fc` and deploy again.

`firebase.json` sets `"public": "."` and ignores the README, the original logo
artwork, and dotfiles. Images and fonts get a one-year immutable cache; HTML
always revalidates.

### After connecting the real domain

Three files hard-code `https://itxops.com/`:

- `index.html` — `<link rel="canonical">` and the `og:` meta tags
- `robots.txt` — the `Sitemap:` line
- `sitemap.xml` — the `<loc>` value

## Notes on content

There are no statistics, client names, testimonials, team members, office
locations, phone numbers, or founding dates anywhere on the site — only
services, platforms, approach, and the contact email. The service and platform
checklists describe the kind of work handled; adjust any line that does not
match what you actually offer.

## Accessibility and performance

- Semantic landmarks, a skip link, labelled form fields, visible focus rings
- Honours `prefers-reduced-motion` — animation off, content fully visible
- Responsive with no horizontal overflow, measured at
  360 / 414 / 768 / 1024 / 1280 / 1440 / 1920px
- First load is roughly 315 KB, of which GSAP + ScrollTrigger are 115 KB
- Fonts, icons, scripts, and images are local; the only external request is
  Firebase Analytics (remove the module script at the bottom of `index.html` to
  drop it and its cookies)
