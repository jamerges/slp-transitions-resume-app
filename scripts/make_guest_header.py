#!/usr/bin/env python3
"""Branded 1200x630 header template for guest-story blog posts (photo + name).

Matches the site's existing text-only headers: cream background, Georgia Bold
titles, dark text, green (--accent) rule. This variant adds a circular guest
photo on the left with a thin green ring, name + role on the right.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

W, H = 1200, 630
CREAM = (250, 249, 246)
DARK = (27, 27, 30)
GREEN = (45, 106, 79)
MUTED = (107, 114, 128)

GB = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
G = "/System/Library/Fonts/Supplemental/Georgia.ttf"
HELV = "/System/Library/Fonts/Helvetica.ttc"
HELV_B = "/System/Library/Fonts/Helvetica.ttc"

# Kadence crops the single-post hero with object-fit:cover into a ~1.5:1 box
# (measured live: 664x442 rendered from a 1200x630 source), which keeps full
# height but crops ~10.6% off each side (visible width ~78.7%). Use a tighter
# safe zone than that measured value so the crop has margin to spare.
SAFE_W, SAFE_H = int(W * 0.66), int(H * 0.58)
SAFE_LEFT = (W - SAFE_W) // 2
SAFE_TOP = (H - SAFE_H) // 2

PHOTO_D = 260
RING = 6
GAP = 50
TEXT_MAX_W = SAFE_W - PHOTO_D - GAP

PHOTO_CX = SAFE_LEFT + PHOTO_D // 2
PHOTO_CY = H // 2
TEXT_X = SAFE_LEFT + PHOTO_D + GAP


def circular_photo(path, diameter):
    im = Image.open(path).convert("RGB")
    im = ImageOps.exif_transpose(im)
    w, h = im.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    im = im.crop((left, top, left + side, top + side)).resize(
        (diameter, diameter), Image.LANCZOS
    )
    mask = Image.new("L", (diameter, diameter), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, diameter, diameter), fill=255)
    out = Image.new("RGBA", (diameter, diameter))
    out.paste(im, (0, 0), mask)
    return out


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if draw.textlength(t, font=font) <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    lines.append(cur)
    return lines


def make_header(photo_path, kicker, name, role, out_path):
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)

    # photo + ring
    r_out = PHOTO_D // 2 + RING
    d.ellipse(
        (PHOTO_CX - r_out, PHOTO_CY - r_out, PHOTO_CX + r_out, PHOTO_CY + r_out),
        fill=GREEN,
    )
    photo = circular_photo(photo_path, PHOTO_D)
    img.paste(
        photo, (PHOTO_CX - PHOTO_D // 2, PHOTO_CY - PHOTO_D // 2), photo
    )

    max_w = TEXT_MAX_W

    kf = ImageFont.truetype(HELV, 20)
    kicker_u = kicker.upper()

    # name (auto-fit, capped at 2 lines)
    for size in range(52, 28, -2):
        nf = ImageFont.truetype(GB, size)
        name_lines = wrap(d, name, nf, max_w)
        if len(name_lines) <= 2:
            break
    name_line_h = int(size * 1.18)

    rf = ImageFont.truetype(G, 23)
    role_lines = wrap(d, role, rf, max_w)[:2]
    role_line_h = 31

    # Stack kicker + name + rule + role, then center the whole block on the
    # photo's vertical center so the group reads as one unit.
    kicker_h = 26
    rule_gap = 22
    block_h = (
        kicker_h
        + 12
        + len(name_lines) * name_line_h
        + rule_gap
        + len(role_lines) * role_line_h
    )
    y = PHOTO_CY - block_h // 2

    d.text((TEXT_X, y), kicker_u, font=kf, fill=GREEN)
    y += kicker_h + 12

    for ln in name_lines:
        d.text((TEXT_X, y), ln, font=nf, fill=DARK)
        y += name_line_h

    y += 6
    d.rectangle((TEXT_X, y, TEXT_X + 64, y + 4), fill=GREEN)
    y += rule_gap

    for ln in role_lines:
        d.text((TEXT_X, y), ln, font=rf, fill=MUTED)
        y += role_line_h

    img.save(out_path, optimize=True)
    print(f"wrote {out_path}")


if __name__ == "__main__":
    import sys

    ROOT = "/Users/jamesberges/Desktop/SLP Career Suite : Resume Tool"
    PHOTOS = os.path.join(ROOT, "content/guest-photos")
    OUT = os.path.join(ROOT, "content/blog-images")

    GUESTS = [
        dict(photo="alan-vu.jpeg", kicker="Entrepreneurs",
             name="Alan Vu", role="Co-Founder & CEO, Flexspeak — SLP, AAC specialist",
             out="15-building-a-startup-without-quitting-alan-vu-photo.png"),
        dict(photo="rachel-levy.png", kicker="Entrepreneurs",
             name="Dr. Rachel Levy", role="Co-Founder, The Babel Group — SLP, 16 years clinical",
             out="13-slp-to-startup-cofounder-rachel-levy-photo.png"),
        dict(photo="jeannette-roberes.jpg", kicker="Entrepreneurs",
             name="Jeannette Roberes", role="Founder, Bearly Articulating — SLP, software engineer, author",
             out="14-slp-to-software-engineer-jeannette-roberes-photo.png"),
        dict(photo="michelle-boisvert.png", kicker="Entrepreneurs",
             name="Michelle Boisvert", role="Founder, easyReportPRO — SLP",
             out="michelle-boisvert-photo.png"),
        dict(photo="ruchi-kapila.jpg", kicker="Entrepreneurs",
             name="Ruchi Kapila", role="SLP & vocologist — gender-affirming voice therapy",
             out="ruchi-kapila-photo.png"),
        dict(photo="rachel-archambault.jpg", kicker="Entrepreneurs",
             name="Rachel Archambault", role="Founder, the PTSD SLP — trauma-informed care consultant",
             out="rachel-archambault-photo.png"),
        dict(photo="meredith-harold.png", kicker="Entrepreneurs",
             name="Meredith Harold", role="Founder, The Informed SLP",
             out="meredith-harold-photo.png"),
        dict(photo="gareth-walkom.png", kicker="Entrepreneurs",
             name="Gareth Walkom", role="Founder, withVR — stuttering VR therapy",
             out="gareth-walkom-photo.png"),
        dict(photo="jhillika-kumar.jpeg", kicker="Entrepreneurs",
             name="Jhillika Kumar", role="Co-Founder & CEO, Mentra",
             out="jhillika-kumar-photo.png"),
        dict(photo="conner-reinhardt.png", kicker="Entrepreneurs",
             name="Conner Reinhardt", role="Co-Founder & COO, Mentra",
             out="conner-reinhardt-photo.png"),
        dict(photo="maya-chupkov.png", kicker="Entrepreneurs",
             name="Maya Chupkov", role="Founder, Proud Stutter",
             out="maya-chupkov-photo.png"),
        dict(photo="chris-wenger.jpg", kicker="Entrepreneurs",
             name="Chris Wenger", role='SLP, "Speech Dude" — neurodivergent-affirming practice',
             out="chris-wenger-photo.png"),
        dict(photo="mattie-murrey-tegels.jpg", kicker="Entrepreneurs",
             name="Mattie Murrey-Tegels", role="Founder, Fresh SLP & Badass SLP — medical SLP, 25+ years",
             out="mattie-murrey-tegels-photo.png"),
    ]

    only = sys.argv[1] if len(sys.argv) > 1 else None
    for g in GUESTS:
        if only and only not in g["photo"]:
            continue
        make_header(
            os.path.join(PHOTOS, g["photo"]), g["kicker"], g["name"], g["role"],
            os.path.join(OUT, g["out"]),
        )
