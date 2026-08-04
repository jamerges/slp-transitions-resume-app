#!/usr/bin/env python3
"""Render the SLP Transitions sizzle reel to MP4 (16:9 and 9:16).

Design intent, per James: speak to the problem and the solution, and leave
SLPs feeling capable rather than demoralised. The lever is specificity, not
cheerleading — verified salary bands and timelines from research-facts.md do
more for morale than any amount of "you've got this". Style guide rules
apply: push->pull reframing, no toxic positivity, no "journey/unlock/empower"
language, no "You're not X, you're Y" constructions.

Deliberately contains NO guest photos. Those images came from the podcast's
own guest pages for promoting the show; using them in an ad for a paid
product would imply an endorsement nobody agreed to.

Silent by design — most social video autoplays muted, so every beat is
carried by type. Drop a music bed on top in any editor.

    python3 scripts/make_sizzle.py           # both aspects
    python3 scripts/make_sizzle.py 9x16      # just vertical
"""
import os, subprocess, sys, math
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

ROOT = "/Users/jamesberges/Desktop/SLP Career Suite : Resume Tool"
OUT = os.path.join(ROOT, "content/video")
FPS = 30

CREAM = (246, 248, 244)
FOREST = (10, 61, 49)
EMERALD = (11, 161, 131)
DEEP = (11, 107, 84)
SLATE = (83, 101, 92)
WHITE = (255, 255, 255)

GB = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
G = "/System/Library/Fonts/Supplemental/Georgia.ttf"
HV = "/System/Library/Fonts/Helvetica.ttc"


def ease(t):
    """easeOutCubic — motion that decelerates reads calmer than linear."""
    return 1 - pow(1 - max(0.0, min(1.0, t)), 3)


def fade(t, hold, up=0.28, down=0.34):
    """Opacity envelope across a scene: rise, hold, fall."""
    if t < up:
        return ease(t / up)
    if t > hold - down:
        return max(0.0, 1 - ease((t - (hold - down)) / down))
    return 1.0


class Canvas:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.vertical = h > w
        self.s = w / 1920 if not self.vertical else w / 1080

    def y(self, frac, tighten=0.62):
        """Fractional height -> pixels, compressed toward centre on vertical."""
        f = 0.5 + (frac - 0.5) * (tighten if self.vertical else 1.0)
        return self.h * f

    def font(self, path, size):
        return ImageFont.truetype(path, max(8, int(size * self.s)))

    def new(self, bg=CREAM):
        return Image.new("RGB", (self.w, self.h), bg)

    def center_text(self, d, y, text, font, fill, alpha=1.0, bg=CREAM, dy=0):
        """Draw centered text with manual alpha blending against bg."""
        if alpha <= 0.01:
            return
        col = tuple(int(bg[i] + (fill[i] - bg[i]) * alpha) for i in range(3))
        wpx = d.textlength(text, font=font)
        d.text(((self.w - wpx) / 2, y + dy), text, font=font, fill=col)

    def wrap(self, d, text, font, max_w):
        words, lines, cur = text.split(), [], ""
        for w_ in words:
            t = (cur + " " + w_).strip()
            if d.textlength(t, font=font) <= max_w:
                cur = t
            else:
                lines.append(cur)
                cur = w_
        lines.append(cur)
        return lines

    def rule(self, d, y, alpha, prog=1.0, w=None, col=EMERALD, bg=CREAM, thick=6):
        if alpha <= 0.02 or prog <= 0.01:
            return
        w = (w or 120) * self.s * prog
        c2 = tuple(int(bg[i] + (col[i] - bg[i]) * alpha) for i in range(3))
        d.rounded_rectangle([(self.w - w) / 2, y, (self.w + w) / 2, y + thick * self.s],
                            radius=thick * self.s / 2, fill=c2)

    def block(self, d, cy, lines, font, fill, alpha, lh=1.22, bg=CREAM, dy=0):
        total = len(lines) * font.size * lh
        y = cy - total / 2
        for ln in lines:
            self.center_text(d, y, ln, font, fill, alpha, bg, dy)
            y += font.size * lh


# ---------------------------------------------------------------- scenes
# (seconds, fn) — fn(canvas, draw, image, t) where t is seconds into scene

def sc_open(c, d, im, t, dur):
    a = fade(t, dur)
    f = c.font(GB, 150 if not c.vertical else 126)
    fs = c.font(HV, 44 if not c.vertical else 38)
    c.block(d, c.y(0.42), ["It's 11pm."], f, FOREST, a, dy=int((1 - ease(t / 0.5)) * 26 * c.s))
    c.rule(d, c.y(0.53), a, ease(min(1, t / 0.9)))
    if t > 0.7:
        a2 = fade(t - 0.7, dur - 0.7)
        c.block(d, c.y(0.62), c.wrap(d, "Your notes still aren't done.", fs, c.w * 0.8),
                fs, SLATE, a2)


def sc_search(c, d, im, t, dur):
    a = fade(t, dur)
    f = c.font(GB, 112 if not c.vertical else 92)
    lines = ["And you're googling", "whether anyone", "actually leaves."] if c.vertical \
        else ["And you're googling whether", "anyone actually leaves."]
    c.block(d, c.y(0.48), lines, f, FOREST, a, dy=int((1 - ease(t / 0.6)) * 22 * c.s))


def sc_turn(c, d, im, t, dur):
    """The pivot. Answer the question plainly rather than reassuring."""
    a = fade(t, dur)
    f = c.font(GB, 176 if not c.vertical else 150)
    fs = c.font(HV, 44 if not c.vertical else 38)
    c.block(d, c.y(0.42), ["They do."], f, EMERALD, a,
            dy=int((1 - ease(t / 0.5)) * 24 * c.s))
    c.rule(d, c.y(0.54), a, ease(min(1, t / 0.9)), w=160)
    if t > 0.6:
        a2 = fade(t - 0.6, dur - 0.6)
        c.block(d, c.y(0.63), c.wrap(d, "With the same license you already hold.",
                                      fs, c.w * 0.82), fs, SLATE, a2)


def _role_card(c, d, t, dur, label, salary, timeline, note):
    a = fade(t, dur)
    lab = c.font(HV, 34 if not c.vertical else 30)
    big = c.font(GB, 190 if not c.vertical else 150)
    role = c.font(GB, 68 if not c.vertical else 54)
    small = c.font(HV, 38 if not c.vertical else 33)

    c.center_text(d, c.y(0.27), label.upper(), lab, EMERALD, a)
    c.block(d, c.y(0.42), [salary], big, FOREST, a,
            dy=int((1 - ease(min(1, t / 0.55))) * 20 * c.s))
    c.rule(d, c.y(0.545), a, ease(min(1, t / 0.85)), w=110)
    c.block(d, c.y(0.625), [timeline], role, DEEP, a)
    if t > 0.5:
        a2 = fade(t - 0.5, dur - 0.5)
        c.block(d, c.y(0.72), c.wrap(d, note, small, c.w * 0.78), small, SLATE, a2, lh=1.45)


def sc_liaison(c, d, im, t, dur):
    _role_card(c, d, t, dur, "Clinical liaison", "$84–135k", "1–3 months to move",
               "Your clinical license is the qualification.")


def sc_ur(c, d, im, t, dur):
    _role_card(c, d, t, dur, "Utilization review", "$80–88k", "Remote-heavy",
               "Your documentation experience is the job.")


def sc_cs(c, d, im, t, dur):
    _role_card(c, d, t, dur, "Customer success", "$75–120k", "3–6 months",
               "A caseload is a client portfolio with worse hours.")


def sc_qualify(c, d, im, t, dur):
    a = fade(t, dur)
    f = c.font(GB, 108 if not c.vertical else 90)
    lines = ["Two of those need", "no new degree,", "no new certificate."] if c.vertical \
        else ["Two of those need no new degree,", "and no new certificate."]
    c.block(d, c.y(0.48), lines, f, FOREST, a, dy=int((1 - ease(t / 0.6)) * 20 * c.s))


def sc_companies(c, d, im, t, dur):
    """Count-up on the company number — the one moment of overt motion."""
    a = fade(t, dur)
    n = int(126 * ease(min(1.0, t / 1.1)))
    big = c.font(GB, 300 if not c.vertical else 240)
    sub = c.font(HV, 46 if not c.vertical else 38)
    c.block(d, c.y(0.42), [str(n)], big, EMERALD, a)
    c.block(d, c.y(0.62), c.wrap(d, "companies that hire former SLPs", sub, c.w * 0.82),
            sub, FOREST, a)


def sc_reframe(c, d, im, t, dur):
    a = fade(t, dur)
    f = c.font(GB, 130 if not c.vertical else 104)
    lines = ["You're more than", "just a clinician."]
    c.block(d, c.y(0.46), lines, f, FOREST, a, dy=int((1 - ease(t / 0.6)) * 22 * c.s))
    c.rule(d, c.y(0.62), a, ease(min(1, t / 1.0)), w=150)


def sc_cta(c, d, im, t, dur):
    """Dark card close: logo, action, url."""
    a = fade(t, dur)
    bg = FOREST
    im.paste(bg, (0, 0, c.w, c.h))
    logo_p = os.path.join(ROOT, "public/logo-icon.png")
    if os.path.exists(logo_p) and a > 0.05:
        L = Image.open(logo_p).convert("RGBA")
        side = int(150 * c.s)
        L = L.resize((side, side), Image.LANCZOS)
        if a < 1:
            al = L.split()[3].point(lambda v: int(v * a))
            L.putalpha(al)
        im.paste(L, ((c.w - side) // 2, int(c.y(0.24))), L)
    f = c.font(GB, 104 if not c.vertical else 86)
    fs = c.font(HV, 40 if not c.vertical else 34)
    url = c.font(HV, 46 if not c.vertical else 38)
    c.block(d, c.y(0.50), ["Find the path that fits."], f, WHITE, a, bg=bg)
    c.block(d, c.y(0.615), c.wrap(d, "Free 2-minute quiz. Real ranges, honest timelines.",
            fs, c.w * 0.86), fs, (170, 200, 186), a, bg=bg)
    if t > 0.55:
        a2 = fade(t - 0.55, dur - 0.55)
        c.block(d, c.y(0.72), ["slptransitions.com"], url, EMERALD, a2, bg=bg)


SCENES = [
    (2.6, sc_open),
    (2.8, sc_search),
    (2.8, sc_turn),
    (3.2, sc_liaison),
    (3.2, sc_ur),
    (3.2, sc_cs),
    (3.0, sc_qualify),
    (3.4, sc_companies),
    (3.0, sc_reframe),
    (4.2, sc_cta),
]


def render(w, h, path):
    c = Canvas(w, h)
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [exe, "-y", "-f", "rawvideo", "-vcodec", "rawvideo", "-s", f"{w}x{h}",
           "-pix_fmt", "rgb24", "-r", str(FPS), "-i", "-", "-an",
           "-vcodec", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
           "-preset", "medium", "-movflags", "+faststart", path]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    total = 0
    for dur, fn in SCENES:
        for i in range(int(dur * FPS)):
            t = i / FPS
            im = c.new()
            d = ImageDraw.Draw(im)
            fn(c, d, im, t, dur)
            proc.stdin.write(im.tobytes())
            total += 1
    proc.stdin.close()
    proc.wait()
    return total


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    want = sys.argv[1] if len(sys.argv) > 1 else "all"
    jobs = []
    if want in ("all", "16x9"):
        jobs.append((1920, 1080, os.path.join(OUT, "slp-sizzle-16x9.mp4")))
    if want in ("all", "9x16"):
        jobs.append((1080, 1920, os.path.join(OUT, "slp-sizzle-9x16.mp4")))
    secs = sum(d for d, _ in SCENES)
    for w, h, p in jobs:
        n = render(w, h, p)
        mb = os.path.getsize(p) / 1e6
        print(f"{os.path.basename(p):26} {w}x{h}  {n} frames  {secs:.1f}s  {mb:.1f} MB")
