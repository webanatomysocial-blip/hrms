<?php
require_once 'api/db.php';
$database = new Database();
$db = $database->getConnection();

if (getenv('DB_TYPE') === 'mysql') {
    $stmt = $db->query("SHOW CREATE TABLE daily_attendance_summary");
    print_r($stmt->fetch());
} else {
    $stmt = $db->query("SELECT sql FROM sqlite_master WHERE type='table' AND name='daily_attendance_summary'");
    print_r($stmt->fetch());
    
    $stmt = $db->query("PRAGMA index_list(daily_attendance_summary)");
    print_r($stmt->fetchAll());
}
?>
