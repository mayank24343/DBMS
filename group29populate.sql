INSERT INTO citizen
(aadhar_no, name, dob, sex, addr_l1, addr_l2, city, state, postal_code, latitude, longitude)
VALUES
('111111111111','Amit Sharma','1990-05-10','M','House 1','Street A','Delhi','Delhi','110001',28.61,77.21),
('222222222222','Neha Verma','1995-07-21','F','House 2','Street B','Mumbai','MH','400001',19.07,72.87),
('333333333333','Rohit Mehta','1988-11-15','M','House 3','Street C','Pune','MH','411001',18.52,73.85),
('444444444444','Anjali Singh','1992-02-02','F','House 4','Street D','Lucknow','UP','226001',26.85,80.94),
('555555555555','Karan Patel','1998-09-09','M','House 5','Street E','Ahmedabad','GJ','380001',23.02,72.57),
('666666666666','Priya Nair','1991-12-12','F','House 6','Street F','Kochi','KL','682001',9.93,76.26),
('777777777777','Vikas Rao','1985-03-30','M','House 7','Street G','Hyderabad','TS','500001',17.38,78.48),
('888888888888','Sneha Iyer','1996-06-06','F','House 8','Street H','Chennai','TN','600001',13.08,80.27),
('999999999999','Rahul Das','1989-08-18','M','House 9','Street I','Kolkata','WB','700001',22.57,88.36),
('101010101010','Pooja Jain','1994-01-25','F','House 10','Street J','Jaipur','RJ','302001',26.91,75.79);

INSERT INTO citizen_contact (citizen_id, phone, is_primary)
VALUES
(1,'9000000001',true),(2,'9000000002',true),(3,'9000000003',true),
(4,'9000000004',true),(5,'9000000005',true),(6,'9000000006',true),
(7,'9000000007',true),(8,'9000000008',true),(9,'9000000009',true),
(10,'9000000010',true);

INSERT INTO health_facility
(name,type,addr_l1,addr_l2,city,state,postal_code,latitude,longitude)
VALUES
('AIIMS Delhi','Hospital','Ring Rd','Ansari Nagar','Delhi','Delhi','110029',28.56,77.21),
('Apollo Mumbai','Hospital','Bandra','West','Mumbai','MH','400050',19.06,72.83),
('Fortis Pune','Hospital','Baner','Road','Pune','MH','411045',18.56,73.78),
('City Lab','Laboratory','MG Rd','Area 1','Delhi','Delhi','110002',28.64,77.22),
('MedPlus','Pharmacy','Main Rd','Sector 2','Hyderabad','TS','500081',17.45,78.38),
('Care Clinic','Clinic','Park St','Area 3','Kolkata','WB','700016',22.55,88.35),
('SRM Lab','Laboratory','Anna Salai','Central','Chennai','TN','600002',13.06,80.25),
('Apollo Pharmacy','Pharmacy','Link Rd','Zone A','Mumbai','MH','400064',19.18,72.84),
('City Hospital','Hospital','Station Rd','Block C','Jaipur','RJ','302006',26.92,75.82),
('District Clinic','Clinic','Sector 5','Block D','Lucknow','UP','226010',26.88,80.99);

INSERT INTO supplier
(name,addr_l1,addr_l2,city,state,postal_code,latitude,longitude)
VALUES
('MedSupply Co','Plot 1','Industrial Area','Delhi','Delhi','110020',28.51,77.18),
('HealthEquip Ltd','Plot 2','MIDC','Pune','MH','411019',18.64,73.75),
('VaccineCorp','Plot 3','Tech Park','Hyderabad','TS','500032',17.44,78.35),
('PharmaPlus','Plot 4','Sector 10','Ahmedabad','GJ','380015',23.03,72.52),
('LifeCare','Plot 5','Area 5','Mumbai','MH','400070',19.08,72.88),
('MedLine','Plot 6','Phase 2','Chennai','TN','600097',12.98,80.25),
('BioSuppliers','Plot 7','Industrial','Kolkata','WB','700091',22.58,88.40),
('EquipWorld','Plot 8','Area 8','Jaipur','RJ','302013',26.97,75.75),
('Wellness Inc','Plot 9','Zone 9','Lucknow','UP','226012',26.90,81.01),
('CareSource','Plot 10','Area 10','Bhopal','MP','462003',23.25,77.41);

INSERT INTO item (type,name,description)
VALUES
('medicine','Paracetamol','Pain reliever'),
('medicine','Amoxicillin','Antibiotic'),
('vaccine','Covishield','COVID Vaccine'),
('vaccine','BCG','TB Vaccine'),
('equipment','Ventilator','ICU Equipment'),
('equipment','ECG Machine','Heart monitor'),
('other','Syringe','Disposable syringe'),
('other','Gloves','Medical gloves'),
('medicine','Ibuprofen','Anti-inflammatory'),
('vaccine','Polio','Polio vaccine');

INSERT INTO healthcareworker (name,role)
VALUES
('Dr. Arun','Doctor'),('Dr. Meena','Doctor'),('Nurse Kavita','Nurse'),
('Nurse Riya','Nurse'),('Tech Ramesh','Technician'),
('Tech Suresh','Technician'),('Pharmacist Alok','Pharmacist'),
('Admin Sunita','Admin'),('Dr. Nikhil','Doctor'),('Nurse Poonam','Nurse');

INSERT INTO visit (citizen_id, centre_id, visit_date, reason)
VALUES
(1,1,'2024-01-10','Fever'),
(2,2,'2024-01-11','Cough'),
(3,3,'2024-01-12','Injury'),
(4,1,'2024-01-13','Checkup'),
(5,4,'2024-01-14','Blood Test'),
(6,5,'2024-01-15','Medicine'),
(7,6,'2024-01-16','Consultation'),
(8,7,'2024-01-17','Lab Test'),
(9,8,'2024-01-18','Vaccination'),
(10,9,'2024-01-19','Emergency');

INSERT INTO diagnosis (visit_id, description)
VALUES
(1,'Viral fever'),(2,'Bronchitis'),(3,'Fracture'),
(4,'Normal'),(5,'High cholesterol'),
(6,'Migraine'),(7,'Skin allergy'),
(8,'Low hemoglobin'),(9,'Routine vaccine'),
(10,'Appendicitis');

INSERT INTO disease_case
(disease,region,report_date,worker_id,patient_id)
VALUES
('COVID-19','Delhi','2024-01-10',1,1),
('Dengue','Mumbai','2024-01-11',2,2),
('Malaria','Pune','2024-01-12',3,3),
('COVID-19','Delhi','2024-01-13',4,4),
('TB','Kolkata','2024-01-14',5,5),
('Flu','Chennai','2024-01-15',6,6),
('COVID-19','Hyderabad','2024-01-16',7,7),
('Measles','Jaipur','2024-01-17',8,8),
('Flu','Lucknow','2024-01-18',9,9),
('Dengue','Delhi','2024-01-19',10,10);

INSERT INTO supplier_contact (supplier_id, phone, is_primary)
VALUES
(1,'9100000001',true),(2,'9100000002',true),(3,'9100000003',true),
(4,'9100000004',true),(5,'9100000005',true),(6,'9100000006',true),
(7,'9100000007',true),(8,'9100000008',true),(9,'9100000009',true),
(10,'9100000010',true);

INSERT INTO healthfac_contact (healthfac_id, phone, is_primary)
VALUES
(1,'9200000001',true),(2,'9200000002',true),(3,'9200000003',true),
(4,'9200000004',true),(5,'9200000005',true),(6,'9200000006',true),
(7,'9200000007',true),(8,'9200000008',true),(9,'9200000009',true),
(10,'9200000010',true);

INSERT INTO skills (worker_id, name, type)
VALUES
(1,'MBBS','qualification'),
(2,'MD','qualification'),
(3,'Nursing','qualification'),
(4,'ICU Care','specialization'),
(5,'X-Ray','specialization'),
(6,'Pathology','specialization'),
(7,'Pharmacy','qualification'),
(8,'Hospital Admin','qualification'),
(9,'Cardiology','specialization'),
(10,'Emergency Care','specialization');

INSERT INTO attendance (worker_id, att_date)
VALUES
(1,'2024-01-10'),(2,'2024-01-10'),(3,'2024-01-10'),
(4,'2024-01-11'),(5,'2024-01-11'),
(6,'2024-01-12'),(7,'2024-01-12'),
(8,'2024-01-13'),(9,'2024-01-13'),
(10,'2024-01-14');

INSERT INTO listing (supplier_id, item_id, quantity, price_per_item)
VALUES
(1,1,500,2.50),(1,2,300,5.00),
(2,5,20,250000.00),(2,6,15,150000.00),
(3,3,1000,150.00),(3,4,800,120.00),
(4,9,400,8.00),(5,10,600,100.00),
(6,7,2000,1.00),(7,8,1500,0.50);

INSERT INTO medical_procedure (name, category, description, is_invasive)
VALUES
('Appendectomy','Surgical','Appendix removal',true),
('Angioplasty','Surgical','Artery widening',true),
('Physiotherapy','Therapeutic','Rehab therapy',false),
('Dialysis','Therapeutic','Kidney support',true),
('ECG','Diagnostic','Heart test',false),
('X-Ray','Diagnostic','Imaging',false),
('CT Scan','Diagnostic','Advanced imaging',false),
('Blood Transfusion','Therapeutic','Blood transfer',true),
('Vaccination','Preventive','Immunization',false),
('Stitching','Surgical','Wound closure',true);

INSERT INTO procedure_provided (procedure_id, fac_id)
VALUES
(1,1),(2,2),(3,6),(4,1),(5,3),
(6,4),(7,7),(8,1),(9,9),(10,10);

INSERT INTO lab_test_provided (test_id, fac_id)
VALUES
(1,4),(2,4),(3,7),(4,7),(5,3),
(6,3),(7,4),(8,7),(9,3),(10,4);

INSERT INTO lab_order (visit_id, test_id, lab_id, order_date)
VALUES
(1,1,4,'2024-01-10'),
(2,2,4,'2024-01-11'),
(3,3,7,'2024-01-12'),
(4,4,7,'2024-01-13'),
(5,5,3,'2024-01-14'),
(6,6,3,'2024-01-15'),
(7,7,4,'2024-01-16'),
(8,8,7,'2024-01-17'),
(9,9,3,'2024-01-18'),
(10,10,4,'2024-01-19');

INSERT INTO lab_result (order_id, result_date, result)
VALUES
(1,'2024-01-10','Normal'),
(2,'2024-01-11','High'),
(3,'2024-01-12','Normal'),
(4,'2024-01-13','Low'),
(5,'2024-01-14','Normal'),
(6,'2024-01-15','Abnormal'),
(7,'2024-01-16','Normal'),
(8,'2024-01-17','Critical'),
(9,'2024-01-18','Normal'),
(10,'2024-01-19','Normal');

INSERT INTO vaccination (citizen_id, vaccine_id, vaccination_date, dose_no, centre_id)
VALUES
(1,3,'2024-01-05',1,1),(2,3,'2024-01-06',1,2),
(3,4,'2024-01-07',1,3),(4,10,'2024-01-08',1,9),
(5,3,'2024-01-09',1,1),(6,4,'2024-01-10',1,3),
(7,10,'2024-01-11',1,9),(8,3,'2024-01-12',1,2),
(9,4,'2024-01-13',1,3),(10,10,'2024-01-14',1,9);

INSERT INTO wards (facility_id, type)
VALUES
(1,'General'),(1,'ICU'),
(2,'General'),(2,'ICU'),
(3,'General'),(4,'Lab'),
(5,'Pharmacy'),(6,'General'),
(9,'Emergency'),(10,'General');

INSERT INTO bed (status, ward_id)
VALUES
('Available',1),('Occupied',1),
('Available',2),('Occupied',2),
('Available',3),('Available',4),
('Occupied',5),('Available',6),
('Available',9),('Occupied',10);

INSERT INTO admission (citizen_id, visit_id, admission_date, discharge_date)
VALUES
(1,1,'2024-01-10','2024-01-12'),
(2,2,'2024-01-11','2024-01-13'),
(3,3,'2024-01-12','2024-01-18'),
(4,4,'2024-01-13','2024-01-14'),
(5,5,'2024-01-14','2024-01-15'),
(6,6,'2024-01-15','2024-01-16'),
(7,7,'2024-01-16','2024-01-20'),
(8,8,'2024-01-17','2024-01-18'),
(9,9,'2024-01-18','2024-01-19'),
(10,10,'2024-01-19',NULL);

INSERT INTO bed_allocs (bed_id, adm_id, start_time, end_time)
VALUES
(1,1,'2024-01-10 10:00','2024-01-12 10:00'),
(2,2,'2024-01-11 11:00','2024-01-13 11:00'),
(3,3,'2024-01-12 09:00','2024-01-18 09:00'),
(4,4,'2024-01-13 14:00','2024-01-14 14:00'),
(5,5,'2024-01-14 08:00','2024-01-15 08:00'),
(6,6,'2024-01-15 09:00','2024-01-16 09:00'),
(7,7,'2024-01-16 10:00','2024-01-20 10:00'),
(8,8,'2024-01-17 11:00','2024-01-18 11:00'),
(9,9,'2024-01-18 12:00','2024-01-19 12:00'),
(10,10,'2024-01-19 13:00',NULL);

INSERT INTO warehouse_inventory
(warehouse_id, item_id, quantity, expiry, threshold)
VALUES
(1,1,1000,'2025-12-31',200),
(1,2,800,'2025-10-31',150),
(2,3,5000,'2026-01-31',1000),
(2,4,4000,'2026-03-31',800),
(3,7,20000,'2027-12-31',5000),
(4,8,15000,'2027-11-30',4000),
(5,9,1200,'2025-09-30',300),
(6,10,3000,'2026-06-30',600),
(7,5,50,'2030-01-01',10),
(8,6,40,'2030-01-01',10);

INSERT INTO facility_inventory
(facility_id, item_id, quantity, expiry, threshold)
VALUES
(1,1,200,'2025-06-30',50),
(2,2,150,'2025-05-31',40),
(3,3,300,'2026-01-31',100),
(4,7,1000,'2027-12-31',300),
(5,8,800,'2027-11-30',200),
(6,9,120,'2025-09-30',30),
(7,10,400,'2026-06-30',100),
(8,1,250,'2025-06-30',60),
(9,4,200,'2026-03-31',80),
(10,2,180,'2025-10-31',50);

INSERT INTO supply_order
(supplier_id, destination_id, destination_type, item_id, quantity, order_date, status)
VALUES
(1,1,'warehouse',1,500,'2024-01-05','Received'),
(2,2,'warehouse',5,5,'2024-01-06','Received'),
(3,3,'warehouse',3,2000,'2024-01-07','Received'),
(4,1,'facility',9,100,'2024-01-08','Received'),
(5,2,'facility',10,150,'2024-01-09','Received'),
(6,3,'facility',7,500,'2024-01-10','Received'),
(7,4,'facility',8,600,'2024-01-11','Order Placed'),
(8,5,'warehouse',6,10,'2024-01-12','Received'),
(9,6,'warehouse',2,400,'2024-01-13','Order Placed'),
(10,7,'facility',4,300,'2024-01-14','Cancelled');
