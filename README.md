# 🏥 Integrated National Health Information System (INHIS)

[![Django](https://img.shields.io/badge/Backend-Django-092e20?style=for-the-badge&logo=django)](https://www.djangoproject.com/)
[![Vite](https://img.shields.io/badge/Frontend-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

--- 
* An enterprise-grade national digital platform designed to integrate public healthcare stakeholders into a unified, real-time ecosystem. From **Supply Chain Management** to **Disease Surveillance**, INHIS ensures data-driven decision-making for public health.
* [Live Demo](national-health-portal.vercel.app)
* [Demo Video](https://youtu.be/T0tmpmn-bko)
* [Slide Show](https://canva.link/wv3wg9ancpbhri9)
---
## Live Demo Login Details
* [Access the demo here](national-health-portal.vercel.app)
* Admin ID: 2000, Citizen ID: 1343, Healthcare Worker: 41

## 🚀 Key Modules

### 👤 Citizen Healthcare Portal
* **Digital Health ID:** Secure registration using Aadhar/Govt ID.
* **Longitudinal Records:** Unified medical history including prescriptions, lab results, and vaccination status.
* **Appointment Engine:** Real-time booking at the nearest available health center.

### 📦 Medical Supply Chain
* **Inventory Tracking:** Separate warehouse and center-level management for vaccines and medicines.
* **Smart Alerts:** Automated tracking of **expiry dates** and stock levels to prevent wastage.

### 🏥 Hospital & Workforce Management
* **Resource Monitoring:** Real-time tracking of bed availability (General, Emergency, ICU).
* **Inter-facility Transfers:** Streamlined workflows for patient transfers between hospitals.
* **Lab Integration:** Direct linking of digital lab results to patient profiles.

### 📊 Disease Surveillance & Analytics
* **Geographic Reporting:** Real-time case reporting by verified healthcare workers.
* **Heatmaps:** Visual tracking of disease spread across different regions.

---

## 🛠️ Technical Stack & Implementation

- **Frontend:** Built with **Vite** for optimized build times and a responsive **React** UI.
- **Backend:** **Django** framework handling complex business logic and user authentication.
- **Database:** **MySQL**
  - **Transaction Management:** Ensures atomicity in critical operations like vaccine stock deductions and patient transfers.
  - **Database Triggers:** Implemented for automated record-keeping and data integrity checks (e.g., preventing expired medicine dispensing).

---

## 🔮 Future Roadmap
* **Machine Learning:** Predictive analysis for demand surges and outbreak forecasting.
* **Advanced Visualizations:** Interactive heat maps for disease severity.
* **Vendor Portals:** Direct access for suppliers to manage prices and logistics.

---

## 👥 The Team
* **Anup Dev Pattnaik** (2024091)
* **Atharva Singh Velpula** (2024138)
* **Mayank Yadav** (2024343)

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/inhis-project.git
   ```
2. **Backend Setup:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
