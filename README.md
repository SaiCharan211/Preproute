# PrepRoute App

PrepRoute is a world-class educational platform designed to help students prepare for exams through structured subjects, topics, and practice tests.

## 🚀 Tech Stack

- **Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **API Client:** [Axios](https://axios-http.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## ✨ Features

- **Authentication:** Secure login flow with JWT token management and persistent sessions using Zustand and LocalStorage.
- **API Integration:** Centralized Axios instance with request/response interceptors for automatic token injection and handling 401 (Unauthorized) redirects.
- **Test Engine:** Interfaces for complex test structures including Subjects, Topics, Sub-Topics, and various Question types.
- **Responsive UI:** Modern design built with Tailwind CSS.

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd preproute-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your API base URL:
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

### Development

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Build

To create a production-ready build:
```bash
npm run build
```

## 📁 Project Structure

- `src/api`: Axios configuration and interceptors.
- `src/store`: Global state management (Auth, etc.).
- `src/types`: TypeScript interfaces and domain models.