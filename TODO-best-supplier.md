# BestSupplier Feature Implementation

## Steps Completed
- [x] 1. Create TODO-best-supplier.md

BestSupplier page complete. Dropdown all items, input qty → ranked suppliers table by price (supplier_id, qty, price/unit, total cost). Fallback to facility inventory. "Reorder" in FacilityInventory → /best-supplier.

To test: Login worker → /inventory → Reorder → Select item/qty → Find Best Suppliers → See ranked list.

`cd frontend && npm run dev`
