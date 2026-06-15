# Panduan Mengaktifkan Fitur AI (AWW Corpora di Netlify)

Tombol **"Generate"** dan kolom tanya-jawab di website memanggil sebuah *Netlify Function*
(`claude-proxy`) yang meneruskan permintaan ke Claude API. API key disimpan aman di server
(environment variable) — **tidak pernah** tampil di HTML publik.

## Struktur file yang harus ada di repo

```
/ (root repo)
├── index.html
├── netlify.toml
└── netlify/
    └── functions/
        └── claude-proxy.js
```

Ketiga file ini sudah disiapkan di folder Anda. Tinggal di-upload semua ke GitHub.

## Langkah-langkah

### 1. Dapatkan API key Anthropic
- Buka https://console.anthropic.com/ → menu **API Keys** → **Create Key**.
- Salin key-nya (formatnya diawali `sk-ant-...`). Simpan baik-baik; hanya tampil sekali.
- Catatan: penggunaan API berbayar sesuai pemakaian token (ada saldo/billing di console).

### 2. Upload semua file ke GitHub
- Pastikan `index.html`, `netlify.toml`, dan folder `netlify/functions/claude-proxy.js`
  ikut ter-upload (jaga struktur foldernya sama persis seperti di atas).

### 3. Hubungkan repo ke Netlify
- Buka https://app.netlify.com/ → **Add new site → Import an existing project**.
- Pilih GitHub → pilih repository Anda.
- Build command: kosongkan. Publish directory: `.` (titik). Klik **Deploy**.

### 4. Set API key di Netlify (WAJIB)
- Di dashboard site → **Site configuration → Environment variables → Add a variable**.
- Key: `ANTHROPIC_API_KEY`
- Value: tempel API key dari langkah 1.
- Simpan, lalu **Deploys → Trigger deploy → Deploy site** agar key terbaca.

### 5. Tes
- Buka website Anda, klik salah satu tombol **"Generate blueprint"**.
- Jika muncul teks hasil AI → berhasil.
- Jika muncul "Error connecting to the AI service":
  - Pastikan env var `ANTHROPIC_API_KEY` sudah benar dan sudah re-deploy.
  - Cek **Netlify → Functions → claude-proxy → Logs** untuk pesan errornya.
  - Pastikan saldo/billing di console Anthropic aktif.

## Model yang dipakai
Saat ini diset ke `claude-sonnet-4-6`. Bisa diganti di dua tempat bila perlu:
- `index.html` (baris berisi `model: 'claude-sonnet-4-6'`)
- `netlify/functions/claude-proxy.js` (nilai default `model`)

## Keamanan
- Jangan pernah menaruh API key langsung di `index.html`.
- Key hanya boleh ada di Environment Variables Netlify.
