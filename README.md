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
git clone [https://github.com/YOUR_USERNAME/AdTargetPro.git](https://github.com/YOUR_USERNAME/AdTargetPro.git)
cd AdTargetPro
