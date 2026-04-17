<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Get user ID from token
$token = getBearerToken();
if (!$token) {
    sendResponse(false, 'Authentication required');
}

$userId = verifyBearerToken();
if (!$userId) {
    sendResponse(false, 'Invalid or expired token');
}

switch ($method) {
    case 'GET':
        getNotifications($db, $userId);
        break;
    case 'PUT':
        if (isset($_GET['id'])) {
            markAsRead($db, $_GET['id'], $userId);
        } elseif (isset($_GET['action']) && $_GET['action'] === 'mark-all-read') {
            markAllAsRead($db, $userId);
        } else {
            sendResponse(false, 'Invalid request');
        }
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteNotification($db, $_GET['id'], $userId);
        } else {
            sendResponse(false, 'Notification ID required');
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getNotifications($db, $userId) {
    try {
        $query = "SELECT * FROM notifications 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC 
                  LIMIT 50";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $notifications = $stmt->fetchAll();
        $unreadCount = count(array_filter($notifications, fn($n) => !$n['is_read']));
        
        sendResponse(true, 'Notifications retrieved successfully', [
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    } catch (PDOException $e) {
        logError('Get notifications error', ['error' => $e->getMessage(), 'user_id' => $userId]);
        sendResponse(false, 'Failed to retrieve notifications');
    }
}

function markAsRead($db, $notificationId, $userId) {
    try {
        $query = "UPDATE notifications 
                  SET is_read = 1 
                  WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $notificationId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendResponse(true, 'Notification marked as read');
        } else {
            sendResponse(false, 'Failed to update notification');
        }
    } catch (PDOException $e) {
        logError('Mark notification as read error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to update notification');
    }
}

function markAllAsRead($db, $userId) {
    try {
        $query = "UPDATE notifications 
                  SET is_read = 1 
                  WHERE user_id = :user_id AND is_read = 0";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendResponse(true, 'All notifications marked as read');
        } else {
            sendResponse(false, 'Failed to update notifications');
        }
    } catch (PDOException $e) {
        logError('Mark all as read error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to update notifications');
    }
}

function deleteNotification($db, $notificationId, $userId) {
    try {
        $query = "DELETE FROM notifications 
                  WHERE id = :id AND user_id = :user_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $notificationId, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            sendResponse(true, 'Notification deleted successfully');
        } else {
            sendResponse(false, 'Failed to delete notification');
        }
    } catch (PDOException $e) {
        logError('Delete notification error', ['error' => $e->getMessage()]);
        sendResponse(false, 'Failed to delete notification');
    }
}
?>
