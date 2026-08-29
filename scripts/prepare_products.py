import json
from pathlib import Path

SOURCE_FILE = Path("OLD_HindPharmaDataFile")
DATA_DIR = Path("data")

FORMULAS = {
    "ABIXIM 200 TAB 10": "Cefixime 200 mg",
    "ACEFILE-MR 10S": "Aceclofenac 100 mg + Chlorzoxazone 250 mg + Paracetamol 325 mg",
    "PANTOSEC 40MG TAB 10": "Pantoprazole 40 mg",
    "PANTOSEC D TAB 10": "Domperidone 10 mg + Pantoprazole 40 mg",
    "NIMUPAIN PLUS TAB (BROWN) 10": "Nimesulide 100 mg + Paracetamol 325 mg",
    "NIMUPAIN TAB 10": "Nimesulide 100 mg",
    "VERTIRON TAB 25": "Cinnarizine 25 mg",
    "FLUKA 150 CAP 1-CAP": "Fluconazole 150 mg",
    "NITRO-G 2.6 TAB 30S": "Nitroglycerin 2.6 mg",
    "NEOS CREAM (NEOMYCIN)10GM 10GM": "Neomycin",
}


def clean(value):
    if value is None:
        return None
    if isinstance(value, str):
        value = " ".join(value.split())
        if not value or value.upper() in {"-BLANK-", "-", "NULL", "NONE"}:
            return None
    return value


def write_json(name, records):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with (DATA_DIR / name).open("w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)


def prepare_data():
    with SOURCE_FILE.open("r", encoding="utf-8") as file:
        records = json.load(file)

    products = []
    inventory = []
    suppliers = {}
    companies = {}
    purchases = []

    for index, record in enumerate(records, start=1):
        product_name = clean(record.get("Product Name"))
        if not product_name:
            continue

        product_id = f"P{index:05d}"
        company = clean(record.get("Company"))
        supplier = clean(record.get("Supplier"))
        mrp = record.get("M.R.P.")
        if mrp in (0, "0", "", None):
            mrp = None

        products.append({
            "id": product_id,
            "code": clean(record.get("Code")),
            "name": product_name,
            "unit": clean(record.get("Unit")),
            "mrp": mrp,
            "formula": FORMULAS.get(str(record.get("Product Name", "")).strip()),
            "company": company,
        })

        if company:
            companies[company] = {"name": company}
        if supplier:
            suppliers[supplier] = {"name": supplier}

        inventory.append({
            "id": f"INV{index:05d}",
            "product_id": product_id,
            "current_stock": record.get("Current Stock", 0),
            "batch": clean(record.get("Batch")),
            "expiry": clean(record.get("EXP")),
        })

        purchases.append({
            "id": f"PUR{index:05d}",
            "product_id": product_id,
            "supplier": supplier,
            "cost_price": record.get("Cost Price"),
            "purchase_price": record.get("Purchase Price"),
            "sales_price": record.get("Sales Price"),
            "received_date": clean(record.get("Rec.Date")),
            "invoice_number": clean(record.get("Inv.No")),
            "invoice_date": clean(record.get("Inv.Date")),
        })

    write_json("products.json", products)
    write_json("companies.json", [{"name": value["name"]} for value in companies.values()])
    write_json("suppliers.json", [{"name": value["name"]} for value in suppliers.values()])
    write_json("inventory.json", inventory)
    write_json("purchases.json", purchases)
    print(f"Prepared {len(products)} products, {len(companies)} companies, {len(suppliers)} suppliers, {len(inventory)} inventory records and {len(purchases)} purchase records")


if __name__ == "__main__":
    prepare_data()
