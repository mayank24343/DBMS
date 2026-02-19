CREATE TABLE citizen (
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
   	citizen_id BIGINT UNSIGNED,
    email VARCHAR(100),
    phone CHAR(10),
	CHECK ((phone IS NOT NULL AND email IS NULL) OR (phone IS NULL AND email IS NOT NULL)),
    is_primary BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (citizen_id) REFERENCES citizen(citizen_id) ON DELETE CASCADE
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
   	healthfac_id BIGINT UNSIGNED,
    email VARCHAR(100),
    phone CHAR(10),
	CHECK ((phone IS NOT NULL AND email IS NULL) OR (phone IS NULL AND email IS NOT NULL)),
    is_primary BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (healthfac_id) REFERENCES health_facility(id) ON DELETE CASCADE
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
   	supplier_id BIGINT UNSIGNED,
    email VARCHAR(100),
    phone CHAR(10),
	CHECK ((phone IS NOT NULL AND email IS NULL) OR (phone IS NULL AND email IS NOT NULL)),
    is_primary BOOLEAN DEFAULT FALSE,
	FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE CASCADE
);

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
	type VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
	CHECK (type IN ('medicine','vaccine','equipment','other'))
);

CREATE TABLE listing (
    id SERIAL PRIMARY KEY,
    supplier_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    quantity BIGINT UNSIGNED NOT NULL,
    price_per_item DECIMAL(10,2) NOT NULL,
	FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE CASCADE,
	FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE
);


CREATE TABLE healthcareworker (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    worker_id BIGINT UNSIGNED,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('qualification','specialization')),
	FOREIGN KEY (worker_id) REFERENCES healthcareworker(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
    worker_id BIGINT UNSIGNED,
    att_date DATE NOT NULL,
    PRIMARY KEY (worker_id, att_date),
	FOREIGN KEY (worker_id) REFERENCES healthcareworker(id) ON DELETE CASCADE
);

CREATE TABLE visit (
    id SERIAL PRIMARY KEY,
    citizen_id BIGINT UNSIGNED,
    centre_id BIGINT UNSIGNED,
    visit_date DATE NOT NULL,
    reason TEXT,
	FOREIGN KEY (citizen_id) REFERENCES citizen(citizen_id),
	FOREIGN KEY (centre_id) REFERENCES health_facility(id)
);

CREATE TABLE doctor_visit (
    visit_id BIGINT UNSIGNED,
    doctor_id BIGINT UNSIGNED,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (visit_id, doctor_id),
	FOREIGN KEY (visit_id) REFERENCES visit(id) ON DELETE CASCADE,
	FOREIGN KEY (doctor_id) REFERENCES healthcareworker(id)
);

CREATE TABLE diagnosis (
    id SERIAL PRIMARY KEY,
    visit_id INT REFERENCES visit(id),
    description TEXT
);


CREATE TABLE prescription (
    id SERIAL PRIMARY KEY,
    visit_id BIGINT UNSIGNED,
    item_id BIGINT UNSIGNED,
    item_type VARCHAR(10) CHECK (item_type IN ('medicine','vaccine')),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    start_date DATE,
    end_date DATE,
    instruction TEXT,
	FOREIGN KEY (visit_id) REFERENCES visit(id),
	FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE medical_procedure (
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
    visit_id BIGINT UNSIGNED,
    test_id BIGINT UNSIGNED,
    lab_id BIGINT UNSIGNED,
    order_date DATE NOT NULL,
	FOREIGN KEY (visit_id) REFERENCES visit(id),
	FOREIGN KEY (test_id) REFERENCES lab_test(id),
	FOREIGN KEY (lab_id) REFERENCES health_facility(id)
);

CREATE TABLE lab_result (
    id SERIAL PRIMARY KEY,
    order_id BIGINT UNSIGNED,
    result_date DATE,
    result VARCHAR(50),
	FOREIGN KEY (order_id) REFERENCES lab_order(id)
);

CREATE TABLE lab_test_provided (
	test_id BIGINT UNSIGNED,
	fac_id BIGINT UNSIGNED,
	PRIMARY KEY(test_id,fac_id),
	FOREIGN KEY (test_id) REFERENCES lab_test(id),
	FOREIGN KEY (fac_id) REFERENCES health_facility(id)
);

CREATE TABLE procedure_provided (
	procedure_id BIGINT UNSIGNED,
	fac_id BIGINT UNSIGNED,
	PRIMARY KEY(procedure_id,fac_id),
	FOREIGN KEY (fac_id) REFERENCES health_facility(id),
	FOREIGN KEY (procedure_id) REFERENCES medical_procedure(procedure_id)
);

CREATE TABLE vaccination (
    id SERIAL PRIMARY KEY,
    citizen_id BIGINT UNSIGNED,
    vaccine_id BIGINT UNSIGNED,
    vaccination_date DATE NOT NULL,
    dose_no INT NOT NULL,
    centre_id BIGINT UNSIGNED,
	FOREIGN KEY (citizen_id) REFERENCES citizen(citizen_id),
	FOREIGN KEY (vaccine_id) REFERENCES item(id),
	FOREIGN KEY (centre_id) REFERENCES health_facility(id)
);

CREATE TABLE wards (
    id SERIAL PRIMARY KEY,
    facility_id BIGINT UNSIGNED,
    type VARCHAR(30) NOT NULL DEFAULT 'Normal',
	FOREIGN KEY (facility_id) REFERENCES health_facility(id)
);

CREATE TABLE bed (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20),
    ward_id BIGINT UNSIGNED,
	FOREIGN KEY (ward_id) REFERENCES wards(id)
);

CREATE TABLE admission (
    id SERIAL PRIMARY KEY,
    citizen_id BIGINT UNSIGNED,
    visit_id BIGINT UNSIGNED,
    admission_date DATE NOT NULL,
    discharge_date DATE,
	FOREIGN KEY (citizen_id) REFERENCES citizen(citizen_id),
	FOREIGN KEY (visit_id) REFERENCES visit(id)
);

CREATE TABLE bed_allocs (
    id SERIAL PRIMARY KEY,
    bed_id BIGINT UNSIGNED,
    adm_id BIGINT UNSIGNED,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
	FOREIGN KEY (bed_id) REFERENCES bed(id),
	FOREIGN KEY (adm_id) REFERENCES admission(id)
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
    warehouse_id BIGINT UNSIGNED,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    expiry DATE NOT NULL,
    threshold INT NOT NULL DEFAULT 0,
	FOREIGN KEY (warehouse_id) REFERENCES warehouse(id)
);

CREATE TABLE facility_inventory (
    id SERIAL PRIMARY KEY,
    facility_id BIGINT UNSIGNED,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    expiry DATE NOT NULL,
    threshold INT NOT NULL DEFAULT 0,
	FOREIGN KEY (facility_id) REFERENCES health_facility(id)
);

CREATE TABLE supply_order (
    id SERIAL PRIMARY KEY,
    supplier_id BIGINT UNSIGNED,
    destination_id BIGINT UNSIGNED NOT NULL,
    destination_type VARCHAR(10) CHECK (destination_type IN ('warehouse','facility')),
    item_id BIGINT UNSIGNED NOT NULL,
    quantity BIGINT UNSIGNED NOT NULL,
    order_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Order Placed',
	CHECK (status IN ('Order Placed','Received','Cancelled')),
	FOREIGN KEY (supplier_id) REFERENCES supplier(id),
	FOREIGN KEY (item_id) REFERENCES item(id)
);

CREATE TABLE disease_case (
    id SERIAL PRIMARY KEY,
    disease VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL,
    worker_id BIGINT UNSIGNED,
    patient_id BIGINT UNSIGNED,
	FOREIGN KEY (worker_id) REFERENCES healthcareworker(id),
	FOREIGN KEY (patient_id) REFERENCES citizen(citizen_id)
);














