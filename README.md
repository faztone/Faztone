# Musica Space

Platform musik berbasis web untuk membantu musisi mengeksplorasi chord, progresi, tonal, latihan, dan piano visualizer.

## Live Website

🌐 **[Buka Musica Space](https://faztone.github.io/Faztone/)**

Repository ini dipublikasikan menggunakan GitHub Pages dari branch `main`.

## Fitur

- Dashboard musik dengan tema dark modern
- Chord Library
- Transpose dan progression editor
- AI Assistant untuk ide chord dan penyederhanaan chord
- Tonal Recognition untuk mendeteksi tonal mayor
- BPM / Metronome
- Piano visualizer dan piano widget interaktif
- Song Finder
- My Library, playlist, practice, dan community view
- Login pengguna menggunakan Supabase Auth
- Login email/password
- Login Google OAuth

## Teknologi

- HTML, CSS, dan JavaScript
- GitHub Pages untuk hosting frontend
- Supabase Auth untuk autentikasi pengguna
- Supabase Database untuk penyimpanan data pengguna pada tahap berikutnya

## Struktur Utama

- `index.html` — halaman utama aplikasi
- `musicaspace-dashboard.js` — interaksi dashboard, tools, piano, dan autentikasi
- `assets/` — aset visual aplikasi

## Menjalankan Secara Lokal

Karena aplikasi menggunakan file statis, repository bisa dibuka dengan server lokal sederhana:

```bash
python3 -m http.server 8080
```

Kemudian buka:

```text
http://localhost:8080
```

## Supabase Authentication

Project Supabase yang digunakan:

```text
https://pyokprmnijoowrpaopyo.supabase.co
```

Untuk Google OAuth, konfigurasi berikut diperlukan.

### Site URL

```text
https://faztone.github.io/Faztone/
```

### Redirect URL

```text
https://faztone.github.io/Faztone/
```

### Google OAuth Callback URL

```text
https://pyokprmnijoowrpaopyo.supabase.co/auth/v1/callback
```

Publishable key boleh digunakan di frontend. Jangan pernah memasukkan Google Client Secret, Supabase service-role key, atau kredensial rahasia lainnya ke repository.

## Deployment

Setiap perubahan pada branch `main` akan menjadi source untuk GitHub Pages. Pastikan file `index.html` tetap berada di root repository.

## Catatan

Fitur autentikasi pengguna sudah terhubung. Penyimpanan lagu, playlist, favorit, dan progress secara per pengguna membutuhkan tabel database Supabase dan Row Level Security (RLS) agar data setiap pengguna tetap terpisah.

---

Made for musicians by **Faza Sadikin**.
