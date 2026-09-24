"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type HoverPreviewItem = {
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
};

type PreviewContextValue = {
  items: Record<string, HoverPreviewItem>;
  activeId: string | null;
  tooltipId: string;
  setActiveId: (id: string | null) => void;
  setAnchor: (rect: DOMRect | null, pointer?: { x: number; y: number }) => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) {
    throw new Error("PreviewTerm must be used inside HoverPreview");
  }
  return ctx;
}

type HoverPreviewProps = {
  items: Record<string, HoverPreviewItem>;
  children: ReactNode;
};

export function HoverPreview({ items, children }: HoverPreviewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const hideTimer = useRef<number | null>(null);

  const clearHide = useCallback(() => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const setActive = useCallback(
    (id: string | null) => {
      clearHide();
      if (id === null) {
        hideTimer.current = window.setTimeout(() => setActiveId(null), 80);
        return;
      }
      setActiveId(id);
    },
    [clearHide],
  );

  const setAnchor = useCallback((rect: DOMRect | null, pointer?: { x: number; y: number }) => {
    const pad = 24;
    const cardW = 288;
    const rawX = pointer?.x ?? (rect ? rect.left + rect.width / 2 : 0);
    const rawY = pointer?.y ?? (rect ? rect.top : 0);
    const maxX =
      typeof window === "undefined" ? rawX : window.innerWidth - pad - cardW + 12;
    setCoords({
      x: Math.min(Math.max(rawX, pad), Math.max(pad, maxX)),
      y: Math.max(rawY, 88),
    });
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => () => clearHide(), [clearHide]);

  const active = activeId ? items[activeId] : undefined;
  const tooltipId = useId();

  const card = active ? (
    <div
      className="hover-preview-card"
      id={tooltipId}
      role="tooltip"
      style={{
        left: coords.x,
        top: coords.y,
      }}
    >
      {active.image ? (
        <div className="hover-preview-media">
          <Image
            src={active.image}
            alt={active.imageAlt ?? ""}
            fill
            sizes="288px"
            quality={70}
          />
        </div>
      ) : null}
      <strong>{active.title}</strong>
      <span className="hover-preview-sub">{active.subtitle}</span>
    </div>
  ) : null;

  return (
    <PreviewContext.Provider
      value={{ items, activeId, tooltipId, setActiveId: setActive, setAnchor }}
    >
      <div className="hover-preview">
        {children}
        {mounted && card ? createPortal(card, document.body) : null}
      </div>
    </PreviewContext.Provider>
  );
}

type PreviewTermProps = {
  id: string;
  children: ReactNode;
};

export function PreviewTerm({ id, children }: PreviewTermProps) {
  const { items, activeId, tooltipId, setActiveId, setAnchor } = usePreview();
  const item = items[id];
  const termRef = useRef<HTMLSpanElement>(null);

  if (!item) return <>{children}</>;

  const show = (pointer?: { x: number; y: number }) => {
    const rect = termRef.current?.getBoundingClientRect() ?? null;
    setAnchor(rect, pointer);
    setActiveId(id);
  };

  const onMouseMove = (event: MouseEvent<HTMLSpanElement>) => {
    setAnchor(null, { x: event.clientX, y: event.clientY });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Escape") {
      setActiveId(null);
      termRef.current?.blur();
    }
  };

  return (
    <span
      ref={termRef}
      role="button"
      tabIndex={0}
      className="hover-preview-term"
      aria-describedby={activeId === id ? tooltipId : undefined}
      onMouseEnter={(event) => show({ x: event.clientX, y: event.clientY })}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setActiveId(null)}
      onFocus={() => show()}
      onBlur={() => setActiveId(null)}
      onKeyDown={onKeyDown}
    >
      {children}
    </span>
  );
}
