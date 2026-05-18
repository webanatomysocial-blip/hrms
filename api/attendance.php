<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// ✅ SECURITY: Verify Token for ALL requests
$userId = verifyBearerToken();
if (!$userId) {
    sendResponse(false, 'Unauthorized. Please login again.');
}

// Fetch user role for authorization
$currentUserStmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$currentUserStmt->bindParam(':id', $userId);
$currentUserStmt->execute();
$currentUser = $currentUserStmt->fetch(PDO::FETCH_ASSOC);
$userRole = $currentUser['role'] ?? 'employee';

switch ($method) {
    case 'GET':
        if (isset($_GET['employee_id'])) {
            $requestedEmployeeId = (int)$_GET['employee_id'];
            if ($userRole !== 'admin' && $userRole !== 'manager' && (int)$requestedEmployeeId !== (int)$userId) {
                sendResponse(false, 'Unauthorized access to employee data');
            }
            if (isset($_GET['action']) && $_GET['action'] === 'active-session') {
                getActiveSession($db, $requestedEmployeeId);
            } elseif (isset($_GET['summary'])) {
                getEmployeeAttendanceSummary($db, $requestedEmployeeId);
            } else {
                getEmployeeAttendance($db, $requestedEmployeeId);
            }
        } else {
            if (isset($_GET['action']) && $_GET['action'] === 'active-session') {
                getActiveSession($db, $userId);
            } elseif (isset($_GET['summary'])) {
                getAllAttendanceSummary($db);
            } elseif ($userRole === 'admin' || $userRole === 'manager') {
                if (isset($_GET['sync_summaries'])) {
                    syncAllDailySummaries($db);
                } else {
                    getAllAttendance($db);
                }
            } else {
                getEmployeeAttendance($db, (int)$userId);
            }
        }
        break;
    case 'POST':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'clock-in':
                    $input['employee_id'] = $userId;
                    clockIn($db, $input);
                    break;
                case 'clock-out':
                    $input['employee_id'] = $userId;
                    clockOut($db, $input);
                    break;
                default:
                    if ($userRole !== 'admin' && isset($input['employee_id']) && $input['employee_id'] != $userId) {
                         sendResponse(false, 'Unauthorized to create attendance for others');
                    }
                    createAttendanceEntry($db, $input);
            }
        } else {
            createAttendanceEntry($db, $input);
        }
        break;
    case 'PUT':
        if ($userRole !== 'admin' && $userRole !== 'manager') {
            sendResponse(false, 'Forbidden. Admin access required.');
        }
        updateAttendanceSummaryManual($db, $input);
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

/**
 * Manually update or create daily attendance summary (Admin only)
 */
function updateAttendanceSummaryManual($db, $input) {
    if (!isset($input['id']) && (!isset($input['employee_id']) || !isset($input['date']))) {
        sendResponse(false, 'Summary ID or Employee ID & Date are required');
    }

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    $employeeId = isset($input['employee_id']) ? (int)$input['employee_id'] : null;
    $date = isset($input['date']) ? $input['date'] : null;
    
    $status = $input['status'] ?? 'present';
    $first_clock_in = $input['first_clock_in'] ?? null;
    $last_clock_out = $input['last_clock_out'] ?? null;
    $total_working_hours = $input['total_working_hours'] ?? 0;

    try {
        $db->beginTransaction();

        if ($id > 0) {
            $query = "UPDATE daily_attendance_summary 
                      SET status = :status, 
                          first_clock_in = :fci, 
                          last_clock_out = :lco, 
                          total_working_hours = :twh,
                          updated_at = " . (DB_TYPE === 'mysql' ? 'NOW()' : "DATETIME('now', 'localtime')") . "
                      WHERE id = :id";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':fci', $first_clock_in);
            $stmt->bindParam(':lco', $last_clock_out);
            $stmt->bindParam(':twh', $total_working_hours);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            if (!$employeeId || !$date) {
                $getInfo = $db->prepare("SELECT employee_id, date, employee_name FROM daily_attendance_summary WHERE id = :id");
                $getInfo->execute([':id' => $id]);
                $info = $getInfo->fetch();
                $employeeId = $info['employee_id'];
                $date = $info['date'];
                $employeeName = $info['employee_name'];
            }
        } else {
            $userStmt = $db->prepare("SELECT name FROM users WHERE id = :id");
            $userStmt->bindParam(':id', $employeeId, PDO::PARAM_INT);
            $userStmt->execute();
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            if (!$user) {
                $db->rollBack();
                sendResponse(false, 'Employee not found');
            }
            $employeeName = $user['name'];
            $id = 0; // Ensure it's treated as new if id was passed as 0

            if (DB_TYPE === 'mysql') {
                $query = "INSERT INTO daily_attendance_summary 
                          (employee_id, employee_name, date, status, first_clock_in, last_clock_out, total_working_hours, created_at, updated_at) 
                          VALUES (:eid, :ename, :d, :status, :fci, :lco, :twh, NOW(), NOW())
                          ON DUPLICATE KEY UPDATE status=VALUES(status), first_clock_in=VALUES(first_clock_in), last_clock_out=VALUES(last_clock_out), total_working_hours=VALUES(total_working_hours), updated_at=NOW()";
            } else {
                $query = "INSERT INTO daily_attendance_summary 
                          (employee_id, employee_name, date, status, first_clock_in, last_clock_out, total_working_hours, created_at, updated_at) 
                          VALUES (:eid, :ename, :d, :status, :fci, :lco, :twh, DATETIME('now', 'localtime'), DATETIME('now', 'localtime'))
                          ON CONFLICT(employee_id, date) DO UPDATE SET status=excluded.status, first_clock_in=excluded.first_clock_in, last_clock_out=excluded.last_clock_out, total_working_hours=excluded.total_working_hours, updated_at=DATETIME('now', 'localtime')";
            }
            $stmt = $db->prepare($query);
            $stmt->execute([':eid'=>$employeeId, ':ename'=>$employeeName, ':d'=>$date, ':status'=>$status, ':fci'=>$first_clock_in, ':lco'=>$last_clock_out, ':twh'=>$total_working_hours]);
        }

        // SYNC DETAILED LOGS
        $db->prepare("DELETE FROM attendance WHERE employee_id = ? AND date = ?")->execute([$employeeId, $date]);
        $sessionId = 'manual_' . uniqid();
        if ($first_clock_in) {
            $db->prepare("INSERT INTO attendance (employee_id, employee_name, date, time, entry_type, session_id, notes) VALUES (?, ?, ?, ?, 'in', ?, 'Manual override')")
               ->execute([$employeeId, $employeeName, $date, $first_clock_in, $sessionId]);
        }
        if ($last_clock_out) {
            $db->prepare("INSERT INTO attendance (employee_id, employee_name, date, time, entry_type, session_id, notes) VALUES (?, ?, ?, ?, 'out', ?, 'Manual override')")
               ->execute([$employeeId, $employeeName, $date, $last_clock_out, $sessionId]);
        }

        $db->commit();
        sendResponse(true, 'Attendance record updated successfully');
    } catch (PDOException $e) {
        if ($db->inTransaction()) $db->rollBack();
        sendResponse(false, 'Database failure: ' . $e->getMessage());
    }
}

function getAllAttendance($db) {
    try {
        $query = "SELECT a.* FROM attendance a JOIN users u ON a.employee_id = u.id WHERE u.role != 'admin' ORDER BY a.date DESC, a.time DESC LIMIT 1000";
        sendResponse(true, 'Attendance retrieved', $db->query($query)->fetchAll());
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}

function getAllAttendanceSummary($db) {
    try {
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;
        $query = "SELECT s.*, u.role FROM daily_attendance_summary s JOIN users u ON s.employee_id = u.id WHERE u.role != 'admin'";
        $params = [];
        if ($startDate && $endDate) { $query .= " AND date BETWEEN :start AND :end"; $params[':start'] = $startDate; $params[':end'] = $endDate; }
        $query .= " ORDER BY date DESC LIMIT 1000";
        $stmt = $db->prepare($query); $stmt->execute($params);
        sendResponse(true, 'Success', $stmt->fetchAll());
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}

function getEmployeeAttendance($db, $employeeId) {
    try {
        $stmt = $db->prepare("SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC, time DESC LIMIT 500");
        $stmt->execute([$employeeId]);
        sendResponse(true, 'Success', $stmt->fetchAll());
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}

function getEmployeeAttendanceSummary($db, $employeeId) {
    try {
        $stmt = $db->prepare("SELECT * FROM daily_attendance_summary WHERE employee_id = ? ORDER BY date DESC LIMIT 365");
        $stmt->execute([$employeeId]);
        sendResponse(true, 'Success', $stmt->fetchAll());
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}

function getActiveSession($db, $employeeId) {
    $today = date('Y-m-d');
    try {
        $stmt = $db->prepare("SELECT id, entry_type, time, session_id FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$employeeId, $today]);
        $last = $stmt->fetch();
        if ($last && $last['entry_type'] === 'in') sendResponse(true, 'Active', ['is_clocked_in'=>true, 'clock_in_time'=>$last['time'], 'session_id'=>$last['session_id']]);
        else sendResponse(true, 'None', ['is_clocked_in'=>false]);
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}

function clockIn($db, $input) {
    $employeeId = (int)$input['employee_id'];
    $today = date('Y-m-d'); $currentTime = date('H:i:s');
    try {
        $db->beginTransaction();
        $user = $db->prepare("SELECT name, active FROM users WHERE id = ?"); $user->execute([$employeeId]); $u = $user->fetch();
        if (!$u || !$u['active']) { $db->rollBack(); sendResponse(false, 'Inactive'); }
        $last = $db->prepare("SELECT entry_type FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1"); $last->execute([$employeeId, $today]); $l = $last->fetch();
        if ($l && $l['entry_type'] === 'in') { $db->rollBack(); sendResponse(false, 'Already in'); }
        $db->prepare("INSERT INTO attendance (employee_id, employee_name, date, time, entry_type, session_id) VALUES (?, ?, ?, ?, 'in', ?)")
           ->execute([$employeeId, $u['name'], $today, $currentTime, uniqid('session_', true)]);
        updateDailySummary($db, $employeeId, $u['name'], $today);
        $db->commit();
        sendResponse(true, 'Success', ['time'=>$currentTime]);
    } catch (PDOException $e) { if ($db->inTransaction()) $db->rollBack(); sendResponse(false, 'Error'); }
}

function clockOut($db, $input) {
    $employeeId = (int)$input['employee_id'];
    $today = date('Y-m-d'); $currentTime = date('H:i:s');
    if ($currentTime > '21:00:00') $currentTime = '21:00:00';
    try {
        $db->beginTransaction();
        $user = $db->prepare("SELECT name FROM users WHERE id = ?"); $user->execute([$employeeId]); $u = $user->fetch();
        $last = $db->prepare("SELECT session_id, entry_type FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id DESC LIMIT 1"); $last->execute([$employeeId, $today]); $l = $last->fetch();
        if (!$l || $l['entry_type'] === 'out') { $db->rollBack(); sendResponse(false, 'Not in'); }
        $db->prepare("INSERT INTO attendance (employee_id, employee_name, date, time, entry_type, session_id) VALUES (?, ?, ?, ?, 'out', ?)")
           ->execute([$employeeId, $u['name'], $today, $currentTime, $l['session_id']]);
        $hours = updateDailySummary($db, $employeeId, $u['name'], $today);
        $db->commit();
        sendResponse(true, 'Success', ['time'=>$currentTime, 'working_hours'=>$hours]);
    } catch (PDOException $e) { if ($db->inTransaction()) $db->rollBack(); sendResponse(false, 'Error'); }
}

function updateDailySummary($db, $employeeId, $employeeName, $date) {
    try {
        $stmt = $db->prepare("SELECT * FROM attendance WHERE employee_id = ? AND date = ? ORDER BY id ASC"); $stmt->execute([$employeeId, $date]); $entries = $stmt->fetchAll();
        if (empty($entries)) return 0;
        $totalWorkingSeconds = 0; $firstClockIn = null; $lastClockOut = null; $currentClockIn = null;
        foreach ($entries as $entry) {
            if ($entry['entry_type'] === 'in') { $currentClockIn = $entry['time']; if ($firstClockIn === null) $firstClockIn = $entry['time']; }
            elseif ($entry['entry_type'] === 'out' && $currentClockIn !== null) {
                $in = strtotime($date . ' ' . $currentClockIn); $outTime = $entry['time'] > '21:00:00' ? '21:00:00' : $entry['time'];
                $out = strtotime($date . ' ' . $outTime); $totalWorkingSeconds += max(0, $out - $in); $lastClockOut = $outTime; $currentClockIn = null;
            }
        }
        $totalWorkingHours = round($totalWorkingSeconds / 3600, 2); $status = 'present';
        if ($totalWorkingHours > 0 && $totalWorkingHours < 4 && $lastClockOut !== null) $status = 'half_day';
        if ($firstClockIn && strtotime($firstClockIn) > strtotime('09:15:00')) $status = 'late';
        if (getenv('DB_TYPE') === 'mysql') {
            $q = "INSERT INTO daily_attendance_summary (employee_id, employee_name, date, total_working_hours, total_break_time, status, first_clock_in, last_clock_out, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE total_working_hours=VALUES(total_working_hours), status=VALUES(status), first_clock_in=VALUES(first_clock_in), last_clock_out=VALUES(last_clock_out), updated_at=NOW()";
        } else {
            $q = "INSERT INTO daily_attendance_summary (employee_id, employee_name, date, total_working_hours, total_break_time, status, first_clock_in, last_clock_out, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?, DATETIME('now', 'localtime'), DATETIME('now', 'localtime')) ON CONFLICT(employee_id, date) DO UPDATE SET total_working_hours=excluded.total_working_hours, status=excluded.status, first_clock_in=excluded.first_clock_in, last_clock_out=excluded.last_clock_out, updated_at=DATETIME('now', 'localtime')";
        }
        $db->prepare($q)->execute([$employeeId, $employeeName, $date, $totalWorkingHours, $status, $firstClockIn, $lastClockOut]);
        return $totalWorkingHours;
    } catch (PDOException $e) { return 0; }
}

function createAttendanceEntry($db, $input) {
    try {
        $u = $db->prepare("SELECT name FROM users WHERE id = ?"); $u->execute([$input['employee_id']]); $name = $u->fetch()['name'];
        $db->prepare("INSERT INTO attendance (employee_id, employee_name, date, time, entry_type, session_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)")
           ->execute([$input['employee_id'], $name, $input['date'], $input['time'], $input['entry_type'], uniqid(), $input['notes']??null]);
        updateDailySummary($db, $input['employee_id'], $name, $input['date']);
        sendResponse(true, 'Success');
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}

function syncAllDailySummaries($db) {
    try {
        $today = date('Y-m-d'); $stmt = $db->query("SELECT DISTINCT employee_id, employee_name FROM attendance WHERE date = '$today'");
        $synced = 0; while ($emp = $stmt->fetch()) { updateDailySummary($db, $emp['employee_id'], $emp['employee_name'], $today); $synced++; }
        sendResponse(true, "Synced $synced.");
    } catch (PDOException $e) { sendResponse(false, 'Error'); }
}
?>
