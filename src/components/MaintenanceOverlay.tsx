"use client";

import { useI18n } from "@/lib/i18n/context";
import { isMaintenanceMode } from "@/lib/maintenance";

export default function MaintenanceBanner() {
  const { t } = useI18n();

  if (!isMaintenanceMode()) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        role="status"
        className="mx-auto max-w-[960px] rounded-2xl border-2 border-primary bg-highlight px-4 py-3 text-center shadow-sm sm:px-6"
      >
        <p className="text-sm font-extrabold text-heading sm:text-base">
          {t.maintenance.title}
        </p>
        <p className="mt-1 text-xs leading-5 text-body sm:text-sm">
          {t.maintenance.body}
        </p>
      </div>
    </div>
  );
}
