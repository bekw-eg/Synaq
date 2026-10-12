"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/providers/AccountProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { navigateAfterAuth } from "@/lib/client-auth";

export function ExamAccount() {
  const { user } = useAccount(), { locale } = useLanguage(), kk = locale === "kk";
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      await navigateAfterAuth("/login");
    } catch { setError(kk ? "Шығу мүмкін болмады. Қайта көріңіз." : "Не удалось выйти. Повторите попытку."); setBusy(false); }
  }
  return <><Header title={kk ? "Аккаунт" : "Аккаунт"} /><div className="page-content reading-content">
    <section className="space-y-4 rounded-lg border p-4 sm:p-6"><p className="break-words font-medium">{user?.name}</p><p className="break-all text-muted-foreground">{user?.email}</p>
      <Button variant="outline" disabled={busy} onClick={logout}>{kk ? "Шығу" : "Выйти"}</Button>
      {error && <p role="alert">{error}</p>}
    </section>
    <section aria-labelledby="phone-launch-title" className="space-y-3 rounded-lg border p-4 sm:p-6">
      <h2 id="phone-launch-title" className="section-title">{kk ? "Телефонда жылдам ашу" : "Быстрый запуск на телефоне"}</h2>
      <p className="text-sm text-muted-foreground">{kk
        ? "Synaq белгішесін басты экранға қосыңыз. Сынақтар мен нәтижелер үшін интернет қажет."
        : "Добавьте значок Synaq на главный экран. Для пробников и результатов нужен интернет."}</p>
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">Android · Chrome</summary>
        <p className="py-2">{kk
          ? "Chrome мәзірін (⋮) ашыңыз → «Басты экранға қосу» → «Орнату». Егер орнату ұсынылмаса, таңбаша қосуға болады."
          : "Откройте меню Chrome (⋮) → «Добавить на главный экран» → «Установить». Если установка не предлагается, можно создать ярлык."}</p>
      </details>
      <details className="text-sm">
        <summary className="cursor-pointer font-medium">iPhone · Safari</summary>
        <p className="py-2">{kk
          ? "Сайтты Safari арқылы ашыңыз → «Бөлісу» → «Басты экранға қосу» → «Қосу»."
          : "Откройте сайт в Safari → «Поделиться» → На экран «Домой» → «Добавить»."}</p>
      </details>
    </section>
  </div></>;
}
