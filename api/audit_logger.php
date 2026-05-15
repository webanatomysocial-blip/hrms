<?php
/**
 * Audit Logger
 */
class AuditLogger {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function log($userId, $action, $context = []) {
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
        
        // Add user-agent to context
        $context['user_agent'] = $userAgent;
        $contextStr = json_encode($context);
        
        // Standardize Timezone to UTC for storage
        $now = (DB_TYPE === 'mysql') ? "UTC_TIMESTAMP()" : "DATETIME('now')";

        try {
            $query = "INSERT INTO audit_logs (user_id, action, ip_address, context, created_at) 
                      VALUES (:user_id, :action, :ip, :context, $now)";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':ip', $ipAddress);
            $stmt->bindParam(':context', $contextStr);
            $stmt->execute();
        } catch (PDOException $e) {
            // Log to file if DB fails
            logError('Audit log failed', ['error' => $e->getMessage(), 'user_id' => $userId, 'action' => $action]);
        }
    }
}
?>
