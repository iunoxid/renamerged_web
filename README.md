# Renamerged

Aplikasi web untuk memproses dan mengelompokkan file PDF faktur pajak berdasarkan IDTKU dan nama partner. Aplikasi ini mengekstrak, mengelompokkan, dan menggabungkan PDF yang memiliki partner yang sama dalam satu folder berdasarkan IDTKU.

## 🚀 Fitur

### 🔄 Dual Processing Modes
- **Rename Only**: Mengganti nama file PDF sesuai format custom yang dapat dikonfigurasi
- **Rename + Merge**: Mengganti nama + menggabungkan PDF dengan partner yang sama

### 📝 Custom Filename Format
- **Drag & Drop Components**: Atur urutan komponen nama file dengan drag and drop
- **Component Selection**: Pilih komponen yang ingin disertakan (Partner, Tanggal, Referensi, Invoice)
- **Custom Separators**: Pilih pemisah antar komponen (dash, underscore, pipe, dll)
- **Character Replacement**: Ganti karakter "/" dengan karakter lain
- **Live Preview**: Lihat preview nama file secara real-time

### 🎨 User Interface
- **Upload & Extract**: Upload file ZIP berisi PDF dengan drag & drop interface
- **File Detection**: Otomatis mendeteksi dan menampilkan jumlah PDF dalam ZIP
- **Real-time Progress**: Monitor progress dan log pemrosesan secara real-time via WebSocket
- **Result Summary**: Tampilan hasil akhir dengan jumlah file berhasil/gagal diproses
- **External Link Safety**: Link eksternal otomatis membuka tab baru untuk menjaga progress
- **Dark/Light Theme**: Toggle antara mode gelap dan terang dengan UI yang nyaman
- **Responsive Design**: Layout yang responsif untuk desktop dan mobile
- **Modular CSS**: Arsitektur CSS yang termodularisasi untuk maintainability

### ⚙️ Processing Features
- **PDF Analysis**: Ekstrak metadata (IDTKU, partner, tanggal, referensi, nomor invoice)
- **File Detection**: Otomatis menghitung dan menampilkan jumlah PDF yang terdeteksi
- **Intelligent Grouping**: Kelompokkan PDF berdasarkan IDTKU dan nama partner
- **Success/Error Tracking**: Laporan detail file yang berhasil dan gagal diproses
- **Auto Cleanup**: Pembersihan file otomatis untuk mengoptimalkan storage
- **Progress Tracking**: Real-time progress dengan estimasi waktu selesai

## 📁 Struktur Proyek

```
renamerged_web/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── app.js             # Main application
│   │   ├── config/            # Konfigurasi
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility functions
│   ├── uploads/              # File storage
│   ├── package.json          # Backend dependencies
│   └── server.js            # Entry point
├── frontend/                  # Frontend client
│   ├── public/               # Static files
│   │   ├── css/             # Modular CSS files
│   │   │   ├── main.css     # Main CSS entry point
│   │   │   ├── base.css     # Base layout & containers
│   │   │   ├── theme.css    # Dark/light theme & footer
│   │   │   ├── components.css # UI components (buttons, progress, log)
│   │   │   ├── forms.css    # Form elements (radio, checkbox, select)
│   │   │   └── drag-drop.css # Drag & drop functionality
│   │   ├── index.html       # Main HTML file
│   │   └── src/             # Frontend modules
│   │       ├── components/  # UI components
│   │       │   ├── file.upload.js      # File upload handling
│   │       │   ├── progress.tracker.js # Progress tracking
│   │       │   ├── settings.manager.js # Settings & filename format
│   │       │   ├── socket.manager.js   # WebSocket communication
│   │       │   └── theme.manager.js    # Dark/light theme toggle
│   │       ├── config/      # Frontend config
│   │       │   └── app.config.js       # App configuration
│   │       ├── utils/       # Frontend utilities
│   │       │   └── dom.utils.js        # DOM manipulation utilities
│   │       └── app.js       # Main application entry
│   └── package.json         # Frontend dependencies
├── package.json             # Root package.json
└── README.md               # Dokumentasi
```

## 🛠 Instalasi

### Prerequisites
- Node.js (versi 14 atau lebih baru)
- npm atau yarn
- Docker & Docker Compose (untuk containerized deployment)

### 🚀 Quick Start (Recommended)

1. Clone repository:
```bash
git clone https://github.com/iunoxid/renamerged_web
cd renamerged_web
```

2. Install semua dependencies:
```bash
npm run install:all
```

3. Setup environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Jalankan dengan script helper:
```bash
# Development mode - Jalankan backend dan frontend terpisah
./scripts/dev.sh

# Atau gunakan npm scripts
npm run dev              # Concurrent mode
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

### 🔧 Manual Development Setup

#### Backend (Terminal 1)
```bash
cd backend
npm install
cp .env.example .env
npm run dev              # Port 5001
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev              # Port 3000
```

### 🐳 Docker Development

```bash
# Development dengan Docker
docker-compose -f docker-compose.dev.yml up

# Production dengan Docker
docker-compose up -d
```

## 🔧 Konfigurasi

### 📝 Environment Variables

Aplikasi menggunakan file `.env` untuk konfigurasi. Copy dari `.env.example`:

```bash
# Setup environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### Root Configuration (`.env`)
```bash
# Backend Configuration
BACKEND_PORT=5002
BACKEND_API_URL=http://localhost:5002

# Frontend Configuration
FRONTEND_PORT=3000
API_HOST=localhost
API_PORT=5002
API_URL=http://localhost:5002

# Production (uncomment for production)
# PROD_API_URL=https://api.yourdomain.com
NODE_ENV=development
```

#### Backend Configuration (`backend/.env`)
```bash
# Server Configuration
PORT=5002
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Upload Configuration
MAX_FILE_SIZE=200
UPLOAD_PATH=uploads/upload
DOWNLOAD_PATH=uploads/download

# Cleanup Configuration
CLEANUP_INTERVAL_MINUTES=10
MAX_AGE_HOURS=1
DELETION_DELAY_MINUTES=1
```

#### Frontend Configuration (`frontend/.env`)
```bash
# Backend API Configuration
API_HOST=localhost
API_PORT=5002
API_URL=http://localhost:5002

# Frontend Dev Server
FRONTEND_PORT=3000
```

### 🔄 Automatic Environment Updates

Frontend secara otomatis update konfigurasi dari file `.env`:

```bash
# Update meta tags dari .env
npm run env:update

# Otomatis dijalankan saat start
npm run dev  # auto-run env:update
```

## 📖 API Documentation

### Endpoints

#### Upload File
```
POST /upload
Content-Type: multipart/form-data

Body:
- file: ZIP file containing PDFs
- settings: JSON object with processing settings
  {
    "mode": "rename" | "merge",  // Processing mode
    "filenameFormat": {          // Only for rename mode
      "components": ["partner", "date", "reference", "invoice"],
      "separator": " - ",
      "slashReplacement": "_"
    }
  }

Response:
{
  "success": true,
  "message": "File processed successfully",
  "download_url": "/download/{uuid}/file.zip",
  "uuid": "generated-uuid"
}
```

#### Download Result
```
GET /download/{uuid}/file.zip

Response: ZIP file with processed PDFs
```

### WebSocket Events

#### Client → Server
- `connection`: Koneksi baru
- `disconnect`: Pemutusan koneksi

#### Server → Client
- `log`: Pesan log pemrosesan
- `progress`: Update progress (0-100%)

## 🏗 Arsitektur

### Backend Architecture

- **Controllers**: Menangani HTTP requests
- **Services**: Business logic untuk PDF processing
- **Middleware**: Upload handling, error handling
- **Utils**: PDF extraction, merging, file management, cleanup

### Frontend Architecture

- **Components**: Modular UI components (FileUpload, ProgressTracker, etc.)
- **Utils**: DOM manipulation, utilities
- **Config**: Application configuration

## 🔍 Cara Kerja

### Mode "Rename Only"
1. **Upload**: User upload ZIP berisi PDF faktur pajak
2. **Detection**: Sistem mendeteksi dan menampilkan jumlah PDF dalam ZIP
3. **Extract**: Server ekstrak ZIP ke folder temporary dengan UUID unik
4. **Analyze**: PDF dianalisis untuk ekstrak metadata (IDTKU, partner, tanggal, referensi, invoice)
5. **Format**: Nama file diganti sesuai format yang dikonfigurasi user
6. **Package**: PDF dengan nama baru dikemas dalam ZIP untuk download
7. **Results**: Tampilkan summary hasil (berhasil/gagal) di log box
8. **Cleanup**: File temporary dihapus otomatis

### Mode "Rename + Merge"
1. **Upload**: User upload ZIP berisi PDF faktur pajak
2. **Detection**: Sistem mendeteksi dan menampilkan jumlah PDF dalam ZIP
3. **Extract**: Server ekstrak ZIP ke folder temporary dengan UUID unik
4. **Analyze**: PDF dianalisis untuk ekstrak metadata (IDTKU, partner, tanggal, referensi, invoice)
5. **Group**: PDF dikelompokkan berdasarkan IDTKU dan partner name
6. **Rename**: File diganti nama sesuai format default
7. **Merge**: PDF dengan partner sama digabung menjadi satu file per grup
8. **Package**: Hasil pengelompokan dikemas dalam ZIP baru untuk download
9. **Results**: Tampilkan summary hasil (berhasil/gagal) di log box
10. **Cleanup**: File temporary dihapus otomatis

### Real-time Communication
- **WebSocket**: Progress dan log dikirim secara real-time ke frontend
- **File Detection**: Notifikasi otomatis jumlah PDF yang terdeteksi dalam ZIP
- **Progress Tracking**: Persentase kemajuan dan estimasi waktu selesai
- **Result Summary**: Laporan akhir dengan detail file berhasil/gagal
- **Error Handling**: Notifikasi error individual per file dan penanganan yang robust

## 🧪 Testing

```bash
# Test semua
npm test

# Test backend only
npm run test:backend

# Test frontend only
npm run test:frontend
```

## 🚀 Deployment

### 🎯 Development Deployment

#### Option 1: Script Helper (Recommended)
```bash
# Menjalankan backend dan frontend terpisah dengan script
./scripts/dev.sh

# Output:
# 📱 Frontend: http://localhost:3000
# 🔗 Backend:  http://localhost:5001
# 🩺 Health:   http://localhost:5001/health
```

#### Option 2: Manual Terminal Terpisah
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

#### Option 3: Docker Development
```bash
docker-compose -f docker-compose.dev.yml up
```

### 🏭 Production Deployment

#### Option 1: Native (Terpisah)
```bash
# Terminal 1 - Backend Production
cd backend
npm ci --only=production
npm run start:prod

# Terminal 2 - Frontend Production
cd frontend
npm ci
npm run start:prod
```

#### Option 2: Script Helper
```bash
./scripts/prod.sh
```

#### Option 3: Docker Production (Recommended)
```bash
# Build dan jalankan
docker-compose up -d

# Monitor logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Option 4: Separate Docker Containers
```bash
# Backend only
docker build -t renamerged-backend ./backend
docker run -p 5001:5001 --env-file ./backend/.env renamerged-backend

# Frontend only (terminal terpisah)
docker build -t renamerged-frontend ./frontend
docker run -p 3000:3000 renamerged-frontend
```

### 🌐 Production Environment Setup

#### Backend Environment (backend/.env)
```bash
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://yourdomain.com
MAX_FILE_SIZE=200
CLEANUP_INTERVAL_MINUTES=10
MAX_AGE_HOURS=1
DELETION_DELAY_MINUTES=1
```

#### Frontend Environment (frontend/.env)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_SOCKET_URL=https://api.yourdomain.com
```

### 🔒 Security Considerations (Production)

1. **Environment Variables**: Jangan commit file `.env` ke git
2. **CORS**: Set `CORS_ORIGIN` ke domain spesifik di production
3. **HTTPS**: Gunakan reverse proxy (nginx) untuk HTTPS
4. **File Limits**: Sesuaikan `MAX_FILE_SIZE` dengan kebutuhan
5. **Process Manager**: Gunakan PM2 untuk process management

### 📊 Monitoring

```bash
# Health check endpoints
curl http://localhost:5001/health  # Backend health
curl http://localhost:3000/health  # Frontend health (via nginx)

# Docker health check
docker-compose ps
```

## 🤝 Contributing

1. Fork repository
2. Buat feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push ke branch: `git push origin feature/amazing-feature`
5. Buat Pull Request

## 📜 License

ISC License - lihat file LICENSE untuk detail lengkap.

## 👨‍💻 Author

**Syahbandi**
- Instagram: [@syahbandi.a](https://www.instagram.com/syahbandi.a)
- Facebook: [ssyah.bandi](https://www.facebook.com/ssyah.bandi)
- Website: [mikhailovna.com](https://mikhailovna.com)

## 🆕 Latest Updates

### Version 2.0.0 Features:
- ✅ **File Detection**: Otomatis mendeteksi dan menampilkan jumlah PDF dalam ZIP
- ✅ **Result Summary**: Tampilan hasil akhir dengan jumlah file berhasil/gagal
- ✅ **External Link Safety**: Link eksternal otomatis membuka tab baru
- ✅ **UI Improvements**: Warna border yang lebih soft di light mode
- ✅ **Enhanced Logging**: Log yang lebih detail untuk setiap tahap proses

## 💝 Support

Jika aplikasi ini bermanfaat, silakan donasi di [sini](https://bit.ly/kiyuris)

---

&copy; 2025 mikhailovna.com. All Rights Reserved.