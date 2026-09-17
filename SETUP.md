# Sasta OLX — Setup Guide

This guide explains how to set up and run the Sasta OLX project locally after cloning the private GitHub repository.

---

## 1. Prerequisites

Install the following:

* Git
* Python 3.12+
* Node.js and npm
* PostgreSQL 18.x
* Access to the project's Firebase project

Verify the installations:

```powershell
git --version
python --version
node --version
npm --version
psql --version
```

---

# 2. Clone the Repository

The repository is private, so you must be added as a GitHub collaborator before cloning.

```powershell
git clone https://github.com/Jaydeep-Sarkar-10/idk.git
cd idk
```

Project structure:

```text
idk/
├── backend/
└── frontend/
```

---

# 3. Backend Setup

## 3.1 Go to the Backend

```powershell
cd backend
```

## 3.2 Create a Virtual Environment

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell does not allow activation, you can use the virtual environment's Python directly:

```powershell
.\venv\Scripts\python.exe manage.py runserver
```

---

## 3.3 Install Backend Dependencies

```powershell
python -m pip install --upgrade pip
pip install django djangorestframework psycopg psycopg-binary django-cors-headers djangorestframework-simplejwt python-dotenv firebase-admin
```

---

# 4. PostgreSQL Setup

Make sure PostgreSQL is installed and running.

Create the project database:

```sql
CREATE DATABASE sasta_olx;
```

The backend uses:

```text
Database: sasta_olx
User: postgres
Host: localhost
Port: 5432
```

**Important:** Do not modify the `finwise_db` database. It belongs to another project.

---

# 5. Backend Environment Variables

Create:

```text
backend/.env
```

Use this structure:

```env
DB_NAME=sasta_olx
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_POSTGRES_PASSWORD
DB_HOST=localhost
DB_PORT=5432

FIREBASE_SERVICE_ACCOUNT_PATH=firebase-adminsdk.json
```

Replace:

```text
YOUR_LOCAL_POSTGRES_PASSWORD
```

with the PostgreSQL password configured on your own computer.

### Important

Do **not** commit `.env` to GitHub.

The repository already ignores environment files.

---

# 6. Firebase Admin Credentials

Google authentication requires Firebase Admin SDK credentials on the Django backend.

You need the Firebase service-account JSON file from the project owner.

Place it here:

```text
backend/firebase-adminsdk.json
```

The structure should be:

```text
backend/
├── firebase-adminsdk.json
├── manage.py
├── accounts/
└── config/
```

The `.env` file should contain:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-adminsdk.json
```

### ⚠️ Security

**Never commit or publicly share ****`firebase-adminsdk.json`****.**

It contains a private service-account credential and is intentionally ignored by Git.

---

# 7. Run Django Migrations

From the `backend` directory:

```powershell
python manage.py migrate
```

Then check the Django project:

```powershell
python manage.py check
```

You should see:

```text
System check identified no issues
```

---

# 8. Start the Django Backend

From:

```text
backend/
```

run:

```powershell
python manage.py runserver
```

The backend normally runs at:

```text
http://127.0.0.1:8000/
```

Keep this terminal running.

---

# 9. Frontend Setup

Open a **new terminal**.

From the project root:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

---

# 10. Frontend Environment Variables

Create:

```text
frontend/.env
```

The Firebase web configuration should be provided by the project owner.

Use the following structure:

```env
VITE_FIREBASE_API_KEY=YOUR_VALUE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_VALUE
VITE_FIREBASE_PROJECT_ID=YOUR_VALUE
VITE_FIREBASE_STORAGE_BUCKET=YOUR_VALUE
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_VALUE
VITE_FIREBASE_APP_ID=YOUR_VALUE
VITE_FIREBASE_MEASUREMENT_ID=YOUR_VALUE
```

Do not commit `frontend/.env` to GitHub.

---

# 11. Start the React Frontend

From:

```text
frontend/
```

run:

```powershell
npm run dev
```

Vite will display the local URL, normally:

```text
http://localhost:5173/
```

---

# 12. Running the Full Project

You need two terminals.

### Terminal 1 — Django

```powershell
cd "path\to\idk\backend"
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

### Terminal 2 — React

```powershell
cd "path\to\idk\frontend"
npm run dev
```

Then open the URL provided by Vite.

---

# 13. Authentication

Sasta OLX supports:

* Email/password signup
* Email/password login
* Google login
* Firebase Authentication
* Django server-side Firebase token verification
* Django JWT authentication
* Logout
* Protected API requests

The authentication flow is:

```text
Google
   ↓
Firebase Authentication
   ↓
React receives Firebase ID token
   ↓
Django verifies Firebase ID token
   ↓
Django finds/creates User
   ↓
Django issues JWT
   ↓
React is authenticated
```

Firebase is used for Google identity verification, while Django remains the application's main authentication/API system.

---

# 14. Testing Google Login

Before testing Google authentication, make sure:

* Firebase Google Sign-In is enabled.
* `frontend/.env` contains the Firebase configuration.
* `backend/firebase-adminsdk.json` exists.
* `backend/.env` contains the Firebase service-account path.
* Django is running.
* React is running.
* Your Google account is allowed by the Firebase project configuration.

Test Google login from both:

* Login page
* Signup page

---

# 15. Important Files Not Stored in Git

The following files are intentionally excluded from GitHub:

```text
backend/.env
frontend/.env
backend/firebase-adminsdk.json
backend/db.sqlite3
```

If these files are missing after cloning, that is expected.

Create/configure them locally.

**Do not add them manually with ****`git add -f`****.**

---

# 16. Check Git Before Committing

Run:

```powershell
git status
```

Review your changes:

```powershell
git diff
```

You can verify that sensitive files are ignored:

```powershell
git check-ignore -v backend/.env
git check-ignore -v frontend/.env
git check-ignore -v backend/firebase-adminsdk.json
git check-ignore -v backend/db.sqlite3
```

These files should be reported as ignored.

---

# 17. Team Git Workflow

Both developers should avoid making changes directly on `main`.

Create a feature branch:

```powershell
git checkout -b your-feature-name
```

For example:

```powershell
git checkout -b marketplace-listings
```

Make your changes, then:

```powershell
git status
git add .
git commit -m "Add marketplace listings"
git push -u origin marketplace-listings
```

Then create a Pull Request on GitHub.

After review, merge the Pull Request into `main`.

---

# 18. Starting New Work

Before starting a new feature:

```powershell
git checkout main
git pull origin main
```

Then create a new branch:

```powershell
git checkout -b new-feature-name
```

Example:

```powershell
git checkout -b product-details
```

---

# 19. Useful Git Commands

Check current branch:

```powershell
git branch
```

Check repository status:

```powershell
git status
```

Get the latest changes:

```powershell
git pull origin main
```

Create a new branch:

```powershell
git checkout -b feature-name
```

Switch branches:

```powershell
git checkout branch-name
```

Stage changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Your commit message"
```

Push:

```powershell
git push
```

---

# 20. Troubleshooting

## PostgreSQL password error

If you see:

```text
password authentication failed for user "postgres"
```

check:

```text
backend/.env
```

Make sure:

```env
DB_NAME=sasta_olx
DB_USER=postgres
DB_PASSWORD=YOUR_LOCAL_POSTGRES_PASSWORD
DB_HOST=localhost
DB_PORT=5432
```

Also make sure PostgreSQL is running.

---

## Database does not exist

If Django says that `sasta_olx` does not exist:

```sql
CREATE DATABASE sasta_olx;
```

Then run:

```powershell
python manage.py migrate
```

---

## Firebase Admin error

Make sure this file exists:

```text
backend/firebase-adminsdk.json
```

And this is present in `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=firebase-adminsdk.json
```

Do not rename or edit the service-account JSON.

---

## Frontend cannot connect to backend

Make sure Django is running:

```powershell
python manage.py runserver
```

And React is running:

```powershell
npm run dev
```

Check the API configuration in:

```text
frontend/src/services/api.js
frontend/src/api/auth.js
```

---

# 21. New Developer Checklist

After cloning the repository:

* [ ] Get GitHub collaborator access
* [ ] Clone the repository
* [ ] Install Python
* [ ] Install Node.js
* [ ] Install PostgreSQL
* [ ] Create `sasta_olx` database
* [ ] Create Python virtual environment
* [ ] Install backend dependencies
* [ ] Create `backend/.env`
* [ ] Get `firebase-adminsdk.json` securely
* [ ] Run Django migrations
* [ ] Run Django system check
* [ ] Create `frontend/.env`
* [ ] Run `npm install`
* [ ] Start Django
* [ ] Start React
* [ ] Test email/password authentication
* [ ] Test Google authentication

---

# 22. Security Rules

Never commit or publicly share:

* PostgreSQL passwords
* Firebase Admin service-account JSON/private keys
* `.env` files containing secrets
* Server-side API secrets

If a secret is accidentally committed to GitHub, treat it as compromised and rotate/revoke it immediately.

---

## Project Status

The project currently uses:

```text
Frontend:
React + Vite + Firebase Authentication

Backend:
Django + Django REST Framework

Database:
PostgreSQL

Authentication:
Email/Password + Google/Firebase + Django JWT
```