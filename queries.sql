-- 1 medical history of a person 
SELECT v.visit_date, hf.name AS facility, d.name AS disease
FROM visit v
JOIN health_facility hf ON v.centre_id = hf.id
LEFT JOIN diagnosis diag ON v.id = diag.visit_id
LEFT JOIN disease d ON diag.disease_id = d.id
WHERE v.citizen_id = 961
ORDER BY v.visit_date DESC;

-- 2 complete details of a hospital visit
SELECT v.visit_date, hf.name AS facility,lab_test.name as lab_test, lab_result.result as test_result, d.name AS disease, i.name as medicine, pr.dosage as dosage, pr.frequency as frequency, pr.start_date as start_date, pr.end_date as end_date, mp.name AS procedure_name,
a.admission_date, a.discharge_date, w.type as ward_type
FROM visit v 
LEFT JOIN lab_order ON lab_order.visit_id = v.id
LEFT JOIN lab_result ON lab_result.order_id = lab_order.id
LEFT JOIN lab_test on lab_test.id = lab_order.test_id
LEFT JOIN diagnosis diag ON v.id = diag.visit_id
LEFT JOIN disease d ON diag.disease_id = d.id
LEFT JOIN prescription pr ON v.id = pr.visit_id
LEFT JOIN item i ON pr.item_id = i.id
LEFT JOIN procedure_taken pt ON v.id = pt.visit_id
LEFT JOIN medical_procedure mp ON pt.procedure_id = mp.procedure_id
LEFT JOIN admission a ON a.visit_id = v.id
LEFT JOIN wards w ON a.ward_id = w.id
JOIN health_facility hf ON hf.id = w.facility_id
WHERE v.citizen_id = 988 AND v.id = 52;

-- 3 vaccination history of a person 
SELECT i.name AS vaccine_name, v.vaccination_date, v.dose_no, hf.name AS center
FROM vaccination v
JOIN item i ON v.vaccine_id = i.id
JOIN health_facility hf ON v.centre_id = hf.id
WHERE v.citizen_id = 1500
ORDER BY v.vaccination_date DESC;

-- 4 hospital visits in a date range
SELECT v.visit_date, hf.name, v.reason
FROM visit v
JOIN health_facility hf ON v.centre_id = hf.id
WHERE v.citizen_id = 1120
AND v.visit_date BETWEEN '2023-01-01' AND '2026-12-31';

-- 5 vaccine citizen is eleigible for but hasnt taken 
SELECT i.name 
FROM item i
JOIN vacc_prereq_age vpa ON i.id = vpa.vaccine_id
WHERE i.type = 'vaccine'
AND vpa.age_limit <= (SELECT TIMESTAMPDIFF(YEAR, dob, CURDATE()) FROM citizen WHERE citizen_id = 1343)
AND i.id NOT IN (SELECT vaccine_id FROM vaccination WHERE citizen_id = 1343);

-- 6 suppliers selling specific item ordered as per cost 
SELECT s.name, l.price_per_item, l.quantity
FROM listing l
JOIN supplier s ON l.supplier_id = s.id
JOIN item i ON l.item_id = i.id
WHERE i.name = 'Paracetamol'
ORDER BY l.price_per_item;

-- 7 items close to expiry at a given facility
SELECT i.name, inv.quantity, inv.expiry, p.city
FROM inventory inv
JOIN item i ON inv.item_id = i.id
JOIN place p ON inv.place_id = p.id
WHERE inv.place_id = 1
  AND inv.expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY);

-- 8 items below inventory threshold 
SELECT i.name, inv.quantity, inv.threshold
FROM inventory inv
JOIN item i ON inv.item_id = i.id
WHERE inv.place_id = 1 AND inv.quantity < inv.threshold;

-- 9 workers in fac w qualification
SELECT hw.name, hw.role, s.name AS qualification
FROM healthcareworker hw
JOIN works w ON hw.id = w.worker_id
JOIN skills s ON hw.id = s.worker_id
WHERE w.fac_id = 1
  AND w.end_date IS NULL
  AND s.name = 'MBBS'; 

-- 10 facilities offering a lab test 
SELECT hf.name FROM health_facility hf
JOIN lab_test_provided ltp ON hf.id = ltp.fac_id
WHERE ltp.test_id = 12;

-- 11 facilities offering a procedure
SELECT hf.name FROM health_facility hf
JOIN procedure_provided pp ON hf.id = pp.fac_id
WHERE pp.procedure_id = 10;

-- 12 facilities w vacant beds by location
SELECT p.state, p.city, hf.name, SUM(w.total) - SUM(w.occupied) AS vacant_beds, SUM(w.total) as total_beds
FROM wards w
JOIN health_facility hf ON w.facility_id = hf.id
JOIN place p ON hf.id = p.id
WHERE p.state = 'Delhi'
GROUP BY w.facility_id
HAVING SUM(w.total) - SUM(w.occupied) > 0;

-- 13 individuals effected by a disease in a region 
SELECT c.state, c.city, COUNT(DISTINCT c.citizen_id) as cases
FROM diagnosis d
JOIN visit v ON d.visit_id = v.id
JOIN citizen c ON v.citizen_id = c.citizen_id
WHERE d.disease_id = 16
GROUP BY c.state, c.city;

-- 14 total cases of a given disease on a given day
SELECT COUNT(*) 
FROM diagnosis d 
JOIN visit v ON d.visit_id = v.id 
WHERE d.disease_id = 6 AND v.visit_date = '2026-03-18';

-- 15 monthly average of a disease
SELECT MONTH(v.visit_date) as month, COUNT(*) / COUNT(DISTINCT v.visit_date) as avg_daily_cases
FROM diagnosis d
JOIN visit v ON d.visit_id = v.id
WHERE d.disease_id = 12
GROUP BY MONTH(v.visit_date);
