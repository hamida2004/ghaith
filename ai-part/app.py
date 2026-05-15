import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

import pandas as pd

from sqlalchemy import create_engine

from sklearn.feature_extraction.text import (
    TfidfVectorizer
)

from sklearn.metrics.pairwise import (
    cosine_similarity
)

# =========================
# LOAD ENV
# =========================
load_dotenv()

# =========================
# APP
# =========================
app = FastAPI(
    title="Donation Recommendation Service"
)

# =========================
# CORS
# =========================
app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================
# DB CONNECTION
# =========================
DB_URI = (
    f"postgresql+psycopg2://"
    f"{os.getenv('DB_USER')}:"
    f"{os.getenv('DB_PASS')}@"
    f"{os.getenv('DB_HOST')}:"
    f"{os.getenv('DB_PORT')}/"
    f"{os.getenv('DB_NAME')}"
)

engine = create_engine(DB_URI)

# =========================
# GLOBALS
# =========================
requests_df = pd.DataFrame()

donations_df = pd.DataFrame()

vectorizer = None

tfidf_matrix = None

sim_matrix = None

popularity = {}

# =========================
# LOAD DATA
# =========================
def load_data():

    requests_df = pd.read_sql(
        """
        SELECT
            r.id,
            r.title,
            r.description,
            r.status,
            r.donation_status,
            c.name AS category

        FROM "Requests" r

        LEFT JOIN "Categories" c
        ON r.category_id = c.id

        WHERE r.status = 'accepted'
        """,
        engine
    )

    donations_df = pd.read_sql(
        """
        SELECT
            donor_id AS user_id,
            request_id

        FROM "Donations"

        WHERE request_id IS NOT NULL
        """,
        engine
    )

    # =========================
    # CLEAN TEXT
    # =========================
    requests_df = requests_df.fillna("")

    requests_df["text"] = (

        requests_df["title"].astype(str)

        + " " +

        requests_df["description"].astype(str)

        + " " +

        requests_df["category"].astype(str)
    )

    # remove empty rows
    requests_df["text"] = (
        requests_df["text"]
        .str.strip()
    )

    requests_df = requests_df[
        requests_df["text"] != ""
    ]

    return (
        requests_df,
        donations_df
    )

# =========================
# BUILD MODEL
# =========================
def build_model(requests_df):

    global vectorizer
    global tfidf_matrix

    # no requests
    if requests_df.empty:

        print(
            "WARNING: no requests found"
        )

        return None

    try:

        vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        tfidf_matrix = (
            vectorizer.fit_transform(
                requests_df["text"]
            )
        )

        similarity_matrix = (
            cosine_similarity(
                tfidf_matrix
            )
        )

        print(
            "AI model initialized successfully"
        )

        return similarity_matrix

    except ValueError as e:

        print(
            f"WARNING: model initialization failed: {e}"
        )

        return None

# =========================
# POPULARITY
# =========================
def compute_popularity(
    donations_df
):

    if donations_df.empty:
        return {}

    popularity = (
        donations_df
        .groupby("request_id")
        .size()
    )

    return popularity.to_dict()

# =========================
# STARTUP
# =========================
@app.on_event("startup")
def init():

    global requests_df
    global donations_df
    global sim_matrix
    global popularity

    try:

        (
            requests_df,
            donations_df
        ) = load_data()

        sim_matrix = build_model(
            requests_df
        )

        popularity = (
            compute_popularity(
                donations_df
            )
        )

        print(
            "Startup completed"
        )

    except Exception as e:

        print(
            f"Startup failed: {e}"
        )

# =========================
# RECOMMEND
# =========================
def recommend(
    user_id,
    k=5
):

    global sim_matrix

    # no requests available
    if requests_df.empty:

        return []

    # model failed
    if sim_matrix is None:

        return (
            requests_df
            .head(k)
            .to_dict(
                orient="records"
            )
        )

    # user donations
    user_donations = (

        donations_df[
            donations_df["user_id"] == user_id
        ]["request_id"]

        .dropna()

        .tolist()
    )

    # =========================
    # COLD START
    # =========================
    if not user_donations:

        if popularity:

            top = sorted(

                popularity.items(),

                key=lambda x: x[1],

                reverse=True
            )

            top_ids = [
                r[0]
                for r in top[:k]
            ]

            return (
                requests_df[
                    requests_df["id"]
                    .isin(top_ids)
                ]

                .to_dict(
                    orient="records"
                )
            )

        # fallback
        return (
            requests_df
            .head(k)
            .to_dict(
                orient="records"
            )
        )

    # =========================
    # CONTENT-BASED FILTERING
    # =========================
    scores = {}

    for req_id in user_donations:

        if (
            req_id
            not in requests_df["id"].values
        ):
            continue

        idx = (
            requests_df.index[
                requests_df["id"] == req_id
            ][0]
        )

        for i, score in enumerate(
            sim_matrix[idx]
        ):

            target_id = (
                requests_df.iloc[i]["id"]
            )

            # skip already donated
            if (
                target_id
                in user_donations
            ):
                continue

            scores[target_id] = (

                scores.get(
                    target_id,
                    0
                )

                + score
            )

    # popularity boost
    for rid in scores:

        scores[rid] += (

            0.1 *

            popularity.get(rid, 0)
        )

    ranked = sorted(

        scores.items(),

        key=lambda x: x[1],

        reverse=True
    )

    top_ids = [
        r[0]
        for r in ranked[:k]
    ]

    return (

        requests_df[
            requests_df["id"]
            .isin(top_ids)
        ]

        .to_dict(
            orient="records"
        )
    )

# =========================
# API
# =========================
@app.get("/")
def root():

    return {
        "message":
            "AI Recommendation Service Running"
    }

# =========================
# GET RECOMMENDATIONS
# =========================
@app.get("/recommend/{user_id}")
def get_recommendations(
    user_id: int,
    k: int = 5
):

    try:

        results = recommend(
            user_id,
            k
        )

        return {

            "user_id":
                user_id,

            "count":
                len(results),

            "recommendations":
                results
        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)
        )

# =========================
# RELOAD MODEL
# =========================
@app.post("/reload")
def reload_model():

    global requests_df
    global donations_df
    global sim_matrix
    global popularity

    (
        requests_df,
        donations_df
    ) = load_data()

    sim_matrix = build_model(
        requests_df
    )

    popularity = (
        compute_popularity(
            donations_df
        )
    )

    return {
        "message":
            "Model reloaded successfully"
    }