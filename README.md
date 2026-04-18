<div align="center">
  
# 🎌 SenseiSuggest 🎌

SenseiSuggest is a highly personalized, intelligent, and modern web application that redefines how you discover your next favorite anime. Built with a robust full-stack architecture, the platform combines a sophisticated hybrid machine learning engine with a sleek, responsive user interface to deliver a premium experience for anime enthusiasts and platform administrators alike.

---

</div>

<br/>

## ✨ Unique Selling Propositions (USPs) 

Discover what sets SenseiSuggest apart from traditional recommendation engines:

### 🧠 1. Hybrid Machine Learning Engine
Unlike basic recommendation systems that rely on a single algorithm, SenseiSuggest leverages a **Triple-Threat Approach** to generate highly accurate, multi-dimensional anime recommendations tailored to individual user tastes:
*   **Collaborative Filtering:** Anticipates your preferences based on the viewing patterns and ratings of similar users.
*   **Association Rule Mining:** Discovers hidden patterns in watch histories.
*   **Content-Based Filtering:** Recommends shows based on the attributes of anime you already love.

### 🌍 2. Geographical & Demographic Insights
SenseiSuggest goes beyond just tracking user preferences; it incorporates **location-based tracking** (handling countries, states, and cities) to understand viewership demographics globally. This enables powerful targeted analytics and regional trend discovery.

### 📊 3. Comprehensive Analytics & Admin Dashboard
A dedicated, powerful administration portal built with dynamic **Recharts** visualizations. Admins can monitor platform metrics, user engagement, demographic distribution, and manage the anime catalog.

### 📝 4. Personalized User & Content Management
SenseiSuggest offers a comprehensive suite of management tools tailored for both users and administrators. Users get granular control to curate their personalized watchlists, rate shows, and manage their anime journey effortlessly. Simultaneously, administrators can effortlessly maintain the platform's database with automated metadata fetching, bulk updates, and granular control over every anime title, genre, and season.

### 📓 5. Premium Anime Scrapbook (Shogun War-Journal)
SenseiSuggest features a state-of-the-art, physically-simulated digital scrapbook for every user. Dubbed the **"Shogun War-Journal"**, this feature allows users to:
*   **Visual Chronicle:** Capture and store personalized moments from their anime journey with screenshot logging.
*   **High-Fidelity Aesthetics:** Experience a weighted, 3D digital book with leather-bound covers, tea-stained parchment, and a realistic synthetic spiral binding.
*   **Progression & Rank:** The journal dynamically displays user-specific metadata, including their personalized **Otaku Rank** (from Samurai to Shogun) and a unique **Hanko** (traditional wax seal).
*   **Hand-Written Feel:** Featuring calligraphy-style typography and physical interaction physics for a truly immersive artifact experience.

<br/>

## 🛠️ Technology Stack

SenseiSuggest is built using modern, scalable, and high-performance technologies:

### 🎨 Frontend Architecture
*   **[React 19](https://react.dev/) & [Vite](https://vitejs.dev/):** A lightning-fast, modern, and lightweight frontend foundation.
*   **[Tailwind CSS](https://tailwindcss.com/) & PostCSS:** Utility-first styling for a highly responsive, beautiful, and consistent dark/light mode UI.
*   **[react-pageflip](https://github.com/nodlik/react-pageflip):** Powering the sophisticated 3D book physics and page-turning interactions of the Scrapbook.
*   **[Framer Motion](https://www.framer.com/motion/):** High-end micro-animations and interaction physics for a premium tactile feel.
*   **[Recharts](https://recharts.org/):** Declarative, dynamic data visualization for analytics and admin dashboards.
*   **React Router DOM:** Seamless client-side routing.

### ⚙️ Backend Architecture
*   **[FastAPI](https://fastapi.tiangolo.com/):** High-performance, asynchronous REST API framework powering the core endpoints.
*   **[Supabase](https://supabase.com/):** Backend-as-a-Service providing a powerful PostgreSQL database, real-time subscriptions, and secure authentication.
*   **Machine Learning Data Pipeline:** Utilizes **`pandas`**, **`numpy`**, **`scipy`**, and **`scikit-learn`** for processing datasets and generating recommendations.

<br/>

## 🎯 Core Features

*   **Personalized Discovery:** Get three layers of anime suggestions based on your unique watch history, ratings, and preferences.
*   **Catalog Filtering:** Browse the anime database with filters for genres to find exactly what you're looking for.
*   **User Profiles & Watchlists:** Create a personalized account, track your `Watching` queue, and log your `Completed` shows. Empower yourself with personal content management to curate your anime journey.
*   **3D Shogun Scrapbook:** A beautiful, physically-simulated journal that chronicles your anime journey with personalized ranks and hand-written entries.
*   **Granular Rating System:** Rate your favorite anime to continuously train and improve your future recommendations.
*   **Advanced Administrative Content Management:** Streamlined tools for administrators to add, edit, and manage anime titles, genres, and metadata efficiently.
*   **Full Admin Capabilities:** Complete CRUD operations for anime, genres, and seasons, alongside real-time platform statistics.

<br/>

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
Make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [Python](https://www.python.org/) 3.9+
*   [PostgreSQL](https://www.postgresql.org/) (or your preferred SQL database)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn core.main:app --reload --port 8001
   ```
   *The API documentation (Swagger UI) will be available at `http://localhost:8001/docs`.*

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM packages:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will launch in your default web browser.*

<br/>

## 🌟 Acknowledgments

Special thanks to @ARTISTART367 for feature recommendations and testing. 🎌📓

<br/>

## 🤝 Contributing
Contributions, issues, and feature requests are highly welcome! Feel free to check the issues page if you want to contribute to the codebase.