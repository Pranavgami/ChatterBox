import { useState } from "react";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up"); // "Sign Up" or "Login"
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmit, setIsDataSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (currState === "Sign Up" && !isDataSubmit) {
      setIsDataSubmit(true);
      return;
    }
    setLoading(true);
    try {
      const success = await login(
        currState === "Sign Up" ? "signup" : "login",
        {
          fullname,
          email,
          password,

          bio,
        }
      );
      if (success) {
        console.log("Login");
        navigate("/");
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* Left Side */}
      <img src={assets.logo_big} className="w-[min(30vw-250px)]" alt="" />

      {/* Right Side */}
      <form
        onSubmit={onSubmitHandler}
        className="border-2 bg-white/8 text-white p-6 border-gray-500 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <div className="flex justify-between items-center">
          <h2 className="font-medium text-2xl flex items-center justify-between gap-2">
            {currState}
            {currState === "Sign Up" && isDataSubmit && (
              <img
                onClick={() => setIsDataSubmit(false)}
                src={assets.arrow_icon}
                className="w-5 cursor-pointer"
                alt="Back"
              />
            )}
          </h2>
        </div>

        {/* Sign Up Step 1 */}
        {currState === "Sign Up" && !isDataSubmit && (
          <>
            <input
              type="text"
              className="p-2 border border-gray-500 rounded-md focus:outline-none"
              placeholder="Enter Your Fullname"
              onChange={(e) => setFullname(e.target.value)}
              value={fullname}
              required
            />
            <input
              type="email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <input
              type="password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
              type="submit"
            >
              Next
            </button>
          </>
        )}

        {/* Sign Up Step 2 */}
        {currState === "Sign Up" && isDataSubmit && (
          <>
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Provide a short bio..."
              required
            />
            <button
              disabled={loading}
              className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
              type="submit"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </>
        )}

        {/* Login Form */}
        {currState === "Login" && (
          <>
            <input
              type="email"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <input
              type="password"
              className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <button
              disabled={loading}
              className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
              type="submit"
            >
              {loading ? "Loggin in..." : "Login"}
            </button>
          </>
        )}

        {/* Terms Checkbox */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to terms of use & Privacy-policy</p>
        </div>

        {/* Switch Links */}
        <div className="flex flex-col gap-2">
          {currState === "Sign Up" ? (
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmit(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Create an Account?{" "}
              <span
                onClick={() => {
                  setCurrState("Sign Up");
                  setIsDataSubmit(false);
                }}
                className="font-medium text-violet-500 cursor-pointer"
              >
                Click here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
