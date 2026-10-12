"use client";
import { useEffect } from "react";
/** Replace older offline workers so archived practice cannot be served from cache. */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then(reg => reg.update()).catch(() => {});
    }
  }, []);
  return null;
}
