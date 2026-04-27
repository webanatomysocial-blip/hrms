<?php
require_once 'db.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Handle different actions
switch($method) {
    case 'POST':
        if (isset($_GET['action'])) {
            switch($_GET['action']) {
                case 'login':
                    login($db, $input);
                    break;
                case 'register':
                    register($db, $input);
                    break;
                case 'verify':
                    verifyTokenEndpoint($db);
                    break;
                case 'change-password':
                    changePassword($db, $input);
                    break;
                default:
                    sendResponse(false, 'Invalid action');
            }
        } else {
            sendResponse(false, 'No action specified');
        }
        break;
    default:
        sendResponse(false, 'Method not allowed');
}

/**
 * Login function
 */
function login($db, $input) {
    if (!isset($input['email']) || !isset($input['password'])) {
        sendResponse(false, 'Email and password are required');
    }

    $email = validateInput($input['email']);
    $password = $input['password'];

    // Validate email format
    if (!validateEmail($email)) {
        sendResponse(false, 'Invalid email format');
    }

    try {
        $query = "SELECT id, name, email, password, role, permissions, department, position, joining_date, created_at 
                  FROM users 
                  WHERE email = :email AND active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch();
        if ($user) {
            
            // ✅ FIXED: Verify password properly (Backdoor removed)
            if (password_verify($password, $user['password'])) {
                // Remove password from response
                unset($user['password']);
                
                // ✅ FIXED: Generate Secure JWT Token
                $token = generateJWT($user['id'], $user['role']);
                
                // Log successful login
                logError('User logged in successfully', ['user_id' => $user['id'], 'email' => $email]);
                
                // Parse permissions if present
                if (isset($user['permissions']) && $user['permissions']) {
                    $user['permissions'] = json_decode($user['permissions'], true) ?: [];
                } else {
                    $user['permissions'] = [];
                }

                sendResponse(true, 'Login successful', [
                    'user' => $user,
                    'token' => $token
                ]);
            } else {
                // Log failed login attempt
                logError('Failed login attempt - invalid password', ['email' => $email]);
                sendResponse(false, 'Invalid credentials');
            }
        } else {
            // Log failed login attempt
            logError('Failed login attempt - user not found', ['email' => $email]);
            sendResponse(false, 'Invalid credentials');
        }
    } catch(PDOException $e) {
        logError('Login database error', ['error' => $e->getMessage(), 'email' => $email]);
        sendResponse(false, 'Login failed. Please try again later.');
    }
}

/**
 * Register new user/employee
 */
function register($db, $input) {
    if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
        sendResponse(false, 'Name, email and password are required');
    }

    $name = validateInput($input['name']);
    $email = validateInput($input['email']);
    $password = password_hash($input['password'], PASSWORD_DEFAULT);
    $role = isset($input['role']) ? validateInput($input['role']) : 'employee';
    $department = isset($input['department']) ? validateInput($input['department']) : null;
    $position = isset($input['position']) ? validateInput($input['position']) : null;
    $joining_date = isset($input['joining_date']) ? $input['joining_date'] : date('Y-m-d');

    // Validate email format
    if (!validateEmail($email)) {
        sendResponse(false, 'Invalid email format');
    }

    // Validate date format
    if (!validateDate($joining_date)) {
        sendResponse(false, 'Invalid date format. Use YYYY-MM-DD');
    }

    // Validate role
    if (!in_array($role, ['admin', 'manager', 'employee'])) {
        sendResponse(false, 'Invalid role. Must be admin, manager or employee');
    }

    $permissions = isset($input['permissions']) ? json_encode($input['permissions']) : null;

    try {
        // Check if user already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            sendResponse(false, 'User already exists with this email');
        }

        $query = "INSERT INTO users (name, email, password, role, permissions, department, position, joining_date, active) 
                  VALUES (:name, :email, :password, :role, :permissions, :department, :position, :joining_date, 1)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':role', $role);
        $stmt->bindParam(':permissions', $permissions);
        $stmt->bindParam(':department', $department);
        $stmt->bindParam(':position', $position);
        $stmt->bindParam(':joining_date', $joining_date);

        if ($stmt->execute()) {
            $userId = $db->lastInsertId();
            logError('User registered successfully', ['user_id' => $userId, 'email' => $email]);
            sendResponse(true, 'User registered successfully', ['id' => $userId]);
        } else {
            sendResponse(false, 'Registration failed');
        }
    } catch(PDOException $e) {
        logError('Registration database error', ['error' => $e->getMessage(), 'email' => $email]);
        sendResponse(false, 'Registration failed. Please try again later.');
    }
}

/**
 * Verify Bearer token and return user data
 */
function verifyTokenEndpoint($db) {
    // ✅ FIXED: Use shared verification logic
    $userId = verifyBearerToken();
    
    if (!$userId) {
        sendResponse(false, 'Invalid or expired token');
    }
    
    try {
        $query = "SELECT id, name, email, role, permissions, department, position, joining_date, created_at 
                  FROM users 
                  WHERE id = :id AND active = 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $user = $stmt->fetch();
        if ($user) {
            // Parse permissions
            if (isset($user['permissions']) && $user['permissions']) {
                $user['permissions'] = json_decode($user['permissions'], true) ?: [];
            } else {
                $user['permissions'] = [];
            }
            sendResponse(true, 'Token valid', ['user' => $user]);
        } else {
            sendResponse(false, 'User not found or inactive');
        }
    } catch(PDOException $e) {
        logError('Token verification database error', ['error' => $e->getMessage(), 'user_id' => $userId]);
        sendResponse(false, 'Token verification failed');
    }
}

/**
 * Change user password
 */
function changePassword($db, $input) {
    // ✅ FIXED: Use shared verification logic
    $userId = verifyBearerToken();
    if (!$userId) {
        sendResponse(false, 'Invalid or expired token');
    }
    
    if (!isset($input['current_password']) || !isset($input['new_password'])) {
        sendResponse(false, 'Current password and new password are required');
    }
    
    $currentPassword = $input['current_password'];
    $newPassword = $input['new_password'];
    
    // Validate new password length
    if (strlen($newPassword) < 6) {
        sendResponse(false, 'New password must be at least 6 characters long');
    }
    
    try {
        // Get current password hash
        $query = "SELECT password FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        $user = $stmt->fetch();
        
        if (!$user) {
            sendResponse(false, 'User not found');
        }
        
        // Verify current password
        if (!password_verify($currentPassword, $user['password'])) {
            sendResponse(false, 'Current password is incorrect');
        }
        
        // Hash new password
        $newPasswordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        // Update password
        $now = (DB_TYPE === 'mysql') ? "NOW()" : "DATETIME('now', 'localtime')";
        $updateQuery = "UPDATE users SET password = :password, updated_at = $now WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':password', $newPasswordHash);
        $updateStmt->bindParam(':id', $userId, PDO::PARAM_INT);
        
        if ($updateStmt->execute()) {
            logError('Password changed successfully', ['user_id' => $userId]);
            sendResponse(true, 'Password changed successfully');
        } else {
            sendResponse(false, 'Failed to change password');
        }
        
    } catch(PDOException $e) {
        logError('Change password database error', ['error' => $e->getMessage(), 'user_id' => $userId]);
        sendResponse(false, 'Failed to change password. Please try again later.');
    }
}
?>
