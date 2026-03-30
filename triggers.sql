DELIMITER //
CREATE TRIGGER after_admission_insert
AFTER INSERT ON admission
FOR EACH ROW
BEGIN
UPDATE wards
SET occupied = occupied + 1
WHERE id = NEW.ward_id;
END; //
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_admission_update
AFTER UPDATE ON admission
FOR EACH ROW
BEGIN
IF NEW.discharge_date IS NOT NULL AND OLD.discharge_date IS NULL THEN
UPDATE wards
SET occupied = occupied - 1
WHERE id = NEW.ward_id;
END IF;
END; //
DELIMITER ;
