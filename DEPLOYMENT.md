# Deployment

The API runs on **Render** (free web service) and the frontend on **Vercel** (Hobby).
The browser calls the Render API directly; CORS is open because the API is public and read-only.

```
Vercel (static React app)  ──fetch──▶  Render (FastAPI, serves backend/bundle/)
```

## Why the API serves a bundle

The full pipeline loads ~150 MB of parquet data and a ~150 MB Random Forest model.
Neither is in git, and together they need more memory than Render's free 512 MB instance.
`backend/bundle/` (about 4 MB, committed) holds everything the API returns,
precomputed from the full data and models:

| File | Contents |
|---|---|
| `latest.parquet` | Latest row per station with each model's probability |
| `details.parquet` | Latest complete feature row per station with probabilities |
| `history.parquet` | Last 365 days of history per station |
| `meta.json` | Dataset date range, thresholds, test metrics, feature importance |

The deployed API needs only `fastapi`, `uvicorn`, `pandas`, `numpy` and `pyarrow`.

### Rebuilding the bundle

Do this whenever the processed data, the models or the evaluation CSV change:

```powershell
.venv\Scripts\python.exe -m pip install -r backend/requirements-build.txt
.venv\Scripts\python.exe -m backend.build_bundle
```

Commit `backend/bundle/` and push; Render redeploys automatically.

When `backend/bundle/` is absent, the API falls back to computing it in memory
from `data/` and `models/`, so local development still works without building it.

## 1. Backend on Render

1. Push this repository to GitHub, with these changes merged into `main`
   (`render.yaml` deploys from `main`).
2. Go to <https://dashboard.render.com> → **New** → **Blueprint**, connect GitHub and pick
   `Devexhhh/flood-prediction-india`. Render reads `render.yaml` and proposes the
   `flood-prediction-india-api` web service on the **Free** plan. Click **Apply**.
3. Wait for the first build (a few minutes), then open
   `https://<your-service>.onrender.com/api/health`. It should return
   `{"status":"ok", ..., "assets_loaded": true}`.
4. Copy the service URL, for example `https://flood-prediction-india-api.onrender.com`.
   Render adds a suffix if that name is taken, so use the URL it shows you.

Settings from `render.yaml`:

| Setting | Value |
|---|---|
| Build | `pip install -r backend/requirements.txt` |
| Start | `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT` |
| Health check | `/api/health` |
| Python | `3.14.7` (`PYTHON_VERSION`) |
| Region | Singapore (closest free region to India) |
| `CORS_ORIGINS` | `*`; optionally set to your Vercel URL |

**Free-tier note:** the service sleeps after 15 minutes without traffic and takes
roughly 30–60 seconds to wake. The landing page pings `/api/health` on load to start
waking it, and the dashboard tells visitors when the server is starting.

## 2. Frontend on Vercel

1. Go to <https://vercel.com/new> and import `Devexhhh/flood-prediction-india`.
2. Set **Root Directory** to `frontend`. Vercel detects Vite; `frontend/vercel.json`
   sets the install, build and output settings.
3. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `VITE_API_BASE_URL` | Your Render URL, without a trailing slash |

4. Click **Deploy**. Open the site and go to the dashboard; the first load may wait for
   Render to wake.

`VITE_API_BASE_URL` is baked in at build time. If you change it, redeploy on Vercel.
Routing uses URL hashes (`#/dashboard/...`), so no rewrite rules are needed.

### Optional: lock CORS to your site

Once the Vercel URL is known, set `CORS_ORIGINS` on Render to it, for example
`https://flood-prediction-india.vercel.app`. Separate several origins with commas.
Preview deployments use other URLs, so leave it as `*` if you want those to work.

## Local development

```powershell
.venv\Scripts\python.exe -m uvicorn backend.app.main:app --port 8000
```

```powershell
npm --prefix frontend run dev
```

Leave `VITE_API_BASE_URL` unset locally; Vite proxies `/api` to port 8000.
