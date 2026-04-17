<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        if (isset($_GET['employee_id'])) {
            getEmployeeLeaves($db, $_GET['employee_id']);
        } else {
            getAllLeaves($db);
        }
        break;
    case 'POST':
        createLeaveRequest($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            if (isset($_GET['action']) && $_GET['action'] === 'approve') {
                approveLeave($db, $_GET['id'], $input);
            } else {
                updateLeaveRequest($db, $_GET['id'], $input);
            }
        } else {
            sendResponse(false, 'Leave request ID required');
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteLeaveRequest($db, $_GET['id']);
        } else {
            sendResponse(false, 'Leave request ID required');
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getAllLeaves($db) {
    try {
        $query = "SELECT lr.*, u.name as approved_by_name 
                  FROM leave_requests lr 
                  LEFT JOIN users u ON lr.approved_by = u.id 
                  ORDER BY lr.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $leaves = $stmt->fetchAll();
        sendResponse(true, 'Leave requests retrieved successfully', $leaves);
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to retrieve leave requests: ' . $e->getMessage());
    }
}

function getEmployeeLeaves($db, $employeeId) {
    try {
        $query = "SELECT lr.*, u.name as approved_by_name 
                  FROM leave_requests lr 
                  LEFT JOIN users u ON lr.approved_by = u.id 
                  WHERE lr.employee_id = :employee_id 
                  ORDER BY lr.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':employee_id', $employeeId);
        $stmt->execute();
        
        $leaves = $stmt->fetchAll();
        sendResponse(true, 'Employee leave requests retrieved successfully', $leaves);
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to retrieve employee leave requests: ' . $e->getMessage());
    }
}

function createLeaveRequest($db, $input) {
    if (!isset($input['employee_id']) || !isset($input['type']) || 
        !isset($input['start_date']) || !isset($input['end_date']) || !isset($input['reason'])) {
        sendResponse(false, 'Employee ID, type, start date, end date and reason are required');
    }

    $employeeId = $input['employee_id'];
    $type = validateInput($input['type']);
    $startDate = $input['start_date'];
    $endDate = $input['end_date'];
    $reason = validateInput($input['reason']);
    $isUnpaid = isset($input['is_unpaid']) ? (bool)$input['is_unpaid'] : false;

    try {
        // Get employee name
        $userQuery = "SELECT name FROM users WHERE id = :id";
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':id', $employeeId);
        $userStmt->execute();
        
        $user = $userStmt->fetch();
        if (!$user) {
            sendResponse(false, 'Employee not found');
        }
        
        $employeeName = $user['name'];

        // Calculate days
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $days = $start->diff($end)->days + 1;

        $query = "INSERT INTO leave_requests (employee_id, employee_name, type, start_date, end_date, days, reason, is_unpaid) 
                  VALUES (:employee_id, :employee_name, :type, :start_date, :end_date, :days, :reason, :is_unpaid)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':employee_id', $employeeId);
        $stmt->bindParam(':employee_name', $employeeName);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':start_date', $startDate);
        $stmt->bindParam(':end_date', $endDate);
        $stmt->bindParam(':days', $days);
        $stmt->bindParam(':reason', $reason);
        $stmt->bindParam(':is_unpaid', $isUnpaid, PDO::PARAM_BOOL);

        if ($stmt->execute()) {
            $leaveId = $db->lastInsertId();
            sendResponse(true, 'Leave request created successfully', ['id' => $leaveId]);
        } else {
            sendResponse(false, 'Failed to create leave request');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to create leave request: ' . $e->getMessage());
    }
}

function approveLeave($db, $id, $input) {
    if (!isset($input['status']) || !isset($input['approved_by'])) {
        sendResponse(false, 'Status and approver ID are required');
    }

    $status = validateInput($input['status']);
    $approvedBy = $input['approved_by'];

    if (!in_array($status, ['approved', 'rejected'])) {
        sendResponse(false, 'Invalid status. Use approved or rejected');
    }

    try {
        $now = (getenv('DB_TYPE') === 'mysql') ? "NOW()" : "DATETIME('now', 'localtime')";
        $query = "UPDATE leave_requests SET status = :status, approved_by = :approved_by, approved_at = $now 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':approved_by', $approvedBy);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            sendResponse(true, "Leave request {$status} successfully");
        } else {
            sendResponse(false, 'Failed to update leave request status');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to approve leave request: ' . $e->getMessage());
    }
}

function updateLeaveRequest($db, $id, $input) {
    try {
        $fields = [];
        $params = [':id' => $id];

        if (isset($input['type'])) {
            $fields[] = "type = :type";
            $params[':type'] = validateInput($input['type']);
        }
        if (isset($input['start_date'])) {
            $fields[] = "start_date = :start_date";
            $params[':start_date'] = $input['start_date'];
        }
        if (isset($input['end_date'])) {
            $fields[] = "end_date = :end_date";
            $params[':end_date'] = $input['end_date'];
        }
        if (isset($input['reason'])) {
            $fields[] = "reason = :reason";
            $params[':reason'] = validateInput($input['reason']);
        }
        if (isset($input['is_unpaid'])) {
            $fields[] = "is_unpaid = :is_unpaid";
            $params[':is_unpaid'] = (bool)$input['is_unpaid'];
        }

        // Recalculate days if dates are updated
        if (isset($input['start_date']) || isset($input['end_date'])) {
            $getCurrentQuery = "SELECT start_date, end_date FROM leave_requests WHERE id = :id";
            $getCurrentStmt = $db->prepare($getCurrentQuery);
            $getCurrentStmt->bindParam(':id', $id);
            $getCurrentStmt->execute();
            
            $current = $getCurrentStmt->fetch();
            if ($current) {
                $startDate = isset($input['start_date']) ? $input['start_date'] : $current['start_date'];
                $endDate = isset($input['end_date']) ? $input['end_date'] : $current['end_date'];
                
                $start = new DateTime($startDate);
                $end = new DateTime($endDate);
                $days = $start->diff($end)->days + 1;
                
                $fields[] = "days = :days";
                $params[':days'] = $days;
            }
        }

        if (empty($fields)) {
            sendResponse(false, 'No fields to update');
        }

        $query = "UPDATE leave_requests SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($query);

        if ($stmt->execute($params)) {
            sendResponse(true, 'Leave request updated successfully');
        } else {
            sendResponse(false, 'Failed to update leave request');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to update leave request: ' . $e->getMessage());
    }
}

function deleteLeaveRequest($db, $id) {
    try {
        $query = "DELETE FROM leave_requests WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            sendResponse(true, 'Leave request deleted successfully');
        } else {
            sendResponse(false, 'Failed to delete leave request');
        }
    } catch(PDOException $e) {
        sendResponse(false, 'Failed to delete leave request: ' . $e->getMessage());
    }
}
?>
