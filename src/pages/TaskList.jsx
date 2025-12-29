import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';

// Task Card component without drag and drop library
function TaskCard({ task, users, deleteTask, disabled }) {
    const dragRef = useRef(null);
    const handleDragStart = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        // Set data transfer with task ID
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';

        // For better visual appearance during drag
        setTimeout(() => {
            e.target.style.opacity = '0.4';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
    };

    return (
        <div
            ref={dragRef}
            className={`task-card ${task.status.toLowerCase().replace(' ', '-')}`}
            draggable={!disabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
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
            <div className="task-actions">
                <div className="action-buttons">
                    <Link to={`/tasks/edit/${task.id}`} className="btn btn-edit">
                        <FaEdit /> Edit
                    </Link>
                    <button
                        className="btn btn-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this task?')) {
                                deleteTask(task.id);
                            }
                        }}
                    >
                        <FaTrash /> Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// DropZone component for better drop detection
function DropZone({ columnId, title, children, onDrop }) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!isOver) setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);

        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId && onDrop) {
            onDrop(parseInt(taskId), columnId);
        }
    };

    return (
        <div
            className={`task-column ${isOver ? 'drag-over' : ''}`}
            data-column-id={columnId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <h2 className="column-title">{title}</h2>
            <div className="task-list">
                {children}
                {children && children.length === 0 && (
                    <div className="empty-column">No tasks</div>
                )}
            </div>
        </div>
    );
}

// Confirmation Dialog component
function ConfirmationDialog({ isOpen, message, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-dialog">
                <p>{message}</p>
                <div className="confirmation-buttons">
                    <button className="btn btn-confirm" onClick={onConfirm}>Yes, move it</button>
                    <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
}

// Toast notification component
function Toast({ message, isVisible, type = 'success' }) {
    if (!isVisible) return null;

    return (
        <div className={`toast-notification ${type}`}>
            {type === 'success' && <FaCheck className="toast-icon" />}
            <span>{message}</span>
        </div>
    );
}

// Main TaskBoard component
function TaskBoard({ tasks, users, updateTask, deleteTask }) {
    // Group tasks by status
    const [pendingTasks, setPendingTasks] = useState([]);
    const [inProgressTasks, setInProgressTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    // State for confirmation dialog
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingTaskMove, setPendingTaskMove] = useState(null);

    // State for toast notification
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterAssignee, setFilterAssignee] = useState('All');

    // Filter and sort tasks into columns
    useEffect(() => {
        const filteredTasks = tasks.filter(task => {
            // Apply search filter
            const matchesSearch =
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.description.toLowerCase().includes(searchTerm.toLowerCase());

            // Apply assignee filter
            const matchesAssignee = filterAssignee === 'All' || task.assignee === filterAssignee;

            return matchesSearch && matchesAssignee;
        });

        setPendingTasks(filteredTasks.filter(task => task.status === 'Pending'));
        setInProgressTasks(filteredTasks.filter(task => task.status === 'In Progress'));
        setCompletedTasks(filteredTasks.filter(task => task.status === 'Completed'));
    }, [tasks, searchTerm, filterAssignee]);

    // Get status name from column
    const getStatusFromColumn = (columnId) => {
        return columnId === 'pending' ? 'Pending' :
            columnId === 'inProgress' ? 'In Progress' : 'Completed';
    };

    // Handle drop event
    const handleDrop = (taskId, targetColumnId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Get source column from task's current status
        const sourceColumnId = task.status === 'Pending' ? 'pending' :
            task.status === 'In Progress' ? 'inProgress' : 'completed';

        // Don't do anything if dropped in the same column
        if (sourceColumnId === targetColumnId) return;

        // Implement movement restrictions
        // 1. Can't move tasks out of completed
        if (sourceColumnId === 'completed') {
            showToast("Can't move tasks out of Completed", "error");
            return;
        }

        // 2. Can't move from in progress back to pending
        if (sourceColumnId === 'inProgress' && targetColumnId === 'pending') {
            showToast("Can't move tasks from In Progress back to Pending", "error");
            return;
        }

        // Get the new status
        const newStatus = getStatusFromColumn(targetColumnId);

        // Only show confirmation if status is changing
        if (task.status !== newStatus) {
            setPendingTaskMove({
                task,
                newStatus,
                sourceColumnId,
                targetColumnId
            });
            setShowConfirmation(true);
        }
    };

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });

        // Auto-hide toast after 3 seconds
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Handle confirmation of task move
    const handleConfirmMove = () => {
        if (pendingTaskMove) {
            const { task, newStatus } = pendingTaskMove;
            updateTask({
                ...task,
                status: newStatus
            });

            // Show success toast
            showToast(`Task "${task.title}" moved to ${newStatus} successfully!`);
        }
        setShowConfirmation(false);
        setPendingTaskMove(null);
    };

    // Handle cancellation of task move
    const handleCancelMove = () => {
        setShowConfirmation(false);
        setPendingTaskMove(null);
    };

    // Generate confirmation message
    const getConfirmationMessage = () => {
        if (!pendingTaskMove) return '';

        const { task, newStatus } = pendingTaskMove;
        return `Are you sure you want to move "${task.title}" from ${task.status} to ${newStatus}?`;
    };

    return (
        <div className="task-board-page">
            <div className="page-header">
                <h1>Task Board</h1>
                <Link to="/tasks/create" className="btn btn-primary">Create New Task</Link>
            </div>

            <div className="filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-controls">
                    <div className="filter-group">
                        <label>Assignee:</label>
                        <select
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                        >
                            <option value="All">All Assignees</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id.toString()}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="task-columns">
                <DropZone
                    columnId="pending"
                    title="Pending"
                    onDrop={handleDrop}
                >
                    {pendingTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            deleteTask={deleteTask}
                            disabled={false}
                        />
                    ))}
                </DropZone>

                <DropZone
                    columnId="inProgress"
                    title="In Progress"
                    onDrop={handleDrop}
                >
                    {inProgressTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            deleteTask={deleteTask}
                            disabled={false}
                        />
                    ))}
                </DropZone>

                <DropZone
                    columnId="completed"
                    title="Completed"
                    onDrop={handleDrop}
                >
                    {completedTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            users={users}
                            deleteTask={deleteTask}
                            disabled={true}
                        />
                    ))}
                </DropZone>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmation}
                message={getConfirmationMessage()}
                onConfirm={handleConfirmMove}
                onCancel={handleCancelMove}
            />

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                isVisible={toast.visible}
                type={toast.type}
            />

            {/* CSS for styling */}
            <style jsx>{`
                .task-board-page {
                    position: relative;
                    padding: 20px;
                }
                
                .task-columns {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                    min-height: 400px;
                }
                
                .task-column {
                    flex: 1;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 15px;
                    background-color: #f9f9f9;
                    min-height: 300px;
                    transition: all 0.2s ease;
                }
                
                .column-title {
                    margin-top: 0;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e0e0e0;
                    text-align: center;
                }
                
                .task-column.drag-over {
                    border-color: #4a90e2;
                    background-color: rgba(74, 144, 226, 0.1);
                    box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
                }
                
                .task-card {
                    background: white;
                    border-radius: 6px;
                    padding: 12px;
                    margin-bottom: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    cursor: grab;
                    user-select: none;
                }
                
                .task-card:active {
                    cursor: grabbing;
                }
                
                .task-card h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                
                .task-card.completed {
                    opacity: 0.8;
                    background-color: #f0f0f0;
                }
                
                .task-meta {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 0.9em;
                }
                
                .status-badge {
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.8em;
                    font-weight: bold;
                }
                
                .status-badge.pending {
                    background-color: #ffd54f;
                    color: #5f4f24;
                }
                
                .status-badge.in-progress {
                    background-color: #64b5f6;
                    color: #1a4971;
                }
                
                .status-badge.completed {
                    background-color: #81c784;
                    color: #2e5931;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }
                
                .btn {
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: none;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.9em;
                    text-decoration: none;
                }
                
                .btn-edit {
                    background-color: #64b5f6;
                    color: white;
                }
                
                .btn-delete {
                    background-color: #e57373;
                    color: white;
                }
                
                .empty-column {
                    color: #999;
                    text-align: center;
                    padding: 20px;
                    font-style: italic;
                }
                
                /* Confirmation Dialog */
                .confirmation-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .confirmation-dialog {
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    max-width: 400px;
                    width: 90%;
                }
                
                .confirmation-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .btn-confirm {
                    background-color: #4CAF50;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                .btn-cancel {
                    background-color: #f44336;
                    color: white;
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                
                /* Toast Notification */
                .toast-notification {
                    position: fixed;
                    top: 10%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background-color: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1100;
                    animation: fadeIn 0.3s, fadeOut 0.3s 2.7s;
                    max-width: 80%;
                }
                
                .toast-notification.success {
                    border-left: 4px solid #4CAF50;
                }
                
                .toast-notification.error {
                    border-left: 4px solid #f44336;
                }
                
                .toast-icon {
                    color: #4CAF50;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translate(-50%, -60%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; transform: translate(-50%, -50%); }
                    to { opacity: 0; transform: translate(-50%, -40%); }
                }
            `}</style>
        </div>
    );
}

export default TaskBoard;