import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CalendarDays, Check, Clock3, ExternalLink, Video, X } from "lucide-react";
import { Button } from "./Button";
import { useLanguage } from "../../i18n/LanguageContext";

type SchedulingModalProps = { isOpen: boolean; onClose: () => void };
type Slot = { startAt: string; endAt: string };
type LoadState = "idle" | "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";

function dateInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function SchedulingModal({ isOpen, onClose }: SchedulingModalProps) {
  const titleId = useId();
  const { copy, language } = useLanguage();
  const modal = copy.scheduleModal;
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [timeZone, setTimeZone] = useState("America/Bogota");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [meeting, setMeeting] = useState<{ meetUrl?: string; eventUrl?: string; startAt?: string } | null>(null);
  const minDate = useMemo(() => dateInputValue(new Date()), []);
  const maxDate = useMemo(() => dateInputValue(new Date(Date.now() + 30 * 86_400_000)), []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !date) return;
    const controller = new AbortController();
    setLoadState("loading");
    setSelectedSlot("");
    setSlots([]);
    setErrorMessage("");

    fetch(`/api/scheduling/availability?date=${encodeURIComponent(date)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.message || modal.availabilityError);
        setSlots(result.slots || []);
        setTimeZone(result.timeZone || "America/Bogota");
        setLoadState("ready");
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadState("error");
        setErrorMessage(error instanceof Error ? error.message : modal.availabilityError);
      });

    return () => controller.abort();
  }, [date, isOpen, modal.availabilityError]);

  if (!isOpen) return null;

  const formatTime = (value: string) => new Intl.DateTimeFormat(language === "es" ? "es-CO" : "en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSlot) {
      setErrorMessage(modal.selectTimeError);
      return;
    }
    setSubmitState("submitting");
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/scheduling/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          phone: String(formData.get("phone") || "").trim(),
          interest: String(formData.get("interest") || "").trim(),
          startAt: selectedSlot,
          language,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || modal.error);
      setMeeting(result);
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : modal.error);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[75] grid place-items-center overflow-y-auto bg-slate-950/85 px-3 py-6 backdrop-blur-md sm:px-4 sm:py-10">
      <button type="button" className="absolute inset-0 cursor-default" aria-label={modal.closeForm} onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 w-full max-w-4xl rounded-2xl border border-white/15 bg-slate-950 p-5 text-white shadow-[0_2rem_8rem_rgba(0,0,0,0.6)] sm:p-8">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white" aria-label={modal.closeForm}>
          <X className="h-5 w-5" />
        </button>

        {submitState === "success" ? (
          <div className="mx-auto max-w-xl py-8 text-center" role="status">
            <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-slate-500 bg-slate-800"><Check className="h-6 w-6" /></span>
            <h2 id={titleId} className="mb-3 text-3xl font-semibold tracking-tight">{modal.successTitle}</h2>
            <p className="mb-6 text-slate-300">{modal.successDescription}</p>
            {meeting?.startAt && <p className="mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"><CalendarDays className="mr-2 inline h-4 w-4" />{new Intl.DateTimeFormat(language === "es" ? "es-CO" : "en-US", { dateStyle: "long", timeStyle: "short", timeZone }).format(new Date(meeting.startAt))}</p>}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {meeting?.meetUrl && <a href={meeting.meetUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 font-semibold text-slate-950 hover:bg-slate-100"><Video className="h-4 w-4" />{modal.joinMeet}<ExternalLink className="h-4 w-4" /></a>}
              <Button type="button" variant="outline" onClick={onClose}>{modal.close}</Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{modal.eyebrow}</p>
            <h2 id={titleId} className="mb-3 pr-12 text-3xl font-semibold tracking-tight sm:text-4xl">{modal.title}</h2>
            <p className="mb-7 max-w-2xl text-slate-300">{modal.description}</p>

            <form className="grid gap-7 lg:grid-cols-[1fr_0.95fr]" onSubmit={handleSubmit}>
              <div className="grid content-start gap-4">
                <label className="grid gap-2 text-sm text-slate-200">{modal.name}<input name="name" required minLength={2} maxLength={100} autoComplete="name" className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400" placeholder={modal.namePlaceholder} /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-200">{modal.email}<input name="email" type="email" required maxLength={160} autoComplete="email" className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400" placeholder={modal.emailPlaceholder} /></label>
                  <label className="grid gap-2 text-sm text-slate-200">{modal.phone}<input name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400" placeholder={modal.phonePlaceholder} /></label>
                </div>
                <label className="grid gap-2 text-sm text-slate-200">{modal.interest}<textarea name="interest" required minLength={10} maxLength={2000} rows={5} className="resize-y rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-slate-400" placeholder={modal.interestPlaceholder} /></label>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                <label className="mb-5 grid gap-2 text-sm text-slate-200"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{modal.date}</span><input type="date" value={date} min={minDate} max={maxDate} onChange={(event) => setDate(event.target.value)} required className="rounded-lg border border-white/15 bg-slate-900 px-4 py-3 text-white [color-scheme:dark] focus:border-slate-400" /></label>
                <div className="mb-3 flex items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm text-slate-200"><Clock3 className="h-4 w-4" />{modal.time}</span><span className="text-xs text-slate-500">{timeZone}</span></div>
                <div className="grid max-h-52 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
                  {loadState === "idle" && <p className="col-span-full py-6 text-center text-sm leading-relaxed text-slate-400">{modal.selectDatePrompt}</p>}
                  {loadState === "loading" && <p className="col-span-full py-6 text-center text-sm text-slate-400">{modal.loading}</p>}
                  {loadState === "ready" && slots.length === 0 && <p className="col-span-full py-6 text-center text-sm text-slate-400">{modal.noTimes}</p>}
                  {slots.map((slot) => <button key={slot.startAt} type="button" onClick={() => setSelectedSlot(slot.startAt)} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${selectedSlot === slot.startAt ? "border-white bg-white text-slate-950" : "border-white/15 bg-white/5 text-slate-200 hover:border-white/35 hover:bg-white/10"}`}>{formatTime(slot.startAt)}</button>)}
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">{modal.invitationNote}</p>
              </div>

              {errorMessage && <p className="rounded-lg border border-red-400/25 bg-red-950/35 px-4 py-3 text-sm text-red-100 lg:col-span-2" role="alert">{errorMessage}</p>}
              <Button type="submit" disabled={submitState === "submitting" || !selectedSlot} className="w-full bg-white text-slate-950 hover:bg-slate-100 lg:col-span-2">{submitState === "submitting" ? modal.scheduling : modal.schedule}<ArrowRight className="h-4 w-4" /></Button>
            </form>
          </>
        )}
      </section>
    </div>,
    document.body,
  );
}
