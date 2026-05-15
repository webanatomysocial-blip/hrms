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
        getAnnouncements($db);
        break;
    case 'POST':
        if ($role !== 'admin') {
            sendResponse(false, 'Forbidden. Requires admin privileges.');
        }
        createAnnouncement($db, $userId, $input);
        break;
    case 'DELETE':
        if ($role !== 'admin') {
            sendResponse(false, 'Forbidden. Requires admin privileges.');
        }
        deleteAnnouncement($db, $_GET['id'] ?? null);
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getAnnouncements($db) {
    try {
        $query = "SELECT a.*, u.name as author_name FROM announcements a 
                  LEFT JOIN users u ON a.created_by = u.id 
                  ORDER BY a.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $data = $stmt->fetchAll();
        sendResponse(true, 'Announcements fetched', $data);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to fetch announcements: ' . $e->getMessage());
    }
}

function createAnnouncement($db, $userId, $input) {
    $title = $input['title'] ?? '';
    $content = $input['content'] ?? '';

    if (empty($title) || empty($content)) {
        sendResponse(false, 'Title and content are required');
    }

    try {
        $query = "INSERT INTO announcements (title, content, created_by) VALUES (:title, :content, :created_by)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':created_by', $userId);

        if ($stmt->execute()) {
            sendResponse(true, 'Announcement created successfully');
        } else {
            sendResponse(false, 'Failed to create announcement');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to create announcement: ' . $e->getMessage());
    }
}

function deleteAnnouncement($db, $id) {
    if (!$id) {
        sendResponse(false, 'Announcement ID is required');
    }

    try {
        $query = "DELETE FROM announcements WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);

        if ($stmt->execute()) {
            sendResponse(true, 'Announcement deleted successfully');
        } else {
            sendResponse(false, 'Failed to delete announcement');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete announcement: ' . $e->getMessage());
    }
}
?>
