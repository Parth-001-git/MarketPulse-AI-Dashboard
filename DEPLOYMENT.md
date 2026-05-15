# Deployment Guide - Phase 6

This guide provides step-by-step instructions for deploying the Market Intelligence Dashboard into a live, publicly accessible environment.

We will deploy the **Next.js Frontend** to **Vercel**, and the **FastAPI Backend** to **Render** (or Railway).

---

## 1. Deploying the Backend (FastAPI to Render)

Render is excellent for hosting Python web services out of the box using Infrastructure-as-Code (`render.yaml`).

### Steps
1. Push your entire project to a GitHub repository.
2. Sign in to [Render](https://render.com/) and click **New > Blueprint**.
3. Connect your GitHub repository. Render will automatically detect the `render.yaml` file included in the root directory.
4. **Environment Variables**:
   In the Render dashboard, navigate to the Environment section for your new Web Service.
   Add the following secret variables:
   - `OPENAI_API_KEY`: Your OpenAI key (if you want AI commentary enabled)
   - `ALLOWED_ORIGINS`: `["*"]` or specify your explicit Vercel frontend URL (e.g. `["https://market-intel.vercel.app"]`)
5. Click **Apply**. Render will install requirements (`pip install -r backend/requirements.txt`) and run the start command automatically.
6. Once deployed, note the Public URL for your backend (e.g. `https://market-intelligence-api.onrender.com`).

*Note: The `/metrics` endpoint is fully operational and exposed in production for scraping by external Prometheus setups.*

---

## 2. Deploying the Frontend (Next.js to Vercel)

Vercel provides a seamless, zero-config deployment process for Next.js applications. A `vercel.json` has been included in the `frontend` folder.

### Steps
1. Sign in to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub repository.
3. **Important**: Since the application is located in a subdirectory, set the **Root Directory** to `frontend`.
4. The framework will be automatically detected as Next.js.
5. **Environment Variables**:
   Add the following environment variable during setup:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: The Public URL of your deployed Render backend (e.g., `https://market-intelligence-api.onrender.com`). Ensure there is no trailing slash.
6. Click **Deploy**. Vercel will install dependencies, build the standalone output, and deploy your site.
7. Visit the generated Vercel URL to view your live application.

---

## 3. Production Readiness & Health Monitoring

### System Resilience
- **CORS Configuration**: The backend middleware is dynamically configured to accept cross-origin requests safely, either via wildcard `"*"` (with credentials stripped) or specifically targeted to the Vercel domain.
- **Worker Configuration**: The backend boots Uvicorn with `--workers 2` replacing the development `--reload` flag, enabling parallel request processing and ensuring stability under load.

### Live Health Tracking
The frontend features an **Operational Status Pane** that constantly pings the `/health` endpoint every 30 seconds. This allows you to visually verify the production connection across the open internet, measuring precise round-trip API latencies and assuring the backend is online.

---

## Troubleshooting

- **Frontend shows "Backend Offline"**: 
  - Double check your `NEXT_PUBLIC_API_URL` in the Vercel Dashboard. It must precisely match the Render URL, with `https://` prefix and no trailing `/`.
  - Check the backend logs in the Render dashboard for startup errors or missing dependencies.

- **CORS Errors in Browser Console**:
  - Ensure the backend `ALLOWED_ORIGINS` variable is either set to `["*"]` or correctly mirrors the Vercel deployment URL format like `["https://your-app.vercel.app"]`.

- **Missing AI Insights**:
  - Ensure `OPENAI_API_KEY` is securely set in the Render environment variables. The system will gracefully degrade to deterministic rule-engine outputs if the key is invalid or absent.
