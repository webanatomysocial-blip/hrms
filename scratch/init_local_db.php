<?php
// Set up SQLite database for local testing
$dbFile = __DIR__ . '/../database.db';
$schemaFile = __DIR__ . '/../api/schema.sql';

if (!file_exists($schemaFile)) {
    die("Schema file not found at $schemaFile\n");
}

try {
    $db = new PDO("sqlite:$dbFile");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read and execute schema
    $sql = file_get_contents($schemaFile);
    
    // Split SQL by semicolon to execute one by one (SQLite PDO doesn't like multiple statements in one exec for some reason)
    $statements = explode(';', $sql);
    foreach ($statements as $stmt) {
        $trimmed = trim($stmt);
        if (!empty($trimmed)) {
            $db->exec($trimmed);
        }
    }
    
    echo "Database schema initialized successfully.\n";

    // Add admin user
    $name = 'Admin';
    $email = 'admin@webanatomy.in';
    $password = password_hash('admin123', PASSWORD_DEFAULT);
    $role = 'admin';

    $stmt = $db->prepare("INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$name, $email, $password, $role]);
    
    echo "Admin user $email created successfully.\n";

} catch (PDOException $e) {
    die("Error: " . $e->getMessage() . "\n");
}
