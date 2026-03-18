-- Speed up patient-specific history lookups
CREATE INDEX idx_visit_citizen_date ON visit(citizen_id, visit_date DESC);

-- Speed up regional disease analytics
CREATE INDEX idx_citizen_location ON citizen(state, city);

-- Speed up disease-specific reporting
CREATE INDEX idx_diagnosis_disease ON diagnosis(disease_id);

-- Speed up vaccination history lookups
CREATE INDEX idx_vaccination_citizen ON vaccination(citizen_id);

-- Speed up expiry alerts
CREATE INDEX idx_inventory_expiry ON inventory(expiry);

-- Speed up stock level checks for specific facilities
CREATE INDEX idx_inventory_place_item ON inventory(place_id, item_id);

-- Speed up price comparisons for procurement
CREATE INDEX idx_listing_item_price ON listing(item_id, price_per_item);

-- Speed up worker searches by facility
CREATE INDEX idx_works_fac_status ON works(fac_id, end_date);

-- Speed up skill/qualification filtering
CREATE INDEX idx_skills_name ON skills(name);

-- medical history view
CREATE VIEW view_complete_clinical_record AS
SELECT 
    v.citizen_id, v.id AS visit_id, v.visit_date, hf.name AS facility,
    d.name AS diagnosis, i.name AS medication, pr.dosage,
    lt.name AS test_name, lr.result AS test_result,
    mp.name AS procedure_performed,
    a.admission_date, a.discharge_date, w.type AS ward_type
FROM visit v
LEFT JOIN health_facility hf ON v.centre_id = hf.id
LEFT JOIN diagnosis diag ON v.id = diag.visit_id
LEFT JOIN disease d ON diag.disease_id = d.id
LEFT JOIN prescription pr ON v.id = pr.visit_id
LEFT JOIN item i ON pr.item_id = i.id
LEFT JOIN lab_order lo ON lo.visit_id = v.id
LEFT JOIN lab_result lr ON lr.order_id = lo.id
LEFT JOIN lab_test lt ON lt.id = lo.test_id
LEFT JOIN procedure_taken pt ON v.id = pt.visit_id
LEFT JOIN medical_procedure mp ON pt.procedure_id = mp.procedure_id
LEFT JOIN admission a ON a.visit_id = v.id
LEFT JOIN wards w ON a.ward_id = w.id;

-- supply level view
CREATE VIEW view_inventory_alerts AS
SELECT 
    p.state, p.city, hf.name AS facility_name, i.name AS item_name,
    inv.quantity, inv.threshold, inv.expiry,
    CASE 
        WHEN inv.quantity < inv.threshold THEN 'Low Stock'
        WHEN inv.expiry <= CURDATE() THEN 'Expired'
        WHEN inv.expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Expiring Soon'
        ELSE 'Healthy'
    END AS status_flag
FROM inventory inv
JOIN item i ON inv.item_id = i.id
JOIN health_facility hf ON inv.place_id = hf.id
JOIN place p ON hf.id = p.id;

-- vacancy check
CREATE VIEW view_facility_bed_capacity AS
SELECT 
    p.state, p.city, hf.name, hf.type,
    SUM(w.total) AS total_beds,
    SUM(w.occupied) AS occupied_beds,
    SUM(w.total) - SUM(w.occupied) AS available_beds
FROM wards w
JOIN health_facility hf ON w.facility_id = hf.id
JOIN place p ON hf.id = p.id
GROUP BY hf.id, p.state, p.city;
