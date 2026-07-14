import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "./Button";
import { useLanguage } from "../../i18n/LanguageContext";

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const { copy, language } = useLanguage();
  const modal = copy.contactModal;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      language,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? modal.error);
      }

      form.reset();
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : modal.error,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/80 px-4 py-10 backdrop-blur-md">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={modal.closeForm}
        onClick={onClose}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-xl rounded-2xl border border-white/15 bg-slate-950 p-6 text-white shadow-[0_2rem_8rem_rgba(0,0,0,0.55)] sm:p-9"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={modal.closeForm}
        >
          <X className="h-5 w-5" />
        </button>

        {submitState === "success" ? (
          <div className="py-8 text-center" role="status">
            <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-slate-500 bg-slate-800">
              <Check className="h-6 w-6" />
            </span>
            <h2 id={titleId} className="mb-3 text-3xl font-semibold tracking-tight">
              {modal.successTitle}
            </h2>
            <p id={descriptionId} className="mx-auto mb-8 max-w-md text-slate-300">
              {modal.successDescription}
            </p>
            <Button type="button" onClick={onClose} className="bg-white text-slate-950 hover:bg-slate-100">
              {modal.close}
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {modal.eyebrow}
            </p>
            <h2 id={titleId} className="mb-3 pr-12 text-3xl font-semibold tracking-tight sm:text-4xl">
              {modal.title}
            </h2>
            <p id={descriptionId} className="mb-8 max-w-lg text-slate-300">
              {modal.description}
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-name" className="mb-2 block text-sm text-slate-200">
                  {modal.name}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400"
                  placeholder={modal.namePlaceholder}
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="mb-2 block text-sm text-slate-200">
                  {modal.email}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  maxLength={160}
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400"
                  placeholder={modal.emailPlaceholder}
                />
              </div>

              <div>
                <label htmlFor="contact-phone" className="mb-2 block text-sm text-slate-200">
                  {modal.phone}
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  required
                  minLength={7}
                  maxLength={30}
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400"
                  placeholder={modal.phonePlaceholder}
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm text-slate-200">
                  {modal.details}
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={5}
                  className="w-full resize-y rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400"
                  placeholder={modal.detailsPlaceholder}
                />
              </div>

              {submitState === "error" && (
                <p className="rounded-lg border border-red-400/25 bg-red-950/35 px-4 py-3 text-sm text-red-100" role="alert">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitState === "submitting"}
                className="w-full bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99]"
              >
                {submitState === "submitting" ? modal.sending : modal.send}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
