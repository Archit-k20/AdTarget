import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login, register } from "../api";

// ── Validation ────────────────────────────────────────────────────────────────

const validate = (fields, isLogin) => {
  const errors = {};

  if (!isLogin) {
    if (!fields.firstname.trim())
      errors.firstname = "First name is required.";
    if (!fields.lastname.trim())
      errors.lastname = "Last name is required.";
  }

  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
};

// ── FieldError ────────────────────────────────────────────────────────────────

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-sm text-red-600">{message}</p>
  ) : null;

// ── Auth ──────────────────────────────────────────────────────────────────────

const Auth = ({ mode = "login", setIsAuthenticated, toast }) => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const isLogin = mode === "login";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation before hitting the API
    const errors = validate(formData, isLogin);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = isLogin
        ? await login({ email: formData.email, password: formData.password })
        : await register({
            firstname: formData.firstname,
            lastname: formData.lastname,
            email: formData.email,
            password: formData.password,
          });

      localStorage.setItem("token", response.data.token);
      setIsAuthenticated(true);
      toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (isLogin
          ? "Invalid email or password."
          : "Registration failed. Please try again.");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          {isLogin
            ? "Sign in to manage your ads."
            : "Register to start publishing ads."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name fields — register only */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    fieldErrors.firstname
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                />
                <FieldError message={fieldErrors.firstname} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    fieldErrors.lastname
                      ? "border-red-400"
                      : "border-gray-300"
                  }`}
                />
                <FieldError message={fieldErrors.lastname} />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                fieldErrors.email ? "border-red-400" : "border-gray-300"
              }`}
            />
            <FieldError message={fieldErrors.email} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 pr-10 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  fieldErrors.password ? "border-red-400" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? isLogin
                ? "Signing in…"
                : "Creating account…"
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Toggle link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in here
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;