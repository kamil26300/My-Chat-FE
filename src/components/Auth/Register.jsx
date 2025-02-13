import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

export default function Register() {
  const [isRotated, setIsRotated] = useState(false);
  const [isDisabled, setDisabled] = useState(true);
  const [fields, setFields] = useState({
    username: "",
    email: "",
    password: "",
    confirmPass: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPass: "",
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(fields.username, fields.email, fields.password);
    if (success) {
      navigate("/chat");
      toast.success("Account created successfully");
    } else {
      toast.error("Account creation failed");
    }
  };

  const inputCSS = (field) =>
    `w-full bg-white text-black text-sm py-2 px-3 border-2 border-gray-300 focus:outline-none rounded ${
      !errors[field]
        ? "focus:border-cyan-400"
        : "border-red-600 focus:border-red-600 outline-none"
    }`;
  const labelCSS = "block text-white text-sm font-medium mb-1";
  const errorCSS = "text-red-600 text-sm mt-1 pb-2";

  const validateForm = (value, field) => {
    let error = "";

    switch (field) {
      case "username":
        if (value.length === 0) {
          error = "Username is mandatory";
        } else {
          error = !/^[a-zA-Z0-9_]{3,20}$/.test(value)
            ? "Username should be in the correct format"
            : "";
        }
        break;
      case "email":
        if (value.length === 0) {
          error = "Email is mandatory";
        } else {
          error = !/^\S+@\S+\.\S+$/.test(value)
            ? "Email should be in the correct format"
            : "";
        }
        break;
      case "password":
        // Validate password format (8-15 characters, 1 upper, 1 lower, 1 number)
        if (value.length === 0) {
          error = "Password is mandatory";
        } else if (value.length < 5 || value.length > 18) {
          error = "Length must be between 5 and 18 characters";
        } else if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) {
          error = "Must contain at least 1 alphabet and 1 number";
        }
        break;
      case "confirmPass":
        // Validate password confirmation
        if (value.length === 0) {
          error = "Password is mandatory";
        } else {
          error = value !== fields.password ? "Passwords do not match" : "";
        }
        break;
      default:
        break;
    }
    // Update the errors state
    setErrors((prevErrors) => ({ ...prevErrors, [field]: error }));
  };

  useEffect(() => {
    const setDisabledBtn = () => {
      const allFieldsFilled = Object.values(fields).every(
        (value) => value !== ""
      );
      const isErrorFieldEmpty = Object.values(errors).every(
        (value) => value === ""
      );
      setDisabled(!(allFieldsFilled && isErrorFieldEmpty));
    };
    setDisabledBtn();
  }, [fields, errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    validateForm(value, name);
    setFields((prevFields) => ({ ...prevFields, [name]: value }));
  };

  const resetFields = () => {
    setIsRotated(true);
    setTimeout(() => {
      setIsRotated(false);
    }, 500);
    const newFields = { ...fields };
    for (const key in newFields) {
      newFields[key] = "";
    }
    setFields(newFields);
    setErrors(newFields);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222222]">
      <div className="bg-[#333333] rounded p-8 w-96">
        <div className="flex justify-between">
          <h2 className="text-2xl font-semibold text-white mb-4">Register</h2>
          <button
            type="button"
            onClick={resetFields}
            className="h-min relative rounded-full p-1 text-gray-400 hover:text-white rotate-0"
          >
            <ArrowPathIcon
              className={`h-6 w-6 ${
                isRotated ? "rotate-[360deg] duration-1000" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label className={labelCSS} htmlFor="username">
              Username
            </label>
            <input
              type="username"
              id="username"
              name="username"
              value={fields.username}
              onChange={handleChange}
              className={inputCSS("username")}
              required
            />
            <div className={errorCSS}>{errors.username}</div>
          </div>

          <div>
            <label className={labelCSS} htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              className={inputCSS("email")}
              required
            />
            <div className={errorCSS}>{errors.email}</div>
          </div>
          <div>
            <label className={labelCSS} htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={fields.password}
              onChange={handleChange}
              className={inputCSS("password")}
              required
            />
            <div className={errorCSS}>{errors.password}</div>
          </div>
          <div>
            <label className={labelCSS} htmlFor="confirmPass">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPass"
              name="confirmPass"
              value={fields.confirmPass}
              onChange={handleChange}
              className={inputCSS("confirmPass")}
              required
            />
            <div className={errorCSS}>{errors.confirmPass}</div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              disabled={isDisabled}
              className="mt-2 w-full bg-[#3498DB] rounded hover:opacity-80 text-white font-semibold py-2 px-4 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              Register
            </button>
            <Link
              to="/login"
              className="w-full bg-transparent text-center rounded border-2 border-white text-white hover:underline font-bold py-2 px-4 transition duration-300"
            >
              Already have an Acccount !
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
