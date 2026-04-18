DELIMITER //
CREATE TRIGGER before_admission_insert
BEFORE INSERT ON admission
FOR EACH ROW
BEGIN
    DECLARE current_occupied INT;
    DECLARE current_total INT;

    -- Lock the row to prevent concurrent overbooking
    SELECT occupied, total INTO current_occupied, current_total
    FROM wards WHERE id = NEW.ward_id FOR UPDATE;

    -- Throw an exception if full
    IF current_occupied >= current_total THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Transaction Failed: Ward is at maximum capacity.';
    END IF;
END; //
DELIMITER ;

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
CREATE TRIGGER before_admission_update
BEFORE UPDATE ON admission
FOR EACH ROW
BEGIN
    DECLARE current_occupied INT;
    DECLARE current_total INT;

    -- Only check capacity if the patient is actually changing wards
    IF NEW.ward_id != OLD.ward_id THEN
        SELECT occupied, total INTO current_occupied, current_total
        FROM wards WHERE id = NEW.ward_id FOR UPDATE;

        IF current_occupied >= current_total THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Transaction Failed: Target ward is at maximum capacity.';
        END IF;
    END IF;
END; //
DELIMITER ;

DELIMITER //
CREATE TRIGGER after_admission_update
AFTER UPDATE ON admission
FOR EACH ROW
BEGIN
    -- CASE 1: Patient is Discharged
    IF NEW.discharge_date IS NOT NULL AND OLD.discharge_date IS NULL THEN
        UPDATE wards
        -- GREATEST(0) ensures occupancy never accidentally drops below zero
        SET occupied = GREATEST(0, occupied - 1) 
        WHERE id = NEW.ward_id;
    END IF;

    -- CASE 2: Patient is Transferred (Ward Changed)
    IF NEW.ward_id != OLD.ward_id THEN
        -- Free up the bed in the old ward
        UPDATE wards
        SET occupied = GREATEST(0, occupied - 1)
        WHERE id = OLD.ward_id;

        -- Occupy the bed in the new ward
        UPDATE wards
        SET occupied = occupied + 1
        WHERE id = NEW.ward_id;
    END IF;
END; //
DELIMITER ;
