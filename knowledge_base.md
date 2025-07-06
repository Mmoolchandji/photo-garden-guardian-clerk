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
- **Mobile-Optimized UI:** The app adapts layouts and scroll behaviors for smooth mobile use, including touch gestures and responsive design. This includes significant improvements to `PhotoModal`, `FloatingShareButton`, `BulkMetadataForm`, `BulkMetadataStep`, `BulkUploadHeader`, `FabricSelector` (dropdown overflow), and the Delete Card within `BulkActionToolbar`.
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
| 2025-06-27 | Mobile Responsiveness Completed      | All components and pages optimized for mobile, including `PhotoModal`, `FloatingShareButton`, `BulkMetadataForm`, `BulkMetadataStep`, `BulkUploadHeader`, `FabricSelector`, and `BulkActionToolbar` Delete Card. |
| 2025-06-22 | Knowledge Base Started               | First iteration of documentation            |
| 2025-06-30 | Admin & Selection UX | Improved admin page with auto-refresh and enhanced selection mode to auto-exit when empty. |
| 2025-07-01 | Mobile UI & Responsiveness | Major improvements to mobile responsiveness across multiple components, including the share modal and admin page. |
| 2025-07-02 | Enhanced Photo Editing & Fabrics | Integrated `BulkEditModal`, added full CRUD for fabric types, and improved UX with auto-saving. |
| 2025-07-04 | Supabase Environment Variables | Moved Supabase credentials to environment variables for improved security and configuration flexibility. |
| 2025-07-05 | Bulk Upload UX | Added a remove button to the bulk upload preview, allowing users to delete individual photos from the selection. |
| 2025-07-06 | Code Refinements | Reordered hooks in `BulkUploadModal` for better code organization. |

> 🕓 *Update this table regularly as new features or fixes are added.*


---

#### 5. **Recent Updates**

*   **Bulk Photo Editing**: A new `BulkEditModal` has been integrated to streamline the editing of multiple photos at once. The modal features auto-saving on navigation for a smoother user experience.
*   **Fabric Type Management**: Full CRUD (Create, Read, Update, Delete) functionality has been implemented for fabric types, managed through a new `useFabricTypes` custom hook.
*   **Enhanced Mobile Responsiveness**: Significant improvements have been made to the mobile UI, including a full-width floating share button, a more compact bulk upload form, and responsive layouts for modals and various components.
*   **Improved User Experience**:
    *   The share modal has been simplified by removing tabs and highlighting the recommended sharing method.
    *   The admin page now automatically refreshes after photo operations.
    *   Selection mode now automatically exits when the last photo is deselected.
*   **Code Refinements**:
    *   The `PhotoCard` component has been extracted for reusability.
    *   The gallery header and search controls have been unified into a single `SearchAndFilters` component.
    *   The `PhotoModal` and `BulkActionToolbar` have been refactored for cleaner code and better functionality.
*   **Bulk Upload Improvements**:
    *   A remove button has been added to the bulk upload preview, allowing users to delete individual photos before uploading.
    *   The success screen is now skipped on successful bulk uploads to streamline the user workflow.
*   **Configuration**:
    *   Supabase keys have been moved to environment variables to improve security.

---
