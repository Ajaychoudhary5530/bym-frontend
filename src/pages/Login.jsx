import { useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!email) {
      alert("Enter email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email });
      setStep(2);
    } catch (err) {
      alert("Failed to send OTP");
      console.error(err);
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      login(res.data);
    } catch (err) {
      alert("Invalid or expired OTP");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        
        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="Company Logo"
            className="h-14 object-contain"
          />
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">
          BYM-Inventory Login
        </h2>

        <input
          type="email"
          placeholder="Enter email"
          className="border p-2 w-full mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step === 2}
        />

        {step === 2 && (
          <input
            type="text"
            placeholder="Enter OTP"
            className="border p-2 w-full mb-3 rounded"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        )}

        {step === 1 ? (
          <button
            onClick={sendOTP}
            className="bg-blue-600 text-white w-full py-2 rounded"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button
            onClick={verifyOTP}
            className="bg-green-600 text-white w-full py-2 rounded"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        )}
      </div>
    </div>
  );
}
