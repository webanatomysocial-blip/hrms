<?php
// Production Error Handling
error_reporting(0);
ini_set('display_errors', 0);
/**
 * CORS handling - MUST be at the very top
 */
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (!empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');
session_start();


/**
 * Basic .env parser
 */
function loadEnv($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $_ENV[trim($parts[0])] = trim($parts[1]);
            putenv(sprintf('%s=%s', trim($parts[0]), trim($parts[1])));
        }
    }
}
loadEnv(__DIR__ . '/../.env');

// Define JWT Secret (read from env or fallback)
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'KaphiMosol9_HRMS_Secret_Key_2026_Secure!!');


class Database {
    private $conn;

    public function getConnection() {
        $this->conn = null;
        
        $dbType = getenv('DB_TYPE') ?: 'sqlite';
        $dbHost = getenv('DB_HOST') ?: 'localhost';
        $dbName = getenv('DB_NAME') ?: 'hrms';
        $dbUser = getenv('DB_USER') ?: 'root';
        $dbPass = getenv('DB_PASS') ?: '';
        $dbFile = __DIR__ . '/database.db';

        try {
            if ($dbType === 'mysql') {
                $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
                $this->conn = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } else {
                $this->conn = new PDO(
                    "sqlite:" . $dbFile,
                    null,
                    null,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
                // Enable foreign keys for SQLite
                $this->conn->exec("PRAGMA foreign_keys = ON;");
            }
        } catch(PDOException $exception) {
            error_log('Database connection error: ' . $exception->getMessage());
            sendResponse(false, 'Database connection failed. Please ensure your .env configuration is correct.');
            exit();
        }

        return $this->conn;
    }
}

/**
 * Send standardized JSON response
 */
function sendResponse($success, $message, $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    http_response_code($success ? 200 : 400); // Simple status code approach
    echo json_encode($response);
    exit();
}

/**
 * Sanitize and validate input
 */
function validateInput($data) {
    if ($data === null) {
        return null;
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Get Bearer token from Authorization header
 */
function getBearerToken() {
    $headers = null;
    
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(
            array_map('ucwords', array_keys($requestHeaders)), 
            array_values($requestHeaders)
        );
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    // Extract token from "Bearer <token>" format
    if (!empty($headers)) {
        if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

/**
 * Base64Url Encode
 */
function base64UrlEncode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

/**
 * Generate Secure JWT Token
 */
function generateJWT($userId, $role = 'employee') {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'sub' => $userId,
        // 'role' => $role, // Can add role if needed
        'iat' => time(),
        'exp' => time() + (86400 * 7) // Valid for 7 days
    ]);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify JWT Token and return User ID
 */
function verifyBearerToken() {
    $token = getBearerToken();
    if (!$token) return null;

    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    $header = $parts[0];
    $payload = $parts[1];
    $signatureProvided = $parts[2];

    // Re-create signature
    $signature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
    $base64UrlSignature = base64UrlEncode($signature);

    // Verify signature
    if (!hash_equals($base64UrlSignature, $signatureProvided)) {
        return null;
    }

    // Verify Expiration
    $payloadData = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    if (!isset($payloadData['exp']) || $payloadData['exp'] < time()) {
        return null; // Expired
    }

    return isset($payloadData['sub']) ? $payloadData['sub'] : null;
}

/**
 * Validate email format
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

/**
 * Log errors to file
 */
function logError($message, $context = []) {
    $logFile = __DIR__ . '/logs/error.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? json_encode($context) : '';
    $logMessage = "[$timestamp] $message $contextStr" . PHP_EOL;
    
    error_log($logMessage, 3, $logFile);
}

// Set timezone
date_default_timezone_set('Asia/Kolkata');
?>
