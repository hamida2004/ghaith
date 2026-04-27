import os
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

# ✅ DEFINE APP FIRST
app = FastAPI(title="Donation Recommendation Service")

import pandas as pd
from sqlalchemy import create_engine
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# =========================
# 🔌 DB CONNECTION (POSTGRES)
# =========================
DB_URI = f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DB_URI)

# =========================
# 📥 LOAD DATA
# =========================
def load_data():
    requests_df = pd.read_sql("""
        SELECT r.id, r.title, r.description, c.name AS category
        FROM "Requests" r
        LEFT JOIN "Categories" c ON r.category_id = c.id
    """, engine)

    donations_df = pd.read_sql("""
        SELECT donor_id AS user_id, request_id
        FROM "Donations"
    """, engine)

    requests_df = requests_df.fillna("")
    requests_df["text"] = (
        requests_df["title"] + " " +
        requests_df["description"] + " " +
        requests_df["category"]
    )

    return requests_df, donations_df

# =========================
# 🧠 BUILD MODEL
# =========================
def build_model(requests_df):
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(requests_df["text"])
    similarity_matrix = cosine_similarity(tfidf_matrix)
    return similarity_matrix

# =========================
# 📊 POPULARITY
# =========================
def compute_popularity(donations_df):
    popularity = donations_df.groupby("request_id").size()
    return popularity.to_dict()

# =========================
# ⚡ LOAD ON STARTUP (IMPORTANT)
# =========================
@app.on_event("startup")
def init():
    global requests_df, donations_df, sim_matrix, popularity

    requests_df, donations_df = load_data()
    sim_matrix = build_model(requests_df)
    popularity = compute_popularity(donations_df)

# =========================
# 🎯 RECOMMEND
# =========================
def recommend(user_id, k=5):
    user_donations = donations_df[
        donations_df["user_id"] == user_id
    ]["request_id"].tolist()

    # Cold start
    if not user_donations:
        top = sorted(popularity.items(), key=lambda x: x[1], reverse=True)
        top_ids = [r[0] for r in top[:k]]
        return requests_df[requests_df["id"].isin(top_ids)].to_dict(orient="records")

    scores = {}

    for req_id in user_donations:
        if req_id not in requests_df["id"].values:
            continue

        idx = requests_df.index[requests_df["id"] == req_id][0]

        for i, score in enumerate(sim_matrix[idx]):
            target_id = requests_df.iloc[i]["id"]

            if target_id in user_donations:
                continue

            scores[target_id] = scores.get(target_id, 0) + score

    # Add popularity boost
    for rid in scores:
        scores[rid] += 0.1 * popularity.get(rid, 0)

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_ids = [r[0] for r in ranked[:k]]

    return requests_df[requests_df["id"].isin(top_ids)].to_dict(orient="records")

# =========================
# 🚀 API
# =========================
@app.get("/recommend/{user_id}")
def get_recommendations(user_id: int, k: int = 5):
    results = recommend(user_id, k)
    return {"user_id": user_id, "recommendations": results}