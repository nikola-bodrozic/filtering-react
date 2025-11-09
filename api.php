<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// --- For CORS preflight ---
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$file = __DIR__ . '/users.json';

// --- Initialize file if missing ---
if (!file_exists($file)) {
    file_put_contents($file, json_encode([
        ["id" => 1, "name" => "Alice", "email" => "alice@mail.com"],
        ["id" => 2, "name" => "Bob", "email" => "bob@mail.com"]
    ], JSON_PRETTY_PRINT));
}

// --- Read current users ---
$users = json_decode(file_get_contents($file), true) ?? [];

// --- Helper: find index by id ---
function findUserIndex($users, $id) {
    foreach ($users as $i => $user) {
        if ($user['id'] == $id) return $i;
    }
    return -1;
}

// --- Handle GET (list all users) ---
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(["status" => "ok", "users" => $users]);
    exit;
}

// --- Read JSON body for POST requests ---
$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$type = $input['type'] ?? null;

switch ($type) {
    case "addUser":
        $newUser = $input['user'] ?? null;
        if (!$newUser) {
            echo json_encode(["error" => "Missing user data"]);
            exit;
        }
        $users[] = $newUser;
        break;

    case "updateUser":
        $id = $input['id'] ?? null;
        $field = $input['field'] ?? null;
        $value = $input['value'] ?? null;
        $i = findUserIndex($users, $id);
        if ($i === -1) {
            echo json_encode(["error" => "User not found"]);
            exit;
        }
        if (in_array($field, ["name", "email"])) {
            $users[$i][$field] = $value;
        }
        break;

    case "removeUser":
        $id = $input['id'] ?? null;
        $i = findUserIndex($users, $id);
        if ($i === -1) {
            echo json_encode(["error" => "User not found"]);
            exit;
        }
        array_splice($users, $i, 1);
        break;

    default:
        echo json_encode(["error" => "Unknown action type"]);
        exit;
}

// --- Save updated users to file ---
file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));

// --- Return updated list ---
echo json_encode(["status" => "ok", "users" => $users]);
?>
