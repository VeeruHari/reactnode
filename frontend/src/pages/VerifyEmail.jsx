import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const pendingVerificationTokens = new Set();

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState({
    type: 'loading',
    message: 'Verifying your email address...'
  });

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus({
        type: 'error',
        message: 'Verification token is missing from the URL.'
      });
      return;
    }

    if (pendingVerificationTokens.has(token)) {
      return;
    }

    pendingVerificationTokens.add(token);

    const verify = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        setStatus({
          type: 'success',
          message: response.data.message || 'Your email has been verified successfully.'
        });
      } catch (error) {
        setStatus({
          type: 'error',
          message: error.response?.data?.message || 'Unable to verify your email at this time.'
        });
      } finally {
        pendingVerificationTokens.delete(token);
      }
    };

    verify();
  }, []);

  return (
    <section className="card">
      <h2>Email Verification</h2>
      <p
        role="status"
        style={{
          color: status.type === 'success' ? 'green' : status.type === 'error' ? 'crimson' : 'inherit'
        }}
      >
        {status.message}
      </p>
    </section>
  );
};

export default VerifyEmail;
