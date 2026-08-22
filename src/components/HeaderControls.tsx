import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * The fixed top-right cluster. Positioning lives here rather than on each
 * control so the two stay aligned and a third one can be added without
 * re-deriving offsets.
 */
export default function HeaderControls() {
  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}
