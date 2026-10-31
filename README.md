# Swastik Properties

Backend API for the Swastik Properties platform.

## Backend stack

- Python 3.12
- Django 5.2 LTS
- Django REST Framework
- PostgreSQL (SQLite is used only as a no-configuration local fallback)
- SimpleJWT authentication
- drf-spectacular API schema/documentation

## Local setup (Windows PowerShell)

From the repository root:

```powershell
cd backend
py -3.12 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` and set a unique `DJANGO_SECRET_KEY`. Configure `DATABASE_URL` to a PostgreSQL database you have created. Until `DATABASE_URL` is set, development settings use SQLite.

Then run:

```powershell
python manage.py check
python manage.py makemigrations accounts
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Do not commit `.env`, database files, uploaded media, or secrets.

## Django applications

- `accounts`: authentication, users and access roles.
- `properties`: property inventory and property lifecycle.
- `locations`: reusable geographic data.
- `agents`: agent-specific business profile and assignments.
- `submissions`: public form submissions and administrator-only review/export.
- `common`: shared models and utilities.

## Project decisions

- There is no CMS.
- Administrators manage properties directly.
- Property deletion is permanent, subject to explicit handling of dependent records and uploaded files.
- Agents must not have access to form submission records or exports.
