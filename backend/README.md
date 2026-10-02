# MusicaSpace Backend

Backend Flask untuk analisis audio dasar MusicaSpace.

## Jalankan lokal

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

API berjalan di `http://localhost:5001`.

## Endpoint

- `GET /health`
- `POST /api/analyze`
- `POST /api/detect-beats`
- `POST /api/recognize-chords`

Kirim audio sebagai multipart field bernama `file`. Baseline ini memakai librosa untuk BPM, beat, dan perkiraan root chord. Model ChordMini dari ZIP akan dipasang pada tahap berikutnya.
