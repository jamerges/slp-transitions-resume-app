#!/usr/bin/env python3
"""Build the "share your story" form on slptransitions.com/about (page 2626).

Native kadence/form, not an iframe from the app — the marketing site owns its
own pages. Kadence Blocks PRO is active and already delivers mail from
/contact-us/, so this reuses a mechanism proven on this host rather than
introducing a second one.

kadence/form is a STATIC block: what we write into post_content is what gets
served. The block-comment JSON and the rendered HTML have to agree, and three
things are delivery-critical — name="kb_field_N", the _kb_form_id /
_kb_form_post_id hidden inputs, and the _kb_verify_email honeypot. Everything
else is presentation.

Re-run to regenerate. Idempotent: it replaces the existing block by uniqueID.
"""
import json, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from wp_publish import api

PAGE_ID = 2626
UID = "_a7f312-01"
EMAIL_TO = "jamoberges@gmail.com"

# (label, type, required, placeholder, description)
FIELDS = [
    ("Your name", "text", True, "First and last", ""),
    ("Email", "email", True, "you@example.com", "Only used to reply to you."),
    ("What did you do as an SLP?", "text", True,
     "e.g. Schools, 7 years, mostly early intervention", "Setting and roughly how long."),
    ("What do you do now?", "text", True,
     "e.g. Implementation Manager at a health-tech company",
     "Role and industry. If you're mid-transition, say where you're heading."),
    ("How long did the move take?", "text", False, "e.g. about 8 months", ""),
    ("LinkedIn or website", "text", False, "https://", ""),
    ("Anything else?", "textarea", False, "",
     "The hardest part, or the thing you wish someone had told you. A couple of sentences is plenty."),
]

def field_attr(label, ftype, required, placeholder, desc):
    return {
        "label": label, "showLabel": True, "placeholder": placeholder,
        "default": "", "description": desc, "rows": 4,
        "options": [{"value": "", "label": ""}], "multiSelect": False,
        "inline": False, "showLink": False, "min": "", "max": "",
        "type": ftype, "required": required, "width": ["100", "", ""], "auto": "",
    }

def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))

def field_html(i, label, ftype, required, placeholder, desc):
    fid = f"kb_field_{UID}_{i}"
    req_star = '<span class="kb-form-required">*</span>' if required else ""
    req_attr = ' data-required="yes"' if required else ""
    cls = f"kb-form-field-{i} " if i else ""
    out = [f'<div class="kadence-blocks-form-field {cls}kb-field-desk-width-100 kb-input-size-standard">']
    out.append(f'<label class="kb-form-label" for="{fid}">{esc(label)}{req_star}</label>')
    if desc:
        out.append(f'<div class="kb-form-field-description">{esc(desc)}</div>')
    if ftype == "textarea":
        out.append(
            f'<textarea name="kb_field_{i}" id="{fid}" data-label="{esc(label)}" '
            f'type="textarea" placeholder="{esc(placeholder)}" data-type="textarea" '
            f'class="kb-field kb-text-style-field kb-textarea-field kb-field-{i}" '
            f'rows="4"{req_attr}></textarea>')
    else:
        style = "kb-email-field" if ftype == "email" else "kb-text-field"
        out.append(
            f'<input name="kb_field_{i}" id="{fid}" data-label="{esc(label)}" '
            f'type="{ftype}" placeholder="{esc(placeholder)}" value="" data-type="{ftype}" '
            f'class="kb-field kb-text-style-field {style} kb-field-{i}"{req_attr}/>')
    out.append("</div>")
    return "".join(out)

def build():
    attrs = {
        "uniqueID": UID, "postID": str(PAGE_ID),
        "fields": [field_attr(*f) for f in FIELDS],
        "messages": [{
            "success": "Thank you — that's landed in my inbox. I read every one of these and I'll reply personally.",
            "error": "That didn't send. Email me directly at jamoberges@gmail.com and I'll pick it up from there.",
            "required": "This one's needed", "invalid": "That email doesn't look right",
            "recaptchaerror": "", "preError": "",
        }],
        "style": [{"showRequired": True, "size": "standard", "rowGap": "18", "rowGapType": "px"}],
        "submit": [{
            "label": "Send my story", "width": ["100", "", ""], "size": "standard",
            "widthType": "auto", "btnStyle": "basic", "btnSize": "standard",
        }],
        "submitFont": [{"size": [15, "", ""], "sizeType": "px", "textTransform": "none"}],
        "actions": ["email"],
        "email": [{
            "emailTo": EMAIL_TO,
            "subject": "New story pitch — SLP Transitions",
            "fromEmail": "", "fromName": "", "replyTo": "email_field",
            "cc": "", "bcc": "", "html": True,
        }],
        "entry": [{"formName": "Share your story", "userIP": True, "userDevice": True}],
        "webhook": [{"url": ""}],
    }

    inner = "".join(field_html(i, *f) for i, f in enumerate(FIELDS))
    html = (
        f'<div class="wp-block-kadence-form kadence-form-{UID} kb-form-wrap">'
        f'<form class="kb-form" action="" method="post">{inner}'
        f'<input type="hidden" name="_kb_form_id" value="{UID}"/>'
        f'<input type="hidden" name="_kb_form_post_id" value="{PAGE_ID}"/>'
        f'<input type="hidden" name="action" value="kb_process_ajax_submit"/>'
        f'<input class="kadence-blocks-field verify" type="text" name="_kb_verify_email" '
        f'autocomplete="off" aria-hidden="true" placeholder="Email" tabindex="-1"/>'
        f'<div class="kadence-blocks-form-field kb-submit-field kb-field-desk-width-100">'
        f'<button class="kb-forms-submit button kb-button-size-standard">Send my story</button>'
        f'</div></form></div>'
    )
    return (f"<!-- wp:kadence/form {json.dumps(attrs, separators=(',', ':'))} -->\n"
            f"{html}\n<!-- /wp:kadence/form -->")


if __name__ == "__main__":
    block = build()
    raw = api(f"/wp/v2/pages/{PAGE_ID}?context=edit")["content"]["raw"]

    existing = re.search(
        r'<!-- wp:kadence/form \{"uniqueID":"' + re.escape(UID) + r'".*?<!-- /wp:kadence/form -->',
        raw, re.S)
    iframe = re.search(r"<!-- wp:html -->\s*<!--\s*SLP TRANSITIONS — STORY FORM EMBED.*?<!-- /wp:html -->", raw, re.S)

    if existing:
        raw = raw[:existing.start()] + block + raw[existing.end():]
        print("replaced the existing form block")
    elif iframe:
        raw = raw[:iframe.start()] + block + raw[iframe.end():]
        print("replaced the app iframe embed with a native form")
    else:
        print("!! found neither an existing form nor the iframe embed — aborting")
        sys.exit(1)

    r = api(f"/wp/v2/pages/{PAGE_ID}", "POST", {"content": raw})
    print("status:", r.get("status"), "| modified:", r.get("modified"))
