## Meal Planner & Shopping List Web App

This project is a small full‑stack meal planner that:
- Loads meals from a local CSV file
- Generates a random N‑day plan with no repeats
- Filters by energy level (Low / Medium / High / Extra High)
- Produces a consolidated shopping list grouped by ingredient category

### Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite), plain CSS
- **Data Source**: `mealRepo.csv` flat file (no database)

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
- The CSV file `data/mealRepo.csv` is the only data source; there is no database.
- The frontend communicates with the backend via JSON over REST using Axios (`frontend/src/api.js`).
- Energy level filtering and re‑roll logic ensure no repeated meals within a plan.

