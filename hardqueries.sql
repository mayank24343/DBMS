-- gives visit past diagonsis of a patient using aadhar 
  
select c.name, v.visit_date, hf.name as hospital, d.name as disease, diag.description from citizen c join visit v on c.citizen_id = v.citizen_id join health_facility hf on v.centre_id = hf.id left join diagnosis diag on v.id = diag.visit_id left join disease d on diag.disease_id = d.id where c.aadhar_no = "101182230365" order by v.visit_date desc;

-- hospital visits within date range 

select v.id as visit_id, hf.name as hospital, v.visit_date, v.reason from visit v join health_facility hf on v.centre_id = hf.id join citizen c on v.citizen_id = c.citizen_id where c.aadhar_no = "101182230365" and v.visit_date BETWEEN '2020-01-01' AND '2023-02-02';

-- precribed medecines during visits 
select c.name, i.name as medicine, p.dosage, p.frequency, p.start_date, p.end_date from prescription p join visit v on p.visit_id = v.id join citizen c on v.citizen_id = c.citizen_id join item i on p.item_id = i.id where c.aadhar_no = "101182230365";

-- vaccination history of a citizen 
select i.name as vaccine, v.dose_no, v.vaccination_date, hf.name as centre from vaccination v join item i on v.vaccine_id = i.id join health_facility hf on v.centre_id = hf.id join citizen c on v.citizen_id = c.citizen_id where c.aadhar_no = "101182230365" order by v.vaccination_date;

-- diease cases in a region 
SELECT d.name AS disease, p.city, COUNT(*) AS total_cases
    FROM diagnosis diag
JOIN disease d ON diag.disease_id = d.id
JOIN visit v ON diag.visit_id = v.id
JOIN health_facility hf ON v.centre_id = hf.id
JOIN place p ON hf.id = p.id
WHERE d.name = 'Dengue'
AND p.state = 'Delhi'
GROUP BY p.city, d.name;

-- top 10 diseases 
SELECT d.name, COUNT(*) AS total_cases
FROM diagnosis diag
JOIN disease d ON diag.disease_id = d.id
GROUP BY d.name
ORDER BY total_cases DESC
LIMIT 10;

-- places where disease case exceed a number (20)

SELECT p.city, COUNT(*) AS cases
FROM diagnosis diag
JOIN visit v ON diag.visit_id = v.id
JOIN health_facility hf ON v.centre_id = hf.id
JOIN place p ON hf.id = p.id
GROUP BY p.city
HAVING COUNT(*) > 20;

-- hospitals with diminishing supllies 

SELECT hf.name AS hospital, i.name AS item, inv.quantity, inv.threshold
FROM inventory inv
JOIN health_facility hf ON inv.place_id = hf.id
JOIN item i ON inv.item_id = i.id
WHERE inv.quantity < inv.threshold;

-- expired or near expiry stock 

SELECT i.name AS item, p.city, inv.expiry, inv.quantity
FROM inventory inv
JOIN item i ON inv.item_id = i.id
JOIN place p ON inv.place_id = p.id
WHERE inv.expiry <= CURDATE() + INTERVAL 30 DAY;

-- visits per hosptial 
SELECT hf.name AS hospital, COUNT(v.id) AS total_visits
FROM visit v
JOIN health_facility hf ON v.centre_id = hf.id
GROUP BY hf.name
ORDER BY total_visits DESC;

--visits per citizen
SELECT c.name, COUNT(v.id) AS visit_count
FROM citizen c
JOIN visit v ON c.citizen_id = v.citizen_id
GROUP BY c.name
ORDER BY visit_count DESC;

--most prescribved medecines
SELECT i.name AS medicine, COUNT(*) AS times_prescribed
FROM prescription p
JOIN item i ON p.item_id = i.id
GROUP BY i.name
ORDER BY times_prescribed DESC;

--vaccination count per vaccine 
SELECT i.name AS vaccine, COUNT(*) AS vaccinations_given
FROM vaccination v
JOIN item i ON v.vaccine_id = i.id
GROUP BY i.name
ORDER BY vaccinations_given DESC;

-- inventory overall 
SELECT i.name AS item, SUM(inv.quantity) AS total_stock
FROM inventory inv
JOIN item i ON inv.item_id = i.id
GROUP BY i.name
ORDER BY total_stock DESC;

--average visits to a hospital 
SELECT AVG(visit_count) AS avg_visits_per_hospital
FROM (
    SELECT centre_id, COUNT(*) AS visit_count
    FROM visit
    GROUP BY centre_id
) AS hospital_visits;



