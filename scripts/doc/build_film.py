#!/usr/bin/env python3
"""Build both YouTube cuts: real photos, narration, quiet bed, captions, thumbs."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path("/workspace")
MEDIA = ROOT / "public/media/keanu"
AUDIO = ROOT / "public/audio"
OUT = ROOT / "public/film"
WORK = ROOT / "scripts/doc/work"
FONT_B = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"
FONT_S = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
W, H, FPS = 1920, 1080, 24

SHOTS = [
    ("rooftop.jpg", "Hay una foto", "There is a photograph"),
    ("gaze.jpg", "explica por qué lo queremos", "is why we love him"),
    ("young.jpg", "nació el dos de septiembre", "was born on September"),
    ("hands.jpg", "Creció sobre todo", "grew up mostly"),
    ("down.jpg", "Antes de que nadie", "Before anyone shouted"),
    ("billted.jpg", "llegó Bill y Ted", "Bill and Ted arrived"),
    ("suit.jpg", "Speed, con Sandra", "Speed, with Sandra"),
    ("gaze.jpg", "noventa y nueve, Neo", "In 1999, Neo"),
    ("wick.jpg", "Y John Wick", "And John Wick"),
    ("ribbon.jpg", "listón azul", "blue ribbon"),
    ("e3-crowd.jpg", "en el E3", "at E3"),
    ("e3-smile.jpg", "los impresionantes eran ellos", "they were the breathtaking"),
    ("bass-now.jpg", "Dogstar", "Dogstar"),
    ("lying.jpg", "River Phoenix murió", "River Phoenix died"),
    ("bass-90s.jpg", "La Nochebuena", "On Christmas Eve"),
    ("down.jpg", "Jennifer murió", "Jennifer died"),
    ("rooftop.jpg", "El duelo cambia", "Grief changes shape"),
    ("hands.jpg", "Su hermana Kim", "His sister Kim"),
    ("fans.jpg", "foto del sándwich", "sandwich photograph"),
    ("e3-cyber.jpg", "lo llamen santo", "call him a saint"),
    ("gaze.jpg", "cuando morimos", "when we die"),
    ("lying.jpg", "quienes nos aman", "the ones who love us"),
    ("bass-90s.jpg", "ser pequeño", "being small"),
    ("hands.jpg", "vida rota", "broken life"),
    ("rooftop.jpg", "Termina en un banco", "ends at a bench"),
    ("e3-smile.jpg", "Si algún día lo ves", "If you ever see him"),
]

CHAPTERS = {
    "es": [
        ("La foto", "Hay una foto"),
        ("El nombre", "Keanu Charles Reeves nació"),
        ("Antes del cartel", "Antes de que nadie"),
        ("Las películas", "ochenta y nueve llegó"),
        ("River", "River Phoenix murió"),
        ("Nochebuena", "La Nochebuena"),
        ("Sin su nombre", "Su hermana Kim"),
        ("El banco y la fila", "foto del sándwich"),
        ("Cuando morimos", "cuando morimos"),
        ("La brisa", "vida rota"),
        ("Quédate", "Si esta historia"),
    ],
    "en": [
        ("The photograph", "There is a photograph"),
        ("The name", "Keanu Charles Reeves was born"),
        ("Before the poster", "Before anyone shouted"),
        ("The films", "Bill and Ted arrived"),
        ("River", "River Phoenix died"),
        ("Christmas Eve", "On Christmas Eve"),
        ("Without his name", "His sister Kim"),
        ("The bench and the line", "sandwich photograph"),
        ("When we die", "when we die"),
        ("The breeze", "broken life"),
        ("Stay", "If this story stayed"),
    ],
}


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def load_timing(lang: str) -> tuple[str, list, float]:
    data = json.loads((AUDIO / f"keanu-{lang}.timestamps.json").read_text())
    chars = data["graph_chars"]
    return "".join(chars), data["graph_times"], float(data["duration"])


def find_time(text: str, times: list, cue: str) -> float | None:
    idx = text.find(cue)
    if idx < 0:
        idx = text.casefold().find(cue.casefold())
    if idx < 0 or idx >= len(times):
        return None
    return float(times[idx][0])


def ass_time(seconds: float) -> str:
    seconds = max(0, seconds)
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def caption_events(chars_text: str, times: list) -> list[tuple[float, float, str]]:
    events = []
    buf = ""
    start = None
    last_end = 0.0
    for i, ch in enumerate(chars_text):
        if start is None and ch.strip():
            start = float(times[i][0])
        buf += ch
        last_end = float(times[i][1])
        cut = ch in ".!?\n" or (len(buf) >= 46 and ch == " ")
        if cut and start is not None and buf.strip():
            events.append((start, max(last_end, start + 0.4), " ".join(buf.split())))
            buf = ""
            start = None
    if start is not None and buf.strip():
        events.append((start, last_end, " ".join(buf.split())))
    return events


def write_ass(path: Path, events: list[tuple[float, float, str]]) -> None:
    lines = [
        "[Script Info]",
        "ScriptType: v4.00+",
        "PlayResX: 1920",
        "PlayResY: 1080",
        "WrapStyle: 0",
        "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        "Style: Cap,Liberation Sans,52,&H00E2ECF3,&H000000FF,&H0014100C,&H96000000,-1,0,0,0,100,100,0,0,1,3,0,2,90,90,78,1",
        "",
        "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    for start, end, text in events:
        safe = text.replace("{", "(").replace("}", ")")
        lines.append(
            f"Dialogue: 0,{ass_time(start)},{ass_time(end + 0.12)},Cap,,0,0,0,,{safe}"
        )
    path.write_text("\n".join(lines), encoding="utf-8")


def cover(im: Image.Image, w: int, h: int, bias: float = 0.42) -> Image.Image:
    im = im.convert("RGB")
    scale = max(w / im.width, h / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, min(nw - w, int((nw - w) * 0.5)))
    top = max(0, min(nh - h, int((nh - h) * bias)))
    return im.crop((left, top, left + w, top + h))


def make_thumb(lang: str, dest: Path) -> None:
    base = cover(Image.open(MEDIA / "gaze.jpg"), 1280, 720, 0.32)
    base = ImageEnhance.Contrast(base).enhance(1.08)
    grad = Image.new("L", (1280, 720), 0)
    mask = ImageDraw.Draw(grad)
    for x in range(820):
        mask.line([(x, 0), (x, 720)], fill=int(230 * (1 - x / 820)))
    dark = Image.new("RGB", (1280, 720), (7, 8, 12))
    base = Image.composite(dark, base, grad)
    draw = ImageDraw.Draw(base)
    kicker = ImageFont.truetype(FONT_S, 28)
    big = ImageFont.truetype(FONT_B, 78)
    draw.text((56, 78), "KEANU REEVES", font=kicker, fill=(226, 177, 92))
    lines = (
        ["EL HOMBRE", "QUE ELIGIÓ", "SER BUENO"]
        if lang == "es"
        else ["THE MAN", "WHO STAYED", "KIND"]
    )
    y = 150
    for line in lines:
        draw.text((52, y), line, font=big, fill=(243, 236, 226))
        y += 88
    draw.rectangle((56, y + 8, 168, y + 16), fill=(181, 74, 66))
    dest.parent.mkdir(parents=True, exist_ok=True)
    base.save(dest, quality=90, optimize=True)


def end_card(lang: str, dest: Path) -> None:
    im = Image.new("RGB", (W, H), (7, 8, 12))
    draw = ImageDraw.Draw(im)
    draw.text((140, 340), "KEANU REEVES", font=ImageFont.truetype(FONT_S, 36), fill=(226, 177, 92))
    title = "El hombre que eligió\nser bueno" if lang == "es" else "The man who chose\nto stay kind"
    draw.multiline_text((140, 400), title, font=ImageFont.truetype(FONT_B, 78), fill=(243, 236, 226), spacing=12)
    foot = "InodeAi  ·  la persona detrás del famoso" if lang == "es" else "InodeAi  ·  the person behind the famous name"
    draw.text((140, 860), foot, font=ImageFont.truetype(FONT_R, 32), fill=(163, 152, 140))
    im.save(dest, quality=92)


def write_bed(path: Path, seconds: float, sr: int = 44100) -> None:
    n = int(seconds * sr)
    t = np.arange(n, dtype=np.float64) / sr
    sig = np.zeros(n, dtype=np.float64)
    for freq, amp in ((110, 0.35), (164.81, 0.18), (220, 0.12), (329.63, 0.06)):
        sig += amp * np.sin(2 * np.pi * freq * t)
    pulse = 0.55 + 0.45 * np.sin(2 * np.pi * t / 9.5)
    sig *= pulse
    sig *= np.clip(t / 2.5, 0, 1)
    sig *= np.clip((seconds - t) / 3, 0, 1)
    peak = np.max(np.abs(sig)) or 1
    audio = (sig / peak * 0.22 * 32767).astype(np.int16)
    import wave

    with wave.open(str(path), "w") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(sr)
        handle.writeframes(audio.tobytes())


def render_still(src: Path, dur: float, dest: Path, pan: int) -> None:
    dur = max(dur, 1.4)
    direction = 1 if pan % 2 == 0 else -1
    start = 0 if direction > 0 else 1
    sign = "+" if direction > 0 else "-"
    vf = (
        "scale=2400:1350:force_original_aspect_ratio=increase,"
        f"crop=1920:1080:x='(iw-1920)*({start}{sign}t/{dur:.3f})':y='(ih-1080)*0.4',"
        f"setsar=1,fps={FPS},format=yuv420p,"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={max(0.0, dur - 0.35):.3f}:d=0.35"
    )
    run(
        [
            "ffmpeg", "-y", "-loop", "1", "-i", str(src), "-t", f"{dur:.3f}",
            "-vf", vf, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
            "-pix_fmt", "yuv420p", str(dest),
        ]
    )


def clock(seconds: float) -> str:
    s = int(seconds)
    return f"{s // 60}:{s % 60:02d}"


def build(lang: str) -> dict:
    text, times, duration = load_timing(lang)
    work = WORK / lang
    work.mkdir(parents=True, exist_ok=True)
    cue_index = 0 if lang == "es" else 1
    points: list[tuple[float, str]] = []
    for shot in SHOTS:
        found = find_time(text, times, shot[1 + cue_index])
        if found is None:
            print("missing cue", lang, shot[1 + cue_index])
            continue
        points.append((found, shot[0]))
    points.sort()
    cleaned: list[tuple[float, str]] = []
    for start, name in points:
        if cleaned and start - cleaned[-1][0] < 2.2:
            continue
        cleaned.append((start, name))
    segments = []
    for i, (start, name) in enumerate(cleaned):
        end = cleaned[i + 1][0] if i + 1 < len(cleaned) else duration
        segments.append((start, end - start, name))

    card = work / "end.jpg"
    end_card(lang, card)
    seg_paths = []
    for i, (_start, dur, name) in enumerate(segments):
        dest = work / f"seg-{i:02d}.mp4"
        render_still(MEDIA / name, dur, dest, i)
        seg_paths.append(dest)
        print(lang, i, name, round(dur, 1))
    end_seg = work / "seg-end.mp4"
    render_still(card, 6.5, end_seg, 0)
    seg_paths.append(end_seg)

    concat = work / "concat.txt"
    concat.write_text("".join(f"file '{p.as_posix()}'\n" for p in seg_paths))
    silent = work / "silent.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c", "copy", str(silent)])

    events = caption_events(text, times)
    ass = work / "caps.ass"
    write_ass(ass, events)
    bed = work / "bed.wav"
    write_bed(bed, duration + 8)
    voiced = work / "voiced.mp4"
    ass_esc = str(ass).replace("\\", "\\\\").replace(":", "\\:")
    run(
        [
            "ffmpeg", "-y", "-i", str(silent), "-i", str(AUDIO / f"keanu-{lang}.mp3"), "-i", str(bed),
            "-filter_complex",
            f"[0:v]ass='{ass_esc}'[v];[1:a]apad=pad_dur=8[voice];[2:a]volume=0.07,apad=pad_dur=8[m];[voice][m]amix=inputs=2:duration=first:normalize=0[a]",
            "-map", "[v]", "-map", "[a]",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
            "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
            "-t", f"{duration + 6.2:.2f}",
            str(voiced),
        ]
    )
    final = OUT / f"keanu-{lang}.mp4"
    final.parent.mkdir(parents=True, exist_ok=True)
    voiced.replace(final)

    chapter_rows = []
    for label, cue in CHAPTERS[lang]:
        found = find_time(text, times, cue)
        if found is not None:
            chapter_rows.append({"t": round(found, 2), "label": label})
    return {"duration": round(duration + 6.2, 2), "chapters": chapter_rows, "video": f"/film/keanu-{lang}.mp4"}


def descriptions(rows: dict) -> None:
    base_es = (ROOT / "src/data/film.ts").read_text()
    # Chapters are appended in the package the app prefers.
    es_chapters = "\n".join(f"{clock(c['t'])} {c['label']}" for c in rows["es"]["chapters"])
    en_chapters = "\n".join(f"{clock(c['t'])} {c['label']}" for c in rows["en"]["chapters"])
    es = f"""Hay una foto de un hombre comiendo un sándwich, solo, en un banco. Internet lo llamó el Keanu triste. Este documental no repite el mito. Cuenta por qué el mundo lo quiere de verdad.

Keanu Reeves perdió a su amigo River Phoenix. Perdió a su hija Ava, que nació muerta la Nochebuena de 1999. Perdió a Jennifer Syme. Y aun así eligió seguir siendo amable, en voz baja, sin cartel.

Aquí están sus películas — Bill y Ted, Point Break, Speed, Matrix, John Wick, el E3, Dogstar — y, sobre todo, la persona. La fundación privada a la que no quiere ponerle su nombre. La frase frente a Stephen Colbert. El día en que el éxito no lo volvió cruel.

Capítulos
{es_chapters}

Si esta historia se quedó contigo, suscríbete a InodeAi. Y deja en los comentarios el nombre de alguien a quien todavía extrañas.

Fuentes: The Late Show con Stephen Colbert (2019 y 2024), Parade (2006), Ladies’ Home Journal (2009) y el desmentido de su equipo, en 2022, del mito del 70% de Matrix. Las cifras de regalos al equipo se cuentan como leyenda, no como un número auditado.

Fotografías reales de archivo de prensa y apariciones públicas.

#KeanuReeves #Documental #ElLadoHumano #JohnWick #Matrix #InodeAi #Cine #HistoriasReales #Bondad #Keanu"""
    en = f"""There is a photograph of a man eating a sandwich, alone, on a bench. The internet called him Sad Keanu. This documentary does not repeat the myth. It tells why the world actually loves him.

Keanu Reeves lost his friend River Phoenix. He lost his daughter Ava, stillborn on Christmas Eve, 1999. He lost Jennifer Syme. And he still chose to stay kind, quietly, without a billboard.

His films are here — Bill and Ted, Point Break, Speed, The Matrix, John Wick, E3, Dogstar — and, more than those, the person. The private foundation he will not put his name on. The sentence he said to Stephen Colbert. The fact that success did not make him cruel.

Chapters
{en_chapters}

If this story stayed with you, subscribe to InodeAi. And leave in the comments the name of someone you still miss.

Sources: The Late Show with Stephen Colbert (2019 and 2024), Parade (2006), Ladies’ Home Journal (2009), and his team’s 2022 denial of the myth that he donated 70% of his Matrix money. Crew-gift figures are told as legend, not as an audited number.

Real photographs from press archives and public appearances.

#KeanuReeves #Documentary #HumanStory #JohnWick #TheMatrix #InodeAi #Kindness #TrueStory #Cinema #Keanu"""
    (ROOT / "youtube/TITULO-Y-DESCRIPCION-ES.txt").write_text(
        "TÍTULO\nKeanu Reeves: el hombre que eligió ser bueno\n\nDESCRIPCIÓN\n" + es + "\n",
        encoding="utf-8",
    )
    (ROOT / "youtube/TITLE-AND-DESCRIPTION-EN.txt").write_text(
        "TITLE\nKeanu Reeves: The Man Who Chose to Stay Kind\n\nDESCRIPTION\n" + en + "\n",
        encoding="utf-8",
    )
    package = {
        "es": {
            "title": "Keanu Reeves: el hombre que eligió ser bueno",
            "description": es,
            "hashtags": "#KeanuReeves #Documental #ElLadoHumano #JohnWick #Matrix #InodeAi #Cine #HistoriasReales #Bondad #Keanu",
            **rows["es"],
        },
        "en": {
            "title": "Keanu Reeves: The Man Who Chose to Stay Kind",
            "description": en,
            "hashtags": "#KeanuReeves #Documentary #HumanStory #JohnWick #TheMatrix #InodeAi #Kindness #TrueStory #Cinema #Keanu",
            **rows["en"],
        },
    }
    (OUT / "package.json").write_text(json.dumps(package, ensure_ascii=False, indent=2), encoding="utf-8")
    _ = base_es


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_thumb("es", OUT / "thumb-es.jpg")
    make_thumb("en", OUT / "thumb-en.jpg")
    print("thumbs ready")
    rows = {"es": build("es"), "en": build("en")}
    descriptions(rows)
    print("done", rows["es"]["duration"], rows["en"]["duration"])


if __name__ == "__main__":
    main()
