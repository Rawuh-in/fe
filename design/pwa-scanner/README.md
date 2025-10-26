# Scanner Check-in PWA

## Cover — Ikhtisar
- Fokus utama: scan cepat di lapangan, kontras tinggi (AA+), dukung instalasi Add to Home Screen.
- Palet netral (grayscale) dengan aksen tunggal `--primary` untuk aksi utama dan status konfirmasi.
- Komponen besar & tap target ≥ 44px, ikon sederhana 2 warna, tipografi jelas (16px dasar).
- Flow utama: Home (pilih stage) → Buka kamera → Hasil scan (OK/DUP/EXPIRED/INVALID) → Scan berikutnya.
- Mode terang adalah default. Mode gelap dapat ditambahkan kemudian (token siap).

> Lihat `prototype/index.html` untuk mock interaktif (mobile 360×800 & 390×844).

---

## Frame 01 — Home / Scan (Stage Selector)
- Header sticky `Scanner Check-in` + badge koneksi (Online/Offline) kanan.
- Dropdown `Stage` (default Venue A; opsi: Airport, Venue A, Venue B, Hotel).
- Tombol utama `Buka Kamera` (ikon kamera kiri, lebar penuh).
- Banner antrean offline muncul bila jumlah antrean > 0: `Offline • 3 check-in akan dikirim saat online`.
- Link sekunder `Masukkan Kode Manual`.

```
┌──────────────────────────────┐
│ Scanner Check-in      ●Online│
├─────────── Stage ───────────┤
│ ▼ Venue A                    │
├──────────────────────────────┤
│ [ 📷  Buka Kamera ]          │
├──────────────────────────────┤
│ Offline • 3 check-in ...     │
├──────────────────────────────┤
│ Masukkan Kode Manual →       │
└──────────────────────────────┘
```

## Frame 02 — Scan Active
- Kamera penuh tinggi dengan cropping square guidance (stroke putih semi-transparan).
- Overlay atas: teks status `Memindai…`.
- Overlay bawah: tombol ikon `Flash` (toggle), `Switch Camera`, close (jika dibutuhkan).
- Deteksi kondisi gelap → toast `Aktifkan flash untuk hasil lebih baik`.

## Frame 03 — Hasil OK (Hijau)
- Card hasil menumpuk di atas preview (semi blur di belakang).
- Judul `Check-in Berhasil`, icon sukses, highlight warna `--success`.
- Rincian: `Nama Peserta`, `Event`, `Stage`, `Waktu`.
- CTA primer `Scan Berikutnya`, CTA sekunder ikon `Masukkan Kode Manual` (opsional).

```
┌──────────────────────────────┐
│ ✔ Check-in Berhasil          │
│ Nama Peserta  : …            │
│ Event         : …            │
│ Stage         : Venue A      │
│ Waktu         : 12.45 WIB    │
├──────────────────────────────┤
│ [ Scan Berikutnya ]          │
└──────────────────────────────┘
```

## Frame 04 — Hasil DUP (Kuning)
- Warna status `--warning`.
- Sub-info: `Terakhir dipakai 12.31 WIB • Petugas: Farah`.
- CTA primer `Scan Ulang`, link `Lihat Riwayat`.

## Frame 05 — Hasil EXPIRED (Oranye)
- Warna status `--warning` (dengan varian 700).
- Subteks `Minta bantuan helpdesk`.
- CTA primer `Scan Ulang`.

## Frame 06 — Hasil INVALID (Merah)
- Warna status `--danger`.
- CTA primer `Scan Ulang`.

## Frame 07 — Manual Entry
- Field teks dengan autocomplete (`Nama/No. HP`).
- Dropdown stage tetap tersedia (konsisten).
- CTA `Verifikasi Manual` → status card sama seperti OK dengan badge `Manual Verify`.

## Frame 08 — Variant Hotel
- Muncul ketika Stage = Hotel.
- Setelah OK, card menyertakan section `Hotel` + `Nomor Kamar` atau badge `Pending Room`.
- Tombol tambahan `Cetak Label` (styling siap untuk thermal printer 58/80mm; lihat CSS print di prototipe).

---

## Empty & Edge States
- **Izin kamera ditolak:** Ilustrasi sederhana + teks edukasi + tombol `Buka Pengaturan` dan link `Masukkan Kode Manual`.
- **Lingkungan gelap:** Toast non-blocking `Aktifkan flash untuk hasil lebih baik`.
- **Offline mode:** Banner di header + toast `Tersimpan ke antrean offline`. Saat koneksi pulih: toast `Terkirim`.

---

## Komponen Kunci
- **Buttons**
  - Primary (filled, gunakan `--primary`), Secondary (outline), Destructive (`--danger`).
  - Touch area minimal 44×44.
- **Inputs**
  - Text field dengan label atas, helper opsional.
  - Dropdown & search share casing.
- **Badges**
  - Status koneksi (Online/Offline), Stage label, Status hasil (OK/DUP/EXPIRED/INVALID).
- **Banners**
  - Info / Warning / Error; full width, dismissible opsional.
- **Cards**
  - Result card, offline queue item, history item.
- **Modals**
  - Izin kamera, konfirmasi manual verify.
- **Toasts**
  - Posisi top, auto dismiss 3s, warna mengikuti status.

> Lihat `components.html` snippet di folder `prototype` untuk contoh markup komponen.

---

## Design Tokens

| Token            | Nilai / Catatan                                   |
|------------------|----------------------------------------------------|
| `--primary`      | #2979FF (aksen aman WCAG via teks putih)           |
| `--success`      | #2E7D32                                            |
| `--warning`      | #F9A825 (DUP) / `--warning-strong` #EF6C00 (Expired)|
| `--danger`       | #D32F2F                                            |
| `--muted`        | #E0E0E0 (batas) / teks sekunder #616161             |
| `--bg`           | #F5F5F5 (app shell) / varian gelap #1E1E1E          |
| `--fg`           | #212121 (teks utama ringan) / #FFFFFF di dark      |
| Radius           | 8 / 12 / 16                                        |
| Shadow           | xs 0 1 2 rgba(0,0,0,.08); sm 0 2 6 rgba(0,0,0,.12); md 0 4 12 rgba(0,0,0,.16) |
| Spacing          | skala 4: 4,8,12,16,20,24,32                        |
| Type scale       | 12, 14, 16 (body), 20, 24, 28 (heading)            |
| Icon size        | 20 & 24px                                          |

Semua token diimplementasikan di `prototype/styles.css` untuk konsistensi.

---

## Prototipe
- File: `prototype/index.html` (jalankan lewat browser/dev server).
- Navigasi: Home → tap `Buka Kamera` → `Scan Berikutnya` → kembali ke mode scan.
- State hasil dapat diganti via tombol top bar debug (lihat `data-state` toggles).
- Print label (Hotel) gunakan CSS media print; preview di browser.

---

## Assets
- Ikon (SVG): kamera, flash, offline, success, warning, danger (lihat folder `icons/`).
- App Icon dummy resolusi 192px & 512px (`assets/app-icon-192.png`, `assets/app-icon-512.png`).
- Pastikan manifest PWA mengarah ke ikon ini saat implementasi dev.

---

## Catatan Lanjutan
- Mode gelap: gunakan token `--bg-dark`, `--fg-dark` (sudah disiapkan di CSS).
- Aksesibilitas: kontras minimal 4.5:1, fokus jelas (outline 2px `--primary`).
- Internationalization: copy UI disiapkan dalam Bahasa Indonesia; gunakan kunci i18n untuk future proof.

