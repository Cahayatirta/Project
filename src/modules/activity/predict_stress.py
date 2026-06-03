import json
import os
import sys
import tempfile
import zipfile
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf


BASE_DIR = Path(__file__).resolve().parents[3]
MODEL_DIR = BASE_DIR / "Model Ai" / "model"
MODEL_PATH = MODEL_DIR / "mood_classifier.keras"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
LABEL_ENCODER_PATH = MODEL_DIR / "label_encoder.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
CAT_ENCODERS_PATH = MODEL_DIR / "cat_encoders.pkl"

MODEL = None
SCALER = None
LABEL_ENCODER = None
FEATURE_COLUMNS = None
CAT_ENCODERS = None
SANITIZED_MODEL_PATH = None


def parse_duration_to_hours(value):
    if value is None:
        return 0.0

    if isinstance(value, (int, float)):
        return float(value)

    normalized = str(value).strip().lower()
    if not normalized:
        return 0.0

    hour_match = None
    minute_match = None

    import re

    hour_match = re.search(r"(\d+(?:\.\d+)?)\s*h", normalized)
    minute_match = re.search(r"(\d+(?:\.\d+)?)\s*m", normalized)

    if hour_match or minute_match:
        hours = float(hour_match.group(1)) if hour_match else 0.0
        minutes = float(minute_match.group(1)) if minute_match else 0.0
        return round(hours + (minutes / 60.0), 2)

    number_match = re.search(r"(\d+(?:\.\d+)?)", normalized)
    if number_match and "min" in normalized:
        return round(float(number_match.group(1)) / 60.0, 2)

    named_activity_hours = {
        "walking": 0.5,
        "jogging": 0.75,
        "running": 0.75,
        "yoga": 0.75,
        "cycling": 1.0,
        "gym": 1.0,
        "workout": 1.0,
        "badminton": 1.0,
    }

    return named_activity_hours.get(normalized, 0.5)


def normalize_screen_time_category(value):
    normalized = str(value or "").strip().lower()
    mapping = {
        "low": "Low",
        "medium": "Moderate",
        "moderate": "Moderate",
        "high": "High",
    }
    return mapping.get(normalized, "Moderate")


def normalize_sleep_quality(value):
    if isinstance(value, (int, float)):
        score = float(value)
        if score >= 7:
            return "Good"
        if score >= 4:
            return "Moderate"
        return "Poor"

    normalized = str(value or "").strip().lower()
    mapping = {
        "good": "Good",
        "moderate": "Moderate",
        "medium": "Moderate",
        "poor": "Poor",
    }
    return mapping.get(normalized, "Moderate")


def estimate_stress_level(payload):
    score = 0.0

    screen_time = float(payload.get("screenTime") or 0)
    sleep_hours = float(payload.get("sleepHours") or 0)
    caffeine_intake = float(payload.get("caffeineIntake") or 0)
    work_hours = float(payload.get("workHours") or 0)
    activity_hours = parse_duration_to_hours(payload.get("physicalActivity"))
    wellness_index = float(payload.get("wellnessIndex") or 0)
    fatigue_score = float(payload.get("fatigueScore") or 0)
    digital_balance = float(payload.get("digitalBalance") or 0)
    mood = str(payload.get("mood") or "").strip().lower()

    if screen_time >= 9:
        score += 2
    elif screen_time >= 7:
        score += 1

    if sleep_hours < 5.5:
        score += 3
    elif sleep_hours < 6.5:
        score += 2
    elif sleep_hours >= 8:
        score -= 1

    if caffeine_intake >= 4:
        score += 2
    elif caffeine_intake >= 2:
        score += 1

    if work_hours >= 10:
        score += 2
    elif work_hours >= 8.5:
        score += 1

    if activity_hours >= 0.75:
        score -= 2
    elif activity_hours >= 0.33:
        score -= 1
    elif activity_hours == 0:
        score += 1

    mood_weights = {
        "anxious": 3,
        "overwhelmed": 3,
        "drained": 2,
        "tired": 2,
        "balanced": -1,
        "calm": -2,
        "focused": -1,
        "relaxed": -2,
        "good": -1,
        "great": -2,
        "steady": 0,
        "better": 0,
        "normal": 0,
    }
    score += mood_weights.get(mood, 0)

    if wellness_index:
        score += (10 - max(0, min(wellness_index, 10))) * 0.2
    if fatigue_score:
        score += max(0, min(fatigue_score, 10)) * 0.15
    if digital_balance:
        score += (10 - max(0, min(digital_balance, 10))) * 0.1

    return round(max(0.0, min(score, 10.0)), 2)


def sanitize_model_archive():
    with zipfile.ZipFile(MODEL_PATH, "r") as source:
        config = json.loads(source.read("config.json"))
        metadata = source.read("metadata.json")
        weights = source.read("model.weights.h5")

    def scrub(obj):
        if isinstance(obj, dict):
            obj.pop("quantization_config", None)
            for value in obj.values():
                scrub(value)
        elif isinstance(obj, list):
            for item in obj:
                scrub(item)

    scrub(config)

    handle, temp_path = tempfile.mkstemp(suffix=".keras")
    os.close(handle)

    with zipfile.ZipFile(temp_path, "w") as target:
        target.writestr("metadata.json", metadata)
        target.writestr("config.json", json.dumps(config))
        target.writestr("model.weights.h5", weights)

    return temp_path


def ensure_loaded():
    global MODEL, SCALER, LABEL_ENCODER, FEATURE_COLUMNS, CAT_ENCODERS, SANITIZED_MODEL_PATH

    if MODEL is not None:
        return

    SCALER = joblib.load(SCALER_PATH)
    LABEL_ENCODER = joblib.load(LABEL_ENCODER_PATH)
    FEATURE_COLUMNS = joblib.load(FEATURE_COLUMNS_PATH)
    CAT_ENCODERS = joblib.load(CAT_ENCODERS_PATH)
    SANITIZED_MODEL_PATH = sanitize_model_archive()
    MODEL = tf.keras.models.load_model(SANITIZED_MODEL_PATH, compile=False)


def build_feature_row(payload):
    stress_level = estimate_stress_level(payload)
    row = {
        "screen_time": float(payload.get("screenTime") or 0),
        "sleep_hours": float(payload.get("sleepHours") or 0),
        "stress_level": stress_level,
        "wellness_index": float(payload.get("wellnessIndex") or 0),
        "sleep_quality": normalize_sleep_quality(payload.get("sleepQuality")),
        "fatigue_score": float(payload.get("fatigueScore") or 0),
        "digital_balance": float(payload.get("digitalBalance") or 0),
        "screen_time_category": normalize_screen_time_category(payload.get("screenTimeCategory")),
        "physical_activity": parse_duration_to_hours(payload.get("physicalActivity")),
        "caffeine_intake": float(payload.get("caffeineIntake") or 0),
        "work_hours": float(payload.get("workHours") or 0),
    }
    return row


def transform_features(payload):
    row = build_feature_row(payload)
    frame = pd.DataFrame([row], columns=FEATURE_COLUMNS).copy()

    for column, encoder in CAT_ENCODERS.items():
        if column not in frame.columns:
            continue

        frame[column] = frame[column].astype(str)
        known_classes = set(encoder.classes_)
        fallback = list(encoder.classes_)[0] if len(encoder.classes_) else ""
        frame[column] = frame[column].apply(lambda value: value if value in known_classes else fallback)
        frame[column] = encoder.transform(frame[column])

    numeric_columns = [column for column in FEATURE_COLUMNS if column not in CAT_ENCODERS]
    frame[numeric_columns] = SCALER.transform(frame[numeric_columns])
    return frame.astype(np.float32), row


def predict(payload):
    ensure_loaded()
    features, raw_row = transform_features(payload)
    probabilities = MODEL.predict(features, verbose=0)[0]
    predicted_index = int(np.argmax(probabilities))
    predicted_label = LABEL_ENCODER.inverse_transform([predicted_index])[0]

    return {
        "status": str(predicted_label).strip().lower(),
        "label": predicted_label,
        "confidence": round(float(probabilities[predicted_index]), 6),
        "stressLevelScore": raw_row["stress_level"],
        "probabilities": {
            str(label).strip().lower(): round(float(probabilities[index]), 6)
            for index, label in enumerate(LABEL_ENCODER.classes_)
        },
    }


def main():
    try:
        payload = json.load(sys.stdin)
        result = predict(payload)
        sys.stdout.write(json.dumps(result))
    except Exception as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)


if __name__ == "__main__":
    main()
