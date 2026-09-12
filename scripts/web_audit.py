from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1] / "web"
errors = []
count = 0

class Parser(HTMLParser):
    def __init__(self, file):
        super().__init__(); self.file = file
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key not in {"href", "src", "data-source"} or not value:
                continue
            target = value.split("#", 1)[0].split("?", 1)[0]
            if not target or target.startswith(("http://", "https://", "mailto:", "tel:", "javascript:", "data:")):
                continue
            candidate = (self.file.parent / target).resolve()
            try:
                candidate.relative_to(ROOT.resolve())
            except ValueError:
                errors.append(f"{self.file.relative_to(ROOT)}: outside-root reference {value}")
                continue
            if not candidate.exists():
                errors.append(f"{self.file.relative_to(ROOT)}: missing {value}")

for file in sorted(ROOT.rglob("*.html")):
    count += 1
    Parser(file).feed(file.read_text(encoding="utf-8"))

if errors:
    print("WEB AUDIT FAILED")
    print("\\n".join(errors))
    raise SystemExit(1)
print(f"WEB AUDIT PASSED: {count} HTML pages checked")
