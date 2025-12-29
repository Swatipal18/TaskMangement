import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function EditTask({ tasks, updateTask, users }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [taskData, setTaskData] = useState({
        title: '',
        description: '',
        assignee: '',
        status: 'Pending'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const task = tasks.find(t => t.id === parseInt(id));
        if (task) {
            setTaskData(task);
        } else {
            navigate('/tasks');
        }
    }, [id, tasks, navigate]);

    const validate = () => {
        const newErrors = {};
        if (!taskData.title.trim()) newErrors.title = 'Title is required';
        if (!taskData.description.trim()) newErrors.description = 'Description is required';
        if (!taskData.assignee) newErrors.assignee = 'Please select an assignee';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            updateTask(taskData);
            navigate('/tasks');
        }
    };

    return (
        <div className="edit-task">
            <h1>Edit Task</h1>

            <form onSubmit={handleSubmit} className="task-form">
                <div className="form-group">
                    <label htmlFor="title">Task Title*</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={taskData.title}
                        onChange={handleChange}
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description*</label>
                    <textarea
                        id="description"
                        name="description"
                        value={taskData.description}
                        onChange={handleChange}
                        rows="4"
                        className={errors.description ? 'error' : ''}
                    ></textarea>
                    {errors.description && <div className="error-message">{errors.description}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="assignee">Assignee*</label>
                    <select
                        id="assignee"
                        name="assignee"
                        value={taskData.assignee}
                        onChange={handleChange}
                        className={errors.assignee ? 'error' : ''}
                    >
                        <option value="">Select an assignee</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                    {errors.assignee && <div className="error-message">{errors.assignee}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={taskData.status}
                        onChange={handleChange}
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/tasks')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Update Task
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditTask;