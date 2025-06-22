### 📘 `knowledge_base.md` — Project Knowledge Base

---

#### 1. **Project Overview**

* **Project Name:** Photo Garden Guardian Clerk
* **Purpose:**
  To streamline the process of uploading, previewing, and sharing fabric photos, particularly for textile businesses or cataloging needs, with special attention to WhatsApp integration and role-based access.
* **Description:**
  This application enables users to upload single or multiple photos, preview images with details, and share them via WhatsApp. It supports role-based access, mobile-optimized UI, and integrates with Supabase for authentication, storage, and database management.
* **Tech Stack:**
  - React (with TypeScript)
  - Supabase (Auth, Storage, DB)
  - Modern CSS/SCSS
  - WhatsApp Web API (sharing)
  - Tailwind CSS for styling
  - Supabase for database managements
* **Target Platform (Web/Mobile/Desktop):** Web (Mobile-optimized)
* **Primary Users:**
  - Textile business staff
  - Admins (managing uploads and access)
  - End-users needing quick sharing and cataloging

---

#### 2. **Essential Files**

| File/Folder           | Purpose/Description                                  |
| --------------------- | ---------------------------------------------------- |
| `index.html`          | Entry point for the frontend                         |
| `src/main.tsx`        | Main React entry point, bootstraps the app           |
| `src/App.tsx`         | Root React component, app layout and routing         |
| `src/components/`     | Reusable UI components (BulkUpload, Preview, etc.)   |
| `src/pages/`          | Page-level components for different routes           |
| `src/contexts/`       | React context providers for global state             |
| `src/hooks/`          | Custom React hooks for logic reuse                   |
| `src/utils/`          | Utility/helper functions                            |
| `src/integrations/`   | External service integrations (e.g., Supabase)       |
| `src/types/`          | TypeScript types and interfaces                      |
| `public/`             | Static assets (favicon, placeholder images, etc.)    |
| `supabase/config.toml`| Supabase project configuration                       |
| `package.json`        | Project dependencies and scripts                     |
| `vite.config.ts`      | Vite build tool configuration                        |
| `tailwind.config.ts`  | Tailwind CSS configuration                          |
| `tsconfig.json`       | TypeScript compiler configuration                    |

> ✏️ *Update this table as files/folders change or new ones are added.*

---

#### 3. **App Features & Functionality**

* [x] Photo Upload (Single & Multiple)
* [x] Image Preview & Details (Title, Description, Fabric Type)
* [x] WhatsApp Image Sharing (With and Without Caption)
* [x] Role-Based Access (e.g., Admin-only views)
* [x] Selection Mode with Long-Press (Mobile Specific)
* [x] Scroll & UI Behavior Optimized for Mobile
* [x] Supabase Integration (Auth, Storage, DB)

- **Photo Upload:** Users can upload one or more fabric images at a time, with drag-and-drop and file picker support. Bulk upload flows are optimized for textile catalogs.
- **Image Preview & Details:** Uploaded images can be previewed with metadata such as title, description, and fabric type. Users can edit details before finalizing uploads.
- **WhatsApp Sharing:** Share images directly to WhatsApp, with or without captions. Multiple images can be sent in a single action, with optional compression for mobile compatibility.
- **Role-Based Access:** Admins have access to management views and controls. Regular users have restricted access, ensuring security and workflow separation.
- **Selection Mode (Mobile):** Long-press enables selection mode on mobile devices, allowing batch operations like sharing or deletion.
- **Mobile-Optimized UI:** The app adapts layouts and scroll behaviors for smooth mobile use, including touch gestures and responsive design.
- **Supabase Integration:** Handles authentication, file storage, and database operations securely and efficiently.

---

#### 4. **Development Timeline / Milestone Tracker**

| Date       | Feature/Update                       | Notes or Context                            |
| ---------- | ------------------------------------ | ------------------------------------------- |
| 2025-06-01 | Project Initialized                  | Folder setup, Supabase configured           |
| 2025-06-05 | Photo Upload & Preview Added         | Both desktop and mobile support             |
| 2025-06-10 | WhatsApp Sharing (URLs)              | Initial basic sharing implemented           |
| 2025-06-15 | Multiple Image Sharing + Compression | WhatsApp-style compression logic integrated |
| 2025-06-18 | Fabric Selector UI Fixes             | Desktop vs. mobile styling issues addressed |
| 2025-06-22 | Knowledge Base Started               | First iteration of documentation            |

> 🕓 *Update this table regularly as new features or fixes are added.*

---
