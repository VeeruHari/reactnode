import { useState } from 'react';
import axios from 'axios';
import { Turnstile } from '@marsidev/react-turnstile';

const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    comments: '',
    turnstileToken: '',
};

const Contact = () => {
    const [formData, setFormData] = useState(initialFormData);
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [turnstileError, setTurnstileError] = useState('');
    const [turnstileKey, setTurnstileKey] = useState(0);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setStatusMessage('');

        if (!formData.turnstileToken) {
            setTurnstileError('Please complete the Turnstile challenge.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/contact`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            setStatusMessage(response.data.message || 'Your message was sent successfully.');
            setFormData({ ...initialFormData, turnstileToken: '' });
            setTurnstileError('');
            setTurnstileKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.error('Contact form submission failed:', error);
            setStatusMessage(error.response?.data?.message || 'Unable to send your message right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="card">
            <h2>Contact Us</h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <label>
                        First Name
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            required
                            style={{ display: 'block', width: '100%', marginTop: '6px' }}
                        />
                    </label>

                    <label>
                        Last Name
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                            style={{ display: 'block', width: '100%', marginTop: '6px' }}
                        />
                    </label>
                </div>

                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            style={{ display: 'block', width: '100%', marginTop: '6px' }}
                        />
                    </label>

                    <label>
                        Phone
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(123) 456-7890"
                            style={{ display: 'block', width: '100%', marginTop: '6px' }}
                        />
                    </label>
                </div>

                <label>
                    Comments
                    <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Tell us more..."
                        style={{ display: 'block', width: '100%', marginTop: '6px' }}
                    />
                </label>

                <Turnstile
                    key={turnstileKey}
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
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
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </section>
    );
};

export default Contact;