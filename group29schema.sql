CREATE TABLE citizens (
    	citizen_id SERIAL PRIMARY KEY,
    	aadhar_no VARCHAR(12) UNIQUE NOT NULL,
    	name VARCHAR(100) NOT NULL,
    	dob DATE NOT NULL,
	sex CHAR(1) NOT NULL,
	CHECK (sex IN ('M','F','O')),
    	addr_l1 TEXT NOT NULL,
    	addr_l2 TEXT NOT NULL,
    	city VARCHAR(50) NOT NULL,
    	state VARCHAR(50) NOT NULL,
    	postal_code CHAR(6) NOT NULL,
    	latitude DECIMAL(9,6) NOT NULL,
    	longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE citizen_contact (
    	id SERIAL PRIMARY KEY,
   	citizen_id INT REFERENCES citizen(citizen_id) ON DELETE CASCADE,
    	email VARCHAR(100),
    	phone CHAR(10),
	CHECK ((phone IS NOT NULL AND email IS NULL) OR (phone IS NULL AND email IS NOT NULL)),
    	is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE health_facility (
    	id SERIAL PRIMARY KEY,
    	name VARCHAR(100) NOT NULL,
    	type VARCHAR(30) NOT NULL,
	CHECK (type IN ('Hospital','Clinic','Pharmacy','Laboratory')),
	addr_l1 TEXT NOT NULL,
    	addr_l2 TEXT NOT NULL,
    	city VARCHAR(50) NOT NULL,
    	state VARCHAR(50) NOT NULL,
    	postal_code CHAR(6) NOT NULL,
    	latitude DECIMAL(9,6) NOT NULL,
    	longitude DECIMAL(9,6) NOT NULL
);

CREATE TABLE healthfac_contact (
    	id SERIAL PRIMARY KEY,
   	healthfac_id INT REFERENCES health_facility(id) ON DELETE CASCADE,
    	email VARCHAR(100),
    	phone CHAR(10),
	CHECK ((phone IS NOT NULL AND email IS NULL) OR (phone IS NULL AND email IS NOT NULL)),
    	is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE supplier (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	addr_l1 TEXT NOT NULL,
    	addr_l2 TEXT NOT NULL,
    	city VARCHAR(50) NOT NULL,
    	state VARCHAR(50) NOT NULL,
    	postal_code CHAR(6) NOT NULL,
    	latitude DECIMAL(9,6) NOT NULL,
    	longitude DECIMAL(9,6) NOT NULL

);

CREATE TABLE supplier_contact (
    	id SERIAL PRIMARY KEY,
   	supplier_id INT REFERENCES supplier(id) ON DELETE CASCADE,
    	email VARCHAR(100),
    	phone CHAR(10),
	CHECK ((phone IS NOT NULL AND email IS NULL) OR (phone IS NULL AND email IS NOT NULL)),
    	is_primary BOOLEAN DEFAULT FALSE
);

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
	type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE listing (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(id),
    item_id INT NOT NULL REFERENCES item(id),
    quantity INT,
    price_per_item DECIMAL(10,2)
);


CREATE TABLE healthcareworker (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES healthcareworker(id),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('qualification','specialization'))
);

CREATE TABLE attendance (
    worker_id INT REFERENCES healthcareworker(id),
    att_date DATE NOT NULL,
    PRIMARY KEY (worker_id, att_date)
);

CREATE TABLE visit (
    id SERIAL PRIMARY KEY,
    citizen_id INT REFERENCES citizen(citizen_id),
    centre_id INT REFERENCES health_facility(id),
    visit_date DATE NOT NULL,
    reason TEXT
);

CREATE TABLE doctor_visit (
    visit_id INT REFERENCES visit(id) ON DELETE CASCADE,
    doctor_id INT REFERENCES healthcareworker(id),
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (visit_id, doctor_id)
);

CREATE TABLE diagnosis (
    id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visit(id),
    description TEXT
);


CREATE TABLE prescription (
    id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visit(id),
    item_id INT REFERENCES item(id),
    item_type VARCHAR(10) CHECK (item_type IN ('medicine','vaccine')),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE,
    end_date DATE,
    instruction TEXT
);

medical_procedure (
  procedure_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,        
  description TEXT,
  is_invasive BOOLEAN DEFAULT TRUE
);

CREATE TABLE lab_test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
	description TEXT
);

CREATE TABLE lab_order (
    id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visit(id),
    test_id INT REFERENCES lab_test(id),
    lab_id INT REFERENCES health_facility(id),
    order_date DATE NOT NULL
);

CREATE TABLE lab_result (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES lab_order(id),
    result_date DATE,
    result VARCHAR(50) 
);

CREATE TABLE lab_test_provided (
	test_id INT REFERENCES lab_test(id),
	fac_id INT REFERENCES health_facility(id),
	PRIMARY KEY(test_id,fac_id)
);

CREATE TABLE procedure_provided (
	procedure_id INT REFERENCES medical_procedure(procedure_id),
	fac_id INT REFERENCES health_facility(id),
	PRIMARY KEY(procedure_id,fac_id)
);

CREATE TABLE vaccination (
    id SERIAL PRIMARY KEY,
    citizen_id INT REFERENCES citizen(citizen_id),
    vaccine_id INT REFERENCES vaccines(id),
    vaccination_date DATE NOT NULL,
    dose_no INT NOT NULL,
    centre_id INT REFERENCES health_facility(id)
);

CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    facility_id INT REFERENCES health_facility(id),
    type VARCHAR(30) NOT NULL DEFAULT 'Normal'
);

CREATE TABLE bed (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20),
    ward_id INT REFERENCES wards(id)
);

CREATE TABLE admission (
    id SERIAL PRIMARY KEY,
    citizen_id INT REFERENCES citizen(citizen_id),
    visit_id INT REFERENCES visit(id),
    admission_date DATE NOT NULL,
    discharge_date DATE
);

CREATE TABLE bed_allocs (
    id SERIAL PRIMARY KEY,
    bed_id INT REFERENCES bed(id),
    adm_id INT REFERENCES admission(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP
);

CREATE TABLE warehouse (
    id SERIAL PRIMARY KEY,
    addr_l1 TEXT NOT NULL,
    	addr_l2 TEXT NOT NULL,
    	city VARCHAR(50) NOT NULL,
    	state VARCHAR(50) NOT NULL,
    	postal_code CHAR(6) NOT NULL,
    	latitude DECIMAL(9,6) NOT NULL,
    	longitude DECIMAL(9,6) NOT NULL

);

CREATE TABLE warehouse_inventory (
    id SERIAL PRIMARY KEY,
    warehouse_id INT REFERENCES warehouse(id),
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    expiry DATE NOT NULL,
    threshold INT NOT NULL DEFAULT 0
);

CREATE TABLE facility_inventory (
    id SERIAL PRIMARY KEY,
    facility_id INT REFERENCES health_facility(id),
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    expiry DATE NOT NULL,
    threshold INT NOT NULL DEFAULT 0
);

CREATE TABLE supply_order (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(id),
    destination_id INT NOT NULL,
    destination_type VARCHAR(10) CHECK (destination_type IN ('warehouse','facility')),
    item_id INT NOT NULL REFERENCES item(id),
    quantity INT NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Order Placed',
	CHECK (status IN ('Order Placed','Received','Cancelled'))
);

CREATE TABLE disease_case (
    id SERIAL PRIMARY KEY,
    disease VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL,
    worker_id INT REFERENCES healthcareworker(id),
    patient_id INT REFERENCES citizen(citizen_id)
);







