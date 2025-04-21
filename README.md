# CMS Schedule App

**Version 2 – Home Page Update**

The CMS Schedule App is a scheduling and client management platform designed to simplify the process of managing jobs, schedules, and custom settings for multiple businesses. It includes a modern homepage, admin dashboard, and real-time data management powered by Supabase and Next.js.

---

## Features

- **Dynamic Job Scheduling**  
  Automatically assigns jobs to team members based on availability.

- **Dark Mode Toggle**  
  Seamless light and dark mode switching for better accessibility.

- **Dropdown Navigation**  
  Includes a dropdown menu with options for Home, Schedule, and Settings.

- **Real-time Time/Date**  
  Displays live date and time in the dropdown.

- **Modern UI Components**  
  Built with Tailwind CSS and Radix UI for a sleek, responsive interface.

- **Next.js Framework**  
  Fast server-side rendering and API integration.

- **Static Asset Optimization**  
  Images are now served from `/public/images/home/` using static `<img>` tags.

- **Business Cleaning Schedule Settings**  
  Admins can now customize business cleaning days via the CMS settings panel.

- **Secure Sign-In Flow (V2)**  
  Implemented a route-based login system that reflects authentication state without requiring a page refresh.

---

## To-Do List

- [x] Implement job randomization feature  
- [x] Add dropdown menu for navigation  
- [x] Include a dark mode toggle  
- [x] Add business cleaning day settings page  
- [x] Replace `<Image>` components with static `<img>` for better control  
- [x] Build and deploy Version 2 Home Page update  
- [x] Create a secure login flow with live dropdown state updates  
- [x] Add user authentication for restricted access  
- [ ] Add "Sign in with Google" or third-party provider login (button hidden for now)  
- [ ] Implement a calendar view for better schedule visualization  
- [ ] Develop a settings page for user preferences  
- [ ] Allow job data to be exported as Excel reports  
- [ ] Store form progress and purge old entries via cron job  
- [ ] Deploy public site and admin dashboard to production  
- [ ] Add Docker and Kubernetes integration for self-hosting  

---

## Goals for Future Versions

- Add Excel report generation using `ExcelJS` + TypeScript  
- Enable automatic form progress saving to Supabase  
- Schedule background purges using Supabase Edge Functions or external cron  
- Add client-specific settings pages for more granular control  
- Implement mobile-friendly navigation and layouts  
- Add localization support using `next-intl`  
- Integrate with Supabase Storage for uploading and downloading documents  
- Support self-hosted deployments with Docker and Kubernetes  

---

## How to Build and Run Locally

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/cms-schedule-app.git
   cd cms-schedule-app
  


2. **Install Dependencies**
   ```bash
   npm install
   

3. **Environment Setup**  
   Create a \`.env.local\` file in the root directory and add the following:

    ```env
   NEXT_PUBLIC_SUPABASE_URL=[INSERT YOUR SUPABASE URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT YOUR SUPABASE ANON KEY]
   

4. **Run the Development Server**
   ```bash
   npm run dev
   \`\`\`
   Visit [http://localhost:3000](http://localhost:3000) to view the app.

5. **Build for Production**
   ```bash
   npm run build
   npm start
   

---

## Feedback and Issues

If you encounter issues or want to suggest improvements, create a GitHub issue or reach out directly.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
EOF

