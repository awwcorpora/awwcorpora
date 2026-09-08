# Panduan Edit — awwcorpora.web.id

Panduan singkat untuk mengubah isi situs sendiri, tanpa perlu aplikasi apa pun.
Semua dikerjakan lewat github.com di browser.

---

## Cara kerjanya

```
Anda edit index.html  →  commit  →  Netlify build otomatis  →  situs live
   (bisa dibaca)                      (memadatkan file)         (terminify)
```

Anda **selalu** mengedit `index.html` dan `portfolio-axel.html` di root repo —
file yang masih rapi dan ada komentar penjelasnya. Netlify yang memadatkannya.

> **Folder `dist/` jangan pernah disentuh.** Isinya dibuat ulang otomatis setiap
> deploy. Apa pun yang Anda tulis di sana akan tertimpa.

---

## Jaring pengaman

Kalau Anda salah ketik sampai JavaScript-nya rusak, **build akan gagal dan situs
lama tetap hidup**. Situs tidak akan pernah tampil rusak ke pengunjung.

Cara mengeceknya: buka **app.netlify.com** → tab **Deploys**.

| Yang Anda lihat | Artinya |
|---|---|
| **Published** hijau | Berhasil, perubahan sudah live |
| **Failed** merah | Ada salah ketik. Klik untuk baca pesannya — akan disebut baris mana |

Kalau gagal: perbaiki, commit lagi. Netlify otomatis mencoba ulang.

---

## 1. Mengubah kalimat

1. Buka repo di github.com, klik file `index.html`
2. Klik ikon **pensil** (Edit this file) di kanan atas
3. Tekan **Ctrl+F** (Cmd+F di Mac), ketik potongan kalimat yang mau diganti
4. Ganti teksnya
5. Scroll ke bawah → **Commit changes**

**Aturan mutlak:** hanya ubah teks yang ada **di antara** tanda `>` dan `<`.

```html
<h3>AWW Health</h3>
     ↑ ini yang boleh diubah
```

Jangan ubah nama tag (`h3`, `div`, `span`), jangan hapus `<` atau `>`.

**Karakter khusus.** Kalau teks Anda mengandung tanda ini, tulis penggantinya:

| Mau menulis | Tulis begini |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |

---

## 2. Menambah gambar

### Langkah A — siapkan filenya

Sebelum upload, **wajib** dikecilkan dulu:

- Lebar maksimal **1600 px**
- Ukuran file di bawah **300 KB**
- Format **JPG** untuk foto, **PNG** untuk logo, **WebP** kalau bisa
- Nama file: huruf kecil, tanpa spasi → `kantor-jakarta.jpg` (bukan `Foto Kantor (1).JPG`)

Foto langsung dari HP biasanya 4–8 MB. Kalau diupload apa adanya, situs Anda
akan sangat lambat di jaringan seluler. Kecilkan dulu di squoosh.app (gratis,
langsung di browser).

### Langkah B — upload ke repo

Buka folder `assets/` di repo → **Add file** → **Upload files** → seret file →
**Commit changes**.

### Langkah C — panggil di halaman

Sisipkan di tempat yang Anda mau:

```html
<img src="/assets/kantor-jakarta.jpg"
     alt="Kantor AWW Corpora di Jakarta"
     loading="lazy" width="1600" height="900">
```

- `alt` — deskripsi singkat. Wajib diisi: dibaca pembaca layar untuk tunanetra, dan dipakai Google.
- `loading="lazy"` — gambar baru dimuat saat discroll. Bikin halaman jauh lebih ringan.
- `width`/`height` — ukuran asli gambar. Mencegah halaman "melompat" saat gambar muncul.

### ⚠️ Gambar dari luar akan diblokir

Situs ini punya Content Security Policy yang hanya mengizinkan gambar dari
folder `assets/` Anda sendiri. Link gambar dari **Imgur, Google Drive,
Unsplash, atau CDN mana pun tidak akan tampil** — layarnya kosong, tanpa pesan error.

Selalu upload dulu ke `assets/`.

### Gambar di dalam kartu

Kalau mau gambar mengisi kartu dengan rapi tanpa gepeng:

```html
<div style="border-radius:18px;overflow:hidden;aspect-ratio:16/9;margin-bottom:16px">
  <img src="/assets/nama.jpg" alt="…" loading="lazy"
       style="width:100%;height:100%;object-fit:cover">
</div>
```

`object-fit:cover` membuat gambar terpotong rapi, bukan penyet.

---

## 3. Memindahkan posisi

### Menukar urutan section — mudah

Setiap bagian besar halaman dibungkus begini:

```html
<section class="sec" id="skills">
  ...seluruh isinya...
</section>
```

Untuk memindahkan, potong dari `<section` sampai `</section>` **beserta seluruh
isinya**, lalu tempel di posisi baru. Pastikan tidak ada yang tertinggal.

Latar belakang selang-seling abu-abu/putih diatur oleh class `sec alt` dan `sec`.
Setelah menukar urutan, sesuaikan supaya tetap selang-seling.

### Mengubah tata letak di dalam section — sulit

Ini ranah CSS grid dan flexbox. Salah sedikit, tampilannya berantakan di HP
padahal di laptop terlihat normal. Untuk ini, lebih aman minta bantuan.

### Yang gampang diubah sendiri

Di bagian paling atas `<style>` ada blok `:root` — ubah di sini, seluruh situs ikut berubah:

```css
--g1:#2ad0ff;   /* warna gradient 1 */
--g2:#7b5cff;   /* warna gradient 2 */
--g3:#ff4d8d;   /* warna gradient 3 */
--max:1120px;   /* lebar maksimal konten */
```

---

## 4. Jangan disentuh

| File / bagian | Alasan |
|---|---|
| `dist/` | Dibuat otomatis, selalu tertimpa |
| `netlify/functions/` | Mesin AWW AI |
| `build.mjs`, `package.json` | Mesin build |
| `assets/` | Foto & CV Anda ada di sini — jangan dihapus, hanya ditambah |
| Blok `<script>` | Menjalankan AI, artikel, dan menu mobile |
| Banner `<!--! ... -->` | Bukti hak cipta Anda |

---

## 5. Setelah edit — cek 4 hal ini

Buka situs, tekan **Ctrl+Shift+R** (Cmd+Shift+R di Mac) untuk mengabaikan cache:

1. Tampilan di laptop masih rapi
2. **Buka dari HP** — ini yang paling sering rusak
3. Tombol **✦ Ask AWW AI** masih menjawab
4. Kalau menambah gambar: gambarnya benar-benar tampil

---

## Kalau ragu

Jangan menebak-nebak lalu commit. Tanyakan dulu — jauh lebih cepat daripada
memperbaiki halaman yang sudah rusak.

Perubahan yang sebaiknya diserahkan saja:

- Mengubah tata letak di dalam section
- Menambah section baru
- Apa pun yang menyentuh `<script>`
- Menambah resource dari luar (font, analytics, embed YouTube) — perlu ubah CSP

---

© 2026 Axel Wahyu Wicaksono / AWW Corpora. All Rights Reserved.
