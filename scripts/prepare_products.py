import json
from pathlib import Path

SOURCE_FILE = Path("OLD_HindPharmaDataFile")
OUTPUT_FILE = Path("data/products.json")

# Web-verified formulas/compositions. Products not verified here remain blank.
FORMULAS = {
    "ABIXIM 200 TAB 10": "Cefixime 200 mg",
    "ACEFILE-MR 10S": "Aceclofenac 100 mg + Chlorzoxazone 250 mg + Paracetamol 325 mg",
    "AMROX LS DROPS 15ML": "Ambroxol 7.5 mg/ml + Guaifenesin 12.5 mg/ml + Levosalbutamol 0.25 mg/ml",
    "AMROX LS JUNIOR SYP 60ML 60ML": "Ambroxol 15 mg + Guaifenesin 50 mg + Levosalbutamol 0.5 mg",
    "PANTOSEC 40MG TAB 10": "Pantoprazole 40 mg",
    "PANTOSEC D TAB 10": "Domperidone 10 mg + Pantoprazole 40 mg",
    "NIMUPAIN PLUS TAB (BROWN) 10": "Nimesulide 100 mg + Paracetamol 325 mg",
    "NIMUPAIN TAB 10": "Nimesulide 100 mg",
    "VERTIRON TAB 25": "Cinnarizine 25 mg",
    "FLUKA 150 CAP 1-CAP": "Fluconazole 150 mg",
    "NITRO-G 2.6 TAB 30S": "Nitroglycerin 2.6 mg",
    "NEOS CREAM (NEOMYCIN)10GM 10GM": "Neomycin",
    "ZANDU  BALM (NEW)  8ML 8ML": "Mentha + Gaultheria + Eucalyptus + Trachyspermum ammi + Base q.s.",
    "ZANDU  BALM 25ML 1*25ML": "Mentha + Gaultheria + Eucalyptus + Trachyspermum ammi + Base q.s.",
}


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
        raw_name = record.get("Product Name")
        product_name = clean(raw_name)
        if not product_name:
            continue

        mrp = record.get("M.R.P.")
        if mrp in (0, "0", "", None):
            mrp = None

        products.append({
            "id": f"P{index:05d}",
            "name": product_name,
            "mrp": mrp,
            "formula": FORMULAS.get(str(raw_name).strip()),
            "company": clean(record.get("Company")),
        })

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(products, file, ensure_ascii=False, indent=2)

    print(f"Prepared {len(products)} product records -> {OUTPUT_FILE}")


if __name__ == "__main__":
    prepare_products()
