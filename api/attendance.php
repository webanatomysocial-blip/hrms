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
            
            // Authorization Check: Only Admin, Manager or the User themselves can view their attendance
            if ($userRole !== 'admin' && $userRole !== 'manager' && (int)$requestedEmployeeId !== (int)$userId) {
                sendResponse(false, 'Unauthorized access to employee data');
            }
            
            if (isset($_GET['summary'])) {
                getEmployeeAttendanceSummary($db, $requestedEmployeeId);
            } else {
                getEmployeeAttendance($db, $requestedEmployeeId);
            }
        } else {
            // If fetching global data
            if (isset($_GET['summary'])) {
                // ✅ ALLOW: Everyone can see the global summary for the dashboard
                getAllAttendanceSummary($db);
            } elseif ($userRole === 'admin' || $userRole === 'manager') {
                if (isset($_GET['sync_summaries'])) {
                    syncAllDailySummaries($db);
                } else {
                    getAllAttendance($db);
                }
            } else {
                // Employees see ONLY their own data for detailed logs
                getEmployeeAttendance($db, (int)$userId);
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
        
        $query = "SELECT s.*, u.role FROM daily_attendance_summary s
                  JOIN users u ON s.employee_id = u.id
                  WHERE u.role != 'admin'";
        $params = [];
        
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
                  ORDER BY date DESC, time DESC, id DESC 
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

        $now = (DB_TYPE === 'mysql') ? "NOW()" : "DATETIME('now', 'localtime')";
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
    // HARD CAP: If clocking out after 9 PM, record it as exactly 9 PM
    if ($currentTime > '21:00:00') {
        $currentTime = '21:00:00';
    }
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
                
                // CAP at 9:00 PM
                $actualClockOutTime = $entry['time'];
                if ($actualClockOutTime > '21:00:00') {
                    $actualClockOutTime = '21:00:00';
                }
                
                $clockOutTime = strtotime($date . ' ' . $actualClockOutTime);
                $sessionSeconds = $clockOutTime - $clockInTime;
                
                if ($sessionSeconds > 0) {
                    $totalWorkingSeconds += $sessionSeconds;
                }
                
                $lastClockOut = $actualClockOutTime;
                $currentClockIn = null;
            }
        }

        // AUTO CLOCK-OUT LOGIC:
        // If still clocked in and (it's a past date OR it's today after 9:00 PM)
        if ($currentClockIn !== null) {
            $today = date('Y-m-d');
            $currentTime = date('H:i:s');
            $ninePM = '21:00:00';
            
            if ($date < $today || ($date === $today && $currentTime >= $ninePM)) {
                $clockInTime = strtotime($date . ' ' . $currentClockIn);
                $clockOutTime = strtotime($date . ' ' . $ninePM);
                $sessionSeconds = $clockOutTime - $clockInTime;
                
                if ($sessionSeconds > 0) {
                    $totalWorkingSeconds += $sessionSeconds;
                }
                $lastClockOut = $ninePM;
                
                // Optional: We could actually INSERT an 'out' record here if we wanted it to be persistent
                // but updating the summary is often enough for reporting.
            }
        }

        $totalWorkingHours = round($totalWorkingSeconds / 3600, 2);
        
        // Determine status
        $status = 'present';
        
        // If they have worked less than 4 hours but have clocked out at least once today
        if ($totalWorkingHours > 0 && $totalWorkingHours < 4 && $lastClockOut !== null) {
            $status = 'half_day';
        }
        
        // Late takes precedence: if anyone comes after 9:15 they get late
        if ($firstClockIn && strtotime($firstClockIn) > strtotime('09:15:00')) {
            $status = 'late';
        }
        
        // If they are currently clocked in (lastClockOut is null) 
        // we keep the status as 'present' or 'late' as determined above
        if ($lastClockOut === null && $firstClockIn !== null) {
            // No changes needed, status is already 'present' or 'late'
        }


        if (DB_TYPE === 'mysql') {
            $summaryStmt = $db->prepare("
                INSERT INTO daily_attendance_summary 
                (employee_id, employee_name, date, total_working_hours, total_break_time, status, first_clock_in, last_clock_out, created_at, updated_at) 
                VALUES (:eid, :ename, :d, :twh, 0, :st, :fci, :lco, NOW(), NOW())
                ON DUPLICATE KEY UPDATE 
                total_working_hours = VALUES(total_working_hours),
                status = VALUES(status),
                first_clock_in = VALUES(first_clock_in),
                last_clock_out = VALUES(last_clock_out),
                updated_at = NOW()
            ");
        } else {
            $summaryStmt = $db->prepare("
                INSERT INTO daily_attendance_summary 
                (employee_id, employee_name, date, total_working_hours, total_break_time, status, first_clock_in, last_clock_out, created_at, updated_at) 
                VALUES (:eid, :ename, :d, :twh, 0, :st, :fci, :lco, DATETIME('now', 'localtime'), DATETIME('now', 'localtime'))
                ON CONFLICT(employee_id, date) DO UPDATE SET 
                total_working_hours = excluded.total_working_hours,
                status = excluded.status,
                first_clock_in = excluded.first_clock_in,
                last_clock_out = excluded.last_clock_out,
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

function syncAllDailySummaries($db) {
    try {
        $today = date('Y-m-d');
        // Get all unique employees who clocked in today
        $stmt = $db->prepare("SELECT DISTINCT employee_id, employee_name FROM attendance WHERE date = :today");
        $stmt->bindParam(':today', $today);
        $stmt->execute();
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $synced = 0;
        foreach ($employees as $emp) {
            updateDailySummary($db, $emp['employee_id'], $emp['employee_name'], $today);
            $synced++;
        }
        
        sendResponse(true, "Successfully synced summary for $synced employees today.");
    } catch (PDOException $e) {
        logError('Sync daily summaries error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to sync daily summaries');
    }
}
?>
