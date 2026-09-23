# SMEC Group — corporate website

Static multi-page site: **HTML5, Tailwind CSS v3 (compiled), vanilla JavaScript**. Open `index.html` to view it; no server is needed.

Design: clean corporate style modelled on IBM.com (Carbon). **IBM Plex Sans** throughout, light-weight headlines, white and light-gray (`#F4F4F4`) surfaces, near-black text (`#161616`) and one primary colour, navy blue `#1E3A8A`. Images sit inside the page grid with rounded corners (12px); cards, buttons and fields use small radii. Icons are [Lucide](https://lucide.dev) (loaded from jsDelivr, rendered by `main.js` from `<i data-lucide="name">`).

Photos are free-licence Unsplash images loaded from `images.unsplash.com`. Replace them with SMEC's own photography before launch (see checklist).

## Pages
| File | Content |
|---|---|
| `index.html` | Hero with network globe, key figures, alumni marquee, four group companies, Learn → Build → Automate story, programme tabs, software services, accreditations, careers teaser |
| `about.html` | Story, figures, group structure diagram, values, journey, global presence |
| `services.html` | Six solution areas with a scroll-spy side nav, plus a filterable **Course explorer** (30 programmes) |
| `projects.html` | Featured ERP project, filterable project list, skilling-impact figures |
| `careers.html` | Hero search, why SMEC, life at SMEC, benefits, hiring process, jobs filterable by **company**/team/location/type, FAQ, talent-community form |
| `job.html?id=…` | Job detail, 4-step application form with CV upload, related roles, JobPosting structured data |
| `contact.html` | Enquiry form (topic can be preset with `?topic=admission|software|corporate|engineering|careers`), phone numbers, all campus and office addresses |

## Develop
```bash
npm install
npm run build   # rebuild the pages from src/ and compile Tailwind
npm run watch   # recompile CSS while editing
```
Edit `src/partials/` (header, footer, head) and `src/pages/`, not the generated root `*.html` files.

## Before going live: check these
Content comes from smectechnologies.co.in and smeclabs.com. smec.in could not be read, so:
1. **Marine automation and oil & gas sections** (services.html #automation / #oil-gas, home company panels) use general descriptions. Replace them with the exact services from smec.in and smecoilandgas.com.
2. **Jobs** in `assets/js/jobs.js` are SAMPLE roles. Replace them with real vacancies.
3. **Benefits** on the careers page are generic. Confirm them with HR.
4. **Projects** are based on real client work, with client names withheld. Get each client's OK before publishing.
5. **Journey milestones** on the About page: only 2001 and 2026 are dated. Confirm the order of the others.
6. **Emails**: none were published on your sites, so the site uses phone and WhatsApp only. Add official email addresses if you want them.
7. **Nagercoil**: add the full address of the centre.
8. Replace the Unsplash stock photos (search the pages for `images.unsplash.com`) with real SMEC photos of your teams, campuses and project sites.
9. Connect the forms. `fakeSubmit()` in `assets/js/main.js` needs to be swapped for a `fetch()` call to your backend. Application forms send `multipart/form-data`, including the CV and `jobId`.
