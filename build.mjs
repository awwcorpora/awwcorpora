/**
 * Build script — AWW Corpora
 * © 2026 Axel Wahyu Wicaksono. All Rights Reserved.
 *
 * Apa yang dilakukan file ini:
 *   1. Memeriksa sintaks JavaScript di setiap halaman .html
 *   2. Memadatkan (minify) HTML, CSS dan JavaScript di dalamnya
 *   3. Menyimpan hasilnya ke folder  dist/   <- inilah yang dipublikasikan Netlify
 *   4. Menyalin assets/, robots.txt dan sitemap.xml apa adanya ke dist/
 *
 * Anda TIDAK perlu menjalankan ini sendiri. Netlify menjalankannya otomatis
 * setiap kali Anda commit. Anda cukup mengedit index.html / portfolio-axel.html
 * seperti biasa.
 */

import { minify } from 'html-minifier-terser';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SRC = '.';        // halaman sumber ada di root repo
const OUT = 'dist';     // hasil build (dibuat otomatis, jangan diedit)
// File & folder di root yang ikut disalin apa adanya (kalau ada)
const PASSTHROUGH = ['assets', 'robots.txt', 'sitemap.xml', 'LICENSE'];

const MINIFY_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  ignoreCustomComments: [/^!/],   // banner hak cipta <!--! ... --> tetap dipertahankan
  minifyCSS: true,
  minifyJS: true,
  keepClosingSlash: true,
  html5: true,
  decodeEntities: false,
  processConditionalComments: true,
  removeAttributeQuotes: false,
  removeRedundantAttributes: false,
};

const kb = (n) => (n / 1024).toFixed(1) + ' KB';

/**
 * Memeriksa sintaks setiap blok <script> di dalam halaman.
 * Kode HANYA di-compile, tidak dijalankan — jadi aman.
 * Ini menangkap kesalahan seperti kurang tutup kurung, yang kalau lolos akan
 * mematikan seluruh JavaScript halaman (tombol AI, artikel, menu mobile).
 */
function checkScripts(html, filename) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m, index = 0, problems = [];
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] || '';
    const code = m[2] || '';
    index++;
    if (/\bsrc\s*=/i.test(attrs)) continue;          // script eksternal, tidak ada isi
    if (/type\s*=\s*["']?(application\/json|text\/template)/i.test(attrs)) continue;
    if (!code.trim()) continue;
    try {
      new vm.Script(code, { filename: `${filename} <script #${index}>` });
    } catch (err) {
      problems.push(`  blok <script> ke-${index}: ${err.message}`);
    }
  }
  return problems;
}

async function copyRecursive(from, to) {
  const stat = await fs.stat(from);
  if (stat.isDirectory()) {
    await fs.mkdir(to, { recursive: true });
    for (const entry of await fs.readdir(from)) {
      await copyRecursive(path.join(from, entry), path.join(to, entry));
    }
  } else {
    await fs.mkdir(path.dirname(to), { recursive: true });
    await fs.copyFile(from, to);
  }
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  const pages = (await fs.readdir(SRC)).filter((f) => f.endsWith('.html'));
  if (pages.length === 0) {
    console.error('\n✗ Tidak ada file .html di root repo.\n');
    process.exit(1);
  }

  console.log('\nMembangun situs…\n');
  let totalIn = 0, totalOut = 0;

  for (const page of pages) {
    const src = await fs.readFile(path.join(SRC, page), 'utf8');

    // 1) Periksa sintaks JavaScript SEBELUM minify.
    const problems = checkScripts(src, page);
    if (problems.length) {
      console.error(`\n✗ JavaScript di ${page} ada kesalahan penulisan:\n`);
      problems.forEach((p) => console.error(p));
      console.error('\n  Build dihentikan. Situs live TIDAK diubah dan tetap aman.');
      console.error('  Perbaiki baris di atas, commit lagi, lalu Netlify akan mencoba ulang.\n');
      process.exit(1);
    }

    let out;
    try {
      out = await minify(src, MINIFY_OPTS);
    } catch (err) {
      // Kalau HTML-nya rusak, hentikan build supaya situs live TIDAK ikut rusak.
      console.error(`\n✗ Gagal memproses ${page} — kemungkinan ada tag HTML yang salah tulis.`);
      console.error(`  ${err.message}\n`);
      process.exit(1);
    }
    await fs.writeFile(path.join(OUT, page), out);
    totalIn += src.length; totalOut += out.length;
    const saved = Math.round((1 - out.length / src.length) * 100);
    console.log(`  ✓ ${page.padEnd(24)} ${kb(src.length).padStart(9)} → ${kb(out.length).padStart(9)}  (−${saved}%)`);
  }

  for (const item of PASSTHROUGH) {
    if (existsSync(item)) {
      await copyRecursive(item, path.join(OUT, item));
      console.log(`  ✓ ${item.padEnd(24)} disalin apa adanya`);
    }
  }

  console.log(`\nSelesai. ${pages.length} halaman, total ${kb(totalIn)} → ${kb(totalOut)}.\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
