## Meal Planner & Shopping List Web App

This project is a small full‑stack meal planner that:
- Loads meals from a local CSV file
- Generates a random N‑day plan with no repeats (with smart ingredient overlap for the last 1–2 meals)
- Filters by energy level (Low / Medium / High / Extra High)
- Produces a consolidated shopping list grouped by ingredient category
- Uses Groq to suggest new meals in the same CSV schema and optionally append them to the repo

### Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite), plain CSS
- **Data Source**: `backend/data/mealRepo.csv` flat file (no database)

---

## Project Structure

- **backend**: FastAPI app, business logic, and CSV data
- **frontend**: React single‑page app built with Vite

---

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The FastAPI server will run on `http://localhost:8000`.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will typically run on `http://localhost:5173`.

---

## Development Notes

- All business logic (randomizer, filtering, shopping list generation) lives in `meal_service.py`.
- The CSV file `backend/data/mealRepo.csv` is the only data source; there is no database.
- The frontend communicates with the backend via JSON over REST using Axios (`frontend/src/api.js`).
- Energy level filtering and re‑roll logic ensure no repeated meals within a plan.
- The **Suggest New Meals** feature uses the Groq API via the `/suggest` endpoint to propose new meals, and `/meals/append` to persist selected suggestions back into `backend/data/mealRepo.csv`. Set `GROQ_API_KEY` in `backend/.env` to enable it.

