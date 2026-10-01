# How to Run Himalaya Plast Factory OS (HPOS)

This repository contains **two distinct applications** that power the Himalaya Plast Operations System. Depending on which architecture you are testing or deploying, follow the instructions below to get them running locally.

---

## 1. Option A: Next.js + PostgreSQL (Custom Web App)
Located in the `/hpos-app` directory, this is the modern, standalone web application built with Next.js 15, React 19, Tailwind CSS, and Prisma.

### Prerequisites
- Node.js 20+
- PostgreSQL 16+ running on port 5432

### Steps to Run
1. **Navigate to the app directory:**
   ```bash
   cd hpos-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Create a `.env` file in the `hpos-app` folder (or copy from `.env.example`) and add your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hpos_db?schema=public"
   ```
4. **Set up the Database & Seed Data:**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run seed
   ```
5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
6. **Access the App:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.
   - **Test Email:** `test_founder@hpos.local` (or `param@himalayaplast.com`)
   - **Password:** `Password123!`

---

## 2. Option B: Frappe / ERPNext (Enterprise Backend)
Located in the `/hpos_extensions` directory, this is the Python/MariaDB backend built on the Frappe Framework, designed to integrate with ERPNext and India Compliance.

### Prerequisites
- WSL2 (Ubuntu) if on Windows, or native Linux/macOS
- Python 3.12, Node.js 20, MariaDB, Redis
- Frappe Bench installed

### Steps to Run
1. **Start the Bench Environment:**
   Open your WSL/Ubuntu terminal and start the Frappe bench background services:
   ```bash
   cd /home/param/hpos-bench
   bench start
   ```
   *(This starts the web server on port 8000, worker threads, and Redis)*

2. **Access the Frappe Desk:**
   Open [http://localhost:8000/login](http://localhost:8000/login) in your browser.
   - **Admin Username:** `Administrator`
   - **Admin Password:** `admin`
   
   *Or use role-specific test accounts:*
   - **Founder:** `test_founder@hpos.local` (Password: `Password123!`)
   - **Machine Operator:** `test_operator1@hpos.local` (Password: `Password123!`)

### Automated Tests (Frappe)
To run the automated regression suite for the Frappe app, open a new WSL terminal window:
```bash
cd /home/param/hpos-bench
bench --site hpos.local execute hpos_extensions.api.deploy_verify.run_full_regression
```

---

## Port Matrix Summary
| Application | Tech Stack | Local URL |
|---|---|---|
| **HPOS Web App** | Next.js, Prisma, PostgreSQL | `http://localhost:3000` |
| **ERPNext Backend** | Frappe, MariaDB, Python | `http://localhost:8000` |
