<?php
// Production Error Handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/php_error.log');

// Global Exception Handler
set_exception_handler(function ($e) {
    error_log("Uncaught Exception: " . $e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Server Error: ' . $e->getMessage()]);
    exit;
});

/**
 * CORS handling
 */
header("Access-Control-Allow-Origin: *");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

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

// GLOBAL SECRET KEY
if (!defined('JWT_SECRET')) {
    define('JWT_SECRET', getenv('JWT_SECRET') ?: 'KaphiMosol9_HRMS_Secret_Key_2026_Secure!!');
}

class Database {
    private $conn;

    public function getConnection() {
        $dbType = getenv('DB_TYPE') ?: 'mysql';
        $dbHost = getenv('DB_HOST') ?: 'localhost';
        $dbName = getenv('DB_NAME');
        $dbUser = getenv('DB_USER');
        $dbPass = getenv('DB_PASS');
        
        if (!defined('DB_TYPE')) define('DB_TYPE', $dbType);

        try {
            if ($dbType === 'mysql') {
                $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
                $this->conn = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } else {
                $this->conn = new PDO("sqlite:" . __DIR__ . "/database.db");
            }
            return $this->conn;
        } catch(PDOException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
            exit;
        }
    }
}

function sendResponse($success, $message, $data = null) {
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data]);
    exit();
}

function getBearerToken() {
    $headers = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['Authorization'] ?? '';
    if (preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) return $matches[1];
    return null;
}

function verifyBearerToken() {
    $token = getBearerToken();
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    // Use the same secret as defined globally
    $secret = JWT_SECRET;
    
    $header = $parts[0];
    $payload = $parts[1];
    $signature = $parts[2];
    
    $validSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true)));
    
    if ($signature !== $validSignature) return null;
    
    $decodedPayload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    if (!$decodedPayload || (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time())) return null;
    
    return $decodedPayload['sub'] ?? null;
}

function validateInput($data) { return strip_tags(trim($data)); }
function validateEmail($email) { return filter_var($email, FILTER_VALIDATE_EMAIL); }
function validateDate($date, $format = 'Y-m-d') {
    $d = DateTime::createFromFormat($format, $date);
    return $d && $d->format($format) === $date;
}

function logError($message, $context = []) {
    $ctx = !empty($context) ? " | Context: " . json_encode($context) : "";
    error_log("[HRMS_LOG] " . $message . $ctx);
}

date_default_timezone_set('Asia/Kolkata');
