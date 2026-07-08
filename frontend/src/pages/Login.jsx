import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const initialFormData = {
    email: '',
    password: '',
};

const Login = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/login`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            setStatusMessage(response.data.message || 'Login successful.');
            setFormData(initialFormData);
            
            // Store the token or session info if provided
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
            }

            // Redirect to home or dashboard
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            setStatusMessage(error.response?.data?.message || 'Unable to login right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="card" style={{ width: '60%', maxWidth: '60%', margin: '0 auto' }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <label className="form-field">
                    Email
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                    />
                </label>

                <label className="form-field">
                    Password
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </label>

                {statusMessage && (
                    <p role="status" style={{ margin: 0, color: statusMessage.includes('successful') ? 'green' : 'crimson' }}>
                        {statusMessage}
                    </p>
                )}

                <button type="submit" disabled={isSubmitting} style={{ width: 'fit-content', padding: '8px 16px' }}>
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Don't have an account?{' '}
                <Link to="/registration" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Register here
                </Link>
            </p>
        </section>
    );
};

export default Login;
