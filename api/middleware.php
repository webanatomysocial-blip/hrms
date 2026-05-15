<?php
/**
 * Middleware Utility
 */
class Middleware {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Rate Limiting
     */
    public function rateLimit($rateKey, $maxAttempts = 5, $decayMinutes = 15) {
        $now = date('Y-m-d H:i:s');
        $expiresAt = date('Y-m-d H:i:s', time() + ($decayMinutes * 60));

        // Cleanup expired limits
        $this->db->exec("DELETE FROM rate_limits WHERE expires_at < '$now'");

        // Check current limit - ESCAPED `key` with backticks
        $query = "SELECT attempts, last_attempt, expires_at FROM rate_limits WHERE `key` = :key";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':key', $rateKey);
        $stmt->execute();
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($record) {
            if ($record['attempts'] >= $maxAttempts) {
                http_response_code(429);
                sendResponse(false, "Too many attempts. Please try again later.");
            }

            // Increment attempts - ESCAPED `key` with backticks
            $updateQuery = "UPDATE rate_limits SET attempts = attempts + 1, last_attempt = :now WHERE `key` = :key";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->bindParam(':now', $now);
            $updateStmt->bindParam(':key', $rateKey);
            $updateStmt->execute();
        } else {
            // Create new record - ESCAPED `key` with backticks
            $insertQuery = "INSERT INTO rate_limits (`key`, attempts, last_attempt, expires_at) 
                            VALUES (:key, 1, :now, :expires_at)";
            $insertStmt = $this->db->prepare($insertQuery);
            $insertStmt->bindParam(':key', $rateKey);
            $insertStmt->bindParam(':now', $now);
            $insertStmt->bindParam(':expires_at', $expiresAt);
            $insertStmt->execute();
        }
    }

    /**
     * Role-Based Access Control
     */
    public function authorize($allowedRoles = []) {
        $token = getBearerToken();
        if (!$token) {
            http_response_code(401);
            sendResponse(false, 'Unauthorized. Token missing.');
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            http_response_code(401);
            sendResponse(false, 'Unauthorized. Invalid token format.');
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        
        if (!isset($payload['exp']) || $payload['exp'] < time()) {
            http_response_code(401);
            sendResponse(false, 'Unauthorized. Token expired.');
        }

        if (!isset($payload['sub']) || !isset($payload['role'])) {
            http_response_code(401);
            sendResponse(false, 'Unauthorized. Invalid token payload.');
        }

        if (!empty($allowedRoles) && !in_array($payload['role'], $allowedRoles)) {
            http_response_code(403);
            sendResponse(false, 'Forbidden. Insufficient permissions.');
        }

        return $payload['sub'];
    }

    /**
     * Permission-Based Access Control
     */
    public function checkPermission($permission) {
        $userId = $this->authorize();
        $query = "SELECT role, permissions FROM users WHERE id = :id AND active = 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(401);
            sendResponse(false, 'Unauthorized. User not found.');
        }

        if ($user['role'] === 'admin') return $userId;

        $permissions = json_decode($user['permissions'], true) ?: [];
        if (!in_array($permission, $permissions)) {
            http_response_code(403);
            sendResponse(false, "Forbidden. Missing required permission: $permission");
        }
        return $userId;
    }
}
