import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  NotebookPen,
  FolderClosed,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { SITE } from "../siteConfig";

const NAV = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/logs", label: "Logs", Icon: NotebookPen },
  { to: "/documents", label: "Documents", Icon: FolderClosed },
  { to: "/ai-summary", label: "AI Insights", Icon: Sparkles },
];

function navLinkClass({ isActive }) {
  return [
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-sage-soft text-sage-dark"
      : "text-ink-soft hover:bg-surface-sunk hover:text-ink",
  ].join(" ");
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sage text-surface">
        <Sparkles size={16} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        {SITE.name}
      </span>
    </div>
  );
}

function NavItem({ to, label, Icon, end, onNavigate }) {
  return (
    <NavLink to={to} end={end} className={navLinkClass} onClick={onNavigate}>
      <Icon size={18} strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <NavItem key={item.to} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function AccountFooter() {
  const { parent, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="border-t border-line px-3 pt-3">
      {parent?.email && (
        <p className="truncate px-3 pb-2 text-xs text-ink-faint" title={parent.email}>
          {parent.email}
        </p>
      )}
      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink"
      >
        <LogOut size={18} strokeWidth={1.75} />
        Log out
      </button>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col justify-between border-r border-line bg-surface py-5 lg:flex">
        <div className="flex flex-col gap-6">
          <Brand />
          <div className="px-3">
            <NavList />
          </div>
        </div>
        <AccountFooter />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="rounded-lg p-2 text-ink-soft hover:bg-surface-sunk"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-10 lg:hidden" onClick={close}>
          <div className="absolute inset-0 bg-ink/20" />
          <div
            className="absolute inset-x-0 top-[57px] flex flex-col gap-4 border-b border-line bg-surface p-4 shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <NavList onNavigate={close} />
            <AccountFooter />
          </div>
        </div>
      )}
    </>
  );
}
