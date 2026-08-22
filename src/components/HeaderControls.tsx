import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoutButton from "@/components/LogoutButton";
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
  /** The signed-in address, or null. Decides whether logout is offered. */
  email: string | null;
}) {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <LanguageSwitcher />
      {email ? <LogoutButton email={email} /> : null}
      <ThemeToggle initialTheme={initialTheme} />
    </div>
  );
}
