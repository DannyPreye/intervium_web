"use client";

import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal } from "./modal";
import { Button } from "./button";

type ConfirmOptions = {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** "danger" renders a red confirm button for destructive actions. */
  variant?: "primary" | "danger";
};

type ConfirmFn = (opts?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Promise-based replacement for window.confirm — renders a themed alert dialog.
 *  Usage: const confirm = useConfirm(); if (!(await confirm({...}))) return; */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});

  const confirm = useCallback<ConfirmFn>((options = {}) => {
    setOpts(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((result: boolean) => {
    resolver.current(result);
    resolver.current = () => {};
    setOpts(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => settle(false)} title={opts?.title ?? "Are you sure?"}>
        <div className="space-y-6">
          {opts?.description && (
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{opts.description}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => settle(false)}>
              {opts?.cancelText ?? "Cancel"}
            </Button>
            <Button
              variant={opts?.variant === "danger" ? "danger" : "primary"}
              size="sm"
              onClick={() => settle(true)}
              autoFocus
            >
              {opts?.confirmText ?? "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
