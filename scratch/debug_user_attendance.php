<?php
require_once 'api/db.php';

$database = new Database();
$db = $database->getConnection();

$email = 'lahari.k@mosol9.in';

echo "Checking user: $email\n";

$stmt = $db->prepare("SELECT * FROM users WHERE email = :email");
$stmt->bindParam(':email', $email);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "User NOT found!\n";
} else {
    echo "User found:\n";
    print_r($user);
    
    $userId = $user['id'];
    echo "\nChecking attendance records for user ID $userId today...\n";
    
    $today = date('Y-m-d');
    $attStmt = $db->prepare("SELECT * FROM attendance WHERE employee_id = :eid AND date = :today ORDER BY id DESC");
    $attStmt->bindParam(':eid', $userId);
    $attStmt->bindParam(':today', $today);
    $attStmt->execute();
    $records = $attStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($records)) {
        echo "No attendance records found for today.\n";
    } else {
        echo "Found " . count($records) . " records for today:\n";
        print_r($records);
    }
}
