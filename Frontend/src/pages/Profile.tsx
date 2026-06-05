import { useState, type FormEvent } from "react";
import { useRouteLoaderData } from "react-router";
import api from "../utils/api";
import { getToken, setAuthSession } from "../utils/auth";
import type { ApiResponse, User } from "../utils/types";
import Button from "../components/Button";
import Input from "../components/Input";
import useFormInput from "../hooks/useFormInput";

export default function Profile() {
  const rootData = useRouteLoaderData("root") as { user?: User } | undefined;
  const user = rootData?.user;
  const [form, handleInput] = useFormInput({
    name: user?.name ?? "",
    username: user?.username ?? "",
    birthDate: user?.birthDate ?? "",
    gender: user?.gender ?? "",
    job: user?.job ?? "",
    workLocation: user?.workLocation ?? "",
    hobby: user?.hobby ?? "",
    biodata: user?.biodata ?? user?.bio ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  // useEffect(() => {
  //   if (!user) {
  //     return;
  //   }

  //   setField("name", user.name ?? "");
  //   setField("username", user.username ?? "");
  //   setField("birthDate", user.birthDate ?? "");
  //   setField("gender", user.gender ?? "");
  //   setField("job", user.job ?? "");
  //   setField("workLocation", user.workLocation ?? "");
  //   setField("hobby", user.hobby ?? "");
  //   setField("biodata", user.biodata ?? user.bio ?? "");
  // }, [setField, user]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(undefined);
    setError(undefined);

    try {
      const response = await api.patch<ApiResponse<User>>("/users/profile", form);
      const token = getToken();

      if (token) {
        setAuthSession({
          token,
          user: response.data.data,
        });
      }

      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-slate-600">Update your account information.</p>
      </div>

      <div className="flex flex-col gap-6">
        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
            <p className="mt-1 text-sm text-slate-500">Edit your profile details and public identity.</p>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-3">
              <label htmlFor="name">Name</label>
              <Input type="text" id="name" value={form.name} onChange={handleInput} />
            </div>

            <div className="mb-3">
              <label htmlFor="username">Username</label>
              <Input type="text" id="username" value={form.username} onChange={handleInput} />
            </div>

            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <Input type="email" id="email" value={user?.emailAddress ?? ""} disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="mb-3">
                <label htmlFor="birthDate">Birth Date</label>
                <Input type="date" id="birthDate" value={form.birthDate} onChange={handleInput} />
              </div>

              <div className="mb-3">
                <label htmlFor="gender">Gender</label>
                <Input type="text" id="gender" value={form.gender} onChange={handleInput} />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="mb-3">
                <label htmlFor="job">Job</label>
                <Input type="text" id="job" value={form.job} onChange={handleInput} />
              </div>

              <div className="mb-3">
                <label htmlFor="workLocation">Work Location</label>
                <Input type="text" id="workLocation" value={form.workLocation} onChange={handleInput} />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="hobby">Hobby</label>
              <Input type="text" id="hobby" value={form.hobby} onChange={handleInput} />
            </div>

            <div className="mb-5">
              <label htmlFor="biodata">Biodata</label>
              <Input type="text" id="biodata" value={form.biodata} onChange={handleInput} />
            </div>

            {message && <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
            {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </section>

        {/* <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">Update Password</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your current password before setting a new one.</p>
          </div>

          <form action="">
            <div className="mb-3">
              <label htmlFor="old_password">Old Password</label>
              <Input type="password" id="old_password" value="" disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="mb-3">
                <label htmlFor="new_password">New Password</label>
                <Input type="password" id="new_password" value="" disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
              </div>

              <div className="mb-3">
                <label htmlFor="confirm_new_password">Confirm New Password</label>
                <Input type="password" id="confirm_new_password" value="" disabled className="cursor-not-allowed bg-slate-100 text-slate-500" />
              </div>
            </div>

            <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Password update endpoint belum tersedia di backend saat ini.
            </p>

            <div className="flex justify-end">
              <Button type="button" disabled>Update Password</Button>
            </div>
          </form>
        </section> */}
      </div>
    </main>
  );
}
