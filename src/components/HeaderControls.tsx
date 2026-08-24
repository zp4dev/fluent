import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import NotebookLink from "@/components/notebook/NotebookLink";
import ThemeToggle from "@/components/ThemeToggle";
import type { Theme } from "@/lib/theme/config";

/**
 * The fixed top-right cluster. Positioning lives here rather than on each
 * control so they stay aligned and another one can be added without
 * re-deriving offsets.
 */
export default function HeaderControls({
  initialTheme,
  email,
}: {
  initialTheme: Theme;
  /** The signed-in address, or null. Decides which of sign in / out shows. */
  email: string | null;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <NotebookLink />
      <LanguageSwitcher />
      {email ? <LogoutButton email={email} /> : <LoginButton />}
      <ThemeToggle initialTheme={initialTheme} />
    </div>
  );
}
