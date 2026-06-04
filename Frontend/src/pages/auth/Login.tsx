import { type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import Button from "../../components/Button";
import Input from "../../components/Input";
// import useInput from "../../hooks/useInput";
import usePostForm from "../../hooks/usePostForm";
import { setAuthSession } from "../../utils/auth";
import type { User } from "../../utils/types";
import useFormInput from "../../hooks/useFormInput";

type LoginPayload = {
  emailAddress: string;
  password: string;
};

type LoginResult = {
  user: User;
  token: string;
};

type LoginResponse = {
  message: string;
  data: LoginResult;
};

export default function Login() {
  const navigate = useNavigate();
  const [form, handleInputChange] = useFormInput<LoginPayload>({
    emailAddress: "",
    password: "",
  })
  const { submit, loading, error } = usePostForm<LoginPayload, LoginResponse>("/auth/login", {
    onSuccess: (response) => {
      setAuthSession(response.data);
      navigate("/", { replace: true });
    },
  });

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(form);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-lg md:min-h-120 md:flex-row">
        <aside className="flex bg-primary p-8 sm:p-12 md:w-2/5 md:flex-col md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black sm:text-5xl">CogniCare</h1>
            <p className="mt-4 max-w-xs text-lg font-medium leading-8 text-black">
              Helping you understand your cognitive fatigue and stress—so you can take better care of your mind, every day.
            </p>
          </div>

          <div className="text-center hidden md:block">
            <div className="mb-6">
              <p className="text-lg font-semibold text-slate-800">Don't have an account?</p>
              <Link to="/auth/register" className="font-semibold underline">
                Get Started!
              </Link>
            </div>
            <p>Read our <a href="#" className="underline">terms</a> and <a href="#" className="underline">conditions</a></p>
          </div>
        </aside>

        <div className="flex flex-1 items-center justify-center p-8 sm:p-12">
          <form className="w-full max-w-md" onSubmit={handleSubmit}>
            <h2 className="mb-6 text-4xl font-semibold text-black sm:text-5xl">Account Login</h2>

            <div className="mb-3">
              <label htmlFor="emailAddress">Email address</label>
              <Input type="email" id="emailAddress" value={form.emailAddress} onChange={handleInputChange} required />
            </div>

            <div className="mb-3">
              <label htmlFor="password">Password</label>
              <Input type="password" id="password" value={form.password} onChange={handleInputChange} required />
            </div>

            {/* <label htmlFor="remember" className="mb-5 flex items-center gap-3 text-slate-700">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="size-5 rounded accent-primary-400"
              />
              <span>Remember Me</span>
            </label> */}

            {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>}

            <Button type="submit" className="w-full justify-center disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <div className="mt-8 text-center md:hidden">
              <p className="font-semibold text-slate-800">Don't have an account?</p>
              <Link to="/auth/register" className="font-semibold underline">
                Get Started!
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
