# Swastik Properties

Backend API for the Swastik Properties platform.

## Backend stack

- Python 3.12
- Django 5.2 LTS
- Django REST Framework
- PostgreSQL for the target deployment database
- SQLite as a no-configuration local development fallback
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

Edit `backend/.env` and set a unique `DJANGO_SECRET_KEY`. Generate one with:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

For the first local check, leave `DATABASE_URL=` empty; the development settings then use SQLite. When PostgreSQL is installed and the database/user have been created, set `DATABASE_URL` to the PostgreSQL connection string.

Then run:

```powershell
python manage.py check
python manage.py makemigrations accounts
python manage.py migrate
python manage.py test apps.accounts
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
