# TODO: Replace Django ORM with Raw SQL Cursor in All Views
Updated: Schema fully analyzed. Plan approved. Proceed iteratively.

## Breakdowned Steps from Approved Plan

### Phase 1: accounts/views.py (Mixed - Finish cursor conversion) ✅
- [x] 1.1 Convert add_citizen_contact: CitizenContact.objects.create → INSERT citizen_contact
- [x] 1.2 Convert delete_citizen: Citizen.objects.filter → DELETE citizen
- [x] 1.3 Convert add_worker/add_supplier remaining 
- [x] 1.4 Remaining creates/deletes for supplier/facility contacts
### Phase 1: accounts/views.py Complete ✅

### Phase 2: facilities/views.py (Heavy ORM) ✅
- [x] 2.1 Convert facility dashboard APIs: get_ward_availability, facility_occupancy → SELECT wards
- [x] 2.2 Convert patient mgmt: admit_patient, log_usage → INSERT admission/item_use
- [x] 2.3 Convert inventory: facility_inventory, low_inventory, citizen_lab_tests → SELECT inventory/lab_order
- [x] 2.4 Convert clinical integrations: today_appointments/citizen_history → visit joins
- [ ] Test: python backend/manage.py runserver

**Progress**: Phase 2 complete. Starting Phase 3: clinical/views.py

### Phase 3: clinical/views.py (Heavy ORM + ClassViews)
- [ ] 3.1 Convert history/eligible/book: medical_history/vaccination_history/eligible_vaccines/visit_detail → citizen/visit/vaccination/item joins
- [ ] 3.2 Convert search_facilities/search_directory/book_appointment/create_visit_with_diagnosis
- [ ] 3.3 Convert ClassViews: CitizenMedicalHistoryAPIView/VisitDetailAPIView → raw SQL in get_queryset or function views
- [ ] 3.4 Convert analytics: DiseaseGeographicStatsAPIView/DiseaseMonthlyTrendAPIView
- [ ] Test: Citizen/visit APIs.

### Phase 4: inventory/views.py + services/supply_chain.py
- [ ] 4.1 Convert ListAPIVIews: LowStockAlertAPIView/NearExpiryAlertAPIView → raw SELECT inventory
- [ ] 4.2 Convert purchase/request: manual_purchase/auto_purchase/get_best_suppliers → supplier_order/listing
- [ ] 4.3 Convert fulfill_request in services/supply_chain.py → warehouse/inventory_transfer/supplier_order loops
- [ ] Test: Inventory restock flows.

### Phase 5: Final Validation
- [ ] Remove unused model imports.
- [ ] Run `python backend/manage.py runserver` + test all endpoints.
- [ ] Format: `black backend/**/*.py`
- [ ] attempt_completion.

**Tables Covered**: users, citizen*, place, health_facility*, supplier*, healthcareworker*, works*, *_contact*, item*, listing, inventory*, supplier_order*, inventory_transfer, visit*, diagnosis*, prescription*, lab_order*, admission*, ward*, vaccination*, vacc_prereq_*, disease*, procedure_taken*, item_use*, transfer*, lab_result*, lab_test_provided*, procedure_provided*. (* = primary)

**Progress**: Starting Phase 1.

