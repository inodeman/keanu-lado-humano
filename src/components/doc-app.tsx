import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Pause, Play } from "lucide-react";
import { chapters, copy, credits, slides, type Lang } from "@/data/film";

type Pack = Record<
  Lang,
  {
    title: string;
    description: string;
    hashtags: string;
    duration: number;
    chapters: { t: number; label: string }[];
  }
>;

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function DocApp() {
  const [lang, setLang] = useState<Lang>("es");
  const [pack, setPack] = useState<Pack | null>(null);
  const [cutOk, setCutOk] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [audioMissing, setAudioMissing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const text = copy[lang];
  const description = pack?.[lang]?.description ?? text.description;
  const chaptersLive = pack?.[lang]?.chapters;

  useEffect(() => {
    fetch("/film/package.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.es && data?.en) setPack(data as Pack);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let gone = false;
    const src = lang === "es" ? "/film/keanu-es.mp4" : "/film/keanu-en.mp4";
    fetch(src, { method: "HEAD" })
      .then((r) => {
        if (!gone) setCutOk(r.ok);
      })
      .catch(() => {
        if (!gone) setCutOk(false);
      });
    return () => {
      gone = true;
    };
  }, [lang]);

  useEffect(() => {
    setPlaying(false);
    setTime(0);
    setAudioMissing(false);
    const audio = audioRef.current;
    if (!audio || cutOk) return;
    audio.pause();
    audio.src = lang === "es" ? "/audio/keanu-es.mp3" : "/audio/keanu-en.mp3";
    audio.load();
  }, [lang, cutOk]);

  const ratio = dur > 0 ? time / dur : 0;
  const slide = useMemo(() => {
    let current = slides[0];
    for (const item of slides) {
      if (ratio + 0.001 >= item.ratio) current = item;
    }
    return current;
  }, [ratio]);
  const chapter = useMemo(() => {
    let current = chapters[0];
    for (const item of chapters) {
      if (ratio + 0.001 >= item.ratio) current = item;
    }
    return current;
  }, [ratio]);

  async function toggle() {
    if (cutOk) {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        await video.play();
        setPlaying(true);
      } else {
        video.pause();
        setPlaying(false);
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setAudioMissing(true);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  function seekRatio(next: number) {
    const media = cutOk ? videoRef.current : audioRef.current;
    if (!media || !dur) return;
    media.currentTime = Math.min(dur, Math.max(0, next * dur));
  }

  async function onCopy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  const shownDuration = pack?.[lang]?.duration || dur;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6">
      <header className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-[0.22em] text-lamp uppercase">
          {text.kicker}
        </p>
        <div className="flex rounded-full border border-line bg-surface p-1">
          {(["es", "en"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setLang(id)}
              className={`min-h-11 rounded-full px-4 text-sm ${
                lang === id ? "bg-fg text-bg" : "text-muted"
              }`}
            >
              {id === "es" ? "Español" : "English"}
            </button>
          ))}
        </div>
      </header>

      <p className="mt-8 text-sm text-rain">{text.person}</p>
      <h1 className="mt-2 max-w-xl font-serif text-4xl leading-tight text-fg sm:text-5xl">
        {text.title}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{text.deck}</p>

      <section className="mt-6 overflow-hidden rounded-card border border-line bg-surface">
        <div className="relative aspect-video bg-bg" onClick={toggle}>
          {cutOk ? (
            <video
              ref={videoRef}
              key={lang}
              src={lang === "es" ? "/film/keanu-es.mp4" : "/film/keanu-en.mp4"}
              poster={lang === "es" ? "/film/thumb-es.jpg" : "/film/thumb-en.jpg"}
              playsInline
              className="h-full w-full bg-bg object-contain"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
              onError={() => setCutOk(false)}
            />
          ) : (
            <>
              <img
                key={slide.src + chapter.id}
                src={slide.src}
                alt="Keanu Reeves"
                className="still-drift h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/20" />
              <p className="absolute right-4 bottom-4 left-4 max-w-md font-serif text-lg leading-snug text-fg sm:text-2xl">
                {chapter.line[lang]}
              </p>
            </>
          )}
          {!playing && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggle();
              }}
              className="absolute top-1/2 left-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-lamp text-bg"
              aria-label={lang === "es" ? "Reproducir" : "Play"}
            >
              <Play className="ml-1" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 px-3 py-3">
          <button
            type="button"
            onClick={toggle}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-fg text-bg"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={dur ? time / dur : 0}
            onChange={(e) => seekRatio(Number(e.target.value))}
            aria-label={lang === "es" ? "Posición" : "Position"}
          />
          <span className="w-24 shrink-0 text-right text-xs text-muted tabular-nums">
            {clock(time)} / {clock(shownDuration || dur)}
          </span>
        </div>
        {audioMissing && (
          <p className="px-4 pb-3 text-sm text-wick">
            {lang === "es"
              ? "La narración no cargó. Vuelve a intentar en un momento."
              : "Narration did not load. Try again in a moment."}
          </p>
        )}
        {!cutOk && <audio ref={audioRef} preload="metadata" onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} onEnded={() => setPlaying(false)} onError={() => setAudioMissing(true)} />}
      </section>

      <p className="mt-3 text-sm text-muted">
        {lang === "es"
          ? "Corte de unos 9 a 10 minutos. En YouTube ese largo se termina, y pasa de los 8 minutos para poder monetizar."
          : "About a 9 to 10 minute cut. On YouTube that length gets finished, and it clears 8 minutes so it can be monetized."}
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {(chaptersLive
          ? chaptersLive.map((item) => ({ t: item.t, label: item.label, ratio: item.t / (pack?.[lang]?.duration || dur || 1) }))
          : chapters.map((item) => ({ t: item.ratio * (dur || 1), label: item[lang], ratio: item.ratio }))
        ).map((item) => {
          const active = ratio + 0.001 >= item.ratio;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                const media = cutOk ? videoRef.current : audioRef.current;
                if (media && dur) media.currentTime = item.t;
                else seekRatio(item.ratio);
              }}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm ${
                active ? "border-lamp text-lamp" : "border-line text-muted"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <section className="mt-10 rounded-card border border-line bg-surface p-5">
        <p className="text-xs tracking-[0.18em] text-lamp uppercase">
          {lang === "es" ? "Para subir a YouTube" : "For YouTube"}
        </p>
        <h2 className="mt-2 font-serif text-2xl text-fg">
          {lang === "es" ? "Título, descripción y miniaturas" : "Title, description, and thumbnail"}
        </h2>
        <p className="mt-3 font-serif text-xl leading-snug text-fg">{text.ytTitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyButton
            id="title"
            copied={copied}
            label={lang === "es" ? "Copiar título" : "Copy title"}
            onClick={() => onCopy("title", text.ytTitle)}
          />
          <CopyButton
            id="desc"
            copied={copied}
            label={lang === "es" ? "Copiar descripción" : "Copy description"}
            onClick={() => onCopy("desc", description)}
          />
          <CopyButton
            id="tags"
            copied={copied}
            label={lang === "es" ? "Copiar hashtags" : "Copy hashtags"}
            onClick={() => onCopy("tags", text.hashtags)}
          />
        </div>
        <textarea
          readOnly
          value={description}
          className="mt-4 h-56 w-full resize-y rounded-2xl border border-line bg-bg p-4 text-sm leading-relaxed text-fg"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-lamp px-4 text-sm font-medium text-bg"
            href={lang === "es" ? "/film/keanu-es.mp4" : "/film/keanu-en.mp4"}
            download
          >
            <Download size={16} />
            {lang === "es" ? "Descargar video" : "Download video"}
          </a>
          <a
            className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm text-fg"
            href={lang === "es" ? "/film/thumb-es.jpg" : "/film/thumb-en.jpg"}
            download
          >
            <Download size={16} />
            {lang === "es" ? "Descargar miniatura" : "Download thumbnail"}
          </a>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <figure>
            <img
              src="/film/thumb-es.jpg"
              alt="Miniatura en español"
              className="aspect-video w-full rounded-2xl border border-line object-cover"
            />
            <figcaption className="mt-2 text-xs text-muted">1280×720 · Español</figcaption>
          </figure>
          <figure>
            <img
              src="/film/thumb-en.jpg"
              alt="English thumbnail"
              className="aspect-video w-full rounded-2xl border border-line object-cover"
            />
            <figcaption className="mt-2 text-xs text-muted">1280×720 · English</figcaption>
          </figure>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-fg">
          {lang === "es" ? "Fotografías" : "Photographs"}
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          {credits.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {lang === "es"
            ? "InodeAi. La persona detrás del famoso."
            : "InodeAi. The person behind the famous name."}
        </p>
      </section>
    </main>
  );
}

function CopyButton({
  id,
  copied,
  label,
  onClick,
}: {
  id: string;
  copied: string | null;
  label: string;
  onClick: () => void;
}) {
  const on = copied === id;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm text-fg"
    >
      {on ? <Check size={16} /> : <Copy size={16} />}
      {on ? "Listo" : label}
    </button>
  );
}
