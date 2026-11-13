"""Download credited NASA public-domain images for the archive into public/images/nasa/.

Usage: python scripts/fetch-nasa-images.py            (all ids below)
Writes public/images/nasa/<id>.jpg (max 1600 px) and lib/nasa-photos.json (title, credit, source, size).
Source: NASA Image and Video Library (https://images.nasa.gov). NASA imagery is generally not
copyrighted; credit lines follow the agency's own metadata.
"""
import io, json, pathlib, re, sys, urllib.request
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images" / "nasa"
MANIFEST = ROOT / "lib" / "nasa-photos.json"

IDS = {
    "ranger-7": ["PIA23520", "PIA02975", "PIA02974"],
    "surveyor-1": ["PIA12910", "PIA02976"],
    "apollo-11-lander": ["as11-40-5927", "as11-40-5899", "as11-40-5902", "S69-39961", "as11-44-6642", "PIA12909", "jsc2007e034221"],
    "apollo-15-rover": ["as15-88-11901", "as15-86-11603", "as15-086-11601", "KSC-71PC-0685", "S71-39867", "S71-41509"],
    "viking-1": ["PIA00563", "PIA00381", "PIA00567", "PIA01881", "9141929", "101-KSC-75P-12"],
    "viking-2": ["PIA00568", "PIA00396", "PIA01882", "PIA09509", "101-KSC-75PC-167", "101-KSC-75P-110"],
    "pathfinder-sojourner": ["KSC-96PC-1130", "PIA01122", "PIA00621", "PIA00609", "PIA04422", "9614653"],
    "mars-polar-lander": ["KSC-99pc05", "KSC-98pc1229", "PIA02349"],
    "spirit": ["PIA16442", "PIA04835", "PIA16440", "KSC-03pd1900", "PIA05040", "PIA07997", "PIA09491", "PIA02055", "PIA12007", "PIA05570"],
    "opportunity": ["PIA04834", "PIA05839", "PIA18079", "KSC-03pd2090", "PIA21494", "PIA05273", "PIA08812", "PIA14509", "PIA19157", "PIA22521", "PIA22222",
                    "PIA04928", "KSC-03pd1577", "PIA05633", "PIA06739", "PIA07269", "PIA07999", "PIA09104", "PIA15114", "PIA13667", "PIA15035",
                    "PIA18404", "PIA19154", "PIA20012", "PIA22074", "PIA22329", "PIA22909", "PIA23246", "PIA22218", "PIA21496"],
    "phoenix": ["PIA11719", "KSC-07PD-1085", "KSC-07pd2166", "PIA10906", "PIA13804", "PIA11720", "PIA22223", "PIA12338"],
    "lcross": ["200906180001HQ", "KSC-2009-1754", "KSC-2009-3298"],
    "grail": ["KSC-2011-6923", "KSC-2011-6352", "PIA14558", "PIA15514", "PIA16603", "PIA16493"],
    "insight": ["PIA23203", "PIA19402", "NHQ201805050001", "PIA22876", "PIA22956", "PIA22959", "PIA25287", "PIA25680"],
    "ingenuity": ["PIA23151", "PIA24542", "PIA24550", "PIA24592", "PIA24625", "PIA26243", "PIA26236", "PIA26237", "KSC-20200730-PH-FMX01_0042"],
}

UA = {"User-Agent": "rovervilla-archive/1.0"}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90).read()


def credit_of(meta):
    for k in ("XMP:Credit", "AVAIL:Photographer", "IPTC:Credit", "Photoshop:Credit"):
        v = meta.get(k)
        if v and isinstance(v, str) and v.strip(): return v.strip()
    d = meta.get("AVAIL:Description", "") or ""
    m = re.search(r"(?:Image )?[Cc]redit[s]?:\s*([^\n.]+(?:\.[A-Z][^\n.]*)?)", d)
    if m: return m.group(1).strip().rstrip(".")
    c = meta.get("AVAIL:Center", "")
    return {"JPL": "NASA/JPL-Caltech", "KSC": "NASA/KSC", "JSC": "NASA/JSC", "MSFC": "NASA/MSFC", "HQ": "NASA/Bill Ingalls", "ARC": "NASA/Ames"}.get(c, "NASA")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    only = set(sys.argv[1:])
    for slug, ids in IDS.items():
        for nid in ids:
            if only and nid not in only and slug not in only: continue
            dest = OUT / f"{nid}.jpg"
            if dest.exists() and nid in manifest: continue
            files = [x["href"] for x in json.loads(get(f"https://images-api.nasa.gov/asset/{nid}"))["collection"]["items"]]
            pick = next((f for suf in ("~large.jpg", "~orig.jpg", "~medium.jpg", "~orig.tif", "~orig.png", "~large.png") for f in files if f.endswith(suf)), None)
            meta_url = next((f for f in files if f.endswith("metadata.json")), None)
            meta = json.loads(get(meta_url.replace("http://", "https://"))) if meta_url else {}
            im = Image.open(io.BytesIO(get(pick.replace("http://", "https://").replace(" ", "%20")))).convert("RGB")
            im.thumbnail((1600, 1600), Image.LANCZOS)
            im.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
            desc = " ".join((meta.get("AVAIL:Description") or "").split())
            manifest[nid] = {
                "title": (meta.get("AVAIL:Title") or nid).strip(),
                "date": (meta.get("AVAIL:DateCreated") or "")[:10],
                "credit": credit_of(meta),
                "source": f"https://images.nasa.gov/details/{nid}",
                "width": im.width, "height": im.height,
                "description": desc[:600],
                "hero": slug,
            }
            print(f"{slug:22s} {nid:28s} {im.width}x{im.height} {manifest[nid]['credit'][:40]}")
            MANIFEST.write_text(json.dumps(manifest, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
