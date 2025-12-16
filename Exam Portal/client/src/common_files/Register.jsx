


// // import { useState } from "react";
// // import { Eye, EyeOff } from "lucide-react";
// // import { useNavigate } from "react-router-dom";

// // export default function Register() {
// //   const navigate = useNavigate();

// //   // 🔥 Flip state
// //   const [startFlip, setStartFlip] = useState(false);

// //   const flipStyles = `
// //     .flip-animation {
// //       transform: rotateY(0deg);
// //       transition: transform 350ms ease-out;
// //       transform-style: preserve-3d;
// //     }
// //     .flip-animation.flip {
// //       transform: rotateY(90deg);
// //     }
// //   `;

// //   const [formData, setFormData] = useState({
// //     fullName: "",
// //     email: "",
// //     password: "",
// //     confirmPassword: "",
// //     organisationId: "",
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [touched, setTouched] = useState({});
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// //   // ------------------------ Validation ------------------------
// //   const validate = () => {
// //     const newErrors = {};
// //     if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
// //     if (!formData.email.includes("@")) newErrors.email = "Email must contain @";

// //     const passwordRegex =
// //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

// //     if (!passwordRegex.test(formData.password))
// //       newErrors.password =
// //         "Password must have uppercase, lowercase, number, special char & 8–12 chars";

// //     if (formData.password !== formData.confirmPassword)
// //       newErrors.confirmPassword = "Passwords do not match";

// //     if (!formData.organisationId.trim())
// //       newErrors.organisationId = "Organisation ID is required";

// //     return newErrors;
// //   };

// //   // ------------------------ Submit form ------------------------
// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     const validationErrors = validate();
// //     setTouched({
// //       fullName: true,
// //       email: true,
// //       password: true,
// //       confirmPassword: true,
// //       organisationId: true,
// //     });

// //     setErrors(validationErrors);

// //     if (Object.keys(validationErrors).length === 0) {
// //       navigate("/userlogin");
// //     }
// //   };

// //   // ------------------------ Handle Flip -> Login ------------------------
// //   const goToLogin = () => {
// //     setStartFlip(true); // Start animation

// //     setTimeout(() => {
// //       navigate("/userlogin"); // Navigate after animation
// //     }, 350); // Match animation speed
// //   };

// //   return (
// //     <>
// //       <style>{flipStyles}</style>

// //       <div
// //         className={`min-h-screen flex bg-gray-50 flip-animation ${
// //           startFlip ? "flip" : ""
// //         }`}
// //       >
// //         {/* LEFT SIDE FORM */}
// //         <div className="w-full lg:w-1/2 flex items-center justify-center px-10 py-12 bg-white">
// //           <div className="w-full max-w-lg">

// //             <h1 className="text-3xl font-bold text-gray-800">Welcome 👋</h1>
// //             <p className="text-gray-600 mb-8">Create an account</p>

// //             <form onSubmit={handleSubmit} className="space-y-5">

// //               {/* Full Name */}
// //               <div>
// //                 <label className="text-sm font-medium text-gray-700">Full Name</label>
// //                 <input
// //                   type="text"
// //                   name="fullName"
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, fullName: e.target.value })
// //                   }
// //                   className="w-full px-4 py-3 border rounded-lg"
// //                 />
// //                 {touched.fullName && errors.fullName && (
// //                   <p className="text-red-500 text-sm">{errors.fullName}</p>
// //                 )}
// //               </div>

// //               {/* Email */}
// //               <div>
// //                 <label className="text-sm font-medium text-gray-700">Email</label>
// //                 <input
// //                   type="text"
// //                   name="email"
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, email: e.target.value })
// //                   }
// //                   className="w-full px-4 py-3 border rounded-lg"
// //                 />
// //                 {touched.email && errors.email && (
// //                   <p className="text-red-500 text-sm">{errors.email}</p>
// //                 )}
// //               </div>

// //               {/* Password */}
// //               <div>
// //                 <label className="text-sm font-medium text-gray-700">Password</label>
// //                 <div className="relative">
// //                   <input
// //                     type={showPassword ? "text" : "password"}
// //                     name="password"
// //                     onChange={(e) =>
// //                       setFormData({ ...formData, password: e.target.value })
// //                     }
// //                     className="w-full px-4 py-3 border rounded-lg pr-12"
// //                   />
// //                   <span
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="absolute right-3 top-3 cursor-pointer text-gray-500"
// //                   >
// //                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// //                   </span>
// //                 </div>
// //                 {touched.password && errors.password && (
// //                   <p className="text-red-500 text-sm">{errors.password}</p>
// //                 )}
// //               </div>

// //               {/* Confirm Password */}
// //               <div>
// //                 <label className="text-sm font-medium text-gray-700">
// //                   Confirm Password
// //                 </label>
// //                 <div className="relative">
// //                   <input
// //                     type={showConfirmPassword ? "text" : "password"}
// //                     name="confirmPassword"
// //                     onChange={(e) =>
// //                       setFormData({ ...formData, confirmPassword: e.target.value })
// //                     }
// //                     className="w-full px-4 py-3 border rounded-lg pr-12"
// //                   />
// //                   <span
// //                     onClick={() =>
// //                       setShowConfirmPassword(!showConfirmPassword)
// //                     }
// //                     className="absolute right-3 top-3 cursor-pointer text-gray-500"
// //                   >
// //                     {showConfirmPassword ? (
// //                       <EyeOff size={20} />
// //                     ) : (
// //                       <Eye size={20} />
// //                     )}
// //                   </span>
// //                 </div>
// //                 {touched.confirmPassword && errors.confirmPassword && (
// //                   <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
// //                 )}
// //               </div>

// //               {/* Organisation ID */}
// //               <div>
// //                 <label className="text-sm font-medium text-gray-700">
// //                   Organisation ID
// //                 </label>
// //                 <input
// //                   type="text"
// //                   name="organisationId"
// //                   onChange={(e) =>
// //                     setFormData({ ...formData, organisationId: e.target.value })
// //                   }
// //                   className="w-full px-4 py-3 border rounded-lg"
// //                 />
// //                 {touched.organisationId && errors.organisationId && (
// //                   <p className="text-red-500 text-sm">{errors.organisationId}</p>
// //                 )}
// //               </div>

// //               {/* Register Button */}
// //               <button
// //                 type="submit"
// //                 className="w-full bg-blue-600 text-white py-3 rounded-lg"
// //               >
// //                 Register
// //               </button>

// //               {/* Flip Animation Login Button */}
// //               <p className="text-center text-sm text-gray-600">
// //                 Already have an account?{" "}
// //                 <button
// //                   type="button"
// //                   onClick={goToLogin}
// //                   className="text-blue-600 font-medium hover:underline"
// //                 >
// //                   Login
// //                 </button>
// //               </p>
// //             </form>
// //           </div>
// //         </div>

// //         {/* RIGHT IMAGE */}
// //         <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10 bg-gray-100">
// //           <img
// //             src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
// //             alt="Banner"
// //             className="w-full h-full object-cover rounded-2xl"
// //           />
// //         </div>
// //       </div>
// //     </>
// //   );
// // }






// import { useState } from "react";
// import { Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const navigate = useNavigate();

//   // 🔥 Flip animation state
//   const [startFlip, setStartFlip] = useState(false);

//   // Animation styles
//   const flipStyles = `
//     .flip-animation {
//       transform: rotateY(0deg);
//       transition: transform 350ms ease-out;
//       transform-style: preserve-3d;
//     }
//     .flip-animation.flip {
//       transform: rotateY(90deg);
//     }
//   `;

//   // Form State
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     organisationId: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   // Validation logic (no messages displayed)
//   const validate = () => {
//     const errors = {};

//     if (!formData.fullName.trim()) errors.fullName = "required";
//     if (!formData.email.includes("@")) errors.email = "required";

//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,12}$/;

//     if (!passwordRegex.test(formData.password)) errors.password = "required";
//     if (formData.password !== formData.confirmPassword)
//       errors.confirmPassword = "required";
//     if (!formData.organisationId.trim())
//       errors.organisationId = "required";

//     return errors;
//   };

//   // Register submit
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const validationErrors = validate();

//     if (Object.keys(validationErrors).length === 0) {
//       navigate("/userlogin");
//     }
//   };

//   // 🔄 Flip animation then navigate
//   const goToLogin = () => {
//     setStartFlip(true);

//     setTimeout(() => {
//       navigate("/userlogin");
//     }, 350);
//   };

//   return (
//     <>
//       <style>{flipStyles}</style>

//       <div
//         className={`min-h-screen flex bg-gray-50 flip-animation ${
//           startFlip ? "flip" : ""
//         }`}
//       >
//         {/* LEFT SIDE FORM */}
//         <div className="w-full lg:w-1/2 flex items-center justify-center px-10 py-12 bg-white">
//           <div className="w-full max-w-lg">

//             <h1 className="text-3xl font-bold text-gray-800">Welcome 👋</h1>
//             <p className="text-gray-600 mb-8">Create an account</p>

//             <form onSubmit={handleSubmit} className="space-y-5">

//               {/* Full Name */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="fullName"
//                   onChange={(e) =>
//                     setFormData({ ...formData, fullName: e.target.value })
//                   }
//                   className="w-full px-4 py-3 border rounded-lg"
//                   required
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   onChange={(e) =>
//                     setFormData({ ...formData, email: e.target.value })
//                   }
//                   className="w-full px-4 py-3 border rounded-lg"
//                   required
//                 />
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     name="password"
//                     onChange={(e) =>
//                       setFormData({ ...formData, password: e.target.value })
//                     }
//                     className="w-full px-4 py-3 border rounded-lg pr-12"
//                     required
//                   />
//                   <span
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 cursor-pointer text-gray-500"
//                   >
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                   </span>
//                 </div>
//               </div>

//               {/* Confirm Password */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Confirm Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showConfirmPassword ? "text" : "password"}
//                     name="confirmPassword"
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-3 border rounded-lg pr-12"
//                     required
//                   />
//                   <span
//                     onClick={() =>
//                       setShowConfirmPassword(!showConfirmPassword)
//                     }
//                     className="absolute right-3 top-3 cursor-pointer text-gray-500"
//                   >
//                     {showConfirmPassword ? (
//                       <EyeOff size={20} />
//                     ) : (
//                       <Eye size={20} />
//                     )}
//                   </span>
//                 </div>
//               </div>

//               {/* Organisation ID */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Organisation ID <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="organisationId"
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       organisationId: e.target.value,
//                     })
//                   }
//                   className="w-full px-4 py-3 border rounded-lg"
//                   required
//                 />
//               </div>

//               {/* Register Button */}
//               <button
//                 type="submit"
//                 className="w-full bg-blue-600 text-white py-3 rounded-lg"
//               >
//                 Register
//               </button>

//               {/* Flip Login */}
//               <p className="text-center text-sm text-gray-600">
//                 Already have an account?{" "}
//                 <button
//                   type="button"
//                   onClick={goToLogin}
//                   className="text-blue-600 font-medium hover:underline"
//                 >
//                   Login
//                 </button>
//               </p>
//             </form>
//           </div>
//         </div>

//         {/* RIGHT IMAGE */}
//         <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10 bg-gray-100">
//           <img
//             src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
//             alt="Banner"
//             className="w-full h-full object-cover rounded-2xl"
//           />
//         </div>
//       </div>
//     </>
//   );
// }





import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../App";

export default function Register() {
  const navigate = useNavigate();

  // Flip Animation State
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
    .error-text {
      animation: fadeIn 0.25s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organisationId: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Validation Logic
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim())
      newErrors.fullName = "Full name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Email must contain @";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, special char & 8–12 chars";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.organisationId.trim())
      newErrors.organisationId = "Organisation ID is required";

    return newErrors;
  };

  // Submit Form
  const handleSubmit = async(e) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      organisationId: true,
    });

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await axios.post(`${baseUrl}/auth/register`,{
          fullName:formData.fullName, email:formData.email, password:formData.password, organizationId:formData.organisationId, mobile:"1234567790", gender:"male"
        })
        if(response.status === 201){
          sessionStorage.setItem("role","user")
          navigate("/login")
        }
      } catch (error) {
        console.log(error.message)
      }
    }
  };

  const goToLogin = () => {
    setStartFlip(true);
    setTimeout(() => navigate("/login"), 350);
  };

  return (
    <>
      <style>{flipStyles}</style>

      <div
        className={`min-h-screen flex bg-gray-50 flip-animation ${
          startFlip ? "flip" : ""
        }`}
      >
        {/* LEFT SECTION - FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-10 py-12 bg-white">
          <div className="w-full max-w-lg">

            <h1 className="text-3xl font-bold text-gray-800">Welcome 👋</h1>
            <p className="text-gray-600 mb-8">Create an account</p>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-all
                    ${touched.fullName && errors.fullName
                      ? "border-red-500 shadow-sm shadow-red-100"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                    }`}
                />
                {touched.fullName && errors.fullName && (
                  <p className="text-red-500 text-xs error-text">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-all
                    ${touched.email && errors.email
                      ? "border-red-500 shadow-sm shadow-red-100"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                    }`}
                />
                {touched.email && errors.email && (
                  <p className="text-red-500 text-xs error-text">
                    {errors.email}
                  </p>
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
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-all
                      ${touched.password && errors.password
                        ? "border-red-500 shadow-sm shadow-red-100"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                      }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {touched.password && errors.password && (
                  <p className="text-red-500 text-xs error-text">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg outline-none transition-all
                      ${touched.confirmPassword && errors.confirmPassword
                        ? "border-red-500 shadow-sm shadow-red-100"
                        : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                      }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>

                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-500 text-xs error-text">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Organisation ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Organisation ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="organisationId"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg outline-none transition-all
                    ${touched.organisationId && errors.organisationId
                      ? "border-red-500 shadow-sm shadow-red-100"
                      : "border-gray-300 focus:ring-2 focus:ring-blue-500"
                    }`}
                />
                {touched.organisationId && errors.organisationId && (
                  <p className="text-red-500 text-xs error-text">
                    {errors.organisationId}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Register
              </button>

              {/* Login Flip Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={goToLogin}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Login
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-10 bg-gray-100">
          <img
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
            alt="Banner"
            className="w-full h-full object-cover rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </>
  );
}

