import React, { useEffect, useState } from 'react';
import { userApi } from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', name: '', email: '', phone: '', position: '', userType: 0, isActive: true });
    const [error, setError] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await userApi.getAll({ keyword, page, pageSize });
            setUsers(response.data.data || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalCount(response.data.totalCount || 0);
        } catch (err) {
            console.error('Failed to load users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadUsers();
    };

    const openModal = (user = null) => {
        setEditingUser(user);
        setFormData(user ? {
            username: user.username,
            password: '',
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            position: user.position || '',
            userType: user.userType || 0,
            isActive: user.isActive,
        } : {
            username: '',
            password: '',
            name: '',
            email: '',
            phone: '',
            position: '',
            userType: 0,
            isActive: true,
        });
        setError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (editingUser) {
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    position: formData.position,
                    userType: parseInt(formData.userType),
                    isActive: formData.isActive,
                };
                if (formData.password) updateData.password = formData.password;
                await userApi.update(editingUser.id, updateData);
            } else {
                if (!formData.password) {
                    setError('Password is required for new user');
                    return;
                }
                await userApi.create({
                    username: formData.username,
                    password: formData.password,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    position: formData.position,
                    userType: parseInt(formData.userType),
                });
            }

            closeModal();
            loadUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await userApi.delete(id);
            loadUsers();
        } catch {
            alert('Failed to delete user');
        }
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <>
            <div className="content-header mb-3">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6"><h1 className="m-0">Users Management</h1></div>
                        <div className="col-sm-6"><button className="btn btn-success float-sm-end" type="button" onClick={() => openModal()}><i className="fas fa-plus me-1" /> Add User</button></div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <form className="row g-2" onSubmit={handleSearch}>
                        <div className="col-md-10">
                            <input className="form-control" placeholder="Search by name, email, phone..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <button className="btn btn-primary w-100" type="submit"><i className="fas fa-search me-1" /> Search</button>
                        </div>
                    </form>
                </div>
                <div className="card-body table-responsive p-0">
                    {loading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
                    ) : (
                        <table className="table table-hover table-striped mb-0">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td className="text-center text-muted py-4" colSpan="7">No users found</td></tr>
                                ) : users.map((user) => (
                                    <tr key={user.id}>
                                        <td><strong>{user.username}</strong></td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.phone}</td>
                                        <td><span className={`badge ${user.userType === 1 ? 'bg-danger' : 'bg-info'}`}>{user.userType === 1 ? 'Admin' : 'User'}</span></td>
                                        <td><span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                                        <td className="text-end">
                                            <button className="btn btn-sm btn-primary me-2" onClick={() => openModal(user)} type="button"><i className="fas fa-edit" /></button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id)} type="button"><i className="fas fa-trash" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <span>Total: {totalCount} users</span>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}><button className="page-link" type="button" onClick={() => setPage(page - 1)}>Previous</button></li>
                            {pageNumbers.map((pageNumber) => (
                                <li className={`page-item ${page === pageNumber ? 'active' : ''}`} key={pageNumber}>
                                    <button className="page-link" type="button" onClick={() => setPage(pageNumber)}>{pageNumber}</button>
                                </li>
                            ))}
                            <li className={`page-item ${page === totalPages || totalPages === 0 ? 'disabled' : ''}`}><button className="page-link" type="button" onClick={() => setPage(page + 1)}>Next</button></li>
                        </ul>
                    </nav>
                </div>
            </div>

            {showModal && (
                <div className="modal d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,.5)' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingUser ? 'Edit User' : 'Add User'}</h5>
                                    <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
                                </div>
                                <div className="modal-body">
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="row">
                                        <div className="col-md-6 mb-3"><label className="form-label">Username</label><input className="form-control" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required disabled={!!editingUser} /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Password {editingUser && '(leave blank to keep current)'}</label><input className="form-control" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingUser} /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Name</label><input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Email</label><input className="form-control" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Phone</label><input className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Position</label><input className="form-control" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} /></div>
                                        <div className="col-md-6 mb-3"><label className="form-label">Role</label><select className="form-select" value={formData.userType} onChange={(e) => setFormData({ ...formData, userType: e.target.value })}><option value="0">User</option><option value="1">Admin</option></select></div>
                                        {editingUser && (
                                            <div className="col-md-6 mb-3 d-flex align-items-end">
                                                <div className="form-check">
                                                    <input className="form-check-input" id="activeUser" type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                                                    <label className="form-check-label" htmlFor="activeUser">Active</label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" type="button" onClick={closeModal}>Cancel</button>
                                    <button className="btn btn-primary" type="submit">{editingUser ? 'Update' : 'Create'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;
