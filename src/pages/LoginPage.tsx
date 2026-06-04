import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  userId: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/login", data);
      if (res.data.status==='success') {
        setAuth(res.data.data.token, res.data.data.user);
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex">
      
      <div className="w-1/2 bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-4">🤖</div>
          <p className="text-blue-400 text-sm">Preproute Admin Panel</p>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="mb-2 text-2xl font-bold">
            <span className="text-blue-600">Prep</span>
            <span className="text-gray-800">route</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1 mt-4">Login</h1>
          <p className="text-gray-400 text-sm mb-6">
            Use your company provided Login credentials
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                User ID
              </label>
              <input
                {...register("userId")}
                placeholder="Enter User ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.userId && (
                <p className="text-red-500 text-xs mt-1">{errors.userId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Enter Password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <p className="text-blue-500 text-sm cursor-pointer hover:underline">
              Forgot password?
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}