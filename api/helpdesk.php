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
        if (isset($_GET['ticket_id'])) {
            getTicketMessages($db, $_GET['ticket_id'], $userId, $role);
        } else {
            getTickets($db, $userId, $role);
        }
        break;
    case 'POST':
        if (isset($_GET['action']) && $_GET['action'] === 'message') {
            addTicketMessage($db, $userId, $input);
        } else {
            createTicket($db, $userId, $input);
        }
        break;
    case 'PUT':
        updateTicketStatus($db, $_GET['id'] ?? null, $role, $input);
        break;
    case 'DELETE':
        deleteTicket($db, $_GET['id'] ?? null, $role);
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

function getTickets($db, $userId, $role) {
    try {
        if ($role === 'admin' || $role === 'manager') {
            $query = "SELECT t.*, u.name as employee_name FROM help_desk_tickets t 
                      LEFT JOIN users u ON t.employee_id = u.id 
                      ORDER BY t.created_at DESC";
            $stmt = $db->prepare($query);
        } else {
            $query = "SELECT t.*, u.name as employee_name FROM help_desk_tickets t 
                      LEFT JOIN users u ON t.employee_id = u.id 
                      WHERE t.employee_id = :user_id
                      ORDER BY t.created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':user_id', $userId);
        }
        $stmt->execute();
        $data = $stmt->fetchAll();
        sendResponse(true, 'Tickets fetched', $data);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to fetch tickets: ' . $e->getMessage());
    }
}

function getTicketMessages($db, $ticketId, $userId, $role) {
    try {
        // Verification: ensure the user owns the ticket or is an admin
        if ($role !== 'admin' && $role !== 'manager') {
            $check = $db->prepare("SELECT id FROM help_desk_tickets WHERE id = :ticket_id AND employee_id = :user_id");
            $check->bindParam(':ticket_id', $ticketId);
            $check->bindParam(':user_id', $userId);
            $check->execute();
            if (!$check->fetch()) {
                sendResponse(false, 'Forbidden. You do not own this ticket.');
                return;
            }
        }

        $query = "SELECT m.*, u.name as sender_name FROM help_desk_messages m
                  LEFT JOIN users u ON m.sender_id = u.id
                  WHERE m.ticket_id = :ticket_id
                  ORDER BY m.created_at ASC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':ticket_id', $ticketId);
        $stmt->execute();
        $data = $stmt->fetchAll();
        sendResponse(true, 'Messages fetched', $data);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to fetch messages: ' . $e->getMessage());
    }
}

function createTicket($db, $userId, $input) {
    $subject = $input['subject'] ?? '';
    $description = $input['description'] ?? '';
    $priority = $input['priority'] ?? 'medium';
    $category = $input['category'] ?? 'general';

    if (empty($subject) || empty($description)) {
        sendResponse(false, 'Subject and description are required');
    }

    try {
        $query = "INSERT INTO help_desk_tickets (employee_id, subject, description, priority, category) 
                  VALUES (:employee_id, :subject, :description, :priority, :category)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':employee_id', $userId);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':priority', $priority);
        $stmt->bindParam(':category', $category);

        if ($stmt->execute()) {
            $ticketId = $db->lastInsertId();
            sendResponse(true, 'Ticket created successfully', ['id' => $ticketId]);
        } else {
            sendResponse(false, 'Failed to create ticket');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to create ticket: ' . $e->getMessage());
    }
}

function addTicketMessage($db, $userId, $input) {
    $ticketId = $input['ticket_id'] ?? '';
    $message = $input['message'] ?? '';

    if (empty($ticketId) || empty($message)) {
        sendResponse(false, 'Ticket ID and message are required');
    }

    try {
        $query = "INSERT INTO help_desk_messages (ticket_id, sender_id, message) 
                  VALUES (:ticket_id, :sender_id, :message)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':ticket_id', $ticketId);
        $stmt->bindParam(':sender_id', $userId);
        $stmt->bindParam(':message', $message);

        if ($stmt->execute()) {
            sendResponse(true, 'Message added successfully');
        } else {
            sendResponse(false, 'Failed to add message');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to add message: ' . $e->getMessage());
    }
}

function updateTicketStatus($db, $ticketId, $role, $input) {
    if ($role !== 'admin' && $role !== 'manager') {
        sendResponse(false, 'Forbidden. Requires admin privileges.');
    }

    $status = $input['status'] ?? '';
    if (empty($ticketId) || empty($status)) {
        sendResponse(false, 'Ticket ID and status are required');
    }

    try {
        $query = "UPDATE help_desk_tickets SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $ticketId);

        if ($stmt->execute()) {
            sendResponse(true, 'Ticket updated successfully');
        } else {
            sendResponse(false, 'Failed to update ticket');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update ticket: ' . $e->getMessage());
    }
}

function deleteTicket($db, $ticketId, $role) {
    if ($role !== 'admin') {
        sendResponse(false, 'Forbidden. Requires admin privileges.');
    }

    if (!$ticketId) {
        sendResponse(false, 'Ticket ID is required');
    }

    try {
        // Delete messages first
        $msgStmt = $db->prepare("DELETE FROM help_desk_messages WHERE ticket_id = :id");
        $msgStmt->bindParam(':id', $ticketId);
        $msgStmt->execute();

        // Delete ticket
        $query = "DELETE FROM help_desk_tickets WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $ticketId);

        if ($stmt->execute()) {
            sendResponse(true, 'Ticket deleted successfully');
        } else {
            sendResponse(false, 'Failed to delete ticket');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete ticket: ' . $e->getMessage());
    }
}
?>
