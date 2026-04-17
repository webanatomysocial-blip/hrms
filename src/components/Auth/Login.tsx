import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" 
         style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="premium-card">
              <div className="premium-card-body p-5">
                {/* WebAnatomy Logo and Title */}
                <div className="text-center mb-5">
                  <div 
                    className="mb-3 mx-auto"
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundImage: "url('https://webanatomy.in/wp-content/uploads/2025/04/4-e1742804383186.png')",
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  />
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                    <AlertTriangle size={20} className="me-2" />
                    <div>{error}</div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} autoComplete="on">
                  <div className="mb-4">
                    <label className="premium-form-label" htmlFor="email">
                      <Mail size={16} className="me-2" />
                      Email Address
                    </label>
                    <div className="position-relative">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="username email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control premium-form-control ps-5"
                        placeholder="Enter your email address"
                      />
                      <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#a1a1aa' }} />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="premium-form-label" htmlFor="password">
                      <Lock size={16} className="me-2" />
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-control premium-form-control ps-5 pe-5"
                        placeholder="Enter your password"
                      />
                      <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ color: '#a1a1aa' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                        style={{ color: '#a1a1aa' }}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="rememberMe"
                        autoComplete="off"
                      />
                      <label className="form-check-label" htmlFor="rememberMe" style={{ color: '#a1a1aa' }}>
                        Remember me on this device
                      </label>
                    </div>
                  </div>

                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-premium-primary btn-lg"
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Lock className="me-2" size={18} />
                          Sign In to WebAnatomy HRMS
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Contact Support */}
                <div className="text-center">
                  <p style={{ color: '#a1a1aa' }} className="small mb-2">
                    Need help accessing your account?
                  </p>
                  <p style={{ color: '#ffdd00' }} className="small">
                    Contact your system administrator
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p style={{ color: '#a1a1aa' }} className="small">
                © 2025 WebAnatomy Premium HRMS. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
