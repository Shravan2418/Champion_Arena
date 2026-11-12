# Champion Arena – Updated Interactive Login Page

## Included
- Your newly supplied transparent Champion Arena trophy-and-laurel logo, used in the navbar.
- The supplied student-learning artwork used as a CSS background layer (not as a flattened screenshot of the page).
- Real React form controls, role tabs, password visibility, remember-me behavior, validation, loading state and frontend navigation.
- Updated Poppins / Montserrat typography, bold italic headline, larger feature typography and improved navbar logo sizing.
- Username input placeholder: **Enter your username**.

## Run
```bash
npm install
npm run dev
```
Open the Vite URL, usually `http://localhost:5173/login`.

## Frontend-only behavior
The login action is simulated locally. It does not authenticate against a backend or store the password. Google sign-in is an informational placeholder. Register, Forgot Password and dashboard routes are frontend placeholders.


## Registration page
- Route: `/register`
- Required fields: Full Name, Email Address, Password, Confirm Password
- Optional fields: College / University, Institution Code, Student ID / Roll Number, Department, Course / Programme, Academic Year
- Includes password visibility toggles, dropdowns, client-side validation, password confirmation, loading and feedback states.
- Header active-state styling switches between Login and Register based on the current page.
- Registration remains frontend-only; no account is sent to a backend.
