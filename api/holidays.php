<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        getHolidays($db);
        break;
    case 'POST':
        createHoliday($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            updateHoliday($db, $_GET['id'], $input);
        } else {
            sendResponse(false, 'Holiday ID required');
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteHoliday($db, $_GET['id']);
        } else {
            sendResponse(false, 'Holiday ID required');
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getHolidays($db) {
    try {
        $query = "SELECT * FROM holidays ORDER BY date ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $holidays = $stmt->fetchAll();
        sendResponse(true, 'Holidays retrieved successfully', $holidays);
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to retrieve holidays: ' . $e->getMessage());
    }
}

function createHoliday($db, $input) {
    if (!isset($input['name']) || !isset($input['date'])) {
        sendResponse(false, 'Name and date are required');
    }

    $name = validateInput($input['name']);
    $date = $input['date'];
    $type = isset($input['type']) ? validateInput($input['type']) : 'public';
    $description = isset($input['description']) ? validateInput($input['description']) : null;

    try {
        $query = "INSERT INTO holidays (name, date, type, description) 
                  VALUES (:name, :date, :type, :description)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':date', $date);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':description', $description);

        if ($stmt->execute()) {
            $holidayId = $db->lastInsertId();
            sendResponse(true, 'Holiday created successfully', ['id' => $holidayId]);
        } else {
            sendResponse(false, 'Failed to create holiday');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to create holiday: ' . $e->getMessage());
    }
}

function updateHoliday($db, $id, $input) {
    try {
        $fields = [];
        $params = [':id' => $id];

        if (isset($input['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = validateInput($input['name']);
        }
        if (isset($input['date'])) {
            $fields[] = "date = :date";
            $params[':date'] = $input['date'];
        }
        if (isset($input['type'])) {
            $fields[] = "type = :type";
            $params[':type'] = validateInput($input['type']);
        }
        if (isset($input['description'])) {
            $fields[] = "description = :description";
            $params[':description'] = validateInput($input['description']);
        }

        if (empty($fields)) {
            sendResponse(false, 'No fields to update');
        }

        $query = "UPDATE holidays SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($query);

        if ($stmt->execute($params)) {
            sendResponse(true, 'Holiday updated successfully');
        } else {
            sendResponse(false, 'Failed to update holiday');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to update holiday: ' . $e->getMessage());
    }
}

function deleteHoliday($db, $id) {
    try {
        $query = "DELETE FROM holidays WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            sendResponse(true, 'Holiday deleted successfully');
        } else {
            sendResponse(false, 'Failed to delete holiday');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to delete holiday: ' . $e->getMessage());
    }
}
?>
