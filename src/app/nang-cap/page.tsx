import type { Metadata } from "next";

import UpgradeCheckout from "@/components/UpgradeCheckout";
import { getServerDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerDictionary();

  return {
    title: t.meta.upgradeTitle,
    description: t.meta.upgradeDescription,
  };
}

export default function UpgradePage() {
  return (
    <main className="min-h-full bg-background">
      <UpgradeCheckout />
    </main>
  );
}
