<?php
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);
echo "Hash: " . $hash . "\n";
echo "Verify: " . (password_verify($password, $hash) ? 'Success' : 'Failure') . "\n";
?>
