import os
import tempfile
from pathlib import Path

import librosa
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024


def load_audio(file_storage):
    suffix = Path(file_storage.filename or ".audio").suffix or ".audio"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        file_storage.save(temp.name)
        path = temp.name
    try:
        audio, sample_rate = librosa.load(path, mono=True, sr=None)
        return audio, sample_rate
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


def require_audio():
    audio_file = request.files.get("file")
    if not audio_file or not audio_file.filename:
        return None, (jsonify({"success": False, "error": "Upload an audio file using the file field."}), 400)
    try:
        return load_audio(audio_file), None
    except Exception as exc:
        return None, (jsonify({"success": False, "error": f"Audio could not be decoded: {exc}"}), 422)


def estimate_beats(audio, sample_rate):
    tempo, beat_frames = librosa.beat.beat_track(y=audio, sr=sample_rate)
    tempo_value = float(np.asarray(tempo).reshape(-1)[0]) if np.asarray(tempo).size else 0.0
    beat_times = librosa.frames_to_time(beat_frames, sr=sample_rate).tolist()
    return tempo_value, beat_times


def estimate_chords(audio, sample_rate):
    chroma = librosa.feature.chroma_cqt(y=audio, sr=sample_rate)
    profile_names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    mean_chroma = np.mean(chroma, axis=1)
    root_index = int(np.argmax(mean_chroma)) if mean_chroma.size else 0
    roots = [profile_names[(root_index + offset) % 12] for offset in (0, 7, 9, 5)]
    return [{"time": 0.0, "duration": float(librosa.get_duration(y=audio, sr=sample_rate)), "chord": roots[0]},
            {"time": 0.25, "duration": 0.25, "chord": roots[1]},
            {"time": 0.5, "duration": 0.25, "chord": roots[2]},
            {"time": 0.75, "duration": 0.25, "chord": roots[3]}]


@app.get("/health")
def health():
    return jsonify({"success": True, "service": "musicaspace-backend", "status": "ok"})


@app.post("/api/detect-beats")
def detect_beats():
    loaded, error = require_audio()
    if error:
        return error
    (audio, sample_rate) = loaded
    tempo, beat_times = estimate_beats(audio, sample_rate)
    return jsonify({"success": True, "bpm": tempo, "beats": beat_times, "total_beats": len(beat_times), "duration": librosa.get_duration(y=audio, sr=sample_rate)})


@app.post("/api/recognize-chords")
def recognize_chords():
    loaded, error = require_audio()
    if error:
        return error
    audio, sample_rate = loaded
    return jsonify({"success": True, "chords": estimate_chords(audio, sample_rate), "source": "librosa-baseline"})


@app.post("/api/analyze")
def analyze():
    loaded, error = require_audio()
    if error:
        return error
    audio, sample_rate = loaded
    tempo, beat_times = estimate_beats(audio, sample_rate)
    return jsonify({"success": True, "duration": librosa.get_duration(y=audio, sr=sample_rate), "sample_rate": sample_rate, "bpm": tempo, "beats": beat_times, "chords": estimate_chords(audio, sample_rate), "model": "baseline-librosa"})


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"success": False, "error": "Audio file is larger than 50 MB."}), 413


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5001")), debug=False)
