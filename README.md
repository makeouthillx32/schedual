# CMS Schedule App

The CMS Schedule App is a task scheduling platform designed to simplify the process of managing jobs for multiple businesses. It uses a dynamic job randomization feature and integrates modern UI components with a dark mode toggle for better user experience.

---

## Features

- **Dynamic Job Scheduling**:
  - Automatically assign random jobs to team members based on their availability.
- **Dark Mode Toggle**:
  - Seamless light and dark mode switching.
- **Dropdown Navigation**:
  - Includes a dropdown menu for accessing home, schedule, and settings.
- **Real-time Updates**:
  - Displays current date and time in the dropdown menu.
- **Modern UI**:
  - Designed using Tailwind CSS and Radix UI for a clean, responsive interface.
- **Next.js Framework**:
  - Built on Next.js for fast and efficient server-side rendering.

---

## To-Do List

- [x] Implement job randomization feature.
- [x] Add dropdown menu for navigation.
- [x] Include a dark mode toggle.
- [ ] Add user authentication for restricted access.
- [ ] Implement a calendar view for better schedule visualization.
- [ ] Develop a settings page for user preferences.
- [ ] Allow job data to be exported as reports.
- [ ] Deploy to production for public access.

---

## How to Build and Run Locally

1. **Clone the Repository**:
   Clone the project from GitHub to your local machine.

   ```bash
   git clone https://github.com/your-username/cms-schedule-app.git
   cd cms-schedule-app
Install Dependencies: Install the required npm packages.

bash
Copy code
npm install
Environment Setup: Create a .env.local file in the root directory and configure the following environment variables:

env
Copy code
NEXT_PUBLIC_SUPABASE_URL=[INSERT YOUR SUPABASE URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT YOUR SUPABASE ANON KEY]
Run the Development Server: Start the app on your local machine.

bash
Copy code
npm run dev
The app will now be running at http://localhost:3000.

Building for Production: Build the app for production.

bash
Copy code
npm run build
Start the production server.

bash
Copy code
npm start
Feedback and Issues
If you encounter any issues or have suggestions for improvement, feel free to create an issue in the repository or contact Me.

License
This project is open-source and available under the MIT License.

 &#8203;:contentReference[oaicite:0]{index=0}&#8203;
