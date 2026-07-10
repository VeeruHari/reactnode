import { useState } from 'react';
import axios from 'axios';
import { Turnstile } from '@marsidev/react-turnstile';

const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    turnstileToken: '',
};

const Registration = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileError, setTurnstileError] = useState('');
    const [turnstileKey, setTurnstileKey] = useState(0);

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

        if (import.meta.env.PROD && !formData.turnstileToken) {
            setTurnstileError('Please complete the Turnstile challenge.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            setStatusMessage(response.data.message || 'Registration completed successfully.');
            setTurnstileError('');
            setFormData({ ...initialFormData, turnstileToken: '' });
            setTurnstileKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error('Registration form submission failed:', error);
            setStatusMessage(error.response?.data?.message || 'Unable to complete registration right now.');
            setFormData((prevData) => ({ ...prevData, turnstileToken: '' }));
            setTurnstileKey((prevKey) => prevKey + 1);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="card" style={{ width: '80%', maxWidth: '80%', margin: '0 auto' }}>
            <h2>Registration</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <div className="form-row">
                    <label className="form-field">
                        First Name
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            required
                        />
                    </label>

                    <label className="form-field">
                        Last Name
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                        />
                    </label>
                </div>

                <div className="form-row">
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
                        Phone
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(123) 456-7890"
                        />
                    </label>
                </div>

                <label className="form-field">
                    Password
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                    />
                </label>

                <Turnstile
                    key={turnstileKey}
                    id="registration-turnstile"
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY_REG}
                    onSuccess={(token) => {
                        setFormData((prevData) => ({ ...prevData, turnstileToken: token }));
                        setTurnstileError('');
                    }}
                    onError={() => {
                        setFormData((prevData) => ({ ...prevData, turnstileToken: '' }));
                        setTurnstileError('Turnstile verification failed. Please try again.');
                    }}
                    onExpire={() => {
                        setFormData((prevData) => ({ ...prevData, turnstileToken: '' }));
                        setTurnstileError('The Turnstile challenge expired. Please try again.');
                    }}
                    theme="light"
                />

                {turnstileError && (
                    <p style={{ margin: 0, color: 'crimson', fontSize: '0.9rem' }}>{turnstileError}</p>
                )}

                {statusMessage && (
                    <p role="status" style={{ margin: 0, color: statusMessage.includes('successfully') ? 'green' : 'crimson' }}>
                        {statusMessage}
                    </p>
                )}

                <button type="submit" disabled={isSubmitting} style={{ width: 'fit-content', padding: '8px 16px' }}>
                    {isSubmitting ? 'Registering...' : 'Register'}
                </button>
            </form>
        </section>
    );
};

export default Registration;
