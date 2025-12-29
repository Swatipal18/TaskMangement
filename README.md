# Task Management System

A comprehensive web-based task management application built with React. This application allows users to create, manage, and track tasks across different statuses, assign them to team members, and maintain user profiles.

## Features

### Task Management
- Create new tasks with title, description, assignee, and status
- View all tasks in a card layout with visual indicators for different statuses
- Update task status (Pending → In Progress → Completed)
- Edit or delete existing tasks
- Search and filter tasks by title, status, or assignee

### User Management
- Create and manage user profiles
- Assign tasks to specific team members
- Track who is responsible for each task

### Dashboard
- View task statistics (total, pending, in progress, completed)
- See recent tasks at a glance
- Monitor team member count

### UI Features
- Clean, modern interface with responsive design
- Color-coded status indicators
- User-friendly forms with validation
- Smooth navigation between different sections

## Getting Started

### Prerequisites
- Node.js (version 14.0 or later)
- npm (version 6.0 or later)

### Installation

1. Clone this repository to your local machine:
```bash
git clone https://github.com/yourusername/task-management-system.git
cd task-management-system
```

2. Install the required dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/        # Reusable UI components
│   └── Navigation.js  # Navigation sidebar component
├── pages/             # Application pages
│   ├── Dashboard.js   # Statistics and overview
│   ├── TaskList.js    # View all tasks with filters
│   ├── CreateTask.js  # Task creation form
│   ├── EditTask.js    # Task editing form
│   └── UserManagement.js # User creation and management
├── App.js             # Main application component with routing
└── App.css            # Application styles
```

## Technologies Used

- **React**: Frontend library
- **React Router**: Navigation and routing
- **localStorage**: Client-side data persistence
- **CSS3**: Styling with responsive design
- **React Icons**: Icon library for UI elements

## State Management

The application uses React's useState and useEffect hooks for state management:

- Tasks and users are stored in local state and persisted to localStorage
- Forms implement validation for data integrity
- Filter system allows for dynamically filtering tasks based on user input

## Future Improvements

- Implement drag-and-drop interface for changing task status
- Add due dates for tasks and calendar view
- Implement more detailed task statistics and reporting
- Add authentication and user roles
- Create team groups and assign tasks to teams

## License

This project is licensed under the MIT License - see the LICENSE file for details.