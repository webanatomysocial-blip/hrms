<?php
$hash = '$2y$12$TV1aZ/Hfc8OK3zdcTSt2EuGkR3sPlalKOoHhCtRePuW7xEbz8NoXG';
$password = '123456';

if (password_verify($password, $hash)) {
    echo "Password MATCHES\n";
} else {
    echo "Password does NOT match\n";
}
