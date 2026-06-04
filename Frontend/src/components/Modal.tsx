import { useEffect, useState, type ReactNode } from "react";

type ModalProps = {
  onClose: () => void;
  title?: string;
  children?: ReactNode;
};

export default function Modal({ onClose, title = "Modal Header", children }: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const animationFrame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      cancelAnimationFrame(animationFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col rounded-xl bg-white shadow-xl transition-all duration-200 ease-out sm:max-h-[calc(100vh-3rem)] ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-xl leading-none text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-4 text-sm leading-6 text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}
