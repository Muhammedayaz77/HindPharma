# Hind Pharma Web

The complete web application lives under this directory. Its source is independent from the native Android and iOS applications.

- `View/` — web views/pages
- `View Model/` — web view-models and page styles
- `Models/` — web-only models
- `API/` — web API client code
- `Assets/` — web-only assets
- `data/` — static data consumed by the web prototype
- `temp/` — temporary web services retained until their replacements are finalized

GitHub Pages will publish this directory as the site root so the existing public URLs remain stable.


## Website UI rules

- Public web pages use the HindTechGroup-style emerald/teal visual system with persistent light/dark theme support.
- Shared theme assets live in `Assets/theme.css` and `Assets/theme.js`.
- Legal page content is stored in `Assets/privacy-policy.txt` and `Assets/terms-and-conditions.txt`; HTML pages load these files at runtime so legal copy can be changed without editing page layout code.
- Keep responsive/mobile compatibility and performance as first-class requirements.
