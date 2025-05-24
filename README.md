# 🧹 detectDeadElements

A Node.js microservice that analyzes a webpage and detects **dead (invisible or hidden) DOM elements**, helping frontend developers audit, optimize, and clean up unused or inaccessible HTML.

---

## 🚀 Features

- Detects non-visible DOM elements on any public URL using Puppeteer  
- Identifies elements hidden via:
  - `display: none`
  - `visibility: hidden`
  - `opacity: 0`
  - Off-screen positioning (outside the viewport)
  - `aria-hidden="true"`
- Returns element selector, tag name, and the reason it’s considered “dead”  
- Exposes both:
  - **GET** `/functions/detectDeadElements` → JSON-schema docs  
  - **POST** `/functions/detectDeadElements` → detection results  
- Includes automated tests (Jest + Supertest)  
- Ready for deployment on cloud functions (Func.live, Vercel, Render, GCP, AWS Lambda…)

---

