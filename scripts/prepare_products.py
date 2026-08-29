import json
from pathlib import Path

SOURCE_FILE = Path("OLD_HindPharmaDataFile")
OUTPUT_FILE = Path("data/products.json")


def clean(value):
    if value is None:
        return None
    if isinstance(value, str):
        value = " ".join(value.split())
        if not value or value.upper() in {"-BLANK-", "-", "NULL", "NONE"}:
            return None
    return value


def prepare_products():
    with SOURCE_FILE.open("r", encoding="utf-8") as file:
        records = json.load(file)

    products = []
    for index, record in enumerate(records, start=1):
        product_name = clean(record.get("Product Name"))
        if not product_name:
            continue

        products.append({
            "id": f"P{index:05d}",
            "name": product_name,
            "mrp": record.get("M.R.P."),
            "formula": clean(record.get("Formula")) or clean(record.get("Composition")),
            "company": clean(record.get("Company")),
            "unit": clean(record.get("Unit")),
            "image": None,
            "active": True
        })

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(products, file, ensure_ascii=False, indent=2)

    print(f"Prepared {len(products)} product records -> {OUTPUT_FILE}")


if __name__ == "__main__":
    prepare_products()
