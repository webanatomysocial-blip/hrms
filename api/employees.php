<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// ✅ SECURITY: Verify Token
$userId = verifyBearerToken();
if (!$userId) {
    sendResponse(false, 'Unauthorized. Please login again.');
}

// Fetch user role
$currentUserStmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$currentUserStmt->bindParam(':id', $userId);
$currentUserStmt->execute();
$currentUser = $currentUserStmt->fetch(PDO::FETCH_ASSOC);
$userRole = $currentUser['role'] ?? 'employee';

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getEmployee($db, $_GET['id']);
        } else {
            getEmployees($db);
        }
        break;
    case 'POST':
        // Only Admin
        if ($userRole !== 'admin') {
            sendResponse(false, 'Unauthorized. Only admins can create employees.');
        }
        createEmployee($db, $input);
        break;
    case 'PUT':
        // Only Admin
        if ($userRole !== 'admin') {
            sendResponse(false, 'Unauthorized. Only admins can update employees.');
        }
        if (isset($_GET['id'])) {
            updateEmployee($db, $_GET['id'], $input);
        } else {
            sendResponse(false, 'Employee ID required');
        }
        break;
    case 'DELETE':
        // Only Admin
        if ($userRole !== 'admin') {
            sendResponse(false, 'Unauthorized. Only admins can delete employees.');
        }
        if (isset($_GET['id'])) {
            deleteEmployee($db, $_GET['id']);
        } else {
            sendResponse(false, 'Employee ID required');
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getEmployees($db) {
    try {
        $query = "SELECT id, name, email, role, department, position, joining_date, created_at, active 
                  FROM users 
                  WHERE role != 'admin'
                  ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $employees = $stmt->fetchAll();
        sendResponse(true, 'Employees retrieved successfully', $employees);
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to retrieve employees.');
    }
}

function getEmployee($db, $id) {
    try {
        $query = "SELECT id, name, email, role, department, position, joining_date, created_at, active 
                  FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        $employee = $stmt->fetch();
        if ($employee) {
            sendResponse(true, 'Employee retrieved successfully', $employee);
        } else {
            sendResponse(false, 'Employee not found');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to retrieve employee.');
    }
}

function createEmployee($db, $input) {
    if (!isset($input['name']) || empty(trim($input['name']))) {
        sendResponse(false, 'Full Name is required');
    }
    if (!isset($input['email']) || empty(trim($input['email']))) {
        sendResponse(false, 'Email address is required');
    }
    if (!validateEmail($input['email'])) {
        sendResponse(false, 'Invalid email format');
    }

    $name = validateInput($input['name']);
    $email = validateInput($input['email']);
    $password = password_hash(isset($input['password']) && !empty($input['password']) ? $input['password'] : '123456', PASSWORD_DEFAULT);
    $role = isset($input['role']) ? validateInput($input['role']) : 'employee';
    $department = !empty($input['department']) ? validateInput($input['department']) : null;
    $position = !empty($input['position']) ? validateInput($input['position']) : null;
    $joining_date = !empty($input['joining_date']) ? $input['joining_date'] : date('Y-m-d');

    try {
        // Check if employee already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindValue(':email', $email);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            sendResponse(false, 'An employee with this email already exists');
        }

        $query = "INSERT INTO users (name, email, password, role, department, position, joining_date, active) 
                  VALUES (:name, :email, :password, :role, :department, :position, :joining_date, 1)";
        
        $stmt = $db->prepare($query);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':password', $password);
        $stmt->bindValue(':role', $role);
        $stmt->bindValue(':department', $department);
        $stmt->bindValue(':position', $position);
        $stmt->bindValue(':joining_date', $joining_date);

        if ($stmt->execute()) {
            $employeeId = $db->lastInsertId();
            logError('Employee created successfully', ['id' => $employeeId, 'email' => $email]);
            sendResponse(true, 'Employee added successfully', ['id' => $employeeId]);
        } else {
            $errorInfo = $stmt->errorInfo();
            logError('Failed to execute employee insert', ['error' => $errorInfo]);
            sendResponse(false, 'Failed to save employee data to database');
        }
    } catch(PDOException $e) {
        logError('Create employee exception', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
        sendResponse(false, 'Database error: ' . $e->getMessage());
    }
}

function updateEmployee($db, $id, $input) {
    try {
        $fields = [];
        $params = [':id' => $id];

        if (isset($input['name'])) {
            $fields[] = "name = :name";
            $params[':name'] = validateInput($input['name']);
        }
        if (isset($input['email'])) {
            $fields[] = "email = :email";
            $params[':email'] = validateInput($input['email']);
        }
        if (isset($input['role'])) {
            $fields[] = "role = :role";
            $params[':role'] = validateInput($input['role']);
        }
        if (isset($input['department'])) {
            $fields[] = "department = :department";
            $params[':department'] = validateInput($input['department']);
        }
        if (isset($input['position'])) {
            $fields[] = "position = :position";
            $params[':position'] = validateInput($input['position']);
        }
        if (isset($input['joining_date'])) {
            $fields[] = "joining_date = :joining_date";
            $params[':joining_date'] = $input['joining_date'];
        }
        if (isset($input['password']) && !empty($input['password'])) {
             $fields[] = "password = :password";
             $params[':password'] = password_hash($input['password'], PASSWORD_DEFAULT);
        }

        if (empty($fields)) {
            sendResponse(false, 'No fields to update');
        }

        $query = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($query);

        if ($stmt->execute($params)) {
             sendResponse(true, 'Employee updated successfully');
        } else {
             sendResponse(false, 'Failed to update employee');
        }
    } catch(PDOException $e) {
        logError('Update employee error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to update employee');
    }
}

function deleteEmployee($db, $id) {
    try {
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            sendResponse(true, 'Employee deleted successfully');
        } else {
            sendResponse(false, 'Failed to delete employee');
        }
    } catch(PDOException $e) {
        logError('Delete employee error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to delete employee');
    }
}
?>
