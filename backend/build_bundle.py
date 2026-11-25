"""Build the API's serving bundle from the full local data and models.

Run from the project root, with the full data/ and models/ folders present:

    python -m backend.build_bundle

Writes backend/bundle/, which is small enough to commit and deploy.
"""

from __future__ import annotations

import time

from backend.app.bundle import BUNDLE_DIR, build_bundle, save_bundle


def main() -> None:
    start = time.perf_counter()
    bundle = build_bundle()
    save_bundle(bundle)
    sizes = {p.name: p.stat().st_size / 1e6 for p in sorted(BUNDLE_DIR.iterdir())}
    print(f"Bundle written to {BUNDLE_DIR} in {time.perf_counter() - start:.1f}s")
    for name, mb in sizes.items():
        print(f"  {name:<18} {mb:6.2f} MB")
    print(f"  stations: {len(bundle['latest'])}, history rows: {len(bundle['history'])}")


if __name__ == "__main__":
    main()
