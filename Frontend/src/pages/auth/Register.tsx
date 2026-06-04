import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { FaArrowLeft, FaArrowRight, FaCheck, FaRegIdCard, FaUser } from "react-icons/fa6";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SelectWithOther from "../../components/SelectWithOther";
import usePostForm from "../../hooks/usePostForm";
import { setAuthSession } from "../../utils/auth";
import type { User } from "../../utils/types";
import useFormInput from "../../hooks/useFormInput";
import Select from "../../components/Select";
import FieldErrorMessage from "../../components/FieldErrorMessage";

type RegisterForm = {
  name: string;
  username: string;
  emailAddress: string;
  password: string;
  birthDate: string;
  gender: string;
  job: string;
  workLocation: string;
  hobby: string;
};

type RegisterResult = {
  user: User;
  token: string;
};

type RegisterResponse = {
  message: string;
  data: RegisterResult;
};

const steps = [
  {
    title: "Account",
    description: "Create your login identity.",
    icon: FaUser,
  },
  {
    title: "Profile",
    description: "Personalize your wellness profile.",
    icon: FaRegIdCard,
  },
];

const jobOptions = [
  { label: "Student", value: "Student" },
  { label: "Software Developer", value: "Software Developer" },
  { label: "Teacher", value: "Teacher" },
  { label: "Healthcare Worker", value: "Healthcare Worker" },
  { label: "Designer", value: "Designer" },
  { label: "Entrepreneur", value: "Entrepreneur" },
];

const hobbyOptions = [
  { label: "Reading", value: "Reading" },
  { label: "Music", value: "Music" },
  { label: "Sports", value: "Sports" },
  { label: "Gaming", value: "Gaming" },
  { label: "Cooking", value: "Cooking" },
  { label: "Traveling", value: "Traveling" },
];

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const workLocationOptions = [
  { label: "On Site", value: "on_site" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Anywhere", value: "anywhere" },
];

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, handleInputChange, updateField] = useFormInput<RegisterForm>({
    name: "",
    username: "",
    emailAddress: "",
    password: "",
    birthDate: "",
    gender: "",
    job: "",
    workLocation: "",
    hobby: "",
  });
  const { submit, loading, error } = usePostForm<RegisterForm, RegisterResponse>("/auth/register", {
    onSuccess: (response) => {
      console.log(response.data);
      setAuthSession(response.data);
      navigate("/");
    },
  });

  const isFirstStep = currentStep === 1;
  const isSecondStep = currentStep === 2;

  function handleContinue() {
    setCurrentStep(2);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isFirstStep) {
      handleContinue();
      return;
    }
    await submit(form);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-lg md:min-h-120 md:flex-row">
        <aside className="flex bg-primary p-8 sm:p-12 md:w-2/5 md:flex-col md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black sm:text-5xl">CogniCare</h1>
            <p className="mt-4 max-w-xs text-lg font-medium leading-8 text-black">
              Build a profile that helps CogniCare understand your daily rhythm and support better mental recovery.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const Icon = step.icon;
              const isActive = currentStep === stepNumber;
              const isComplete = currentStep > stepNumber;

              return (
                <div
                  key={step.title}
                  className={`flex items-start gap-3 rounded-md p-3 transition-colors ${
                    isActive || isComplete ? "bg-white/50" : "bg-white/20"
                  }`}
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    isComplete ? "bg-emerald-500 text-white" : "bg-white text-slate-900"
                  }`}>
                    {isComplete ? <FaCheck /> : <Icon />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">
                      Step {stepNumber}: {step.title}
                    </p>
                    <p className="text-sm text-slate-700">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 hidden text-center md:block">
            <p className="mb-3 text-lg font-semibold text-slate-800">Have an account?</p>
            <Link
              to="/auth"
              className="inline-flex w-36 items-center justify-center rounded-md border border-black px-4 py-2 font-semibold text-slate-900 transition-colors hover:bg-white/40"
            >
              Log in
            </Link>
          </div>
        </aside>

        <div className="flex flex-1 items-center justify-center p-8 sm:p-12">
          <form className="w-full max-w-md" onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="text-sm font-semibold text-primary-700">Step {currentStep} of 2</p>
              <h2 className="mt-1 text-4xl font-semibold text-black sm:text-5xl">
                {isFirstStep ? "Create Account" : "Complete Profile"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isFirstStep
                  ? "Start with the credentials you will use to sign in."
                  : "Tell us a little more about your daily context."}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2">
              {steps.map((step, index) => {
                const stepNumber = index + 1;

                return (
                  <div key={step.title} className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        currentStep >= stepNumber ? "w-full bg-primary" : "w-0 bg-primary"
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {isFirstStep && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="name">Name</label>
                  <Input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                  <FieldErrorMessage message={error?.getFieldError("name")} />
                </div>

                <div>
                  <label htmlFor="username">Username</label>
                  <Input
                    type="text"
                    id="username"
                    value={form.username}
                    onChange={handleInputChange}
                  />
                  <FieldErrorMessage message={error?.getFieldError("username")} />
                </div>

                <div>
                  <label htmlFor="emailAddress">Email address</label>
                  <Input
                    type="email"
                    id="emailAddress"
                    value={form.emailAddress}
                    onChange={handleInputChange}
                  />
                  <FieldErrorMessage message={error?.getFieldError("emailAddress")} />
                </div>

                <div>
                  <label htmlFor="password">Password</label>
                  <Input
                    type="password"
                    id="password"
                    value={form.password}
                    onChange={handleInputChange}
                  />
                  <FieldErrorMessage message={error?.getFieldError("password")} />
                </div>
              </div>
            )}

            {isSecondStep && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="birthDate">Birthdate</label>
                    <Input
                      type="date"
                      id="birthDate"
                      value={form.birthDate}
                      onChange={handleInputChange}
                      />
                    <FieldErrorMessage message={error?.getFieldError("birthDate")} />
                  </div>

                  <div>
                    <label htmlFor="gender">Gender</label>
                    <Select
                      id="gender"
                      value={form.gender}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-black/50 px-3 py-2 text-black shadow-md focus:outline-primary-500"
                      options={genderOptions}
                    />
                    <FieldErrorMessage message={error?.getFieldError("gender")} />
                  </div>
                </div>

                <div>
                  <label htmlFor="job">Job</label>
                  <SelectWithOther
                    id="job"
                    value={form.job}
                    options={jobOptions}
                    placeholder="Select job"
                    otherLabel="Other"
                    otherPlaceholder="Type your job"
                    onValueChange={updateField}
                  />
                  <FieldErrorMessage message={error?.getFieldError("job")} />
                </div>

                <div>
                  <label htmlFor="workLocation">Work location</label>
                  <Select
                    id="workLocation"
                    value={form.workLocation}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-black/50 px-3 py-2 text-black shadow-md focus:outline-primary-500"
                    options={workLocationOptions}
                  />
                  <FieldErrorMessage message={error?.getFieldError("workLocation")} />
                </div>

                <div>
                  <label htmlFor="hobby">Hobby</label>
                  <SelectWithOther
                    id="hobby"
                    value={form.hobby}
                    options={hobbyOptions}
                    placeholder="Select hobby"
                    otherLabel="Other"
                    otherPlaceholder="Type your hobby"
                    onValueChange={updateField}
                  />
                  <FieldErrorMessage message={error?.getFieldError("hobby")} />
                </div>
              </div>
            )}

            {(error && error.errors.length === 0) && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error.message}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {isSecondStep ? (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  disabled={loading}
                  onClick={() => setCurrentStep(1)}
                >
                  <FaArrowLeft />
                  Back
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-50 md:hidden"
                >
                  Log in
                </Link>
              )}

              <Button type="submit" className="justify-center disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-40" disabled={loading}>
                {isFirstStep ? (
                  <>
                    Continue
                    <FaArrowRight />
                  </>
                ) : (
                  loading ? "Registering..." : "Register"
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
