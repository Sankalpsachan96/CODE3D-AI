# 🚀 CODE3D AI - 100% Free Cloud Deployment & Live Database Guide

This guide explains how to make your **Frontend**, **Backend**, and **Relational Database** 100% Live on the internet for **FREE** with public HTTPS URLs!

---

## 🏗️ Architecture Overview

```
[ User on Mobile / Laptop Anywhere in the World ]
                       │
                       ▼
        [ Live Frontend on Vercel ]
        URL: https://code3d-ai.vercel.app
                       │
                       ▼ (HTTPS API Calls)
        [ Live Backend on Render ]
        URL: https://code3d-backend.onrender.com
                       │
                       ▼ (JDBC SQL Connection)
  [ Live Cloud Database (Neon / Supabase / Aiven) ]
```

---

## ⚡ Step 1: Create a Free Live Cloud Database (Takes 2 minutes)

You can choose either **PostgreSQL** or **MySQL** (both drivers are already installed in your backend):

### Option A: Neon.tech (Recommended - Free Serverless PostgreSQL)
1. Go to [https://neon.tech](https://neon.tech) and sign up with GitHub/Google.
2. Click **"Create Project"** (e.g. `code3d-db`).
3. In the Dashboard, choose **Connection String** $\rightarrow$ select **Java/JDBC**.
4. Copy the connection string:
   - Example: `jdbc:postgresql://ep-summer-pool-12345.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - Note down:
     - **Database URL**: `jdbc:postgresql://ep-.../neondb?sslmode=require`
     - **Username**: (e.g. `neondb_owner`)
     - **Password**: `your_neon_password`

### Option B: Aiven.io (Free Managed MySQL)
1. Go to [https://aiven.io](https://aiven.io) and create a free tier MySQL instance.
2. Note the Host, Port, Username, and Password.
3. JDBC URL format: `jdbc:mysql://<host>:<port>/defaultdb?sslmode=require`

---

## ⚡ Step 2: Push your Code to GitHub

Open terminal in the project root:
```bash
git init
git add .
git commit -m "Complete CODE3D AI with Multi-language, Auth, and Cloud DB support"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/CODE3D-AI.git
git push -u origin main
```

---

## ⚡ Step 3: Deploy Backend on Render.com (100% Free)

1. Go to [https://render.com](https://render.com) and log in with GitHub.
2. Click **"New +"** $\rightarrow$ **"Web Service"**.
3. Select your repository: `CODE3D-AI`.
4. Fill in the settings:
   - **Name**: `code3d-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker` *(Render will automatically detect the Dockerfile we created!)*
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-.../neondb?sslmode=require` |
   | `SPRING_DATASOURCE_USERNAME` | `your_db_username` |
   | `SPRING_DATASOURCE_PASSWORD` | `your_db_password` |
6. Click **"Create Web Service"**.
7. Render will build the container and give you a public URL like:
   👉 **`https://code3d-backend.onrender.com`**

---

## ⚡ Step 4: Deploy Frontend on Vercel (100% Free)

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your repository: `CODE3D-AI`.
4. In the configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and select `frontend`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_BACKEND_URL` | `https://code3d-backend.onrender.com/api` |
6. Click **"Deploy"**!
7. Within 60 seconds, your site will be live at:
   👉 **`https://code3d-ai.vercel.app`**

---

## 🎉 Done! Your Entire Project is Live!
- Anyone around the world can open the Vercel link on their phone or laptop.
- Code executions and 3D visualizer will communicate with your live Render backend.
- Users, registrations, and quiz scores will be permanently stored in your live cloud database!
