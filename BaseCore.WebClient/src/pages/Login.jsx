import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate(String(result.role).toLowerCase() === 'admin' ? '/admin' : '/user', { replace: true });
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="login-page bg-light d-flex align-items-center justify-content-center min-vh-100">
            <div className="login-box" style={{ width: 360 }}>
                <div className="card card-outline card-primary shadow-sm">
                    <div className="card-header text-center bg-white">
                        <h1 className="h3 mb-0"><b>BaseCore</b> Tickets</h1>
                    </div>
                    <div className="card-body">
                        <p className="login-box-msg text-center text-muted">Sign in to start your session</p>

                        {error && (
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {error}
                                <button type="button" className="btn-close" aria-label="Close" onClick={() => setError('')} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <span className="input-group-text"><i className="fas fa-user" /></span>
                            </div>

                            <div className="input-group mb-3">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <span className="input-group-text"><i className="fas fa-lock" /></span>
                            </div>

                            <div className="row align-items-center">
                                <div className="col-7">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="remember" />
                                        <label className="form-check-label" htmlFor="remember">Remember me</label>
                                    </div>
                                </div>
                                <div className="col-5">
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm" aria-hidden="true" /> : 'Sign In'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
