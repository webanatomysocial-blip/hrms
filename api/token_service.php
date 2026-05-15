<?php
/**
 * Token Service (Access + Refresh Tokens)
 */
class TokenService {
    private $db;
    private $secret;

    public function __construct($db) {
        $this->db = $db;
        $this->secret = JWT_SECRET;
    }

    public function generateAccessToken($userId, $role) {
        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $this->base64UrlEncode(json_encode([
            'sub' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + 900 // 15 minutes
        ]));

        $signature = $this->base64UrlEncode(hash_hmac('sha256', "$header.$payload", $this->secret, true));
        return "$header.$payload.$signature";
    }

    public function generateRefreshToken($userId) {
        if (function_exists('random_bytes')) {
            $token = bin2hex(random_bytes(32));
        } elseif (function_exists('openssl_random_pseudo_bytes')) {
            $token = bin2hex(openssl_random_pseudo_bytes(32));
        } else {
            $token = bin2hex(md5(uniqid(mt_rand(), true)));
        }
        $tokenHash = hash('sha256', $token);
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 30)); // 30 days

        $query = "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindParam(':token', $tokenHash);
        $stmt->bindParam(':expires_at', $expiresAt);
        $stmt->execute();

        return $token;
    }

    public function verifyRefreshToken($token) {
        $tokenHash = hash('sha256', $token);
        $query = "SELECT user_id, revoked, expires_at FROM refresh_tokens WHERE token = :token";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':token', $tokenHash);
        $stmt->execute();
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$record) return null;
        if ($record['revoked']) return null;
        if (strtotime($record['expires_at']) < time()) return null;

        return $record['user_id'];
    }

    public function rotateRefreshToken($oldToken) {
        $userId = $this->verifyRefreshToken($oldToken);
        if (!$userId) return null;

        // Revoke old token
        $this->revokeRefreshToken($oldToken);

        // Generate new token
        return $this->generateRefreshToken($userId);
    }

    public function revokeRefreshToken($token) {
        $tokenHash = hash('sha256', $token);
        $query = "UPDATE refresh_tokens SET revoked = 1 WHERE token = :token";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':token', $tokenHash);
        $stmt->execute();
    }

    private function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }
}
?>
