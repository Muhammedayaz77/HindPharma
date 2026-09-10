# Hind Pharma Web

The complete web application lives under this directory. Its source is independent from the native Android and iOS applications.

- `View/` — web views/pages
- `View Model/` — web view-models and page styles
- `Models/` — web-only models
- `API/` — web API client code
- `Assets/` — web-only assets
- `data/` — static data consumed by the web prototype
- `temp/` — temporary web services retained until their replacements are finalized

The GitHub Pages deployment workflow publishes the contents of this directory as the site root, so existing public URLs such as `/View/...`, `/Assets/...` and `/data/...` remain stable after the repository reorganization.
