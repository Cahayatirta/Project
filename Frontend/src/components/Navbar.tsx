import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { Link, NavLink, useNavigate } from "react-router";
import { clearAuthSession } from "../utils/auth";

const navLinks = [
  { label: "Dashboard", to: "/" },
  { label: "History", to: "/history" },
  { label: "Social", to: "/social" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate()

  const logout = () => {
    setIsUserMenuOpen(false)    
    clearAuthSession();
    return navigate('/auth');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-md px-3 py-2 font-semibold transition-colors",
      isActive
        ? "bg-primary-100 text-primary-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    ].join(" ");

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 left-0 right-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="text-3xl font-bold text-primary-300">
          CogniCare
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-6 md:flex">

          <div className="relative">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              onClick={() => setIsUserMenuOpen((open) => !open)}
            >
              <FiUser className="size-5" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-20 mt-3 w-40 rounded-md border border-slate-200 bg-white py-2 shadow-lg">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  Profil
                </Link>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
            <span className="h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <Link
              to="/profile"
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              onClick={() => setIsMenuOpen(false)}
            >
              Profil
            </Link>
            <button
              type="button"
              className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              onClick={() => logout()}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
