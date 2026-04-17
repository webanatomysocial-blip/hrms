import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Lock,
  Shield,
  Building,
  Calendar,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const Setting: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    position: user?.position || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message
      const alertDiv = document.createElement("div");
      alertDiv.className =
        "alert alert-success alert-dismissible fade show position-fixed";
      alertDiv.style.cssText =
        "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
      alertDiv.innerHTML = `
        <strong>Success!</strong> Profile updated successfully.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(alertDiv);
      setTimeout(() => alertDiv.remove(), 5000);
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: Now calls the actual API endpoint
      const response = await fetch("/api/auth.php?action=change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Show success message
        const alertDiv = document.createElement("div");
        alertDiv.className =
          "alert alert-success alert-dismissible fade show position-fixed";
        alertDiv.style.cssText =
          "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
        alertDiv.innerHTML = `
        <strong>Success!</strong> ${data.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 5000);
      } else {
        alert(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Password change error:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid fade-in">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-6 fw-bold mb-1">Account Settings</h1>
          <p className="text-muted">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <div className="row">
        {/* Profile Summary Card */}
        <div className="col-lg-4 col-xl-3 mb-4">
          <div className="premium-card">
            <div className="premium-card-body text-center">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-glow-cyan"
                style={{
                  width: "80px",
                  height: "80px",
                  background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))',
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "2rem",
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                }}
              >
                {user?.name.charAt(0)}
              </div>
              <h5 className="mb-1 text-white">{user?.name}</h5>
              <p className="text-secondary mb-2 small fw-500 opacity-75">{user?.email}</p>
              <span
                className={`badge ${
                  user?.role === "admin" ? "bg-warning text-dark" : "bg-info"
                } text-capitalize px-3 py-2`}
              >
                {user?.role === "admin" ? (
                  <>
                    <Shield size={14} className="me-1" />
                    Administrator
                  </>
                ) : (
                  <>
                    <User size={14} className="me-1" />
                    Employee
                  </>
                )}
              </span>

              <hr className="my-4" />

              <div className="text-start">
                {user?.department && (
                  <div className="d-flex align-items-center mb-2">
                    <Building size={16} className="text-cyan me-2 opacity-75" />
                    <small className="text-secondary fw-500">{user.department}</small>
                  </div>
                )}
                {user?.position && (
                  <div className="d-flex align-items-center mb-2">
                    <User size={16} className="text-indigo me-2 opacity-75" />
                    <small className="text-secondary fw-500">{user.position}</small>
                  </div>
                )}
                {user?.joining_date && (
                  <div className="d-flex align-items-center">
                    <Calendar size={16} className="text-gold me-2 opacity-75" />
                    <small className="text-secondary fw-500">
                      Joined{" "}
                      {new Date(user.joining_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-lg-8 col-xl-9">
          <div className="premium-card">
            {/* Tab Navigation */}
            <div className="premium-card-header">
              <ul className="nav nav-tabs card-header-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "profile" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("profile")}
                    type="button"
                  >
                    <User size={16} className="me-2" />
                    Profile Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${
                      activeTab === "password" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("password")}
                    type="button"
                  >
                    <Lock size={16} className="me-2" />
                    Change Password
                  </button>
                </li>
              </ul>
            </div>

            <div className="premium-card-body">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate}>
                  <h6 className="mb-4 d-flex align-items-center">
                    <User size={18} className="me-2" />
                    Personal Information
                  </h6>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="text-white small fw-700 text-uppercase mb-2 d-block">
                        <User size={16} className="me-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="form-control premium-form-control"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-white small fw-700 text-uppercase mb-2 d-block">
                        <Mail size={16} className="me-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="form-control premium-form-control"
                        placeholder="your.email@webanatomy.in"
                        disabled
                      />
                      <small className="text-muted">
                        Email cannot be changed. Contact admin if needed.
                      </small>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="text-white small fw-700 text-uppercase mb-2 d-block">
                        <Building size={16} className="me-2" />
                        Department
                      </label>
                      <input
                        type="text"
                        value={profileData.department}
                        className="form-control premium-form-control"
                        disabled
                      />
                      <small className="text-muted">
                        Department is managed by administrators.
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="text-white small fw-700 text-uppercase mb-2 d-block">
                        Position/Title
                      </label>
                      <input
                        type="text"
                        value={profileData.position}
                        className="form-control premium-form-control"
                        disabled
                      />
                      <small className="text-muted">
                        Position is managed by administrators.
                      </small>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-premium-primary"
                    >
                      {loading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="me-2" />
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Password Tab */}
              {activeTab === "password" && (
                <form onSubmit={handlePasswordChange} autoComplete="on">
                  <h6 className="mb-4 d-flex align-items-center">
                    <Lock size={18} className="me-2" />
                    Change Password
                  </h6>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        className="premium-form-label"
                        htmlFor="currentPassword"
                      >
                        Current Password
                      </label>
                      <div className="position-relative">
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          className="form-control premium-form-control pe-5"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                          style={{ color: "#a1a1aa" }}
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6"></div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label
                        className="premium-form-label"
                        htmlFor="newPassword"
                      >
                        New Password
                      </label>
                      <div className="position-relative">
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          className="form-control premium-form-control pe-5"
                          placeholder="Enter new password"
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                          style={{ color: "#a1a1aa" }}
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <small className="text-muted">
                        Password must be at least 6 characters long.
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label
                        className="premium-form-label"
                        htmlFor="confirmPassword"
                      >
                        Confirm New Password
                      </label>
                      <div className="position-relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          autoComplete="new-password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="form-control premium-form-control pe-5"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0"
                          style={{ color: "#a1a1aa" }}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-info d-flex align-items-start">
                    <Shield className="me-2 mt-1 flex-shrink-0" size={16} />
                    <div>
                      <strong>Security Tips:</strong>
                      <ul className="mb-0 mt-2">
                        <li>
                          Use a strong password with letters, numbers, and
                          symbols
                        </li>
                        <li>Don't reuse passwords from other accounts</li>
                        <li>Consider using a password manager</li>
                      </ul>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setPasswordData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }
                      className="btn btn-outline-secondary"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-premium-primary"
                    >
                      {loading ? (
                        <>
                          <div
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="me-2" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
