<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

$token = getBearerToken();
if (!$token) sendResponse(false, 'Unauthorized');
$userId = verifyBearerToken();
if (!$userId) sendResponse(false, 'Invalid token');

// Fetch user role
$roleStmt = $db->prepare("SELECT role FROM users WHERE id = :id");
$roleStmt->bindParam(':id', $userId, PDO::PARAM_INT);
$roleStmt->execute();
$role = $roleStmt->fetchColumn();

switch ($method) {
    case 'GET':
        getExpenses($db, $userId, $role);
        break;
    case 'POST':
        if (!empty($_POST)) {
            $input = $_POST;
        }
        submitExpense($db, $userId, $input);
        break;
    case 'PUT':
        if (isset($_GET['action']) && $_GET['action'] === 'approve') {
            if ($role !== 'admin' && $role !== 'manager') {
                sendResponse(false, 'Forbidden. Requires admin/manager privileges.');
            }
            approveExpense($db, $_GET['id'] ?? null, $input);
        } else {
            updateExpense($db, $_GET['id'] ?? null, $input);
        }
        break;
    case 'DELETE':
        deleteExpense($db, $_GET['id'] ?? null, $userId, $role);
        break;
    default:
        sendResponse(false, 'Method not allowed');
}


function getExpenses($db, $userId, $role) {
    try {
        if ($role === 'admin' || $role === 'manager') {
            $query = "SELECT e.*, u.name as employee_name FROM expenses e 
                      JOIN users u ON e.employee_id = u.id ORDER BY e.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
        } else {
            $query = "SELECT * FROM expenses WHERE employee_id = :eid ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute([':eid' => $userId]);
        }
        $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        sendResponse(true, 'Expenses retrieved successfully', $expenses);
    } catch (PDOException $e) {
        sendResponse(false, 'Database failure');
    }
}

function submitExpense($db, $userId, $input) {
    // Defensive Schema Upgrade
    try {
        $db->exec("ALTER TABLE expenses ADD COLUMN attachment_path VARCHAR(255) DEFAULT NULL");
    } catch (PDOException $e) {
        // column likely exists
    }

    if (!isset($input['title']) || !isset($input['amount']) || !isset($input['date'])) {
        sendResponse(false, 'Missing required parameters');
    }

    $attachmentPath = null;
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['attachment']['tmp_name'];
        $fileName = $_FILES['attachment']['name'];
        $fileNameCmps = explode(".", $fileName);
        $fileExtension = strtolower(end($fileNameCmps));
        
        $allowedExts = ['pdf', 'xlsx', 'xls', 'jpg', 'jpeg', 'png', 'docx', 'csv'];
        if (in_array($fileExtension, $allowedExts)) {
            $uploadDir = __DIR__ . '/uploads/expenses/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $destPath = $uploadDir . $newFileName;
            
            if (move_uploaded_file($fileTmpPath, $destPath)) {
                $attachmentPath = 'api/uploads/expenses/' . $newFileName;
            }
        } else {
            sendResponse(false, 'Invalid file extension. Allowed: PDF, Excel, Images.');
        }
    }

    try {
        $query = "INSERT INTO expenses (employee_id, title, amount, date, status, attachment_path) 
                  VALUES (:eid, :title, :amount, :date, 'pending', :path)";
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':eid' => $userId,
            ':title' => htmlspecialchars($input['title']),
            ':amount' => (float)$input['amount'],
            ':date' => $input['date'],
            ':path' => $attachmentPath
        ]);
        sendResponse(true, 'Expense submitted successfully', ['id' => $db->lastInsertId(), 'attachment_path' => $attachmentPath]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to submit expense claim');
    }
}

function approveExpense($db, $id, $input) {
    if (!$id || !isset($input['status'])) {
        sendResponse(false, 'Missing id or status');
    }

    $status = $input['status'];
    if (!in_array($status, ['approved', 'rejected'])) {
        sendResponse(false, 'Invalid status');
    }

    try {
        $query = "UPDATE expenses SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':status' => $status, ':id' => (int)$id]);
        sendResponse(true, "Expense claim $status successfully");
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update expense status');
    }
}
function updateExpense($db, $id, $input) {
    if (!$id) {
        sendResponse(false, 'Expense ID required');
    }

    try {
        $fields = [];
        $params = [':id' => (int)$id];

        if (isset($input['title'])) {
            $fields[] = "title = :title";
            $params[':title'] = htmlspecialchars($input['title']);
        }
        if (isset($input['amount'])) {
            $fields[] = "amount = :amount";
            $params[':amount'] = (float)$input['amount'];
        }
        if (isset($input['date'])) {
            $fields[] = "date = :date";
            $params[':date'] = $input['date'];
        }

        if (empty($fields)) {
            sendResponse(false, 'No fields to update');
        }

        $query = "UPDATE expenses SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $db->prepare($query);

        if ($stmt->execute($params)) {
             sendResponse(true, 'Expense updated successfully');
        } else {
             sendResponse(false, 'Failed to update expense');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update expense');
    }
}

function deleteExpense($db, $id, $userId, $role) {
    if (!$id) {
        sendResponse(false, 'Expense ID required');
    }

    try {
        // Employees can only delete their own unapproved expenses
        if ($role !== 'admin' && $role !== 'manager') {
            $query = "DELETE FROM expenses WHERE id = :id AND employee_id = :eid AND status != 'approved'";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => (int)$id, ':eid' => $userId]);
        } else {
            // Admin/Manager can delete any expense
            $query = "DELETE FROM expenses WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => (int)$id]);
        }

        if ($stmt->rowCount() > 0) {
            sendResponse(true, 'Expense deleted successfully');
        } else {
            sendResponse(false, 'Expense not found or cannot be deleted');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete expense');
    }
}
?>
