import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../Services/api';

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit= async(e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        console.log("hello");

        try {
           const res = await api.post("/register", {
                name,
                email,
                password
            });

            console.log("masuk");

            console.log(res);

            const token = res.data.data.token;
            const username = res.data.data.name;

            localStorage.setItem("token", token);
            localStorage.setItem("name", username);

            navigate("/pages");
        } catch (err) {
            const data = err.response?.data;

            if(data?.errors) {
                const message = Object.values(data.errors).flat().join(" | ");
                setError(message);
            } else if(data?.message) {
                setError(data.message);
            } else if(err.message) {
                setError(err.message)
            } else {
                setError("terjadi kesalahan");
            }
        } finally {
            setError(false);
        }
    }

    return (
        <div className="auth-panel auth-panel--right">
            {error && (
                <div className="form-error">{error}</div>
            )}

            <div className="auth-card">

                <div className="auth-card__header">
                    <h1 className="auth-card__title">Create Account</h1>
                    <p className="auth-card__subtitle">Start building your pages today</p>
                </div>

                <form className="auth-card__body" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            className="form-input"
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            type="text"
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            autoComplete="name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            className="form-input"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} // form-input--error
                            type="email"
                            id="email"
                            name="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            className="form-input"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                        <span className="form-hint">Minimum 8 characters</span>
                    </div>

                    <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
                        {loading ? "Creating account" : "Create Account"}
                    </button>

                </form>

                <div className="auth-card__footer">
                    <span>Already have an account?</span>
                    <Link to="/">Sign in</Link>
                </div>

            </div>
        </div>
    )
}
