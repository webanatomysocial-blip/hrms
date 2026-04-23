<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

echo "Starting data cleanup...\n";

try {
    // Cleanup Users table
    $users = $db->query("SELECT id, name, department, position FROM users")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($users as $user) {
        $newName = html_entity_decode($user['name'], ENT_QUOTES, 'UTF-8');
        $newDept = html_entity_decode($user['department'], ENT_QUOTES, 'UTF-8');
        $newPos = html_entity_decode($user['position'], ENT_QUOTES, 'UTF-8');
        
        if ($newName !== $user['name'] || $newDept !== $user['department'] || $newPos !== $user['position']) {
            $stmt = $db->prepare("UPDATE users SET name = :name, department = :dept, position = :pos WHERE id = :id");
            $stmt->execute([
                ':name' => $newName,
                ':dept' => $newDept,
                ':pos' => $newPos,
                ':id' => $user['id']
            ]);
            echo "Updated User ID {$user['id']}\n";
        }
    }

    // Cleanup Daily Attendance Summary table
    $summaries = $db->query("SELECT id, employee_name FROM daily_attendance_summary")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($summaries as $summary) {
        $newName = html_entity_decode($summary['employee_name'], ENT_QUOTES, 'UTF-8');
        if ($newName !== $summary['employee_name']) {
            $stmt = $db->prepare("UPDATE daily_attendance_summary SET employee_name = :name WHERE id = :id");
            $stmt->execute([
                ':name' => $newName,
                ':id' => $summary['id']
            ]);
            echo "Updated Summary ID {$summary['id']}\n";
        }
    }

    // Cleanup Attendance table
    $attendance = $db->query("SELECT id, employee_name FROM attendance")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($attendance as $entry) {
        $newName = html_entity_decode($entry['employee_name'], ENT_QUOTES, 'UTF-8');
        if ($newName !== $entry['employee_name']) {
            $stmt = $db->prepare("UPDATE attendance SET employee_name = :name WHERE id = :id");
            $stmt->execute([
                ':name' => $newName,
                ':id' => $entry['id']
            ]);
            echo "Updated Attendance ID {$entry['id']}\n";
        }
    }

    echo "Cleanup finished successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
