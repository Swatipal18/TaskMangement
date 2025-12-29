import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useForm } from 'react-hook-form';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

// Define initial sample data
const initialUsers = localStorage.getItem('taskUsers')
    ? JSON.parse(localStorage.getItem('taskUsers'))
    : [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Designer' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Manager' }
    ];

const initialTasks = localStorage.getItem('tasks')
    ? JSON.parse(localStorage.getItem('tasks'))
    : [
        { id: 1, title: 'Complete UI Design', description: 'Finish the dashboard UI mockups', assignee: 1, status: 'Pending', createdAt: '2025-04-24' },
        { id: 2, title: 'API Integration', description: 'Connect frontend with backend APIs', assignee: 1, status: 'In Progress', createdAt: '2025-04-23' },
        { id: 3, title: 'User Testing', description: 'Conduct user testing sessions', assignee: 2, status: 'Completed', createdAt: '2025-04-22' },
        { id: 4, title: 'Bug Fixes', description: 'Fix reported issues in the navigation', assignee: 3, status: 'Pending', createdAt: '2025-04-21' }
    ];

// Statuses with their colors
const statuses = [
    { value: 'Pending', color: 'bg-warning text-dark', icon: 'bi-clock' },
    { value: 'In Progress', color: 'bg-info text-dark', icon: 'bi-arrow-repeat' },
    { value: 'Completed', color: 'bg-success text-white', icon: 'bi-check-circle' }
];

// Main App Component
export default function TaskManagementSystem() {
    const [tasks, setTasks] = useState(initialTasks);
    const [users, setUsers] = useState(initialUsers);
    const [searchQuery, setSearchQuery] = useState('');
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [activeTab, setActiveTab] = useState('tasks');

    // Save tasks and users to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('taskUsers', JSON.stringify(users));
    }, [tasks, users]);

    // Filter tasks based on search query
    const filteredTasks = tasks.filter(task => {
        const assignee = users.find(user => user.id === task.assignee);
        return (
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (assignee && assignee.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    });

    // Handle task creation or update
    const handleTaskSubmit = (taskData) => {
        if (isEditMode && currentTask) {
            // Update existing task
            setTasks(tasks.map(task => task.id === currentTask.id ? { ...taskData, id: currentTask.id } : task));
        } else {
            // Create new task
            const newTask = {
                ...taskData,
                id: Math.max(0, ...tasks.map(t => t.id)) + 1,
                createdAt: new Date().toISOString().slice(0, 10)
            };
            setTasks([...tasks, newTask]);
        }
        setShowTaskForm(false);
        setCurrentTask(null);
        setIsEditMode(false);
    };

    // Handle user creation or update
    const handleUserSubmit = (userData) => {
        if (isEditMode && currentUser) {
            // Update existing user
            setUsers(users.map(user => user.id === currentUser.id ? { ...userData, id: currentUser.id } : user));
        } else {
            // Create new user
            const newUser = {
                ...userData,
                id: Math.max(0, ...users.map(u => u.id)) + 1
            };
            setUsers([...users, newUser]);
        }
        setShowUserForm(false);
        setCurrentUser(null);
        setIsEditMode(false);
    };

    // Handle editing a task
    const handleEditTask = (task) => {
        setCurrentTask(task);
        setIsEditMode(true);
        setShowTaskForm(true);
    };

    // Handle editing a user
    const handleEditUser = (user) => {
        setCurrentUser(user);
        setIsEditMode(true);
        setShowUserForm(true);
    };

    // Handle deleting a task
    const handleDeleteTask = (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setTasks(tasks.filter(task => task.id !== taskId));
        }
    };

    // Handle deleting a user
    const handleDeleteUser = (userId) => {
        // Check if user has assigned tasks
        const hasAssignedTasks = tasks.some(task => task.assignee === userId);

        if (hasAssignedTasks) {
            alert('Cannot delete user with assigned tasks. Please reassign tasks first.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    // Update task status
    const updateTaskStatus = (taskId, newStatus) => {
        setTasks(tasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
    };

    // Task stats calculation
    const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Completed').length
    };

    return (
        <div className="task-management-container">
            {/* Navigation and header */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <div className="container">
                    <a className="navbar-brand fw-bold fs-3" href="#">TaskFlow</a>
                    <div className="ms-auto">
                        <div className="nav nav-tabs border-0">
                            <button
                                className={`nav-link ${activeTab === 'tasks' ? 'active text-white' : 'text-light'}`}
                                onClick={() => setActiveTab('tasks')}
                            >
                                Tasks
                            </button>
                            <button
                                className={`nav-link ${activeTab === 'users' ? 'active text-white' : 'text-light'}`}
                                onClick={() => setActiveTab('users')}
                            >
                                Users
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                {/* Dashboard Stats */}
                {activeTab === 'tasks' && (
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card">
                                <div className="card-body d-flex align-items-center">
                                    <div className="stat-icon bg-primary text-white me-3">
                                        <i className="bi bi-list-task"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Total Tasks</h6>
                                        <h3 className="fw-bold mb-0">{taskStats.total}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card">
                                <div className="card-body d-flex align-items-center">
                                    <div className="stat-icon bg-warning text-dark me-3">
                                        <i className="bi bi-clock"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Pending</h6>
                                        <h3 className="fw-bold mb-0">{taskStats.pending}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card">
                                <div className="card-body d-flex align-items-center">
                                    <div className="stat-icon bg-info text-white me-3">
                                        <i className="bi bi-arrow-repeat"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">In Progress</h6>
                                        <h3 className="fw-bold mb-0">{taskStats.inProgress}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card">
                                <div className="card-body d-flex align-items-center">
                                    <div className="stat-icon bg-success text-white me-3">
                                        <i className="bi bi-check-circle"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-0">Completed</h6>
                                        <h3 className="fw-bold mb-0">{taskStats.completed}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Task Management Interface */}
                {activeTab === 'tasks' && (
                    <>
                        <div className="card mb-4">
                            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center">
                                <h5 className="mb-3 mb-md-0">Task Management</h5>
                                <div className="d-flex w-100 w-md-auto">
                                    <div className="input-group me-2 flex-grow-1 flex-md-grow-0">
                                        <span className="input-group-text">
                                            <i className="bi bi-search"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search tasks or assignees..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary d-flex align-items-center"
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setCurrentTask(null);
                                            setShowTaskForm(true);
                                        }}
                                    >
                                        <i className="bi bi-plus-circle me-1"></i>
                                        <span>Add Task</span>
                                    </button>
                                </div>
                            </div>

                            {/* Task Board with DnD */}
                            <div className="card-body">
                                <DndProvider backend={HTML5Backend}>
                                    <div className="row">
                                        {statuses.map(status => (
                                            <div className="col-md-4 mb-3 mb-md-0" key={status.value}>
                                                <TaskColumn
                                                    status={status}
                                                    tasks={filteredTasks.filter(task => task.status === status.value)}
                                                    users={users}
                                                    onDrop={(taskId) => updateTaskStatus(taskId, status.value)}
                                                    onEdit={handleEditTask}
                                                    onDelete={handleDeleteTask}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </DndProvider>
                            </div>
                        </div>

                        {/* Task Form Modal */}
                        {showTaskForm && (
                            <TaskForm
                                onClose={() => {
                                    setShowTaskForm(false);
                                    setIsEditMode(false);
                                    setCurrentTask(null);
                                }}
                                onSubmit={handleTaskSubmit}
                                users={users}
                                task={currentTask}
                                isEdit={isEditMode}
                            />
                        )}
                    </>
                )}

                {/* User Management Interface */}
                {activeTab === 'users' && (
                    <>
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">User Management</h5>
                                <button
                                    className="btn btn-primary d-flex align-items-center"
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setCurrentUser(null);
                                        setShowUserForm(true);
                                    }}
                                >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    <span>Add User</span>
                                </button>
                            </div>

                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Assigned Tasks</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="avatar-circle bg-primary text-white me-2">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>{user.name}</div>
                                                        </div>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className="badge bg-info text-dark">{user.role}</span>
                                                    </td>
                                                    <td>
                                                        {tasks.filter(task => task.assignee === user.id).length}
                                                    </td>
                                                    <td className="text-end">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="btn btn-sm btn-outline-danger"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* User Form Modal */}
                        {showUserForm && (
                            <UserForm
                                onClose={() => {
                                    setShowUserForm(false);
                                    setIsEditMode(false);
                                    setCurrentUser(null);
                                }}
                                onSubmit={handleUserSubmit}
                                user={currentUser}
                                isEdit={isEditMode}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Task Column Component for DnD
function TaskColumn({ status, tasks, users, onDrop, onEdit, onDelete }) {
    const [{ isOver }, drop] = useDrop({
        accept: 'task',
        drop: (item) => onDrop(item.id),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    return (
        <div
            ref={drop}
            className={`task-column ${isOver ? 'column-drop-active' : ''}`}
        >
            <div className="task-column-header">
                <div className={`status-indicator ${status.color}`}>
                    <i className={`bi ${status.icon}`}></i>
                    <span>{status.value}</span>
                    <span className="ms-2 badge bg-secondary">{tasks.length}</span>
                </div>
            </div>

            <div className="task-list">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        users={users}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="empty-column">
                        <p className="text-muted text-center">No tasks in this column</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Task Card Component with DnD
function TaskCard({ task, users, onEdit, onDelete }) {
    const assignee = users.find(user => user.id === task.assignee);
    const statusConfig = statuses.find(s => s.value === task.status);

    const [{ isDragging }, drag] = useDrag({
        type: 'task',
        item: { id: task.id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`task-card ${isDragging ? 'is-dragging' : ''}`}
        >
            <div className="task-header">
                <h6 className="task-title">{task.title}</h6>
                <div className="task-actions">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(task);
                        }}
                        className="btn btn-sm btn-link text-primary"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        className="btn btn-sm btn-link text-danger"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-footer">
                <div className="task-assignee">
                    <div className="avatar-circle bg-secondary text-white">
                        {assignee ? assignee.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <span>{assignee ? assignee.name : 'Unassigned'}</span>
                </div>
                <span className={`badge ${statusConfig.color}`}>
                    <i className={`bi ${statusConfig.icon} me-1`}></i>
                    {task.status}
                </span>
            </div>
        </div>
    );
}

// Task Form Component using react-hook-form
function TaskForm({ onClose, onSubmit, users, task, isEdit }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            title: task ? task.title : '',
            description: task ? task.description : '',
            assignee: task ? task.assignee : users.length > 0 ? users[0].id : '',
            status: task ? task.status : 'Pending'
        }
    });

    const onFormSubmit = (data) => {
        // Convert assignee to number
        data.assignee = parseInt(data.assignee, 10);
        onSubmit(data);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEdit ? 'Edit Task' : 'Create New Task'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Task Title*</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    {...register("description")}
                                ></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Assignee</label>
                                <select
                                    className="form-select"
                                    {...register("assignee")}
                                >
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    {...register("status")}
                                >
                                    {statuses.map(status => (
                                        <option key={status.value} value={status.value}>
                                            {status.value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                {isEdit ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// User Form Component using react-hook-form
function UserForm({ onClose, onSubmit, user, isEdit }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: user ? user.name : '',
            email: user ? user.email : '',
            role: user ? user.role : 'Team Member'
        }
    });

    const roles = ['Developer', 'Designer', 'Manager', 'Team Member', 'QA', 'Product Owner'];

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{isEdit ? 'Edit User' : 'Create New User'}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit(onFormSubmit)}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Name*</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    {...register("name", { required: "Name is required" })}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email*</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    {...register("role")}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                {isEdit ? 'Update User' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}   