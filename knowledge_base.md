### 📘 `knowledge_base.md` — Project Knowledge Base

---

#### 1. **Project Overview**

* **Project Name:** Photo Garden Guardian Clerk
* **Purpose:**
  To streamline the process of uploading, previewing, and sharing fabric photos, particularly for textile businesses or cataloging needs, with special attention to WhatsApp integration and role-based access.
* **Description:**
  This application streamlines the process of uploading, previewing, and sharing fabric photos. It features advanced photo management capabilities including drag-and-drop sorting, bulk editing, and efficient sharing via WhatsApp. The application supports role-based access, a mobile-optimized UI, and integrates with Supabase for robust authentication, storage, and database management.
* **Tech Stack:**
  - React (with TypeScript)
  - Supabase (Auth, Storage, DB)
  - Modern CSS/SCSS
  - WhatsApp Web API (sharing)
  - Tailwind CSS for styling
  - Dnd-kit (for drag-and-drop functionality)
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
* [x] Drag and Drop Photo Sorting
* [x] "Select All" Functionality for Photos
* [x] View Mode Toggling

- **Photo Upload:** Users can upload one or more fabric images at a time, with drag-and-drop and file picker support. Bulk upload flows are optimized for textile catalogs.
- **Image Preview & Details:** Uploaded images can be previewed with metadata such as title, description, and fabric type. The photo modal now features a carousel, allowing users to navigate between photos without closing the modal.
- **WhatsApp Sharing:** Share images directly to WhatsApp, with or without captions. Multiple images can be sent in a single action, with optional compression for mobile compatibility.
- **Role-Based Access:** Admins have access to management views and controls. Regular users have restricted access, ensuring security and workflow separation.
- **Selection Mode (Mobile):** Long-press enables selection mode on mobile devices, allowing batch operations like sharing or deletion. This is complemented by the new "Select All" functionality for efficient bulk operations.
- **Mobile-Optimized UI:** The app adapts layouts and scroll behaviors for smooth mobile use, including touch gestures and responsive design. This includes significant improvements to `PhotoModal`, `FloatingShareButton`, `BulkMetadataForm`, `BulkMetadataStep`, `BulkUploadHeader`, `FabricSelector` (dropdown overflow), and the Delete Card within `BulkActionToolbar`. The AdminPageHeader has also been enhanced for better mobile responsiveness.
- **Supabase Integration:** Handles authentication, file storage, and database operations securely and efficiently.
- **Drag and Drop Photo Sorting:** Users can reorder photos using intuitive drag-and-drop gestures, with support for mobile touch interaction, 2D grid sorting, and multi-photo group dragging. This feature includes enhanced visual feedback and robust database/state management.
- **View Mode Toggling:** A new `IconSwitch` component allows users to easily toggle between different display modes for photos.
- **Admin Photo Card Refactor:** The `AdminPhotoCard` and `SortableAdminPhotoCard` components have been unified, enabling a dedicated "sort mode" with conditional drag functionality for a streamlined reordering experience.
- **Shared Gallery Redesign:** The public-facing shared gallery page header has been redesigned for improved readability and responsiveness, and photo card display logic has been extracted into a reusable `SharedGalleryPhotoCard` component.

---

#### 4. **Development Timeline / Milestone Tracker**

| Date       | Feature/Update                       | Notes or Context                            |
| ---------- | ------------------------------------ | ------------------------------------------- |
| 2025-08-14 | Phase 2 Performance (current)        | Implemented fetchpriority optimization, initial load limiting, and verified CSS purging. |
| 2025-08-13 | Image Optimization (63e8dc5)         | Enhanced image optimization with height and resize options. |
| 2025-08-12 | Gallery Layout Fix (b1f30d4)         | Adjusted gallery layout for consistent image display. |
| 2025-08-12 | Performance Optimizations (a4d8820)  | Implemented image delivery, data fetching, and code-splitting optimizations. |
| 2025-08-12 | UI Enhancement (e7a79d5)             | Added a gallery button for the desktop view. |
| 2025-08-01 | UI and Performance (b601e8b, 98c24bd, 6882fce, 494b3b0, 3a8a736) | Optimized search, adjusted photo card displays, and improved drag-and-drop. |
| 2025-07-28 | Photo Modal Carousel (250a35f)       | Implemented a carousel in the photo modal for easier navigation. |
| 2025-07-27 | Drag Handle and Grid Refactor (d5f38eb, 40c9167) | Added a drag handle to the compact view and unified the photo grid. |
| 2025-07-27 | Context and View Mode (fa51fce, ec8cd83) | Added ViewModeContext and fixed a missing PhotoSelectionProvider. |
| 2025-07-08 | Select All Functionality | Added "Select All" checkbox to the photo gallery when selection mode is active, allowing quick selection/deselection of all visible photos. |
| 2025-07-08 | IconSwitch Component | Implemented `IconSwitch` component for view mode toggling. |
| 2025-07-07 | Drag and Drop Sorting | Implemented mobile touch interaction, 2D grid sorting, multi-photo group dragging, enhanced visual feedback, database/state management, and mobile UX enhancements for the drag-and-drop photo sorting feature. |
| 2025-07-07 | Admin Page Header Enhancements | Improved mobile responsiveness of AdminPageHeader and changed button text from "Back to Gallery" to "Gallery". |
| 2025-07-07 | Unify Admin Photo Card & Sort Mode | Merged `AdminPhotoCard` and `SortableAdminPhotoCard` into a single `SortableAdminPhotoCard` component, enabling conditional drag functionality and a dedicated "Sort" mode. |
| 2025-07-06 | Code Refinements | Reordered hooks in `BulkUploadModal` for better code organization. |
| 2025-07-06 | Shared Gallery Redesign | Redesigned the public-facing shared gallery page header and extracted photo card display logic into a reusable `SharedGalleryPhotoCard` component. |
| 2025-07-05 | Bulk Upload UX | Added a remove button to the bulk upload preview, allowing users to delete individual photos from the selection. |
| 2025-07-04 | Supabase Environment Variables | Moved Supabase credentials to environment variables for improved security and configuration flexibility. |
| 2025-07-02 | Enhanced Photo Editing & Fabrics | Integrated `BulkEditModal`, added full CRUD for fabric types, and improved UX with auto-saving. |
| 2025-07-01 | Mobile UI & Responsiveness | Major improvements to mobile responsiveness across multiple components, including the share modal and admin page. |
| 2025-06-30 | Admin & Selection UX | Improved admin page with auto-refresh and enhanced selection mode to auto-exit when empty. |
| 2025-06-27 | Mobile Responsiveness Completed | All components and pages optimized for mobile, including `PhotoModal`, `FloatingShareButton`, `BulkMetadataForm`, `BulkMetadataStep`, `BulkUploadHeader`, `FabricSelector`, and `BulkActionToolbar` Delete Card. |
| 2025-06-22 | Knowledge Base Started | First iteration of documentation |
| 2025-06-18 | Fabric Selector UI Fixes | Desktop vs. mobile styling issues addressed |
| 2025-06-15 | Multiple Image Sharing + Compression | WhatsApp-style compression logic integrated |
| 2025-06-10 | WhatsApp Sharing (URLs) | Initial basic sharing implemented |
| 2025-06-05 | Photo Upload & Preview Added | Both desktop and mobile support |
| 2025-06-01 | Project Initialized | Folder setup, Supabase configured |

> 🕓 *Update this table regularly as new features or fixes are added.*


---

#### 5. **Recent Updates**

*   **Phase 2 Performance Optimizations**:
    *   Added `fetchpriority="high"` to first image in viewport for LCP optimization.
    *   Implemented initial load limiting (24 photos) with progressive loading capability.
    *   Enhanced image loading strategy with priority-based lazy loading.
    *   Verified Tailwind CSS purging is active in production builds.
*   **Image Optimization**:
    *   Enhanced image optimization by adding height and resize options to `getOptimizedImageUrl`.
    *   Updated image sources in `CompactPhotoCard`, `PhotoCard`, and `SharedGalleryPhotoCard` to use the new optimization.
*   **Layout and UI Fixes**:
    *   Adjusted the gallery layout to ensure consistent image display and prevent cropping.
    *   Added a dedicated gallery button for the desktop view.
*   **Performance Optimizations**:
    *   Implemented Phase 1 of performance optimizations, focusing on image delivery, data fetching, and code-splitting.
    *   Introduced an image optimization helper, native lazy-loading, and route-level code splitting.
*   **UI and UX Refinements**:
    *   Optimized the `SearchBar` with a debouncing mechanism.
    *   Adjusted the information displayed on photo cards to be more context-aware.
    *   Set the compact view as the default.
    *   Improved drag-and-drop performance in the compact view on mobile devices.
*   **Photo Modal Carousel**:
    *   The `PhotoModal` now features a carousel, allowing users to navigate between photos without closing the modal.
*   **Drag and Drop Enhancements**:
    *   A dedicated drag handle has been added to the compact view of the `SortableAdminPhotoCard`.
    *   The photo grid has been refactored to unify the sorting and selection modes, simplifying the component's logic.
*   **Context and View Mode**:
    *   Added a `ViewModeContext` to manage view states across the application.
    *   Fixed a runtime error caused by a missing `PhotoSelectionProvider` wrapper.
*   **View Mode Toggling**: Implemented an `IconSwitch` component for easily toggling between different view modes.
*   **Select All Functionality**: Added a "Select All" checkbox to the photo gallery, allowing users to quickly select or deselect all visible photos when in selection mode.
*   **Drag and Drop Sorting**: Implemented drag and drop sorting with mobile touch interaction, 2D grid sorting, multi-photo group dragging, enhanced visual feedback, and improved database/state management.
*   **Admin Photo Card Refactor**: Unified `AdminPhotoCard` and `SortableAdminPhotoCard` into a single component, enabling a dedicated "sort mode" with conditional drag functionality.
*   **Admin Page Header Enhancements**: Improved mobile responsiveness of the AdminPageHeader and simplified button text.
*   **Shared Gallery Redesign**: Redesigned the public-facing shared gallery page header and extracted photo card display logic into a reusable `SharedGalleryPhotoCard` component.
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
