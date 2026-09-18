# Renders the workbook .docx as HTML: sheets (for screenshots) or, with a third
# argument "print", fixed Letter sheets for headless Chromium's --print-to-pdf. Used by
# render.sh beside this file. Recovered from the 2026-09-12 scratchpad.
# Faithful-enough renderer for the workbook's feature subset, read from the real
# .docx: runs (font/size/bold/italic/colour/tracking), paragraph spacing and
# alignment, bottom borders, and tables with column widths, cell shading,
# margins, borders and row heights. Page breaks start a new sheet.
import sys, zipfile, html, re
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
def q(t): return W + t
DXA = 96/72/20          # dxa -> css px
HP  = 1/2               # half-points -> pt

def attr(el, name, default=None):
    return el.get(q(name), default) if el is not None else default

def run_html(r):
    rPr = r.find(q("rPr"))
    txt = "".join(t.text or "" for t in r.findall(q("t")))
    if r.find(q("br")) is not None and not txt: return ""
    if not txt: return ""
    s = []
    if rPr is not None:
        f = rPr.find(q("rFonts"));  fam = attr(f, "ascii")
        if fam: s.append(f"font-family:'{fam}',Georgia,serif" if fam=="Georgia" else f"font-family:'{fam}',system-ui,sans-serif")
        sz = rPr.find(q("sz"))
        if sz is not None: s.append(f"font-size:{int(attr(sz,'val'))*HP}pt")
        if rPr.find(q("b")) is not None: s.append("font-weight:700")
        if rPr.find(q("i")) is not None: s.append("font-style:italic")
        c = rPr.find(q("color"))
        if c is not None and attr(c,"val") not in (None,"auto"): s.append(f"color:#{attr(c,'val')}")
        sp = rPr.find(q("spacing"))
        if sp is not None and attr(sp,"val"): s.append(f"letter-spacing:{int(attr(sp,'val'))/20}pt")
    return f"<span style=\"{';'.join(s)}\">{html.escape(txt)}</span>"

def para_html(p):
    pPr = p.find(q("pPr")); s = ["margin:0"]
    brk = any(attr(b,"type")=="page" for b in p.iter(q("br")))
    if pPr is not None:
        sp = pPr.find(q("spacing"))
        if sp is not None:
            s.append(f"margin-top:{int(attr(sp,'before',0))*DXA}px")
            s.append(f"margin-bottom:{int(attr(sp,'after',0))*DXA}px")
        jc = pPr.find(q("jc"))
        if jc is not None: s.append(f"text-align:{ {'center':'center','right':'right','both':'justify'}.get(attr(jc,'val'),'left') }")
        bd = pPr.find(q("pBdr"))
        if bd is not None and bd.find(q("bottom")) is not None:
            b = bd.find(q("bottom")); s.append(f"border-bottom:{max(1,int(attr(b,'sz',6))//4)}px solid #{attr(b,'color','000000')}")
        nm = pPr.find(q("numPr"))
        if nm is not None: s.append("margin-left:24px;list-style:none")
    inner = "".join(run_html(r) for r in p.findall(q("r")))
    if pPr is not None and pPr.find(q("numPr")) is not None:
        inner = '<span style="color:#2D6A4F">&bull;&nbsp;&nbsp;</span>' + inner
    return (brk, f"<p style=\"{';'.join(s)}\">{inner or '&nbsp;'}</p>")

def cell_html(tc, width_px):
    tcPr = tc.find(q("tcPr")); s = [f"width:{width_px}px", "vertical-align:top", "box-sizing:border-box"]
    if tcPr is not None:
        shd = tcPr.find(q("shd"))
        if shd is not None and attr(shd,"fill") not in (None,"auto"): s.append(f"background:#{attr(shd,'fill')}")
        mar = tcPr.find(q("tcMar"))
        if mar is not None:
            pads = []
            for side in ("top","right","bottom","left"):
                e = mar.find(q(side)); pads.append(f"{int(attr(e,'w',0))*DXA if e is not None else 0}px")
            s.append("padding:" + " ".join(pads))
        if tcPr.find(q("vAlign")) is not None: s.append("vertical-align:middle")
        bd = tcPr.find(q("tcBorders"))
        if bd is not None:
            for side in ("top","right","bottom","left"):
                e = bd.find(q(side))
                if e is None or attr(e,"val")=="none": s.append(f"border-{side}:0")
                else: s.append(f"border-{side}:{max(1,int(attr(e,'sz',6))//4)}px solid #{attr(e,'color','D1D5DB')}")
        else: s.append("border:0")
    body = "".join(para_html(p)[1] for p in tc.findall(q("p")))
    return f"<td style=\"{';'.join(s)}\">{body}</td>"

def table_html(tbl):
    grid = [int(attr(g,"w",0)) for g in tbl.findall(f"{q('tblGrid')}/{q('gridCol')}")]
    out = ['<table style="border-collapse:collapse;table-layout:fixed;margin:0 0 4px">']
    for tr in tbl.findall(q("tr")):
        trPr = tr.find(q("trPr")); h = ""
        if trPr is not None and trPr.find(q("trHeight")) is not None:
            h = f"height:{int(attr(trPr.find(q('trHeight')),'val',0))*DXA}px"
        cells = tr.findall(q("tc"))
        out.append(f'<tr style="{h}">')
        for i, tc in enumerate(cells):
            out.append(cell_html(tc, (grid[i] if i < len(grid) else 2000) * DXA))
        out.append("</tr>")
    out.append("</table>")
    return "".join(out)

z = zipfile.ZipFile(sys.argv[1])
root = ET.fromstring(z.read("word/document.xml"))
body = root.find(q("body"))
pages, cur = [], []
for el in body:
    if el.tag == q("p"):
        brk, h = para_html(el)
        if brk:
            pages.append(cur); cur = []
            continue
        cur.append(h)
    elif el.tag == q("tbl"):
        cur.append(table_html(el))
pages.append(cur)

PW, PH, MG = 8.5*96, 11*96, 1*96
PRINT = len(sys.argv) > 3 and sys.argv[3] == "print"
if PRINT:
    # Fixed Letter sheets with the running header and footer drawn on each one,
    # so headless Chromium's --print-to-pdf needs no header template.
    real = [pg for pg in pages if any(x.strip() for x in pg)]
    n = len(real)
    HEAD = ('<div class="hd"><span class="brand">TRANSITION OS</span><span>Companion workbook</span></div>')
    def foot(i): return f'<div class="ft"><span>slptransitions.com &middot; Nobody reads this but you.</span><span>{i}</span></div>'
    sheets = "".join(f'<div class="sheet">{HEAD}<div class="inner">{"".join(pg)}</div>{foot(i+1)}</div>' for i, pg in enumerate(real))
    open(sys.argv[2], "w", encoding="utf-8").write(f"""<meta charset=utf-8>
<style>
 @page{{size:8.5in 11in;margin:0}}
 html,body{{margin:0;padding:0;background:#fff;font-family:Calibri,system-ui;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
 .sheet{{position:relative;width:{PW}px;height:{PH}px;overflow:hidden;page-break-after:always;break-after:page}}
 .sheet:last-child{{page-break-after:auto;break-after:auto}}
 .inner{{position:absolute;left:{MG}px;top:{1300*DXA}px;width:{PW-MG*2}px;height:{PH-1300*DXA-1200*DXA}px;overflow:hidden}}
 .hd,.ft{{position:absolute;left:{MG}px;right:{MG}px;display:flex;justify-content:space-between;font-family:Helvetica,Arial;font-size:7pt;color:#6B7280}}
 .hd{{top:{0.45*96}px}} .ft{{bottom:{0.42*96}px}}
 .brand{{color:#2D6A4F;font-weight:700;letter-spacing:1.5px}}
 p{{line-height:1.35}}
</style>{sheets}""")
    print(f"{n} pages (print) -> {sys.argv[2]}")
    raise SystemExit(0)
sheets = "".join(
    f'<div class="sheet"><div class="inner">{"".join(pg)}</div><div class="pn">{i+1}</div></div>'
    for i, pg in enumerate(pages) if any(x.strip() for x in pg))
open(sys.argv[2],"w",encoding="utf-8").write(f"""<meta charset=utf-8>
<style>
 body{{background:#6b7280;margin:0;padding:26px;font-family:Calibri,system-ui}}
 .sheet{{position:relative;width:{PW}px;height:{PH}px;background:#fff;margin:0 auto 26px;
   box-shadow:0 2px 14px rgba(0,0,0,.35);overflow:hidden}}
 .inner{{position:absolute;left:{MG}px;top:{1300*DXA}px;width:{PW-MG*2}px;height:{PH-MG*2}px;overflow:hidden}}
 .pn{{position:absolute;bottom:26px;right:{MG}px;font-size:8pt;color:#6B7280}}
 p{{line-height:1.35}}
</style>{sheets}""")
print(f"{len([p for p in pages if any(x.strip() for x in p)])} pages -> {sys.argv[2]}")