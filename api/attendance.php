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
            
            // Authorization Check: Only Admin or the User themselves can view their attendance
            if ($userRole !== 'admin' && (int)$requestedEmployeeId !== (int)$userId) {
                sendResponse(false, 'Unauthorized access to employee data');
            }
            
            if (isset($_GET['summary'])) {
                getEmployeeAttendanceSummary($db, $requestedEmployeeId);
            } else {
                getEmployeeAttendance($db, $requestedEmployeeId);
            }
        } else {
            // No employee_id provided
            if ($userRole === 'admin') {
                // Admins see everything
                if (isset($_GET['summary'])) {
                    getAllAttendanceSummary($db);
                } else {
                    getAllAttendance($db);
                }
            } else {
                // Employees see ONLY their own data
                if (isset($_GET['summary'])) {
                    getEmployeeAttendanceSummary($db, (int)$userId);
                } else {
                    getEmployeeAttendance($db, (int)$userId);
                }
            }
        }
        break;
    case 'POST':
        if (isset($_GET['action'])) {
            switch ($_GET['action']) {
                case 'clock-in':
                    // Force employee_id to be the authenticated user
                    $input['employee_id'] = $userId;
                    clockIn($db, $input);
                    break;
                case 'clock-out':
                    // Force employee_id to be the authenticated user
                    $input['employee_id'] = $userId;
                    clockOut($db, $input);
                    break;
                default:
                    // Only admin can manually create entries for others
                    if ($userRole !== 'admin' && isset($input['employee_id']) && $input['employee_id'] != $userId) {
                         sendResponse(false, 'Unauthorized to create attendance for others');
                    }
                    createAttendanceEntry($db, $input);
            }
        } else {
            createAttendanceEntry($db, $input);
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getAllAttendance($db) {
    try {
        $query = "SELECT a.* FROM attendance a
                  JOIN users u ON a.employee_id = u.id
                  WHERE u.role != 'admin'
                  ORDER BY a.date DESC, a.time DESC 
                  LIMIT 1000";
        $stmt = $db->prepare($query);
        $stmt->execute();
        sendResponse(true, 'Attendance retrieved successfully', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        logError('Get all attendance error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to retrieve attendance');
    }
}

function getAllAttendanceSummary($db) {
    try {
        $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
        $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
        
        $query = "SELECT s.* FROM daily_attendance_summary s
                  JOIN users u ON s.employee_id = u.id
                  WHERE u.role != 'admin'";
        $params = [];
        
        if ($startDate && $endDate) {
            $query .= " WHERE date BETWEEN :start AND :end";
            $params[':start'] = $startDate;
            $params[':end'] = $endDate;
        } elseif ($startDate) {
            $query .= " WHERE date >= :start";
            $params[':start'] = $startDate;
        } elseif ($endDate) {
            $query .= " WHERE date <= :end";
            $params[':end'] = $endDate;
        }
        
        $query .= " ORDER BY date DESC LIMIT 1000";
        $stmt = $db->prepare($query);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        
        $stmt->execute();
        sendResponse(true, 'Attendance summary retrieved successfully', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        logError('Get all attendance summary error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to retrieve attendance summary');
    }
}

function getEmployeeAttendance($db, $employeeId) {
    try {
        $query = "SELECT * FROM attendance 
                  WHERE employee_id = :eid 
                  ORDER BY date DESC, time DESC 
                  LIMIT 500";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $stmt->execute();
        sendResponse(true, 'Employee attendance retrieved successfully', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        logError('Get employee attendance error', ['error' => $e->getMessage(), 'employee_id' => $employeeId]);
        sendResponse(false, 'Failed to retrieve employee attendance');
    }
}

function getEmployeeAttendanceSummary($db, $employeeId) {
    try {
        $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
        $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
        
        $query = "SELECT * FROM daily_attendance_summary WHERE employee_id = :eid";
        $params = [':eid' => $employeeId];
        
        if ($startDate && $endDate) {
            $query .= " AND date BETWEEN :start AND :end";
            $params[':start'] = $startDate;
            $params[':end'] = $endDate;
        } elseif ($startDate) {
            $query .= " AND date >= :start";
            $params[':start'] = $startDate;
        } elseif ($endDate) {
            $query .= " AND date <= :end";
            $params[':end'] = $endDate;
        }
        
        $query .= " ORDER BY date DESC LIMIT 365";
        $stmt = $db->prepare($query);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        
        $stmt->execute();
        sendResponse(true, 'Employee attendance summary retrieved successfully', $stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        logError('Get employee attendance summary error', ['error' => $e->getMessage(), 'employee_id' => $employeeId]);
        sendResponse(false, 'Failed to retrieve employee attendance summary');
    }
}

/**
 * Clock In
 */
function clockIn($db, $input) {
    if (!isset($input['employee_id']) || empty($input['employee_id'])) {
        sendResponse(false, 'Employee ID is required');
    }

    $employeeId = (int)$input['employee_id'];
    
    if ($employeeId <= 0) {
        sendResponse(false, 'Invalid employee ID');
    }

    $today = date('Y-m-d');
    $currentTime = date('H:i:s');
    $sessionId = uniqid('session_', true);
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    try {
        $db->beginTransaction();

        // Get employee details
        $userStmt = $db->prepare("SELECT name, active FROM users WHERE id = :id");
        $userStmt->bindParam(':id', $employeeId, PDO::PARAM_INT);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $db->rollBack();
            logError('Clock in failed - employee not found', ['employee_id' => $employeeId]);
            sendResponse(false, 'Employee not found');
        }
        
        if (!$user['active']) {
            $db->rollBack();
            sendResponse(false, 'Employee account is inactive');
        }
        
        $employeeName = $user['name'];

        // Check ONLY the very last entry to decide if we can clock in
        // If last entry was 'in', we can't clock in again.
        $lastEntryStmt = $db->prepare("SELECT id, entry_type, time FROM attendance 
                                       WHERE employee_id = :eid AND date = :d 
                                       ORDER BY id DESC 
                                       LIMIT 1");
        $lastEntryStmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $lastEntryStmt->bindParam(':d', $today);
        $lastEntryStmt->execute();
        $lastEntry = $lastEntryStmt->fetch(PDO::FETCH_ASSOC);

        if ($lastEntry) {
            if ($lastEntry['entry_type'] === 'in') {
                $db->rollBack();
                logError('Clock in failed - already clocked in', ['employee_id' => $employeeId, 'last_time' => $lastEntry['time']]);
                sendResponse(false, 'Already clocked in at ' . $lastEntry['time'] . '. Please clock out first.');
            }
        }

        $now = (getenv('DB_TYPE') === 'mysql') ? "NOW()" : "DATETIME('now', 'localtime')";
        $insertStmt = $db->prepare("INSERT INTO attendance 
                             (employee_id, employee_name, date, time, entry_type, session_id, ip_address, created_at) 
                             VALUES (:eid, :ename, :d, :t, 'in', :sid, :ip, $now)");
        $insertStmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $insertStmt->bindParam(':ename', $employeeName);
        $insertStmt->bindParam(':d', $today);
        $insertStmt->bindParam(':t', $currentTime);
        $insertStmt->bindParam(':sid', $sessionId);
        $insertStmt->bindParam(':ip', $ipAddress);
        
        if (!$insertStmt->execute()) {
            $db->rollBack();
            logError('Clock in failed - insert failed', ['employee_id' => $employeeId]);
            sendResponse(false, 'Failed to record clock in');
        }

        updateDailySummary($db, $employeeId, $employeeName, $today);
        
        $db->commit();
        
        logError('Clock in successful', ['employee_id' => $employeeId, 'name' => $employeeName, 'time' => $currentTime]);
        
        sendResponse(true, 'Clocked in successfully', [
            'time' => $currentTime, 
            'session_id' => $sessionId,
            'employee_name' => $employeeName,
            'date' => $today
        ]);
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        logError('Clock in database error', ['error' => $e->getMessage(), 'employee_id' => $employeeId]);
        sendResponse(false, 'Clock in failed: ' . $e->getMessage());
    }
}

/**
 * Clock Out
 */
function clockOut($db, $input) {
    if (!isset($input['employee_id']) || empty($input['employee_id'])) {
        sendResponse(false, 'Employee ID is required');
    }

    $employeeId = (int)$input['employee_id'];
    
    if ($employeeId <= 0) {
        sendResponse(false, 'Invalid employee ID');
    }

    $today = date('Y-m-d');
    $currentTime = date('H:i:s');
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    try {
        $db->beginTransaction();

        // Get employee details
        $userStmt = $db->prepare("SELECT name, active FROM users WHERE id = :id");
        $userStmt->bindParam(':id', $employeeId, PDO::PARAM_INT);
        $userStmt->execute();
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $db->rollBack();
            logError('Clock out failed - employee not found', ['employee_id' => $employeeId]);
            sendResponse(false, 'Employee not found');
        }
        
        if (!$user['active']) {
            $db->rollBack();
            sendResponse(false, 'Employee account is inactive');
        }
        
        $employeeName = $user['name'];

        // Check last entry
        $lastEntryStmt = $db->prepare("SELECT id, entry_type, session_id, time FROM attendance 
                                       WHERE employee_id = :eid AND date = :d 
                                       ORDER BY id DESC 
                                       LIMIT 1");
        $lastEntryStmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $lastEntryStmt->bindParam(':d', $today);
        $lastEntryStmt->execute();
        $lastEntry = $lastEntryStmt->fetch(PDO::FETCH_ASSOC);

        if (!$lastEntry) {
            $db->rollBack();
            logError('Clock out failed - no clock in found', ['employee_id' => $employeeId]);
            sendResponse(false, 'No clock-in record found for today. Please clock in first.');
        }

        if ($lastEntry['entry_type'] === 'out') {
            $db->rollBack();
            logError('Clock out failed - already clocked out', ['employee_id' => $employeeId, 'last_time' => $lastEntry['time']]);
            sendResponse(false, 'Already clocked out at ' . $lastEntry['time'] . '. Please clock in first.');
        }

        $now = (getenv('DB_TYPE') === 'mysql') ? "NOW()" : "DATETIME('now', 'localtime')";
        $insertStmt = $db->prepare("INSERT INTO attendance 
                             (employee_id, employee_name, date, time, entry_type, session_id, ip_address, created_at) 
                             VALUES (:eid, :ename, :d, :t, 'out', :sid, :ip, $now)");
        $insertStmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $insertStmt->bindParam(':ename', $employeeName);
        $insertStmt->bindParam(':d', $today);
        $insertStmt->bindParam(':t', $currentTime);
        $insertStmt->bindParam(':sid', $lastEntry['session_id']);
        $insertStmt->bindParam(':ip', $ipAddress);
        
        if (!$insertStmt->execute()) {
            $db->rollBack();
            logError('Clock out failed - insert failed', ['employee_id' => $employeeId]);
            sendResponse(false, 'Failed to record clock out');
        }

        $workingHours = updateDailySummary($db, $employeeId, $employeeName, $today);
        
        $db->commit();
        
        logError('Clock out successful', ['employee_id' => $employeeId, 'name' => $employeeName, 'time' => $currentTime, 'hours' => $workingHours]);
        
        sendResponse(true, 'Clocked out successfully', [
            'time' => $currentTime, 
            'working_hours' => $workingHours,
            'employee_name' => $employeeName,
            'date' => $today
        ]);
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        logError('Clock out database error', ['error' => $e->getMessage(), 'employee_id' => $employeeId]);
        sendResponse(false, 'Clock out failed: ' . $e->getMessage());
    }
}

/**
 * Update daily summary
 */
function updateDailySummary($db, $employeeId, $employeeName, $date) {
    try {
        // Get all entries for this date
        $entriesStmt = $db->prepare("SELECT * FROM attendance 
                                     WHERE employee_id = :eid AND date = :d 
                                     ORDER BY id ASC");
        $entriesStmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $entriesStmt->bindParam(':d', $date);
        $entriesStmt->execute();
        
        $entries = $entriesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($entries)) {
            return 0;
        }

        $totalWorkingSeconds = 0;
        $firstClockIn = null;
        $lastClockOut = null;
        $currentClockIn = null;

        foreach ($entries as $entry) {
            if ($entry['entry_type'] === 'in') {
                $currentClockIn = $entry['time'];
                if ($firstClockIn === null) {
                    $firstClockIn = $entry['time'];
                }
                // If they clocked in, mark any previous clock-out as overridden for the summary
                $lastClockOut = null; 
            } elseif ($entry['entry_type'] === 'out' && $currentClockIn !== null) {
                $clockInTime = strtotime($date . ' ' . $currentClockIn);
                $clockOutTime = strtotime($date . ' ' . $entry['time']);
                $sessionSeconds = $clockOutTime - $clockInTime;
                
                if ($sessionSeconds > 0) {
                    $totalWorkingSeconds += $sessionSeconds;
                }
                
                $lastClockOut = $entry['time'];
                $currentClockIn = null;
            }
        }

        $totalWorkingHours = round($totalWorkingSeconds / 3600, 2);
        
        // Determine status
        $status = 'present';
        if ($firstClockIn && strtotime($firstClockIn) > strtotime('09:30:00')) {
            $status = 'late';
        }
        if ($totalWorkingHours > 0 && $totalWorkingHours < 4) {
            $status = 'half_day';
        }
        if ($totalWorkingHours == 0 && $lastClockOut === null) {
            $status = 'present'; // Still working
        }

        $dbType = getenv('DB_TYPE') ?: 'sqlite';
        if ($dbType === 'mysql') {
            $summaryStmt = $db->prepare("
                INSERT INTO daily_attendance_summary 
                (employee_id, employee_name, date, total_working_hours, total_break_time, status, first_clock_in, last_clock_out, created_at, updated_at) 
                VALUES (:eid, :ename, :d, :twh, 0, :st, :fci, :lco, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                total_working_hours = :twh,
                status = :st,
                first_clock_in = :fci,
                last_clock_out = :lco,
                updated_at = NOW()
            ");
        } else {
            $summaryStmt = $db->prepare("
                INSERT INTO daily_attendance_summary 
                (employee_id, employee_name, date, total_working_hours, total_break_time, status, first_clock_in, last_clock_out, created_at, updated_at) 
                VALUES (:eid, :ename, :d, :twh, 0, :st, :fci, :lco, DATETIME('now', 'localtime'), DATETIME('now', 'localtime'))
                ON CONFLICT(employee_id, date) DO UPDATE SET 
                total_working_hours = :twh,
                status = :st,
                first_clock_in = :fci,
                last_clock_out = :lco,
                updated_at = DATETIME('now', 'localtime')
            ");
        }
        
        $summaryStmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $summaryStmt->bindParam(':ename', $employeeName);
        $summaryStmt->bindParam(':d', $date);
        $summaryStmt->bindParam(':twh', $totalWorkingHours);
        $summaryStmt->bindParam(':st', $status);
        $summaryStmt->bindParam(':fci', $firstClockIn);
        $summaryStmt->bindParam(':lco', $lastClockOut);
        
        $summaryStmt->execute();

        return $totalWorkingHours;
        
    } catch (PDOException $e) {
        logError('Update daily summary error', ['error' => $e->getMessage(), 'employee_id' => $employeeId, 'date' => $date]);
        return 0;
    }
}

function createAttendanceEntry($db, $input) {
    if (!isset($input['employee_id'], $input['date'], $input['time'], $input['entry_type'])) {
        sendResponse(false, 'Employee ID, date, time and entry type are required');
    }

    $employeeId = (int)$input['employee_id'];
    $date = validateInput($input['date']);
    $time = validateInput($input['time']);
    $entryType = validateInput($input['entry_type']);
    $sessionId = isset($input['session_id']) ? validateInput($input['session_id']) : uniqid('session_', true);
    $notes = isset($input['notes']) ? validateInput($input['notes']) : null;
    
    // Authorization Check: already done in switch-case mostly, but double check
    global $userId, $userRole;
    if ($userRole !== 'admin' && $employeeId !== $userId) {
        sendResponse(false, 'Unauthorized');
    }

    if (!validateDate($date)) {
        sendResponse(false, 'Invalid date format. Use YYYY-MM-DD');
    }

    if (!in_array($entryType, ['in', 'out'])) {
        sendResponse(false, 'Entry type must be "in" or "out"');
    }

    try {
        $userStmt = $db->prepare("SELECT name FROM users WHERE id = :id");
        $userStmt->bindParam(':id', $employeeId, PDO::PARAM_INT);
        $userStmt->execute();
        
        if ($userStmt->rowCount() === 0) {
            sendResponse(false, 'Employee not found');
        }
        
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        $employeeName = $user['name'];

        $stmt = $db->prepare("INSERT INTO attendance 
                             (employee_id, employee_name, date, time, entry_type, session_id, notes) 
                             VALUES (:eid, :ename, :d, :t, :etype, :sid, :notes)");
        $stmt->bindParam(':eid', $employeeId, PDO::PARAM_INT);
        $stmt->bindParam(':ename', $employeeName);
        $stmt->bindParam(':d', $date);
        $stmt->bindParam(':t', $time);
        $stmt->bindParam(':etype', $entryType);
        $stmt->bindParam(':sid', $sessionId);
        $stmt->bindParam(':notes', $notes);

        if ($stmt->execute()) {
            updateDailySummary($db, $employeeId, $employeeName, $date);
            logError('Manual attendance entry created', ['employee_id' => $employeeId, 'date' => $date]);
            sendResponse(true, 'Attendance entry created successfully');
        } else {
            sendResponse(false, 'Failed to create attendance entry');
        }
    } catch (PDOException $e) {
        logError('Create attendance entry error', ['error' => $e->getMessage(), 'employee_id' => $employeeId]);
        sendResponse(false, 'Failed to create attendance entry');
    }
}
?>
