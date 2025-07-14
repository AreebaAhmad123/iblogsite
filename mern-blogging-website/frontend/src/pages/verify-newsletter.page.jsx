import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const VerifyNewsletterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your subscription...");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("");
      setError("Invalid verification link.");
      return;
    }
    axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/api/verify-newsletter?token=${token}`)
      .then(({ data }) => {
        setStatus("Subscription verified! Thank you for subscribing.");
        toast.success("Subscription verified!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        setStatus("");
        setError(error?.response?.data?.error || "Verification failed.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Newsletter Verification</h2>
        {status && <p className="text-green-700 mb-2">{status}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
      </div>
    </div>
  );
};

export default VerifyNewsletterPage; 