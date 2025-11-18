

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Userlogin() {
  const navigate = useNavigate();

  // 🔥 Flip Animation State
  const [startFlip, setStartFlip] = useState(false);

  const flipStyles = `
    .flip-animation {
      transform: rotateY(0deg);
      transition: transform 350ms ease-out;
      transform-style: preserve-3d;
    }
    .flip-animation.flip {
      transform: rotateY(90deg);
    }
  `;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({
      ...prev,
      [e.target.name]: true,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Email must contain @";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      email: true,
      password: true,
    });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      alert("Login Successful!");
    }
  };

  // 🔥 Flip → Register page
  const goToRegister = () => {
    setStartFlip(true); // Start animation

    setTimeout(() => {
      navigate("/"); // Navigate after animation ends
    }, 350); // match animation duration
  };

  return (
    <>
      <style>{flipStyles}</style>

      <div
        className={`min-h-screen flex bg-white overflow-hidden flip-animation ${
          startFlip ? "flip" : ""
        }`}
      >
        {/* LEFT SIDE */}
        <div className="flex-1 flex justify-center items-center px-12 py-10">
          <div className="w-full max-w-md flex flex-col justify-center -mt-10">
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
            <p className="text-gray-600 mb-8">
              Sign in to continue your journey
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm hover:bg-blue-700"
              >
                Sign in
              </button>

              {/* Flip to Register */}
              <p className="text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={goToRegister}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Register
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden lg:block lg:w-1/2 h-screen bg-gray-50">
          <div className="h-full flex items-center justify-center p-0">
            <img
              src="Images/img2.avif"
              alt="Professional"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}
