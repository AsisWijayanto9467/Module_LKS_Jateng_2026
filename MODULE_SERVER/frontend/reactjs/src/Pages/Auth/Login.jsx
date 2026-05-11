import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../Services/api';

export default function Login() {
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
            const res = await api.post("/login", {
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
        <div className="auth-panel">
            <div className="auth-card">

            <div className="auth-card__header">
                <h1 className="auth-card__title">Sign In</h1>
                <p className="auth-card__subtitle">Enter your credentials to continue</p>
            </div>

            <form className="auth-card__body" onSubmit={handleSubmit}>

                <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
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
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input "
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                {/* <span className="form-error">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="6.5" cy="6.5" r="5.5" stroke="#c0392b" stroke-width="1.5"/>
                    <path d="M6.5 4v3" stroke="#c0392b" stroke-width="1.5" stroke-linecap="square"/>
                    <circle cx="6.5" cy="9" r="0.7" fill="#c0392b"/>
                    </svg>
                    The password you entered is incorrect.
                </span> */}
                </div>

                <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
                    {loading ? "Signing" : "Sign In"}
                </button>

            </form>

            <div className="auth-card__footer">
                <span>Don't have an account?</span>
                <Link to="/register">Create one</Link>
            </div>

            </div>
        </div>
    )
}
