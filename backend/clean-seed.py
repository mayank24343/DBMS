import re

input_file = "seed.sql"
output_file = "mysql_seed_ready.sql"

print(f"Prepping {input_file} for MySQL integration...")

with open(input_file, 'r', encoding='latin-1') as f:
    lines = f.readlines()

fixed_lines = [
    # This is the magic MySQL command that prevents dependency crashes
    "SET FOREIGN_KEY_CHECKS=0;\n" 
]

for line in lines:
    # 1. Skip users - Django manages this with its own required columns
    if "INSERT INTO users" in line:
        continue
    
    # 2. Fix doctor_visit (Django adds an auto-ID column to Many-to-Many tables)
    if "doctor_visit" in line and "VALUES(" in line:
        line = line.replace("VALUES(", "VALUES(DEFAULT,")

    # 3. Fix citizen (Strips the redundant ID to match Django's exact column count)
    if "citizen" in line and "VALUES" in line:
        line = re.sub(r"VALUES\s*\(\s*[^,]+,", "VALUES(", line)

    fixed_lines.append(line)

# Turn constraints back on securely
fixed_lines.append("SET FOREIGN_KEY_CHECKS=1;\n")

with open(output_file, 'w', encoding='utf-8') as f:
    f.writelines(fixed_lines)

print(f"Success! File saved as {output_file}.")
print(f"To seed the database, run: python manage.py dbshell < {output_file}")