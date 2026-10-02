# VajraNet – Deploy guide

Two folders:
- `frontend/`  → Next.js website → deploy on **Vercel**
- `backend/`   → FastAPI ML API (`ml/` + `data_pipeline/`) → deploy on **Render**

The project code is unchanged. Only env files, `backend/requirements.txt`
and this guide were added.

## 1. Backend on Render (do this first)
1. Push this whole folder to GitHub (or push `backend/` alone).
2. Render → New → Web Service → connect the repo.
3. Settings:
   - Root Directory: `backend`  (leave empty if `backend/` is its own repo)
   - Build Command:  `pip install -r requirements.txt`
   - Start Command:  `uvicorn serve:app --app-dir ml --host 0.0.0.0 --port $PORT`
4. Environment: add `PYTHON_VERSION` = `3.11.9` (other keys in `backend/.env.example` are optional).
5. Deploy, then open `https://YOUR-BACKEND.onrender.com/health` – it should return `"status":"ok"`.
   API docs: `/docs`.

## 2. Frontend on Vercel
1. Vercel → Add New → Project → import the repo.
2. Root Directory: `frontend`  (Framework: Next.js, auto-detected).
3. Environment Variables (use your Render URL, https, no trailing slash):
   - `NEXT_PUBLIC_ML_API_URL` = `https://YOUR-BACKEND.onrender.com`
   - `ML_API_URL`             = `https://YOUR-BACKEND.onrender.com`
   - `NEXT_PUBLIC_APP_NAME`   = `VajraNet`
4. Deploy. If you change an env value later, redeploy (values are baked in at build time).

## Run locally
Backend:  `cd backend && pip install -r requirements.txt && uvicorn serve:app --app-dir ml --port 8001`
Frontend: `cd frontend && npm install && npm run dev`  → http://localhost:3000
(`frontend/.env.local` already points to http://localhost:8001. If you upload
the folder to Vercel without Git, delete `.env.local` first so it can't
override the Render URL.)

## Notes
- Render free instances sleep after ~15 min idle; the first request can take ~1 min.
- The map uses free OpenStreetMap / Esri tiles – no map key needed.
- If the Render build runs out of memory because of `torch`, upgrade the instance size.
