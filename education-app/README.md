# Education Systems Explorer

A classroom-themed interactive data visualization tool.

## Setup

1.  Navigate to the project directory:
    ```bash
    cd education-app
    ```

2.  Install dependencies:
    ```bash
    npm install recharts lucide-react clsx tailwind-merge framer-motion
    # Or if using pnpm
    # pnpm install recharts lucide-react clsx tailwind-merge framer-motion
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

-   **Interactive Classroom**: Click on students to reveal questions.
-   **Data Visualizations**: Dynamic charts on the whiteboard.
-   **Filters**: Sidebar to filter data by Country and Subject.
-   **Chalkboard Theme**: Custom styling for an immersive experience.

## Architecture

-   **Framework**: Next.js 15+ (App Router)
-   **Styling**: Tailwind CSS + Custom CSS Variables
-   **Charts**: Recharts
-   **Icons**: Lucide React
-   **Animations**: Framer Motion
