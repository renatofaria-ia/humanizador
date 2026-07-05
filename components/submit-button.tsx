"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  cooldownSeconds?: number;
  cooldownLabel?: string;
};

export function SubmitButton({
  label,
  pendingLabel,
  className,
  cooldownSeconds = 0,
  cooldownLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const [remaining, setRemaining] = useState(cooldownSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remaining]);

  const isCoolingDown = remaining > 0;

  return (
    <button
      type="submit"
      disabled={pending || isCoolingDown}
      className={
        className ??
        "button-primary"
      }
    >
      {pending
        ? pendingLabel ?? "Salvando..."
        : isCoolingDown
          ? cooldownLabel ?? `Aguarde ${remaining}s`
          : label}
    </button>
  );
}
