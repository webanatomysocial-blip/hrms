<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'balances') {
            getLeaveBalances($db, $_GET['employee_id'] ?? null);
        } elseif (isset($_GET['employee_id'])) {
            getEmployeeLeaves($db, $_GET['employee_id']);
        } else {
            getAllLeaves($db);
        }
        break;
    case 'POST':
        createLeaveRequest($db, $input);
        break;
    case 'PUT':
        if (isset($_GET['action']) && $_GET['action'] === 'update-balance') {
            updateLeaveBalance($db, $input);
        } elseif (isset($_GET['id'])) {
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
        $query = "SELECT lr.*, u_emp.role as employee_role, u_emp.department, u_app.name as approved_by_name, u_man.name as manager_approved_by_name 
                  FROM leave_requests lr 
                  JOIN users u_emp ON lr.employee_id = u_emp.id
                  LEFT JOIN users u_app ON lr.approved_by = u_app.id 
                  LEFT JOIN users u_man ON lr.manager_approved_by = u_man.id
                  WHERE u_emp.role != 'admin'
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
        $query = "SELECT lr.*, u_emp.department, u.name as approved_by_name, um.name as manager_approved_by_name 
                  FROM leave_requests lr 
                  JOIN users u_emp ON lr.employee_id = u_emp.id
                  LEFT JOIN users u ON lr.approved_by = u.id 
                  LEFT JOIN users um ON lr.manager_approved_by = um.id
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
    $approverId = (int)$input['approved_by'];

    if (!in_array($status, ['approved', 'rejected'])) {
        sendResponse(false, 'Invalid status. Use approved or rejected');
    }

    try {
        $db->beginTransaction();

        // Get approver role
        $roleQuery = "SELECT role FROM users WHERE id = :id";
        $roleStmt = $db->prepare($roleQuery);
        $roleStmt->bindParam(':id', $approverId, PDO::PARAM_INT);
        $roleStmt->execute();
        $approver = $roleStmt->fetch();
        
        if (!$approver) {
            $db->rollBack();
            sendResponse(false, 'Approver not found');
        }
        $role = $approver['role'];

        // Fetch current leave request status and manager_id
        $currentLeaveQuery = "SELECT status, manager_id, employee_id FROM leave_requests WHERE id = :id";
        $currentLeaveStmt = $db->prepare($currentLeaveQuery);
        $currentLeaveStmt->bindParam(':id', $id, PDO::PARAM_INT);
        $currentLeaveStmt->execute();
        $currentLeave = $currentLeaveStmt->fetch(PDO::FETCH_ASSOC);

        if (!$currentLeave) {
            $db->rollBack();
            sendResponse(false, 'Leave request not found');
        }

        $currentStatus = $currentLeave['status'];
        $managerId = $currentLeave['manager_id'] ? (int)$currentLeave['manager_id'] : null;
        $employeeId = (int)$currentLeave['employee_id'];

        // Prevent duplicate approvals/actions
        if ($currentStatus === 'approved' || $currentStatus === 'rejected') {
            $db->rollBack();
            sendResponse(false, "Leave request has already been processed (Current Status: $currentStatus)");
        }

        $now = (getenv('DB_TYPE') === 'mysql') ? "NOW()" : "DATETIME('now', 'localtime')";
        
        if ($status === 'rejected') {
            // Anyone (Admin/Manager) can reject
            $query = "UPDATE leave_requests SET status = 'rejected', status_detail = 'rejected', approved_by = :approver_id, approved_at = $now WHERE id = :id";
            $params = [':approver_id' => $approverId, ':id' => $id];
            $stmt = $db->prepare($query);
            $stmt->execute($params);
        } else {
            // Approval flow
            if ($role === 'manager') {
                // Check if this manager is assigned to the employee
                if ($managerId !== null && $approverId !== $managerId) {
                    $db->rollBack();
                    sendResponse(false, 'You are not authorized to approve leaves for this employee.');
                }
                
                if ($currentStatus !== 'pending') {
                    $db->rollBack();
                    sendResponse(false, 'Only pending leaves can be approved by a manager.');
                }

                $query = "UPDATE leave_requests SET status = 'manager_approved', status_detail = 'manager_approved', manager_approved_by = :approver_id, manager_approved_at = $now WHERE id = :id";
                $params = [':approver_id' => $approverId, ':id' => $id];
                $stmt = $db->prepare($query);
                $stmt->execute($params);

            } else if ($role === 'admin') {
                // If employee has a manager, enforce multi-stage
                if ($managerId !== null && $currentStatus !== 'manager_approved') {
                    $db->rollBack();
                    sendResponse(false, 'This leave must be approved by the Manager first.');
                }

                $query = "UPDATE leave_requests SET status = 'approved', status_detail = 'approved', approved_by = :approver_id, approved_at = $now WHERE id = :id";
                $params = [':approver_id' => $approverId, ':id' => $id];
                $stmt = $db->prepare($query);
                $stmt->execute($params);

                // Deduct Leave Balance safely
                $leaveQuery = "SELECT employee_id, type, days, is_unpaid FROM leave_requests WHERE id = :id";
                $leaveStmt = $db->prepare($leaveQuery);
                $leaveStmt->bindParam(':id', $id, PDO::PARAM_INT);
                $leaveStmt->execute();
                $leave = $leaveStmt->fetch(PDO::FETCH_ASSOC);

                if ($leave && !$leave['is_unpaid']) {
                    $empId = $leave['employee_id'];
                    $days = (float)$leave['days'];
                    $type = strtolower(trim($leave['type']));

                    $column = null;
                    if (strpos($type, 'sick') !== false || $type === 'sl') $column = 'used_sl';
                    elseif (strpos($type, 'casual') !== false || $type === 'cl') $column = 'used_cl';
                    elseif (strpos($type, 'paid') !== false || $type === 'pl') $column = 'used_pl';

                    if ($column) {
                        $year = date('Y');
                        $quarter = 1; // Treat as Annual

                        $checkBal = "SELECT id FROM leave_balances WHERE employee_id = :eid AND year = :y AND quarter = :q";
                        $cbStmt = $db->prepare($checkBal);
                        $cbStmt->execute([':eid' => $empId, ':y' => $year, ':q' => $quarter]);
                        
                        if (!$cbStmt->fetch()) {
                            $initBal = "INSERT INTO leave_balances (employee_id, year, quarter, sl, cl, pl, used_sl, used_cl, used_pl) 
                                        VALUES (:eid, :y, :q, 1.00, 1.00, 1.00, 0.00, 0.00, 0.00)";
                            $ibStmt = $db->prepare($initBal);
                            $ibStmt->execute([':eid' => $empId, ':y' => $year, ':q' => $quarter]);
                        }

                        $updateBal = "UPDATE leave_balances SET $column = $column + :days 
                                      WHERE employee_id = :eid AND year = :y AND quarter = :q";
                        $ubStmt = $db->prepare($updateBal);
                        $ubStmt->execute([':days' => $days, ':eid' => $empId, ':y' => $year, ':q' => $quarter]);
                    }
                }
            } else {
                $db->rollBack();
                sendResponse(false, 'Only admins and managers can approve leaves');
            }
        }
        
        $db->commit();
        $finalStatus = ($status === 'approved' && $role === 'manager') ? 'manager_approved' : $status;
        sendResponse(true, "Leave request status updated to {$finalStatus} successfully");

    } catch(PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
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
function getLeaveBalances($db, $employeeId = null) {
    try {
        $year = (int)date('Y');
        $quarter = 1; // Treat as Annual

        if ($employeeId) {
            $query = "SELECT lb.*, u.name as employee_name, u.joining_date,
                             COALESCE(lb.year, :y) as year, 
                             COALESCE(lb.quarter, :q) as quarter,
                             lb.sl, lb.cl, lb.pl,
                             COALESCE(lb.used_sl, 0) as used_sl, 
                             COALESCE(lb.used_cl, 0) as used_cl, 
                             COALESCE(lb.used_pl, 0) as used_pl
                      FROM users u 
                      LEFT JOIN leave_balances lb ON u.id = lb.employee_id AND lb.year = :y AND lb.quarter = :q
                      WHERE u.id = :eid";
            $stmt = $db->prepare($query);
            $stmt->execute([':eid' => $employeeId, ':y' => $year, ':q' => $quarter]);
        } else {
            $query = "SELECT u.id as employee_id, u.name as employee_name, u.department, u.joining_date,
                             COALESCE(lb.year, :y) as year, 
                             COALESCE(lb.quarter, :q) as quarter,
                             lb.sl, lb.cl, lb.pl,
                             COALESCE(lb.used_sl, 0) as used_sl, 
                             COALESCE(lb.used_cl, 0) as used_cl, 
                             COALESCE(lb.used_pl, 0) as used_pl
                      FROM users u
                      LEFT JOIN leave_balances lb ON u.id = lb.employee_id AND lb.year = :y AND lb.quarter = :q
                      WHERE u.role != 'admin' AND u.active = 1
                      ORDER BY u.name ASC";
            $stmt = $db->prepare($query);
            $stmt->execute([':y' => $year, ':q' => $quarter]);
        }
        $rows = $stmt->fetchAll();
        $data = [];
        foreach ($rows as $row) {
            if ($row['sl'] === null) {
                // Calculate dynamic quota
                $joinDate = $row['joining_date'] ? new DateTime($row['joining_date']) : null;
                $currentYear = (int)date('Y');
                
                if (!$joinDate || (int)$joinDate->format('Y') < $currentYear) {
                    $row['sl'] = 4.0;
                    $row['cl'] = 4.0;
                    $row['pl'] = 4.0;
                } else if ((int)$joinDate->format('Y') === $currentYear) {
                    $joinMonth = (int)$joinDate->format('n');
                    $quartersRemaining = 4 - ceil($joinMonth / 3) + 1;
                    $row['sl'] = (float)$quartersRemaining;
                    $row['cl'] = (float)$quartersRemaining;
                    $row['pl'] = (float)$quartersRemaining;
                } else {
                    $row['sl'] = 0.0;
                    $row['cl'] = 0.0;
                    $row['pl'] = 0.0;
                }
            }
            $data[] = $row;
        }
        sendResponse(true, 'Leave balances fetched', $data);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to fetch balances: ' . $e->getMessage());
    }
}

function updateLeaveBalance($db, $input) {
    if (!isset($input['employee_id']) || !isset($input['year'])) {
        sendResponse(false, 'Missing parameters');
    }

    $eid = (int)$input['employee_id'];
    $year = (int)$input['year'];
    $quarter = 1; // Treat as Annual
    
    $sl = (float)($input['sl'] ?? 0);
    $cl = (float)($input['cl'] ?? 0);
    $pl = (float)($input['pl'] ?? 0);
    $usl = (float)($input['used_sl'] ?? 0);
    $ucl = (float)($input['used_cl'] ?? 0);
    $upl = (float)($input['used_pl'] ?? 0);

    try {
        $query = "INSERT INTO leave_balances (employee_id, year, quarter, sl, cl, pl, used_sl, used_cl, used_pl) 
                  VALUES (:eid, :y, :q, :sl, :cl, :pl, :usl, :ucl, :upl)
                  ON DUPLICATE KEY UPDATE sl=:sl, cl=:cl, pl=:pl, used_sl=:usl, used_cl=:ucl, used_pl=:upl";
        
        if (DB_TYPE === 'sqlite') {
            $query = "INSERT INTO leave_balances (employee_id, year, quarter, sl, cl, pl, used_sl, used_cl, used_pl) 
                      VALUES (:eid, :y, :q, :sl, :cl, :pl, :usl, :ucl, :upl)
                      ON CONFLICT(employee_id, year, quarter) DO UPDATE SET sl=:sl, cl=:cl, pl=:pl, used_sl=:usl, used_cl=:ucl, used_pl=:upl";
        }

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':eid' => $eid,
            ':y' => $year,
            ':q' => $quarter,
            ':sl' => $sl,
            ':cl' => $cl,
            ':pl' => $pl,
            ':usl' => $usl,
            ':ucl' => $ucl,
            ':upl' => $upl
        ]);
        sendResponse(true, 'Balance updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Database failure: ' . $e->getMessage());
    }
}
?>
