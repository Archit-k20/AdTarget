# AdTarget Pro 🎯

A full-stack advertisement management platform built with **Spring Boot** and **React**. AdTarget Pro allows users to seamlessly create, discover, and manage digital advertisements with high-resolution image support powered by **MinIO** (S3-compatible object storage).

## ✨ Features

* **Secure Authentication:** JWT-based stateless authentication with automatic token refreshing via Axios interceptors.
* **Ad Management:** Full CRUD (Create, Read, Update, Delete) capabilities for user-owned advertisements.
* **Media Storage:** Robust image uploading and serving using a self-hosted MinIO container.
* **Interactive Discovery:** * Keyword search across titles, descriptions, and tags.
  * Like (toggle) and view counter systems.
  * Sorting and pagination for browsing all ads.
* **User Profiles:** Personalized dashboard tracking total ads created and lifetime likes received.
* **Modern UI:** Responsive, gradient-styled interface built with Tailwind CSS and custom Toast notifications.

## 🛠️ Tech Stack

**Frontend**
* React 18
* React Router DOM (v6)
* Tailwind CSS
* Axios (with custom interceptors)
* Lucide React (Icons)

**Backend**
* Java / Spring Boot 3
* Spring Security 6 (JWT)
* Spring Data JPA / Hibernate
* MinIO Java SDK

**Infrastructure**
* MySQL 8.0 (Database)
* MinIO (Object Storage)
* Docker & Docker Compose

---

## 🚀 Getting Started

Follow these steps to get a local development environment up and running.

### Prerequisites
* **Docker Desktop** (Make sure the Docker engine is running)
* **Java 17+** * **Node.js 18+** ### 1. Clone the repository
```bash
2. Start the Infrastructure (Database & Storage)
The project includes a docker-compose.yml file that spins up both MySQL and MinIO with pre-configured health checks and persistent volumes.

Bash
docker-compose up -d
Note: MinIO is accessible at http://localhost:9001 (Username: minioadmin / Password: minioadmin). The backend automatically creates the adtarget-bucket and configures public read policies on startup.

3. Start the Spring Boot Backend
Navigate to the backend directory and run the Spring Boot application using the Maven wrapper.

Bash
cd backend
./mvnw clean spring-boot:run
The backend will start on http://localhost:8081.

4. Start the React Frontend
Open a new terminal window, navigate to the frontend directory, install the dependencies, and start the development server.

Bash
cd frontend
npm install
npm start
The frontend will start on http://localhost:3000.

📡 API Overview
The backend exposes a secure REST API. Swagger/OpenAPI documentation is available (when the backend is running) at:
👉 http://localhost:8081/swagger-ui.html

Key Endpoints:

POST /api/auth/register - Register a new user

POST /api/auth/authenticate - Login & receive JWT

POST /api/auth/refresh - Issue a new JWT using an existing valid token

GET /api/ads - Fetch paginated ads (Public)

POST /api/ads - Create a new ad with a multipart image (Protected)

GET /api/users/me - Fetch logged-in user's profile and stats (Protected)

📸 Screenshots
(Add screenshots of your application here!)

Screenshot 1: The Ad creation form with drag-and-drop.

Screenshot 2: The "All Ads" grid view.

Screenshot 3: The User Profile statistics page.

🛡️ License
This project is licensed under the MIT License - see the LICENSE file for details.


### How to use this:
1. Open your `README.md` file in the root of your project.
2. Replace everything inside it with the Markdown code above.
3. **Important:** Find the URL under "1. Clone the repository" and change `YOUR_USERNAME` to your actual GitHub username.
4. Save the file.
5. Push the update to GitHub:
   ```bash
   git add README.md
   git commit -m "docs: add professional README"
   git push origin main
git clone [https://github.com/YOUR_USERNAME/AdTargetPro.git](https://github.com/YOUR_USERNAME/AdTargetPro.git)
cd AdTargetPro
