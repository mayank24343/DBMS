import random
from datetime import datetime, timedelta

f = open("seed.sql","w")

def rand_date(start, end):
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))

#diseases

diseases = [
("Common Cold",
"Viral upper respiratory infection causing runny nose, sore throat, and cough.",
["Paracetamol"],
[],
[]),

("Influenza",
"Respiratory viral infection with fever, body aches, cough, and fatigue.",
["Oseltamivir","Paracetamol"],
["Rapid influenza diagnostic test","RT-PCR"],
[]),

("Asthma",
"Chronic airway inflammation causing wheezing, breathlessness, and coughing.",
["Salbutamol inhaler","Budesonide inhaler","Montelukast"],
["Spirometry","Peak flow measurement"],
[]),

("Hypertension",
"Persistently elevated blood pressure increasing cardiovascular risk.",
["Amlodipine","Losartan","Hydrochlorothiazide"],
["Blood pressure monitoring","Kidney function test","ECG"],
[]),

("Type 2 Diabetes",
"Metabolic disorder causing high blood glucose due to insulin resistance.",
["Metformin","Insulin","Glimepiride"],
["Fasting blood glucose","HbA1c","Oral glucose tolerance test"],
[]),

("Tuberculosis",
"Bacterial infection primarily affecting lungs causing cough, fever, weight loss.",
["Isoniazid","Rifampicin","Pyrazinamide","Ethambutol"],
["Sputum smear microscopy","GeneXpert test","Chest X-ray"],
[]),

("Malaria",
"Parasitic disease transmitted by mosquitoes causing fever and chills.",
["Artemisinin combination therapy","Chloroquine"],
["Blood smear microscopy","Rapid malaria antigen test"],
[]),

("Pneumonia",
"Lung infection causing fever, cough, chest pain, and breathing difficulty.",
["Amoxicillin","Azithromycin","Ceftriaxone"],
["Chest X-ray","Blood culture","Complete blood count"],
["Oxygen therapy"]),

("Appendicitis",
"Inflammation of the appendix causing abdominal pain and fever.",
["Antibiotics","Pain relievers"],
["Abdominal ultrasound","CT scan","Blood tests"],
["Appendectomy"]),

("Migraine",
"Recurrent severe headaches often with nausea and light sensitivity.",
["Sumatriptan","Ibuprofen","Propranolol"],
["Clinical evaluation"],
[]),

("Anemia",
"Condition with reduced red blood cells causing fatigue and weakness.",
["Iron supplements","Vitamin B12","Folic acid"],
["Complete blood count","Iron studies"],
[]),

("COVID-19",
"Respiratory viral infection caused by SARS-CoV-2.",
["Paracetamol","Remdesivir","Dexamethasone"],
["RT-PCR","Rapid antigen test","Chest CT"],
["Oxygen therapy"]),

("Chronic Kidney Disease",
"Progressive loss of kidney function over time.",
["ACE inhibitors","Diuretics","Erythropoietin"],
["Serum creatinine","Urine analysis","Kidney ultrasound"],
["Dialysis","Kidney transplant"]),

("Coronary Artery Disease",
"Narrowing of coronary arteries leading to reduced blood supply to heart.",
["Aspirin","Atorvastatin","Nitroglycerin"],
["ECG","Stress test","Coronary angiography"],
["Angioplasty","Coronary artery bypass surgery"]),

("Gastroenteritis",
"Infection causing diarrhea, vomiting, and abdominal cramps.",
["Oral rehydration salts","Ondansetron"],
["Stool examination"],
[]),

("Dengue Fever",
"Viral infection transmitted by mosquitoes causing high fever and joint pain.",
["Paracetamol","IV fluids"],
["Dengue NS1 antigen test","Complete blood count"],
["Fluid management"]),

("Meningitis",
"Inflammation of membranes around brain and spinal cord.",
["Ceftriaxone","Vancomycin","Dexamethasone"],
["Lumbar puncture","CSF analysis","Blood culture"],
["ICU care"]),

("Osteoarthritis",
"Degenerative joint disease causing pain and stiffness.",
["Ibuprofen","Acetaminophen","Topical NSAIDs"],
["X-ray","Physical examination"],
["Joint replacement surgery"]),

("Peptic Ulcer Disease",
"Sores in stomach lining often due to H. pylori infection.",
["Omeprazole","Clarithromycin","Amoxicillin"],
["Endoscopy","H. pylori test"],
[]),

("Cancer",
"Malignant tumor in lung tissue affecting breathing and health.",
["Chemotherapy drugs","Immunotherapy"],
["Biopsy","CT scan","PET scan"],
["Surgery","Radiotherapy","Chemotherapy"])
]

for i,d in enumerate(diseases,1):
    f.write(f"INSERT INTO disease VALUES ({i},'{d[0]}','{d[1]}');\n")

#medical procedures
medical_procedures = [
("Appendectomy", "Surgery", "Surgical removal of the appendix"),
("Coronary Angioplasty", "Cardiology Procedure", "Procedure to open blocked coronary arteries using a balloon or stent"),
("Caesarean Section", "Surgery", "Surgical delivery of a baby through the abdomen and uterus"),
("Coronary Artery Bypass Grafting", "Cardiac Surgery", "Surgery to improve blood flow to the heart by bypassing blocked arteries"),
("Gallbladder Removal (Cholecystectomy)", "Surgery", "Surgical removal of the gallbladder"),
("Knee Replacement", "Orthopedic Surgery", "Replacement of a damaged knee joint with an artificial joint"),
("Hip Replacement", "Orthopedic Surgery", "Surgical replacement of a damaged hip joint"),
("Bronchoscopy", "Diagnostic Procedure", "Procedure to examine the airways using a bronchoscope"),
("Endoscopy", "Diagnostic Procedure", "Procedure to examine the digestive tract using an endoscope"),
("Dialysis", "Therapeutic Procedure", "Process that removes waste and excess fluid from the blood when kidneys fail")
]

for i,(t,d,x) in enumerate(medical_procedures,1):
    f.write(f"INSERT INTO medical_procedure VALUES ({i},'{t}','{d}','{x}', TRUE);\n")

#lab tests 
lab_tests = [
("Complete Blood Count (CBC)",
"Measures red blood cells, white blood cells, hemoglobin, and platelets to detect infections, anemia, and inflammation.",
["Anemia","Dengue Fever","Pneumonia","Malaria","Tuberculosis"]),

("Blood Glucose Test",
"Measures glucose levels in blood for diagnosing and monitoring diabetes.",
["Type 2 Diabetes"]),

("HbA1c Test",
"Measures average blood sugar levels over the past 2–3 months.",
["Type 2 Diabetes"]),

("Lipid Profile",
"Measures cholesterol and triglyceride levels to assess cardiovascular risk.",
["Coronary Artery Disease","Hypertension"]),

("Liver Function Test (LFT)",
"Evaluates enzymes and proteins to assess liver damage or dysfunction.",
["Dengue Fever","Malaria"]),

("Kidney Function Test (KFT)",
"Measures creatinine, urea, and other markers to assess kidney health.",
["Chronic Kidney Disease","Hypertension","Type 2 Diabetes"]),

("Urinalysis",
"Examines urine to detect kidney disease, infection, and metabolic disorders.",
["Chronic Kidney Disease","Diabetes"]),

("Thyroid Function Test (TFT)",
"Measures thyroid hormones (TSH, T3, T4) to diagnose thyroid disorders.",
[]),

("C-Reactive Protein (CRP)",
"Measures inflammation levels in the body.",
["Pneumonia","Meningitis","Tuberculosis"]),

("Erythrocyte Sedimentation Rate (ESR)",
"Measures inflammation by determining the rate at which red blood cells settle.",
["Tuberculosis","Meningitis"]),

("Blood Culture",
"Detects bacteria or fungi in blood to diagnose severe infections.",
["Pneumonia","Meningitis"]),

("Sputum Smear Microscopy",
"Examines sputum samples for bacteria such as Mycobacterium tuberculosis.",
["Tuberculosis"]),

("GeneXpert Test",
"Molecular test detecting tuberculosis bacteria and drug resistance.",
["Tuberculosis"]),

("Chest X-ray",
"Imaging test used to detect lung infections or abnormalities.",
["Tuberculosis","Pneumonia","Lung Cancer"]),

("Rapid Influenza Diagnostic Test",
"Detects influenza virus antigens from respiratory samples.",
["Influenza"]),

("COVID-19 RT-PCR Test",
"Detects SARS-CoV-2 genetic material to confirm infection.",
["COVID-19"]),

("Rapid Antigen Test",
"Detects viral proteins for rapid diagnosis of respiratory infections.",
["COVID-19"]),

("Dengue NS1 Antigen Test",
"Detects dengue virus protein early in infection.",
["Dengue Fever"]),

("Malaria Blood Smear",
"Microscopic examination of blood to detect malaria parasites.",
["Malaria"]),

("Rapid Malaria Antigen Test",
"Detects malaria parasite antigens in blood.",
["Malaria"]),

("Troponin Test",
"Measures cardiac troponin proteins released during heart muscle damage.",
["Coronary Artery Disease"]),

("Electrocardiogram (ECG)",
"Measures electrical activity of the heart to detect heart abnormalities.",
["Coronary Artery Disease","Hypertension"]),

("Stress Test",
"Evaluates heart performance under physical stress.",
["Coronary Artery Disease"]),

("Endoscopy",
"Visual examination of the stomach lining using a flexible camera.",
["Peptic Ulcer Disease"]),

("H. pylori Test",
"Detects Helicobacter pylori bacteria responsible for stomach ulcers.",
["Peptic Ulcer Disease"]),

("Lumbar Puncture with CSF Analysis",
"Examines cerebrospinal fluid to diagnose infections of the brain and spinal cord.",
["Meningitis"]),

("CT Scan",
"Detailed imaging technique used to detect internal abnormalities.",
["Appendicitis","Lung Cancer"]),

("Abdominal Ultrasound",
"Uses sound waves to visualize organs such as the appendix or kidneys.",
["Appendicitis","Chronic Kidney Disease"]),

("Biopsy",
"Removal of tissue sample to diagnose cancer or abnormal growths.",
["Lung Cancer"]),

("PET Scan",
"Advanced imaging used to detect cancer activity and spread.",
["Lung Cancer"])
]

for i,(t,d,x) in enumerate(lab_tests,1):
    f.write(f"INSERT INTO lab_test VALUES ({i},'{t}','{d}');\n")

# ---------------- ITEMS ----------------
medicines = [
("Paracetamol", "Analgesic/Antipyretic", "Used to reduce fever and relieve mild to moderate pain"),
("Ibuprofen", "NSAID", "Used to reduce inflammation, pain, and fever"),
("Amoxicillin", "Antibiotic", "Used to treat bacterial infections"),
("Azithromycin", "Antibiotic", "Used for respiratory and skin infections"),
("Metformin", "Antidiabetic", "Used to control blood sugar in type 2 diabetes"),
("Atorvastatin", "Statin", "Used to lower cholesterol levels"),
("Omeprazole", "Proton Pump Inhibitor", "Used to treat acid reflux and stomach ulcers"),
("Cetirizine", "Antihistamine", "Used to treat allergies"),
("Salbutamol", "Bronchodilator", "Used to relieve asthma and breathing difficulties"),
("Insulin", "Hormone therapy", "Used to regulate blood sugar in diabetes"),
("Aspirin", "Antiplatelet", "Used for pain relief and prevention of heart attacks"),
("Losartan", "Antihypertensive", "Used to treat high blood pressure"),
("Hydroxychloroquine", "Antimalarial", "Used for malaria and autoimmune diseases"),
("Doxycycline", "Antibiotic", "Used to treat bacterial infections"),
("Prednisone", "Corticosteroid", "Used to reduce inflammation"),
("Warfarin", "Anticoagulant", "Used to prevent blood clots"),
("Clopidogrel", "Antiplatelet", "Used to prevent strokes and heart attacks"),
("Fluconazole", "Antifungal", "Used to treat fungal infections"),
("Loperamide", "Antidiarrheal", "Used to treat diarrhea"),
("Ondansetron", "Antiemetic", "Used to prevent nausea and vomiting")
]

vaccines = [
("BCG", "Tuberculosis"),
("OPV", "Polio"),
("MMR", "Measles, Mumps, Rubella"),
("Hepatitis B Vaccine", "Hepatitis B"),
("DPT Vaccine", "Diphtheria, Pertussis, Tetanus"),
("Varicella Vaccine", "Chickenpox"),
("HPV Vaccine", "Human Papillomavirus"),
("Influenza Vaccine", "Seasonal Flu"),
("COVID-19 Vaccine", "Coronavirus disease"),
("Typhoid Vaccine", "Typhoid fever")
]

hospital_equipment = [
("Adhesive Bandage", "Used to cover small cuts and wounds"),
("Sterile Gauze Pad", "Used for wound dressing and absorbing blood"),
("Alcohol Swab", "Used to disinfect skin before injections"),
("Disposable Syringe", "Used to inject medications or withdraw fluids"),
("Face Mask", "Used to prevent spread of infectious droplets"),
("Cotton Balls", "Used for cleaning wounds or applying antiseptic"),
("Tongue Depressor", "Disposable wooden stick used to examine the throat"),
("Surgical Gloves", "Disposable gloves used to maintain hygiene and prevent contamination"),
("IV Cannula", "Disposable tube inserted into veins for intravenous therapy"),
("Surgical Cap", "Disposable cap used to maintain sterile conditions in operating rooms")
]

for i,(t,x,d) in enumerate(medicines,1):
    f.write(f"INSERT INTO item VALUES (default,'medicine','{t}','{d}');\n")
for i,(t,d) in enumerate(vaccines,1):
    f.write(f"INSERT INTO item VALUES (default,'vaccine','{t}','{d} vaccine');\n")
    f.write(f"INSERT INTO vacc_prereq_age VALUES (default,{20+i},{random.randint(0,10)});\n")
for i,(t,d) in enumerate(hospital_equipment,1):
    f.write(f"INSERT INTO item VALUES (default,'equipment','{t}','{d}');\n")

    
#places
cities = [
("New Delhi","Delhi"),("Noida","Uttar Pradesh"),("Gurgaon","Haryana"),
("Mumbai","Maharashtra"),("Bangalore","Karnataka"),("Hyderabad","Telangana"),
("Chennai","Tamil Nadu"),("Jaipur","Rajasthan"),("Kolkata","West Bengal"),("Pune","Maharashtra")
]

#40 suppliers 
for i in range(1,41):
    index = i 
    f.write(f"INSERT INTO users(id,password,role) VALUES ({index},'password','supplier');\n")

    city,state=random.choice(cities)
    lat=round(random.uniform(12,29),6)
    lon=round(random.uniform(72,88),6)

    f.write(f"""INSERT INTO supplier VALUES ({index},'Supplier{i}',
'Building {i}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n
""")
    f.write(f"""INSERT INTO supplier_contact VALUES (default,{index},'sup{i}@gmail.com',NULL,TRUE);\n
""")
    f.write(f"""INSERT INTO supplier_contact VALUES (default,{index},NULL,'{random.randint(10**9,10**10-1)}',FALSE);\n
""")
    f.write(f"""INSERT INTO listing VALUES (default, {index}, {index}, {random.randint(5,30)*100}, {random.randint(200,5000)});\n""")
    for k in range(1,index):
        if (random.randint(1,10) > 7):
            f.write(f"""INSERT INTO listing VALUES (default, {index}, {k}, {random.randint(5,30)*100}, {random.randint(200,5000)});\n""")
    for k in range(index+1,40):
        if (random.randint(1,10) > 7):
            f.write(f"""INSERT INTO listing VALUES (default, {index}, {k}, {random.randint(5,30)*100}, {random.randint(200,5000)});\n""")

wards = ['General', 'ICU', 'Surgical', 'Emergency', 'Maternity', 'Pediatric', 'CCU', 'Burn', 'Psychiatric']
vacc_places = []
docs = {}
nur = {}
mw = {}
gen = {}
em = {}
labs = []

wid = 40
cnt = 1
#healthfacs
for i in range(10):
    city,state=cities[i]
    for j in range(1,6):
        lat=round(random.uniform(12,29),6)
        lon=round(random.uniform(72,88),6)
        f.write(f"""INSERT INTO place VALUES ({i*10+j},'Street {i*10+j}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n""")
        f.write(f"""INSERT INTO health_facility VALUES({i*10+j},'Facility{i*10+j}','Hospital');\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},'health{i*10+j}@gmail.com',NULL,FALSE);\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},NULL,'{random.randint(10**6,10**7-1)*1000+i*10+j}',TRUE);\n""") 

        vacc_places.append(i*10+j)
        docs[i*10+j] = []
        nur[i*10+j] = []
        #give all procedures
        for k,(t,d,x) in enumerate(medical_procedures,1):
            f.write(f"INSERT INTO procedure_provided VALUES (default, {k},{i*10+j});\n")
        for p,(t,d,x) in enumerate(lab_tests,1):
            f.write(f"INSERT INTO lab_test_provided VALUES (default, {p},{i*10+j});\n")
        for k,(t,x,d) in enumerate(medicines,1):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{k},{random.randint(1,20)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        for k,(t,d) in enumerate(vaccines,1):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{20+k},{random.randint(1,20)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        for k in range(1,11):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{30+k},{random.randint(1,20)*100},'9999-12-31',default);\n")

        if j%6 == 1:
            for k in range(9):
                
                f.write(f"INSERT INTO wards VALUES(default,{i*10+j},'{wards[k]}',{0}, {random.randint(1,3)*10});\n")
                if (k == 0):
                    gen[i*10+j] = cnt
                if (k == 3):
                    em[i*10+j] = cnt
                if (k == 4):
                    mw[i*10+j]  = cnt
                cnt+=1
        else:
            for k in range(5):
                f.write(f"INSERT INTO wards VALUES(default,{i*10+j},'{wards[k]}',{0}, {random.randint(1,3)*10});\n")
                if (k == 0):
                    gen[i*10+j] = cnt
                if (k == 3):
                    em[i*10+j] = cnt

                if (k == 4):
                    mw[i*10+j]  = cnt
                cnt+=1
            for k in range(5,9):
                if random.randint(1,10) >= 7:
                    f.write(f"INSERT INTO wards VALUES(default,{i*10+j},'{wards[k]}',{0}, {random.randint(1,3)*10});\n")
                    cnt+=1

        for k in range(6):
            wid += 1
            f.write(f"INSERT INTO users(id,password,role) VALUES ({wid},'password','worker');\n")
            f.write(f"""INSERT INTO healthcareworker VALUES({wid},'Worker{wid}','Doctor');\n""")
            f.write(f"""INSERT INTO works VALUES(default, {wid},{i*10+j},'2020-01-01',NULL);\n""")
            f.write(f"""INSERT INTO skills VALUES(default,{wid},'MBBS','qualification');\n""")
            if random.randint(1,10) >= 4:
                f.write(f"""INSERT INTO skills VALUES(default,{wid},'MD','qualification');\n""")
            docs[i*10+j].append(wid)
                
        for k in range(10):
            wid += 1
            f.write(f"INSERT INTO users(id,password,role) VALUES ({wid},'password','worker');\n")
            f.write(f"""INSERT INTO healthcareworker VALUES({wid},'Worker{wid}','Nurse');\n""")
            f.write(f"""INSERT INTO works VALUES(default,{wid},{i*10+j},'2020-01-01',NULL);\n""")
            f.write(f"""INSERT INTO skills VALUES(default,{wid},'B.Sc. Nursing','qualification');\n""")
            if random.randint(1,10) >= 6:
                f.write(f"""INSERT INTO skills VALUES(default,{wid},'M.Sc. Nursing','qualification');\n""")
            nur[i*10+j].append(wid)

    for j in range(6,8):
        docs[i*10+j] = []
        nur[i*10+j] = []
        lat=round(random.uniform(12,29),6)
        lon=round(random.uniform(72,88),6)
        f.write(f"""INSERT INTO place VALUES ({i*10+j},'Street {i*10+j}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n""")
        f.write(f"""INSERT INTO health_facility VALUES({i*10+j},'Facility{i*10+j}','Clinic');\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},'health{i*10+j}@gmail.com',NULL,FALSE);\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},NULL,'{random.randint(10**6,10**7-1)*1000+i*10+j}',TRUE);\n""") 

        for k in [1,2,14,15,16,17,18,19,20,22,23]:
            f.write(f"INSERT INTO lab_test_provided VALUES (default,{k},{i*10+j});\n")
        for k in range(1,6):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{k},{random.randint(1,20)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{random.randint(6,20)},{random.randint(1,20)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")

        for k in range(1,7):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{30+k},{random.randint(1,20)*100},'9999-12-31',default);\n")
        for k in range(1):
            wid += 1
            f.write(f"INSERT INTO users(id,password,role) VALUES ({wid},'password','worker');\n")
            f.write(f"""INSERT INTO healthcareworker VALUES({wid},'Worker{wid}','Doctor');\n""")
            f.write(f"""INSERT INTO works VALUES(default,{wid},{i*10+j},'2020-01-01',NULL);\n""")
            f.write(f"""INSERT INTO skills VALUES(default,{wid},'MBBS','qualification');\n""")
            if random.randint(1,10) >= 7:
                f.write(f"""INSERT INTO skills VALUES(default,{wid},'MD','qualification');\n""")
            docs[i*10+j].append(wid)
        for k in range(2):
            wid += 1
            f.write(f"INSERT INTO users(id,password,role) VALUES ({wid},'password','worker');\n")
            f.write(f"""INSERT INTO healthcareworker VALUES({wid},'Worker{wid}','Doctor');\n""")
            f.write(f"""INSERT INTO works VALUES(default,{wid},{i*10+j},'2020-01-01',NULL);\n""")
            f.write(f"""INSERT INTO skills VALUES(default,{wid},'MBBS','qualification');\n""")
            if random.randint(1,10) >= 6:
                f.write(f"""INSERT INTO skills VALUES(default,{wid},'MD','qualification');\n""")
            nur[i*10+j].append(wid)
       
    for j in range(8,10):
        lat=round(random.uniform(12,29),6)
        lon=round(random.uniform(72,88),6)
        f.write(f"""INSERT INTO place VALUES ({i*10+j},'Street {i*10+j}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n""")
        f.write(f"""INSERT INTO health_facility VALUES({i*10+j},'Facility{i*10+j}','Pharmacy');\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},'health{i*10+j}@gmail.com',NULL,FALSE);\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},NULL,'{random.randint(10**6,10**7-1)*1000+i*10+j}',TRUE);\n""") 

        #give full inventory
        for k,(t,x,d) in enumerate(medicines,1):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{k},{random.randint(1,20)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        for k,(t,d) in enumerate(vaccines,1):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{20+k},{random.randint(1,20)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        for k in range(1,7):
            f.write(f"INSERT INTO inventory VALUES (default,{i*10+j},{30+k},{random.randint(1,20)*100},'9999-12-31',default);\n")

        for k in range(2):
            wid += 1
            f.write(f"INSERT INTO users(id,password,role) VALUES ({wid},'password','worker');\n")
            f.write(f"""INSERT INTO healthcareworker VALUES({wid},'Worker{wid}','Pharmacist');\n""")
            f.write(f"""INSERT INTO works VALUES(default,{wid},{i*10+j},'2020-01-01',NULL);\n""")
            f.write(f"""INSERT INTO skills VALUES(default,{wid},'B.Pharm','qualification');\n""")
    
    for j in range(10,11):
        lat=round(random.uniform(12,29),6)
        lon=round(random.uniform(72,88),6)
        f.write(f"""INSERT INTO place VALUES ({i*10+j},'Street {i*10+j}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n""")
        f.write(f"""INSERT INTO health_facility VALUES({i*10+j},'Facility{i*10+j}','Laboratory');\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},'health{i*10+j}@gmail.com',NULL,FALSE);\n""")
        f.write(f"""INSERT INTO healthfac_contact VALUES (default,{i*10+j},NULL,'{random.randint(10**6,10**7-1)*1000+i*10+j}',TRUE);\n""") 
        for p,(t,d,x) in enumerate(lab_tests,1):
            f.write(f"INSERT INTO lab_test_provided VALUES (default,{p},{i*10+j});\n")
        for k in range(2):
            wid += 1
            f.write(f"INSERT INTO users(id,password,role) VALUES ({wid},'password','worker');\n")
            f.write(f"""INSERT INTO healthcareworker VALUES({wid},'Worker{wid}','Lab Tech');\n""")
            f.write(f"""INSERT INTO works VALUES(default,{wid},{i*10+j},'2020-01-01',NULL);\n""")
            f.write(f"""INSERT INTO skills VALUES(default,{wid},'B.Sc. Microbiology','qualification');\n""")
        labs.append(i*10+j)

#warehouses
for i in range(10,20):
    city,state=cities[i-10]
    for j in range(1,6):
        lat=round(random.uniform(12,29),6)
        lon=round(random.uniform(72,88),6)
        f.write(f"""INSERT INTO place VALUES ({100+(i-10)*5+j},'Street {i*10+j}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n""")
        f.write(f"""INSERT INTO warehouse VALUES ({100+(i-10)*5+j});\n""")
        f.write(f"""INSERT INTO warehouse_contact VALUES (default,{100+(i-10)*5+j},'ware{100+(i-10)*5+j}@gmail.com',NULL,FALSE);\n""")
        f.write(f"""INSERT INTO warehouse_contact VALUES (default,{100+(i-10)*5+j},NULL,'{random.randint(10**6,10**7-1)*1000+100+(i-10)*5+j}',TRUE);\n""") 

        for k,(t,x,d) in enumerate(medicines,1):
            f.write(f"INSERT INTO inventory VALUES (default,{100+(i-10)*5+j},{k},{random.randint(20,50)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        for k,(t,d) in enumerate(vaccines,1):
            f.write(f"INSERT INTO inventory VALUES (default,{100+(i-10)*5+j},{20+k},{random.randint(20,50)*100},'{rand_date(datetime(2026,1,1),datetime(2028,1,1)).date()}',default);\n")
        for k in range(1,11):
            f.write(f"INSERT INTO inventory VALUES (default,{100+(i-10)*5+j},{30+k},{random.randint(20,50)*100},'9999-12-31',default);\n")        


vid = 0
oid = 0
#1000 citizens
for i in range(1,1001):
    index = wid+i
    f.write(f"INSERT INTO users(id,password,role) VALUES ({index},'password','citizen');\n")

    city,state=random.choice(cities)
    dob = rand_date(datetime(1970,1,1),datetime(2024,1,1)).date()
    sex=random.choice(['M','F'])
    lat=round(random.uniform(12,29),6)
    lon=round(random.uniform(72,88),6)

    f.write(f"""INSERT INTO citizen VALUES ({index},'{random.randint(10**11,10**12-1)}','Citizen{i}','{dob}','{sex}',
'House {i}',NULL,'{city}','{state}','{random.randint(100000,999999)}',{lat},{lon});\n
""")
    f.write(f"""INSERT INTO citizen_contact VALUES (default,{index},'cit{i}@gmail.com',NULL,FALSE);\n
""")
    f.write(f"""INSERT INTO citizen_contact VALUES (default,{index},NULL,'{random.randint(10**9,10**10-1)}',TRUE);\n
""")

    #vaccinations 
    if dob.year <= 2010:
        for k in range(21,31):
            if random.randint(1,10) >= 5:
                date = rand_date(datetime(2011,1,1),datetime(2025,1,1)).date()
                f.write(f"""INSERT INTO vaccination VALUES (default,{index},{k},'{date}',{1},{random.choice(vacc_places)});\n""")

    #hospital visits 
    flag1 = True
    flag2 = True
    flag3 = True

    #maternity
    if sex == 'F' and dob.year <= 2000 and random.randint(1,10) < 4:
        
        centre = random.choice(vacc_places)
        for k in range(random.randint(0,2)):
            vid += 1
            date = rand_date(datetime(2011,1,1),datetime(2025,1,1))
            f.write(f"""INSERT INTO visit VALUES(default,{index},{centre},'{date.date()}','Delivery');\n""")
            for p in range(random.randint(1,2)):
                f.write(f"INSERT INTO doctor_visit VALUES(default, {vid}, {random.choice(docs[centre])},'Attending');\n")
            #for p in range(random.randint(2,3)):
                #f.write(f"INSERT INTO doctor_visit VALUES({vid}, {index}, {random.choice(nur[centre])})")
            f.write(f"INSERT INTO admission VALUES(default, {index}, {vid}, {mw[centre]}, '{date.date()}', '{(date + timedelta(days=random.randint(2,4))).date()}');\n")
            f.write(f"INSERT INTO procedure_taken VALUES(default, {vid}, 3);\n")
        if random.randint(1,10) >= 5:
            vid += 1
            date = '2026-3-18'
            f.write(f"""INSERT INTO visit VALUES(default,{index},{centre},'{date}','Delivery');\n""")
            for p in range(random.randint(1,2)):
                f.write(f"INSERT INTO doctor_visit VALUES(default, {vid}, {random.choice(docs[centre])},'Attending');\n")
            f.write(f"INSERT INTO admission VALUES(default, {index}, {vid}, {mw[centre]}, '{date}', NULL);\n")
            f.write(f"INSERT INTO procedure_taken VALUES(default, {vid}, 3);\n")
            f.write(f"UPDATE wards SET occupied = occupied+1 where facility_id={centre} AND type='Maternity';\n")
            flag1 = not flag1

    #tuberculosis
    if random.randint(1,100) <= 5:
        centre = random.choice(vacc_places)
    
        if random.randint(1,10) >= 5 and flag1:
            vid += 1
            date = '2026-3-18'
            f.write(f"""INSERT INTO visit VALUES(default,{index},{centre},'{date}','Health Checkup');\n""")
            for p in range(random.randint(1,2)):
                f.write(f"INSERT INTO doctor_visit VALUES(default, {vid}, {random.choice(docs[centre])},'Attending');\n")
            lab = random.choice(labs+vacc_places)
            for p in [10,12,14]:
                oid+=1
                f.write(f"INSERT INTO lab_order VALUES({oid}, {vid}, {p}, {lab}, '{date}');\n")
                f.write(f"INSERT INTO lab_result VALUES(default, {oid}, '{date}', 'TB Positive');\n")
            f.write(f"INSERT INTO diagnosis VALUES(default, {vid}, {6}, '{diseases[5][0]}');\n")
            for p in [1,3,4]:
                f.write(f"INSERT INTO prescription VALUES(default, {vid}, {p},'medicine','1 tablet','2/day','{date}','{(datetime(2026,3,18) + timedelta(days=random.randint(10,12))).date()}','After food');\n")
            f.write(f"INSERT INTO admission VALUES(default, {index}, {vid}, {gen[centre]}, '{date}', NULL);\n")
            f.write(f"INSERT INTO procedure_taken VALUES(default, {vid}, 9);\n")
            f.write(f"UPDATE wards SET occupied = occupied+1 where facility_id={centre} AND type='General';\n")
            flag2 = not flag2
        else:
            vid += 1
            date = rand_date(datetime(2011,1,1),datetime(2025,1,1))
            f.write(f"""INSERT INTO visit VALUES(default,{index},{centre},'{date.date()}','Health Checkup');\n""")
            for p in range(random.randint(1,2)):
                f.write(f"INSERT INTO doctor_visit VALUES(default, {vid}, {random.choice(docs[centre])},'Attending');\n")
            lab = random.choice(labs+vacc_places)
            for p in [10,12,14]:
                oid+=1
                f.write(f"INSERT INTO lab_order VALUES({oid}, {vid}, {p}, {lab}, '{date.date()}');\n")
                f.write(f"INSERT INTO lab_result VALUES(default, {oid}, '{date.date()}', 'TB Positive');\n")
            
            f.write(f"INSERT INTO diagnosis VALUES(default, {vid}, {6}, '{diseases[5][0]}');\n")
            for p in [1,3,4]:
                f.write(f"INSERT INTO prescription VALUES(default, {vid}, {p},'medicine','1 tablet','2/day','{date.date()}','{(date + timedelta(days=random.randint(10,12))).date()}','After food');\n")
            
            mid = date + timedelta(days = 5)
            f.write(f"INSERT INTO admission VALUES(default, {index}, {vid}, {gen[centre]}, '{date.date()}', '{mid.date()}');\n")
            new = 0
            while True:
                new = random.choice(vacc_places)
                if new != centre:
                    break

            
            f.write(f"INSERT INTO admission VALUES(default, {index}, {vid}, {gen[new]}, '{mid.date()}', '{(mid +  timedelta(days=random.randint(5,6))).date()}');\n")
            print("yass")
            f.write(f"INSERT INTO transfers VALUES(default, {vid}, {centre},{new},{index},'{mid.date()}','Personal reasons');\n")
            print("added")
            f.write(f"INSERT INTO procedure_taken VALUES(default, {vid}, 9);\n")

        # covid, dengue, malaria
    for disease_id, name, meds, labss in [ (12, "COVID", [1,20], [16,17]),(16, "Dengue", [1], [18]),(7, "Malaria", [14], [19,20])]:
        if random.random() < 0.5:
    
            centre = random.choice(vacc_places)
            vid += 1
    
            date = rand_date(datetime(2020,1,1), datetime(2025,1,1))
    
            f.write(f"""INSERT INTO visit VALUES(default,{index},{centre},'{date.date()}','Illness');\n""")
    
            for p in range(random.randint(1,2)):
                f.write(f"INSERT INTO doctor_visit VALUES(default,{vid},{random.choice(docs[centre])},'Attending');\n")
    
            lab = random.choice(labs+vacc_places)
    
            for l in labss:
                oid += 1
                f.write(f"INSERT INTO lab_order VALUES({oid},{vid},{l},{lab},'{date.date()}');\n")
                f.write(f"INSERT INTO lab_result VALUES(default,{oid},'{date.date()}','{name} Positive');\n")
    
            f.write(f"INSERT INTO diagnosis VALUES(default,{vid},{disease_id},'{name} infection');\n")
    
            for m in meds:
                f.write(
                f"INSERT INTO prescription VALUES(default,{vid},{m},'medicine','1 tablet','2/day','{date.date()}','{(date + timedelta(days=5)).date()}','After food');\n"
                )

            if random.randint(1,10) > 6 and flag1 and flag2 and flag3:
                f.write(
                    f"INSERT INTO admission VALUES(default,{index},{vid},{gen[centre]},'{date.date()}',NULL);\n"
                )
                f.write(
                    f"UPDATE wards SET occupied = occupied+1 WHERE facility_id={centre} AND type='General';\n"
                )
                flag3 = not flag3

    if random.randint(1,50) == 1 and flag1 and flag2 and flag3:
        centre = random.choice(vacc_places)
        vid += 1
        date = rand_date(datetime(2026,3,10), datetime(2026,3,18))
    
        f.write(f"INSERT INTO visit VALUES(default,{index},{centre},'{date.date()}','Emergency');\n")
        f.write(f"INSERT INTO diagnosis VALUES(default,{vid},NULL,'Accident Injury');\n")
    
        f.write(f"INSERT INTO admission VALUES(default,{index},{vid},{em[centre]},'{date.date()}',NULL);\n")
        for p in range(random.randint(1,2)):
                f.write(f"INSERT INTO doctor_visit VALUES(default,{vid},{random.choice(docs[centre])},'Attending');\n")
    
        f.write(f"UPDATE wards SET occupied = occupied+1 WHERE facility_id={centre} AND type='Emergency';\n")

   


#increase curr ward counts
