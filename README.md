# EcoMap API

## Motivation and Project Objectives
EcoMap is an environmental problem reporting and monitoring API designed to help communities in Mozambique (initially focusing on Maputo) identify, report, and monitor environmental hazards. The goal is to provide a reliable backend platform to track issues like illegal garbage dumping, blocked drainage channels, and water pollution, ultimately facilitating community cleanup and civic action.

## Target Users and Use Cases
* **Citizens:** Can report environmental problems, providing a description, category, and precise geographical coordinates.
* **Administrators/Local Authorities:** Can monitor the reports, update the resolution status (e.g., from `pending` to `in_progress`), and manage community users.

## Technologies Used
* **Node.js & Express.js:** Backend runtime and web framework.
* **MongoDB Atlas & Mongoose:** Cloud database and Object Data Modeling (ODM).
* **Swagger UI (OpenAPI 3.0):** Interactive API documentation.
* **Render:** Cloud hosting and deployment platform.
* **Jest & Supertest:** Automated testing framework.

## Installation and Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/ecomap.git](https://github.com/YOUR_USERNAME/ecomap.git)
   cd ecomap