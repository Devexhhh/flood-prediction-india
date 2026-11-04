
import json
from pathlib import Path

# ============================================
# 1. PROJECT PATHS
# ============================================

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent

NOTEBOOKS_DIR = PROJECT_ROOT / "notebooks"
OUTPUT_DIR = PROJECT_ROOT / "outputs"

NOTEBOOK_FILES = [
    "01_dataset_exploration.ipynb",
    "02_station_selection.ipynb",
    "03_build_ml_dataset.ipynb",
    "04_model_training.ipynb",
    "05_model_evaluation.ipynb",
]


# ============================================
# 2. EXTRACT NOTEBOOK CODE
# ============================================

def extract_code(notebook_path: Path) -> Path:
    if not notebook_path.is_file():
        print(f"[ERROR] Notebook not found: {notebook_path}")
        return None

    with notebook_path.open("r", encoding="utf-8") as file:
        notebook = json.load(file)

    output_lines = [
        '"""',
        f"Code extracted from: {notebook_path.name}",
        "Generated from Jupyter Notebook code cells.",
        "Original cell order is preserved.",
        '"""',
        "",
    ]

    code_cell_count = 0

    for cell_index, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") != "code":
            continue

        source = cell.get("source", "")
        if isinstance(source, list):
            source = "".join(source)

        code_cell_count += 1

        output_lines.extend([
            "",
            "#" + "=" * 70,
            f"# ORIGINAL CELL {cell_index}",
            "#" + "=" * 70,
            "",
            source.rstrip(),
            "",
        ])

    output_path = OUTPUT_DIR / f"{notebook_path.stem}.py"

    output_path.write_text(
        "\n".join(output_lines) + "\n",
        encoding="utf-8"
    )

    print(
        f"[SUCCESS] {notebook_path.name} -> {output_path.name} "
        f"({code_cell_count} code cells, "
        f"{output_path.stat().st_size:,} bytes)"
    )

    return output_path


# ============================================
# 3. EXPORT ALL FIVE NOTEBOOKS
# ============================================

def main():
    print("Project root:", PROJECT_ROOT)
    print("Notebook directory:", NOTEBOOKS_DIR)
    print("Output directory:", OUTPUT_DIR)

    if not NOTEBOOKS_DIR.is_dir():
        raise FileNotFoundError(
            f"Notebook directory does not exist: {NOTEBOOKS_DIR}"
        )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    successful = 0
    failed = []

    for filename in NOTEBOOK_FILES:
        try:
            result = extract_code(NOTEBOOKS_DIR / filename)

            if result is not None:
                successful += 1
            else:
                failed.append(filename)

        except (OSError, json.JSONDecodeError) as error:
            print(f"[ERROR] {filename}: {error}")
            failed.append(filename)

    print("\n" + "=" * 55)
    print(f"Successfully exported: {successful}/{len(NOTEBOOK_FILES)}")
    print(f"Failed or missing: {len(failed)}")

    if failed:
        print("Check these notebooks:")
        for filename in failed:
            print(" -", filename)

    print("\nGenerated files:")
    for path in sorted(OUTPUT_DIR.glob("*.py")):
        print(f" - {path.name} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
