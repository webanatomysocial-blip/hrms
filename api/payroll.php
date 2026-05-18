<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Verify admin/manager access
$token = getBearerToken();
if (!$token) sendResponse(false, 'Unauthorized');
$userId = verifyBearerToken();
if (!$userId) sendResponse(false, 'Invalid token');

// Check user role
$roleStmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$roleStmt->bindParam(':id', $userId, PDO::PARAM_INT);
$roleStmt->execute();
$role = $roleStmt->fetchColumn();

switch ($method) {
    case 'GET':
        if (isset($_GET['action']) && $_GET['action'] === 'my-salary') {
            getMySalary($db, $userId);
        } elseif (isset($_GET['action']) && $_GET['action'] === 'list-payslips') {
            listPayslips($db, $userId, $role);
        } else {
            sendResponse(false, 'Invalid action');
        }
        break;
    case 'POST':
        if ($role !== 'admin' && $role !== 'manager') {
            sendResponse(false, 'Forbidden. Admin access required.');
        }
        if (isset($_GET['action']) && $_GET['action'] === 'set-ctc') {
            setEmployeeCTC($db, $input);
        } elseif (isset($_GET['action']) && $_GET['action'] === 'generate-payslip') {
            generateMonthlyPayslip($db, $input);
        } else {
            sendResponse(false, 'Invalid action');
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function setEmployeeCTC($db, $input) {
    if (!isset($input['employee_id']) || !isset($input['ctc'])) {
        sendResponse(false, 'Missing required parameters');
    }

    $empId = (int)$input['employee_id'];
    $ctc = (float)$input['ctc'];

    // Excel Logic Breakdown
    $basic = $ctc * 0.50;
    $hra = $ctc * 0.25;
    $pf = $basic * 0.12;
    $special = $ctc - ($basic + $hra + $pf);

    try {
        $query = "INSERT INTO salary_structures (employee_id, ctc, basic, hra, special_allowance, pf_employee) 
                  VALUES (:eid, :ctc, :basic, :hra, :special, :pf)
                  ON DUPLICATE KEY UPDATE ctc=:ctc, basic=:basic, hra=:hra, special_allowance=:special, pf_employee=:pf";
        
        if (DB_TYPE === 'sqlite') {
            $query = "INSERT INTO salary_structures (employee_id, ctc, basic, hra, special_allowance, pf_employee) 
                      VALUES (:eid, :ctc, :basic, :hra, :special, :pf)
                      ON CONFLICT(employee_id) DO UPDATE SET ctc=:ctc, basic=:basic, hra=:hra, special_allowance=:special, pf_employee=:pf";
        }

        $stmt = $db->prepare($query);
        $stmt->execute([
            ':eid' => $empId,
            ':ctc' => $ctc,
            ':basic' => $basic,
            ':hra' => $hra,
            ':special' => $special,
            ':pf' => $pf
        ]);

        // Auto-generate past payslips from Jan 2026 to current month (only if they don't exist yet)
        $currentMonth = (int)date('m');
        if ($currentMonth < 1 || $currentMonth > 12) $currentMonth = 4; // fallback to April
        for ($m = 1; $m <= $currentMonth; $m++) {
            $check = $db->prepare("SELECT COUNT(*) FROM monthly_payroll WHERE employee_id = :eid AND month = :m AND year = 2026");
            $check->execute([':eid' => $empId, ':m' => $m]);
            if ($check->fetchColumn() == 0) {
                calculateAndSaveInternal($db, $empId, $m, 2026);
            }
        }

        sendResponse(true, 'CTC defined successfully. Forward intervals will reflect updates.', ['ctc' => $ctc]);
    } catch (PDOException $e) {
        sendResponse(false, 'Database failure: ' . $e->getMessage());
    }
}
function calculateAndSaveInternal($db, $empId, $month, $year, $ctcOverride = null) {
    try {
        // Defensive Schema Upgrade
        try {
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN ctc FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN monthly_gross FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN basic_monthly FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN hra_monthly FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN special_allowance FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN pf_deduction FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN pt_deduction FLOAT DEFAULT 0");
        } catch (PDOException $e) {
            // columns probably exist
        }

        $ctc = 0;
        $basic = 0;
        $hra = 0;
        $special = 0;
        $pf = 0;

        if ($ctcOverride !== null) {
            $ctc = (float)$ctcOverride;
            $basic = $ctc * 0.50;
            $hra = $ctc * 0.20;
            $allowances = $ctc * 0.05;
            $conveyance = 19200; // Annual
            $special = $ctc - ($basic + $hra + $allowances + $conveyance);
            $pf = 0;
        } else {
            // 1. Salary structure
            $salaryStmt = $db->prepare("SELECT ctc, basic, hra, special_allowance, pf_employee FROM salary_structures WHERE employee_id = :eid");
            $salaryStmt->execute([':eid' => $empId]);
            $salary = $salaryStmt->fetch(PDO::FETCH_ASSOC);
            if (!$salary) return false;

            $ctc = (float)$salary['ctc'];
            $basic = (float)$salary['basic'];
            $hra = (float)$salary['hra'];
            $special = (float)$salary['special_allowance'];
            $pf = (float)$salary['pf_employee'];
        }

        $monthlyGross = $ctc / 12;
        $basicMonthly = $basic / 12;
        $hraMonthly   = $hra / 12;
        $saMonthly    = $special / 12;
        $pfMonthly    = $pf / 12;


        $daysInMonth  = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $perDayWage   = $monthlyGross / $daysInMonth;
        $mPadded      = sprintf('%02d', $month);

        $params = [':eid' => $empId, ':y' => $year];
        if (DB_TYPE === 'sqlite') $params[':m_padded'] = $mPadded;
        else $params[':m'] = $month;

        // 2. LOP
        $lopQ = DB_TYPE === 'sqlite'
            ? "SELECT SUM(days) FROM leave_requests WHERE employee_id=:eid AND status='approved' AND is_unpaid=1 AND strftime('%m',start_date)=:m_padded AND strftime('%Y',start_date)=:y"
            : "SELECT SUM(days) FROM leave_requests WHERE employee_id=:eid AND status='approved' AND is_unpaid=1 AND MONTH(start_date)=:m AND YEAR(start_date)=:y";
        $lopStmt = $db->prepare($lopQ);
        $lopStmt->execute($params);
        $lopDays      = (float)($lopStmt->fetchColumn() ?? 0);
        $lopDeduction = round($lopDays * $perDayWage, 2);

        // 3. Absent days (this month)
        $absQ = DB_TYPE === 'sqlite'
            ? "SELECT COUNT(*) FROM daily_attendance_summary WHERE employee_id=:eid AND status='absent' AND strftime('%m',date)=:m_padded AND strftime('%Y',date)=:y"
            : "SELECT COUNT(*) FROM daily_attendance_summary WHERE employee_id=:eid AND status='absent' AND MONTH(date)=:m AND YEAR(date)=:y";
        $absStmt = $db->prepare($absQ);
        $absStmt->execute($params);
        $absentDays      = (int)($absStmt->fetchColumn() ?? 0);
        $absentDeduction = round($absentDays * $perDayWage, 2);

        // 4. Late marks (this month)
        $lateQ = DB_TYPE === 'sqlite'
            ? "SELECT COUNT(*) FROM daily_attendance_summary WHERE employee_id=:eid AND status='late' AND strftime('%m',date)=:m_padded AND strftime('%Y',date)=:y"
            : "SELECT COUNT(*) FROM daily_attendance_summary WHERE employee_id=:eid AND status='late' AND MONTH(date)=:m AND YEAR(date)=:y";
        $lateStmt = $db->prepare($lateQ);
        $lateStmt->execute($params);
        $lateCount      = (int)($lateStmt->fetchColumn() ?? 0);
        $lateDeduction  = round(floor($lateCount / 3) * $perDayWage, 2);

        // 5. Expenses approved: effect same month's pay
        $expQ = DB_TYPE === 'sqlite'
            ? "SELECT SUM(amount) FROM expenses WHERE employee_id=:eid AND status='approved' AND strftime('%m',date)=:m_padded AND strftime('%Y',date)=:y"
            : "SELECT SUM(amount) FROM expenses WHERE employee_id=:eid AND status='approved' AND MONTH(date)=:m AND YEAR(date)=:y";
        $expStmt = $db->prepare($expQ);
        $expStmt->execute($params);
        $reimbursement = round((float)($expStmt->fetchColumn() ?? 0), 2);

        // 6. Net Pay
        $ptDeduction = 200.00;
        $totalDeductions = $lopDeduction + $absentDeduction + $lateDeduction + $pfMonthly + $ptDeduction;
        $netPay          = round($monthlyGross - $totalDeductions + $reimbursement, 2);

        // 7. Upsert monthly_payroll (store full breakdown)
        $cols = "employee_id, month, year, lop_days, lop_deduction, absent_days, absent_deduction, late_count, late_deduction, expense_reimbursement, net_salary, ctc, monthly_gross, basic_monthly, hra_monthly, special_allowance, pf_deduction, pt_deduction";
        $vals = ":eid, :m, :y, :lop, :lop_ded, :abs, :abs_ded, :late, :late_ded, :exp, :net, :ctc, :gross, :basic, :hra, :special, :pf, :pt";
        $upd  = "lop_days=:lop, lop_deduction=:lop_ded, absent_days=:abs, absent_deduction=:abs_ded, late_count=:late, late_deduction=:late_ded, expense_reimbursement=:exp, net_salary=:net, ctc=:ctc, monthly_gross=:gross, basic_monthly=:basic, hra_monthly=:hra, special_allowance=:special, pf_deduction=:pf, pt_deduction=:pt";

        $payQ = DB_TYPE === 'sqlite'
            ? "INSERT INTO monthly_payroll ($cols) VALUES ($vals) ON CONFLICT(employee_id,month,year) DO UPDATE SET $upd"
            : "INSERT INTO monthly_payroll ($cols) VALUES ($vals) ON DUPLICATE KEY UPDATE $upd";

        $payStmt = $db->prepare($payQ);
        $payStmt->execute([
            ':eid'     => $empId, ':m' => $month, ':y' => $year,
            ':lop'     => $lopDays,    ':lop_ded'  => $lopDeduction,
            ':abs'     => $absentDays, ':abs_ded'  => $absentDeduction,
            ':late'    => $lateCount,  ':late_ded' => $lateDeduction,
            ':exp'     => $reimbursement,
            ':net'     => $netPay,
            ':ctc'     => $ctc,
            ':gross'   => $monthlyGross,
            ':basic'   => $basicMonthly,
            ':hra'     => $hraMonthly,
            ':special' => $saMonthly,
            ':pf'      => $pfMonthly,
            ':pt'      => $ptDeduction
        ]);
        return true;
    } catch (PDOException $e) {
        error_log('calculateAndSaveInternal error: ' . $e->getMessage());
        return false;
    }
}
function generateMonthlyPayslip($db, $input) {
    if (!isset($input['employee_id']) || !isset($input['month']) || !isset($input['year'])) {
        sendResponse(false, 'Missing employee_id, month, or year');
    }

    $empId = (int)$input['employee_id'];
    $month = (int)$input['month'];
    $year = (int)$input['year'];

    if (calculateAndSaveInternal($db, $empId, $month, $year)) {
        sendResponse(true, 'Payslip generated successfully');
    } else {
        sendResponse(false, 'Failed to calculate payslip parameters');
    }
}

function getMySalary($db, $userId) {
    try {
        $query = "SELECT ctc, basic, hra, special_allowance, pf_employee FROM salary_structures WHERE employee_id = :eid";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':eid', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) {
            sendResponse(true, 'No salary structure defined yet', ['ctc' => 0]);
        } else {
            sendResponse(true, 'Salary retrieved successfully', $record);
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Database failure');
    }
}
function listPayslips($db, $userId, $role) {
    try {
        // Defensive Schema Upgrade
        try {
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN ctc FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN monthly_gross FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN basic_monthly FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN hra_monthly FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN special_allowance FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN pf_deduction FLOAT DEFAULT 0");
            $db->exec("ALTER TABLE monthly_payroll ADD COLUMN pt_deduction FLOAT DEFAULT 0");
        } catch (PDOException $e) {
            // columns probably exist
        }

        // Automatically generate missing past payslips up to the PREVIOUS month
        $currentMonth = (int)date('m');
        $prevMonth = $currentMonth - 1;
        if ($prevMonth == 0) {
            $prevMonth = 12; // Wrap around to December
        }

        if ($role === 'admin' || $role === 'manager') {
            $empStmt = $db->prepare("SELECT employee_id FROM salary_structures");
            $empStmt->execute();
            $allEmps = $empStmt->fetchAll(PDO::FETCH_COLUMN);
            
            foreach ($allEmps as $eid) {
                // Generate from January (1) up to previous month
                for ($m = 1; $m <= $prevMonth; $m++) {
                    $check = $db->prepare("SELECT COUNT(*) FROM monthly_payroll WHERE employee_id = :eid AND month = :m AND year = 2026");
                    $check->execute([':eid' => (int)$eid, ':m' => $m]);
                    if ($check->fetchColumn() == 0) {
                        calculateAndSaveInternal($db, (int)$eid, $m, 2026);
                    }
                }
            }
        } else {
            for ($m = 1; $m <= $prevMonth; $m++) {
                $check = $db->prepare("SELECT COUNT(*) FROM monthly_payroll WHERE employee_id = :eid AND month = :m AND year = 2026");
                $check->execute([':eid' => (int)$userId, ':m' => $m]);
                if ($check->fetchColumn() == 0) {
                    calculateAndSaveInternal($db, (int)$userId, $m, 2026);
                }
            }
        }

        $curYear = (int)date('Y');
        $curMonth = (int)date('m');

        if ($role === 'admin' || $role === 'manager') {
            $query = "SELECT p.*, u.name as employee_name, u.department, u.position,
                             CASE WHEN p.ctc > 0 THEN p.ctc ELSE COALESCE(ss.ctc, 0) END as ctc,
                             CASE WHEN p.basic_monthly > 0 THEN p.basic_monthly * 12 ELSE COALESCE(ss.basic, 0) END as basic,
                             CASE WHEN p.hra_monthly > 0 THEN p.hra_monthly * 12 ELSE COALESCE(ss.hra, 0) END as hra,
                             CASE WHEN p.special_allowance > 0 THEN p.special_allowance * 12 ELSE COALESCE(ss.special_allowance, 0) END as special_allowance
                      FROM monthly_payroll p 
                      JOIN users u ON p.employee_id = u.id
                      LEFT JOIN salary_structures ss ON ss.employee_id = p.employee_id
                      WHERE p.year < :y OR (p.year = :y AND p.month < :m)
                      ORDER BY p.year DESC, p.month DESC";
            $stmt = $db->prepare($query);
            $stmt->execute([':y' => $curYear, ':m' => $curMonth]);
        } else {
            $query = "SELECT p.*, u.name as employee_name, u.department, u.position,
                             CASE WHEN p.ctc > 0 THEN p.ctc ELSE COALESCE(ss.ctc, 0) END as ctc,
                             CASE WHEN p.basic_monthly > 0 THEN p.basic_monthly * 12 ELSE COALESCE(ss.basic, 0) END as basic,
                             CASE WHEN p.hra_monthly > 0 THEN p.hra_monthly * 12 ELSE COALESCE(ss.hra, 0) END as hra,
                             CASE WHEN p.special_allowance > 0 THEN p.special_allowance * 12 ELSE COALESCE(ss.special_allowance, 0) END as special_allowance
                      FROM monthly_payroll p
                      LEFT JOIN salary_structures ss ON ss.employee_id = p.employee_id
                      LEFT JOIN users u ON u.id = p.employee_id
                      WHERE p.employee_id = :eid AND (p.year < :y OR (p.year = :y AND p.month < :m))
                      ORDER BY year DESC, month DESC";
            $stmt = $db->prepare($query);
            $stmt->execute([':eid' => $userId, ':y' => $curYear, ':m' => $curMonth]);
        }
        $payslips = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Compute derived values for each payslip
        foreach ($payslips as &$slip) {
            $ctc     = (float)($slip['ctc'] ?? 0);
            $monthly = $ctc / 12;
            $slip['monthly_gross']      = round($monthly, 2);
            $slip['basic_monthly']      = round((float)($slip['basic'] ?? 0) / 12, 2);
            $slip['hra_monthly']        = round((float)($slip['hra'] ?? 0) / 12, 2);
            $slip['special_monthly']    = round((float)($slip['special_allowance'] ?? 0) / 12, 2);
            $slip['pf_monthly']         = round((float)($slip['pf_employee'] ?? 0) / 12, 2);
            $slip['total_deductions']   = round(
                (float)($slip['lop_deduction'] ?? 0),
                2
            );
        }
        unset($slip);
        sendResponse(true, 'Payslips retrieved successfully', $payslips);
    } catch (PDOException $e) {
        sendResponse(false, 'Database failure: ' . $e->getMessage());
    }
}
?>
