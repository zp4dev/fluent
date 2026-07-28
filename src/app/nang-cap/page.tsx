import type { Metadata } from "next";

import UpgradeCheckout from "@/components/UpgradeCheckout";

export const metadata: Metadata = {
  title: "Nâng cấp Pro — Fluent",
  description:
    "Nâng cấp Fluent Pro để mở khóa nghĩa mở rộng, cụm từ đi kèm và họ từ vựng cho mọi từ.",
};

export default function UpgradePage() {
  return (
    <main className="min-h-full bg-background">
      <UpgradeCheckout />
    </main>
  );
}
