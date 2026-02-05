CREATE INDEX idx_citizen_aadhar
ON citizen(aadhar_no);

CREATE UNIQUE INDEX idx_primary_citizen_contact
ON citizen_contact(citizen_id) WHERE is_primary = TRUE;

CREATE INDEX idx_healthfac_type
ON health_facility(type);

CREATE INDEX idx_healthfac_city
ON health_facility(city);

CREATE INDEX idx_healthfac_lat_long
ON health_facility(latitude, longitude);

CREATE UNIQUE INDEX idx_primary_healthfac_contact
ON healthfac_contact(healthfac_id) WHERE is_primary = TRUE;

CREATE INDEX idx_supplier_city
ON supplier(city);

CREATE INDEX idx_listing_item
ON listing(item_id);

CREATE INDEX idx_listing_supplier
ON listing(supplier_id);

CREATE INDEX idx_listing_item_supplier
ON listing(item_id, supplier_id);

CREATE INDEX idx_worker_role
ON healthcareworker(role);

CREATE INDEX idx_skill_lookup
ON skills(name, type);

CREATE INDEX idx_visit_citizen_date
ON visit(citizen_id, visit_date DESC);

CREATE INDEX idx_visit_centre
ON visit(centre_id);

CREATE INDEX idx_doctor_visit_doctor
ON doctor_visit(doctor_id);

CREATE INDEX idx_diagnosis_visit
ON diagnosis(visit_id);

CREATE INDEX idx_prescription_visit
ON prescription(visit_id);

CREATE INDEX idx_prescription_item
ON prescription(item_id);

CREATE INDEX idx_vaccination_citizen
ON vaccination(citizen_id, vaccination_date DESC);

CREATE UNIQUE INDEX idx_unique_vaccine_dose
ON vaccination(citizen_id, vaccine_id, dose_no);

CREATE INDEX idx_lab_test_provided_test
ON lab_test_provided(test_id);

CREATE INDEX idx_lab_test_provided_fac
ON lab_test_provided(fac_id);

CREATE INDEX idx_procedure_provided_proc
ON procedure_provided(procedure_id);

CREATE INDEX idx_procedure_provided_fac
ON procedure_provided(fac_id);

CREATE INDEX idx_lab_order_visit
ON lab_order(visit_id);

CREATE INDEX idx_lab_order_lab
ON lab_order(lab_id);

CREATE INDEX idx_wards_facility
ON wards(facility_id);

CREATE INDEX idx_bed_ward
ON bed(ward_id);

CREATE INDEX idx_admission_citizen
ON admission(citizen_id);

CREATE INDEX idx_warehouse_inventory_item
ON warehouse_inventory(item_id, warehouse_id);

CREATE INDEX idx_facility_inventory_item
ON facility_inventory(item_id, facility_id);

CREATE INDEX idx_facility_inventory_threshold
ON facility_inventory(quantity, threshold)
WHERE quantity < threshold;

CREATE INDEX idx_inventory_expiry
ON facility_inventory(expiry);

CREATE INDEX idx_warehouse_inventory_expiry
ON warehouse_inventory(expiry);

CREATE INDEX idx_supply_order_supplier
ON supply_order(supplier_id);

CREATE INDEX idx_supply_order_item
ON supply_order(item_id);

CREATE INDEX idx_supply_order_status
ON supply_order(status);

CREATE INDEX idx_disease_case_disease_date
ON disease_case(disease, report_date);

CREATE INDEX idx_disease_case_region_date
ON disease_case(region, report_date);


