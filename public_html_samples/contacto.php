<?php
// Cambia $to, y opcionalmente configura SMTP en el hosting
$to = "ventas@tudominio.cl";
$subject = "Contacto web";
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';
$body = "Nombre: $name\nEmail: $email\nMensaje:\n$message";
$headers = "From: no-reply@tudominio.cl\r\nReply-To: $email\r\n";
if (mail($to, $subject, $body, $headers)) {
  echo "OK";
} else {
  http_response_code(500);
  echo "ERROR";
}
?>
