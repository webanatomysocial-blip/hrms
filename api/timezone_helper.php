<?php
/**
 * Timezone Helper
 */
class TimezoneHelper {
    private static $localTimezone = 'Asia/Kolkata';

    public static function setLocalTimezone($tz) {
        self::$localTimezone = $tz;
    }

    public static function getUTCNow() {
        $date = new DateTime('now', new DateTimeZone('UTC'));
        return $date->format('Y-m-d H:i:s');
    }

    public static function convertToUTC($localTimeStr) {
        $date = new DateTime($localTimeStr, new DateTimeZone(self::$localTimezone));
        $date->setTimezone(new DateTimeZone('UTC'));
        return $date->format('Y-m-d H:i:s');
    }

    public static function convertToLocal($utcTimeStr) {
        $date = new DateTime($utcTimeStr, new DateTimeZone('UTC'));
        $date->setTimezone(new DateTimeZone(self::$localTimezone));
        return $date->format('Y-m-d H:i:s');
    }
}
?>
