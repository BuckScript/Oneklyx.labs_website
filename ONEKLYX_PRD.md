# PRD — OneKlyx Interactive Company Website
**Version:** 1.0  
**Owner:** OneKlyx  
**Last Updated:** June 2026  
**Status:** Ready for Development

---

## 1. Executive Summary

OneKlyx is a premium technology company offering Web Development, Mobile Apps, Cloud & Infrastructure, Cybersecurity, AI & Automation, Data & Analytics, UI/UX Design, IT Consulting, and Research Solutions. This PRD defines the complete specification for a single-page, interactive, enterprise-grade marketing and ordering website.

The site must feel indistinguishable from companies like Stripe, Vercel, Linear, Palantir, or OpenAI — not a freelance marketplace. The Kintamani dog is the brand mascot symbolizing resilience, intelligence, and adaptation.

**Core URL:** `oneklyx.com`  
**Primary CTA:** Start a Project (leads to Order Form)  
**Secondary CTA:** Schedule Consultation

---

## 2. Goals & Success Metrics

| Goal | KPI | Target |
|------|-----|--------|
| Generate qualified project leads | Form submissions/month | ≥ 50 |
| Communicate premium brand | Bounce rate | < 40% |
| Enable self-service ordering | Order form completion rate | > 60% |
| Build trust | Avg. session duration | > 2 min |
| Mobile experience | Mobile conversion | parity with desktop |

---

## 3. Target Audience

1. **Startup Founders** — Need MVP web/mobile apps quickly
2. **SME Business Owners** — Need digital transformation, websites, or automation
3. **Academic / Students** — Thesis projects, system development, data analysis
4. **Enterprise IT Teams** — Cloud migration, cybersecurity, consulting
5. **Individual Freelancers** — Outsource overflow work

---

## 4. Information Architecture

```
/ (Single Page Application)
├── #hero           — Brand statement + CTAs
├── #services       — 9 service categories (filterable)
├── #order          — Interactive order/inquiry form
├── #about          — Company story + philosophy
├── #why-us         — 4 value pillars
├── #process        — 5-step engagement model
├── #portfolio      — Project showcase (filterable)
├── #testimonials   — Client social proof
├── #faq            — Collapsible FAQ
├── #contact        — Final CTA + contact details
└── /order          — Dedicated order page (optional deep link)
```

**Navigation Bar:**
- Logo (OKX mark + ONEKLYX wordmark)
- Links: Services | About | Portfolio | Process | Contact
- CTA Button: "Start a Project" (sticky, highlighted)
- Language toggle: ID / EN (optional phase 2)

---

## 5. Section Specifications

### 5.1 Navigation
- **Sticky top nav** with glassmorphism background on scroll
- Logo left-aligned
- Nav links center-aligned
- "Start a Project" button right-aligned (electric blue, glow on hover)
- Mobile: hamburger menu with full-screen overlay
- Active section highlighting via scroll spy

---

### 5.2 Hero Section

**Layout:** Full-viewport, centered

**Elements:**
- Animated background: canvas particle network (dark navy, electric blue nodes + connecting lines that react to mouse movement)
- Background: subtle radial gradient from `#0a0f1e` to `#060912`
- Wireframe Kintamani dog silhouette — SVG, animated with glowing stroke effect, faint blue outline
- OKX logomark integrated above headline

**Copy:**
- Eyebrow tag: `Technology · AI · Cloud · Security`
- H1: **"Build. Adapt. Grow."** (large, bold, white with electric blue gradient on "Adapt")
- Subheadline: *"Turning ideas into secure, scalable, and intelligent digital solutions."*
- Supporting line: *"We help startups, businesses, and institutions transform through modern technology."*

**CTAs:**
- Primary: `Start a Project →` (filled, electric blue, glowing border)
- Secondary: `Schedule Consultation` (ghost, white border)

**Social Proof Strip (below CTAs):**
- "Trusted by 100+ clients across Indonesia"
- 5-star rating badge
- Logos of tech stack icons (React, Flutter, Python, AWS, TensorFlow)

---

### 5.3 Services Section

**Layout:** Filterable grid (3 cols desktop, 2 tablet, 1 mobile)

**Filter Tabs:**
`All | Web & App | Data & AI | Cloud & DevOps | Design | Security | Academic`

**Service Cards (9 total):**

Each card includes:
- Glowing icon (SVG, animates on hover)
- Title (bold, white)
- Short description (2 lines, muted blue-gray)
- Tech tags (React, Flutter, Python, etc.)
- "Learn More" expand → reveals detailed description + pricing tier indicator
- Hover: card lifts with blue glow shadow, icon pulses

**Services:**

| # | Name | Tags | Description |
|---|------|------|-------------|
| 1 | Web Development | React, Vue, Laravel, Django | Company sites, portals, web apps, CMS |
| 2 | Mobile Application | Flutter, React Native, Swift, Kotlin | Android, iOS, cross-platform apps |
| 3 | Cloud & Infrastructure | AWS, GCP, Docker, CI/CD | Hosting, VPS, deployment, scaling |
| 4 | Cybersecurity | Pentest, VAPT, Hardening | Security assessment, vulnerability testing |
| 5 | AI & Automation | TensorFlow, LLM, n8n | Chatbots, ML models, workflow automation |
| 6 | Data & Analytics | Python, SPSS, Tableau | Dashboards, BI, data science, visualization |
| 7 | UI/UX Design | Figma, Wireframe, Prototype | Design system, mockups, user research |
| 8 | IT Consulting | Architecture, Strategy | Digital transformation, tech advisory |
| 9 | Research & Academic | Skripsi, Tesis, Paper | System dev, data analysis, IEEE papers |

---

### 5.4 Order / Inquiry Form (Core Feature)

**Purpose:** Allow clients to place project orders or inquiries directly on the website.

**Layout:** Multi-step form wizard (3 steps) with progress indicator

**Step 1 — Project Info:**
- Full Name (required)
- Email Address (required, validated)
- WhatsApp Number (required)
- Company / Institution (optional)
- Project Type: dropdown → Web App / Mobile App / AI Solution / Data Analytics / Cybersecurity / UI/UX Design / Cloud Setup / IT Consulting / Academic / Other
- Budget Range: radio → < Rp 500K | Rp 500K–2JT | Rp 2JT–5JT | Rp 5JT–20JT | > Rp 20JT | Discuss

**Step 2 — Project Details:**
- Project Title / Name
- Project Description (textarea, min 50 chars)
- Deadline / Target Date (date picker)
- Reference Links (optional, up to 3 URLs)
- File Upload: attach document/wireframe (optional, max 10MB, PDF/PNG/JPG)
- Tech Stack Preference (multi-select chips): React, Flutter, Python, PHP, Node.js, Java, No Preference

**Step 3 — Confirmation:**
- Summary of all inputs
- Terms & Conditions checkbox
- Submit button → animated progress → success state
- Success: animated checkmark + "We'll contact you within 24 hours" + WhatsApp CTA

**Validation:**
- Real-time inline validation
- Email format check
- Phone number format (Indonesian: +62)
- Minimum description length enforcement

**Backend (Phase 2):**
- Send confirmation email to client
- Notify team via WhatsApp Business API or email
- Store in Google Sheets or Notion database via webhook

---

### 5.5 About Section

**Layout:** 2-column (text left, visual right) with animated timeline below

**Content:**
- Brief company story paragraph
- Philosophy callout: *"The ones who survive are not the strongest, but the most adaptable."*
- Kintamani dog mascot illustration (wireframe/geometric style)
- Animated stats counters: `100+ Projects | 50+ Clients | 5+ Industries | 3+ Years`

**Timeline (animated, horizontal scroll on mobile):**
- 2021: OneKlyx Founded
- 2022: First Enterprise Project
- 2023: AI & Cloud Services Launched
- 2024: Academic Solutions Division
- 2025: Cybersecurity Practice Added
- 2026: Regional Expansion

---

### 5.6 Why Choose Us

**Layout:** 2×2 card grid

**Cards:**
1. **Adaptive** — Technology that evolves with your business needs
2. **Secure** — Built with cybersecurity best practices from day one
3. **Scalable** — Architecture ready for growth from MVP to enterprise
4. **Innovative** — Leveraging cutting-edge AI and modern tech stacks

Each card: large icon, bold title, description, glowing border on hover

---

### 5.7 Process Section

**Layout:** Horizontal futuristic roadmap (scrollable on mobile)

**Steps:**
```
DISCOVER → PLAN → BUILD → DEPLOY → GROW
```

- Each step: numbered node, title, 2-line description
- Connecting animated glowing lines between nodes
- On scroll: steps animate in sequentially

| Step | Title | Description |
|------|-------|-------------|
| 01 | Discover | Deep-dive into your goals, requirements, and constraints |
| 02 | Plan | Architecture, timeline, tech stack, and sprint planning |
| 03 | Build | Agile development with weekly demos and updates |
| 04 | Deploy | Production release, testing, monitoring, and handover |
| 05 | Grow | Ongoing support, scaling, and continuous improvement |

---

### 5.8 Portfolio Section

**Layout:** Masonry/grid with filter tabs

**Filter Categories:** All | Website | Mobile App | AI | Cloud | Security | Academic

**Project Card:**
- Thumbnail (hover → short video/gif preview)
- Category badge
- Project title
- Tech tags
- "View Case Study" CTA
- Click → modal with full project details

**Placeholder Projects (to be replaced with real data):**
- E-commerce platform (Web + Backend)
- University Information System (Academic)
- AI Chatbot for SME (AI)
- Penetration Testing Report Dashboard (Security)
- Flutter Banking App (Mobile)
- Data Analytics Dashboard (Data)

---

### 5.9 Testimonials

**Layout:** Auto-scrolling carousel (pause on hover)

**Card:** Avatar, name, company, star rating, quote text

---

### 5.10 FAQ Section

**Layout:** 2-column accordion

**Questions:**
1. Berapa lama waktu pengerjaan proyek?
2. Bagaimana sistem pembayaran OneKlyx?
3. Apakah ada garansi setelah proyek selesai?
4. Teknologi apa saja yang bisa digunakan?
5. Apakah bisa menerima proyek skripsi/tugas akhir?
6. Bagaimana cara memulai proyek dengan OneKlyx?
7. Apakah ada layanan maintenance setelah delivery?
8. Berapa minimum budget untuk memulai proyek?

---

### 5.11 Contact / Footer CTA

**Layout:** Full-width CTA panel + footer

**CTA Panel:**
- Headline: "Let's Build Something Extraordinary"
- Subtext: "Ready to transform your ideas into reality? Let's talk."
- Buttons: Start a Project | WhatsApp Us | Email Us

**Footer:**
- Logo + tagline
- Links: Services | About | Portfolio | Blog | Privacy Policy
- Social: Instagram | LinkedIn | GitHub | WhatsApp
- Copyright: © 2026 OneKlyx. All rights reserved.

---

## 6. Design System

### 6.1 Color Palette

```
--color-bg-primary:     #060912   (Deep Space Black)
--color-bg-secondary:   #0a0f1e   (Dark Navy)
--color-bg-card:        rgba(10, 20, 50, 0.6)  (Glassmorphism card)
--color-accent-blue:    #0066ff   (Electric Blue)
--color-accent-cyan:    #00d4ff   (Neon Cyan)
--color-accent-glow:    rgba(0, 102, 255, 0.3) (Glow effect)
--color-text-primary:   #ffffff   (White)
--color-text-secondary: #8899bb   (Muted Blue-Gray)
--color-text-muted:     #445577   (Faded)
--color-border:         rgba(0, 102, 255, 0.2) (Subtle border)
--color-border-active:  rgba(0, 102, 255, 0.8) (Active border)
```

### 6.2 Typography

```
Display Font:    "Orbitron" or "Space Grotesk Bold" → Headlines
Body Font:       "DM Sans" or "Outfit" → Body text
Mono Font:       "JetBrains Mono" → Code, tags, tech labels

H1:  72px / 80px line-height / 800 weight
H2:  48px / 56px line-height / 700 weight  
H3:  32px / 40px line-height / 600 weight
Body: 16px / 28px line-height / 400 weight
Small: 14px / 22px line-height / 400 weight
```

### 6.3 Component Specs

**Glassmorphism Card:**
```css
background: rgba(10, 20, 50, 0.6);
backdrop-filter: blur(20px);
border: 1px solid rgba(0, 102, 255, 0.2);
border-radius: 16px;
box-shadow: 0 0 30px rgba(0, 102, 255, 0.05);
```

**Glow Button (Primary):**
```css
background: linear-gradient(135deg, #0066ff, #0044cc);
box-shadow: 0 0 20px rgba(0, 102, 255, 0.5);
border-radius: 8px;
transition: box-shadow 0.3s, transform 0.2s;
```

**Hover State (Cards):**
```css
transform: translateY(-4px);
box-shadow: 0 0 40px rgba(0, 102, 255, 0.2);
border-color: rgba(0, 102, 255, 0.6);
```

### 6.4 Animation Specifications

| Animation | Type | Duration | Trigger |
|-----------|------|----------|---------|
| Particle network | Canvas, continuous | ∞ | Page load |
| Section fade-in | CSS transform + opacity | 600ms | Scroll into view |
| Card hover glow | CSS transition | 300ms | Mouse enter |
| Counter increment | JS requestAnimationFrame | 2000ms | Scroll into view |
| Process line draw | SVG stroke-dashoffset | 1500ms | Scroll into view |
| Form step transition | CSS slide + fade | 400ms | Button click |
| Success checkmark | SVG path animation | 800ms | Form submit |
| Kintamani wireframe | SVG stroke pulse | 3000ms loop | Continuous |

---

## 7. Technical Specifications

### 7.1 Tech Stack

**Frontend (Phase 1 — Static/SPA):**
- HTML5 + CSS3 + Vanilla JS (for initial delivery)
- OR: Next.js 14 (App Router) for production
- Tailwind CSS for utility styling
- Framer Motion for animations
- Canvas API for particle system
- GSAP for scroll-triggered animations (optional)

**Form Handling:**
- Phase 1: Formspree or Netlify Forms (no backend needed)
- Phase 2: Custom API endpoint → Google Sheets webhook + WhatsApp notification

**Hosting:**
- Vercel (recommended) or Netlify
- Custom domain: oneklyx.com

### 7.2 Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | > 90 |
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| Mobile PageSpeed | > 85 |

### 7.3 SEO Requirements

- Semantic HTML5 structure
- Open Graph meta tags
- Twitter Card meta tags
- Structured data (Organization, Service schema)
- Sitemap.xml
- robots.txt
- Alt text on all images
- Meta description per section (if multi-page)

### 7.4 Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigable
- ARIA labels on interactive elements
- Focus visible states
- Color contrast ratio > 4.5:1

### 7.5 Responsive Breakpoints

```
Mobile:  320px – 767px
Tablet:  768px – 1199px
Desktop: 1200px – 1920px
Wide:    > 1920px (max-width container: 1400px)
```

---

## 8. Order Flow (Detailed)

```
User clicks "Start a Project"
        ↓
Smooth scroll to #order section (or modal opens)
        ↓
Step 1: Contact + Project Type + Budget
        ↓  (Next button, with validation)
Step 2: Project Details + Description + Timeline
        ↓  (Next button, with validation)
Step 3: Review Summary + T&C + Submit
        ↓
Loading state (animated spinner with "Sending..." text)
        ↓
Success state:
  - Animated checkmark
  - "Order Received! We'll contact you within 24 hours."
  - WhatsApp CTA: "Chat on WhatsApp for faster response"
  - Reference number generated (optional)
        ↓
Team receives:
  - Email notification with all details
  - WhatsApp notification (Phase 2)
  - Data stored in Google Sheets / CRM (Phase 2)
```

---

## 9. Content Requirements

### 9.1 Copy (Bahasa Indonesia + English)
- All copy should be bilingual-ready (structured for i18n in Phase 2)
- Initial launch: Bahasa Indonesia primary, English secondary

### 9.2 Assets Needed
- [ ] High-res OKX logomark (SVG)
- [ ] Kintamani dog wireframe illustration (SVG)
- [ ] Service icons (SVG set, 9 icons)
- [ ] Portfolio screenshots (6 placeholder + real projects)
- [ ] Team photos (optional Phase 2)
- [ ] Client logos (Phase 2)

---

## 10. Phased Delivery Plan

### Phase 1 — MVP (Week 1–2)
- [ ] Complete single-page HTML/CSS/JS website
- [ ] All sections implemented and animated
- [ ] Order form functional (Formspree backend)
- [ ] Mobile responsive
- [ ] Deployed to Vercel

### Phase 2 — Enhanced (Week 3–4)
- [ ] Next.js migration
- [ ] WhatsApp notification integration
- [ ] Google Sheets order database
- [ ] Blog/articles section
- [ ] Client dashboard (order tracking)
- [ ] Multi-language (ID/EN)

### Phase 3 — Scale (Month 2+)
- [ ] Payment gateway integration (DP payment)
- [ ] Client portal login
- [ ] Admin dashboard (manage orders)
- [ ] Analytics integration
- [ ] SEO optimization

---

## 11. Acceptance Criteria

- [ ] All 9 services are displayed with correct information
- [ ] Order form submits successfully and sends notification
- [ ] All animations run at 60fps on modern browsers
- [ ] Page loads in < 3 seconds on 4G mobile
- [ ] No layout breaks at 320px, 768px, 1200px, 1920px
- [ ] Passes WCAG 2.1 AA basic checks
- [ ] Form validation prevents incomplete submissions
- [ ] All links and CTAs are functional
- [ ] Brand colors and typography match spec exactly

---

*End of PRD v1.0 — OneKlyx Website*
