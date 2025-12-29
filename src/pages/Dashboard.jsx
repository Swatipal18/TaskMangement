import { useState, useEffect } from 'react';
import { FaTasks, FaSpinner, FaCheck, FaUserFriends } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Dashboard({ tasks, users }) {
    const [stats, setStats] = useState({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0
    });

    const [recentTasks, setRecentTasks] = useState([]);

    useEffect(() => {
        // Calculate task statistics
        const totalTasks = tasks.length;
        const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
        const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
        const completedTasks = tasks.filter(task => task.status === 'Completed').length;

        setStats({
            totalTasks,
            pendingTasks,
            inProgressTasks,
            completedTasks
        });

        // Get 5 most recent tasks
        const sorted = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTasks(sorted.slice(0, 5));
    }, [tasks]);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="stats-container">
                <div className="stat-card total">
                    <div className="stat-icon"><FaTasks /></div>
                    <div className="stat-content">
                        <h3>Total Tasks</h3>
                        <p className="stat-number">{stats.totalTasks}</p>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon"><FaSpinner /></div>
                    <div className="stat-content">
                        <h3>Pending</h3>
                        <p className="stat-number">{stats.pendingTasks}</p>
                    </div>
                </div>

                <div className="stat-card in-progress">
                    <div className="stat-icon"><FaSpinner className="spinning" /></div>
                    <div className="stat-content">
                        <h3>In Progress</h3>
                        <p className="stat-number">{stats.inProgressTasks}</p>
                    </div>
                </div>

                <div className="stat-card completed">
                    <div className="stat-icon"><FaCheck /></div>
                    <div className="stat-content">
                        <h3>Completed</h3>
                        <p className="stat-number">{stats.completedTasks}</p>
                    </div>
                </div>

                <div className="stat-card users">
                    <div className="stat-icon"><FaUserFriends /></div>
                    <div className="stat-content">
                        <h3>Team Members</h3>
                        <p className="stat-number">{users.length}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="recent-tasks">
                    <div className="section-header">
                        <h2>Recent Tasks</h2>
                        <Link to="/tasks" className="view-all">View All</Link>
                    </div>

                    {recentTasks.length > 0 ? (
                        <div className="task-list">
                            {recentTasks.map(task => (
                                <div key={task.id} className={`task-card ${task.status.toLowerCase().replace(' ', '-')}`}>
                                    <h3>{task.title}</h3>
                                    <p className="description">{task.description}</p>
                                    <div className="task-meta">
                                        <span className={`status-badge ${task.status.toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </span>
                                        <span className="assignee">
                                            Assigned to: {users.find(user => user.id === parseInt(task.assignee))?.name || 'Unassigned'}
                                        </span>
                                    </div>
                                    <Link to={`/tasks/edit/${task.id}`} className="edit-link">Edit Task</Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No tasks created yet. <Link to="/tasks/create">Create your first task</Link>.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;