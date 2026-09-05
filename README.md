# CloudVault - Cloud-Based Meta File Storage SaaS

A full-stack, enterprise-grade cloud file storage and sharing SaaS web application inspired by Google Drive, built with **Java 17 (Spring Boot 3.2)** backend and **React (Vite) + Tailwind CSS** frontend.

---

## 🌟 Key Features & Innovative Capabilities

### 1. 🤖 AI-Powered Document Intelligence
- **"Chat with your PDF / Document"**: Ask questions directly against document context using semantic Q&A.
- **Executive AI Summarizer**: 1-click automatic document summary generation.
- **OCR Content Indexing**: Auto-indexes text content from PDFs, documents, and code files for deep full-text search.
- **Smart Auto-Tagging**: Automatically categorizes files with smart tags (`#invoice`, `#career`, `#financial`, `#code`).

### 2. 🔒 Zero-Knowledge "Secure Vault" (Client-Side E2EE)
- **WebCrypto AES-256-GCM Encryption**: Files uploaded to the Secure Vault are encrypted in the browser using PBKDF2 key derivation before being sent to the server.
- **Zero-Trust Backend**: The server and S3 storage only store ciphertext—even system administrators cannot read your vault payload.
- **Burn-After-Reading Links**: Public share links that automatically self-destruct after 1 download.
- **Optional Link Password Protection**: Passcode-protected public sharing.

### 3. 📊 Storage Analytics & Visual Insights
- **Recharts Interactive Charts**: Storage breakdown by file category (Documents, Images, Videos, Code, Other).
- **Quota Health Monitoring**: Real-time quota progress bar and total file/folder count metrics.
- **User Audit Trail**: Detailed activity logs tracking uploads, folder creations, sharing, and deletions.

### 4. 📁 Core Drive Management & UX
- **Nested Folder Hierarchy**: Support for unlimited nested folders with clickable breadcrumb navigation.
- **Grid & List Views**: Instant toggle between visual grid cards and compact list views.
- **Starred & Trash Management**: Favorite items, soft delete (Trash), restore, and permanent purge.
- **Visual Preview Annotations**: Pinned comments and coordinates overlay on file previews.

---

## 📁 Project Structure

```
d:/internship/
├── backend/                  # Java 17 / Spring Boot REST API
│   ├── src/main/java/com/cloudstorage/
│   │   ├── controller/      # REST API Controllers (Auth, Files, Folders, Sharing, AI, Analytics)
│   │   ├── service/         # Business Logic & Storage Abstractions (Local & S3)
│   │   ├── model/           # JPA Entities (User, FileMetadata, Folder, Share, LinkShare, Activity)
│   │   ├── security/        # Spring Security & JWT Token Provider
│   │   └── repository/      # Spring Data JPA Repositories
│   ├── src/main/resources/  # application.yml configuration
│   └── pom.xml              # Maven dependencies
│
└── frontend/                 # React 18 / Vite / Tailwind CSS
    ├── src/
    │   ├── components/      # Sidebar, Navbar, FileGrid, FileList, Modals, AI Chat Drawer
    │   ├── pages/           # DashboardPage, AnalyticsPage, PublicSharePage, LoginPage
    │   ├── services/        # Axios API Client & Services
    │   └── utils/           # WebCrypto Client-Side AES-256 E2EE Vault Helper
    ├── index.html
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Quick Start Guide

### 1. Launch Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080` with embedded H2/PostgreSQL database and H2 console at `http://localhost:8080/h2-console`.*

### 2. Launch React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with automated proxy to `/api` backend.*

---

## 🧪 Demo Credentials
- **Email**: `demo@cloudvault.com`
- **Password**: `password123`
