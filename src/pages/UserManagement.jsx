import { useState } from 'react';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

function UserManagement({ users, addUser, updateUser, deleteUser }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: ''
    });
    const [errors, setErrors] = useState({});

    const resetForm = () => {
        setFormData({ name: '', email: '', role: '' });
        setErrors({});
    };

    const handleShowAddForm = () => {
        resetForm();
        setShowAddForm(true);
        setEditingUserId(null);
    };

    const handleEditUser = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role
        });
        setEditingUserId(user.id);
        setShowAddForm(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.role.trim()) newErrors.role = 'Role is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
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
            if (editingUserId) {
                updateUser({
                    id: editingUserId,
                    ...formData
                });
            } else {
                addUser(formData);
            }

            setShowAddForm(false);
            resetForm();
            setEditingUserId(null);
        }
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(userId);
        }
    };

    return (
        <div className="user-management">
            <div className="page-header">
                <h1>User Management</h1>
                <button className="btn btn-primary" onClick={handleShowAddForm}>
                    <FaUserPlus /> Add New User
                </button>
            </div>

            {showAddForm && (
                <div className="user-form-container">
                    <h2>{editingUserId ? 'Edit User' : 'Add New User'}</h2>
                    <form onSubmit={handleSubmit} className="user-form">
                        <div className="form-group">
                            <label htmlFor="name">Name*</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <div className="error-message">{errors.email}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role*</label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={errors.role ? 'error' : ''}
                                placeholder="e.g. Developer, Designer, Manager"
                            />
                            {errors.role && <div className="error-message">{errors.role}</div>}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setShowAddForm(false);
                                resetForm();
                                setEditingUserId(null);
                            }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {editingUserId ? 'Update User' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="users-grid">
                {users.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-info">
                            <h3>{user.name}</h3>
                            <p className="user-email">{user.email}</p>
                            <p className="user-role">{user.role}</p>
                        </div>
                        <div className="user-actions">
                            <button className="btn btn-edit" onClick={() => handleEditUser(user)}>
                                <FaEdit /> Edit
                            </button>
                            <button className="btn btn-delete" onClick={() => handleDeleteUser(user.id)}>
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {users.length === 0 && (
                <div className="no-users">
                    <p>No users found. Please add a user to get started.</p>
                    <button className="btn btn-primary" onClick={handleShowAddForm}>
                        <FaUserPlus /> Add New User
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserManagement;