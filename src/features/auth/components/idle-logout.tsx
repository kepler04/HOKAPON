"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { logout } from "@/features/auth/actions";

const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 min of inactivity → sign out
const WARN_BEFORE_MS = 60 * 1000; // show a warning 1 min before

/**
 * Auto sign-out after inactivity in the admin panel. Any mouse/keyboard/touch
 * activity resets the timer. A short warning appears before logging out so the
 * admin can stay if they're still around.
 */
export function IdleLogout() {
  const [warning, setWarning] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearTimers() {
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (outTimer.current) clearTimeout(outTimer.current);
    }

    function doLogout() {
      setLoggingOut(true);
      // Server action clears the auth cookies, then sends us to /login.
      void logout();
    }

    function reset() {
      clearTimers();
      setWarning(false);
      warnTimer.current = setTimeout(
        () => setWarning(true),
        IDLE_LIMIT_MS - WARN_BEFORE_MS,
      );
      outTimer.current = setTimeout(doLogout, IDLE_LIMIT_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    // Throttle resets so we don't reschedule on every pixel of mouse movement.
    let last = 0;
    function onActivity() {
      const now = Date.now();
      if (now - last < 1000) return;
      last = now;
      reset();
    }

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    reset();

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);

  if (!warning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[70] w-full max-w-xs rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-800">
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-900">
            Sesión por expirar
          </p>
          <p className="mt-0.5 text-xs text-amber-800">
            Por inactividad cerraremos tu sesión en menos de 1 minuto. Mueve el
            mouse para seguir conectado.
          </p>
        </div>
      </div>
    </div>
  );
}
