<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'config.php';

// Handle CORS
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
// Allow credentials (if needed)
header('Access-Control-Allow-Credentials: true');
// Allow specific methods (e.g., POST)
header('Access-Control-Allow-Methods: POST');
// Allow specific headers (e.g., Content-Type)
header('Access-Control-Allow-Headers: Content-Type');

// Include the database connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    echo "{'connection error':'" . $conn->connect_error ."'}";
    die("Connection failed: " . $conn->connect_error);
}else{
    // echo "connected?";
}

// Function to update the title of a mattress record
function updateMattressTitle($conn, $uId, $title, $secretKey) {
    if ($secretKey !== 'weareworkingallthetime') {
        return json_encode(array("success" => 0, "info" => "Unauthorized access; key not found."));
        // return "{'success':0, 'info': 'Unauthorized access; key not found.'}";
        // return "{'result':0, 'error': 'Unauthorized access'}";
    }
    $existingTitle = getTitleByUid($conn, $uId); // You need to implement this function
    if ($existingTitle === $title) {
        // return "{'success':1, 'info': 'Mattress " + $uId + " already set to " + $title + ".'}";
        return json_encode(array("success" => 1, "info" => "Mattress " . $uId . " already set to '" . $title . "'"));
        // return "{'success':1, 'info': 'no changes'}";
    }
    // Prepare and execute a SQL query to update the title of the mattress record
    $sql = "UPDATE mattresses SET title = ? WHERE uId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $title, $uId); // Assuming uId is an integer
    $stmt->execute();

    // Check if the update was successful
    if ($stmt->affected_rows > 0) {
        // return "Title updated successfully";
        // return "{'result':1}";
        // return "{'success':1, 'info': 'Mattress id:" + $uId + " updated.'}";
        return json_encode(array("success" => 1, "info" => "Mattress id:" . $uId . " updated."));
    } else {
        // return "Error: Failed to update title";
        // return "{'success':0, 'info': 'Update failed.'}";
        return json_encode(array("success" => 0, "info" => "Update failed."));
    }
}
function getTitleByUid($conn, $uId) {
    // Prepare and execute a SQL query to retrieve the title of the mattress record by uId
    $sql = "SELECT title FROM mattresses WHERE uId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $uId); // Assuming uId is an integer
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch the title from the result set
    $row = $result->fetch_assoc();

    // Check if the query returned a row
    if ($row) {
        return $row['title'];
    } else {
        return null; // or handle appropriately if no title is found
    }
}

function sanitizeText($text) {
    // Remove leading and trailing whitespace
    $text = trim($text);
    
    // Convert special characters to HTML entities
    $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    
    // Optionally, you can apply additional sanitization steps as needed
    
    return $text;
}

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, TRUE); // Decode JSON data into associative array

// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($input['uId'], $input['title'], $input['secretKey'])) {
        // Get the uId and new title from the POST data
        $uId = $input['uId']; // Assuming the uId is provided via POST parameter
        $title = $input['title']; // Assuming the new title is provided via POST parameter
        $secretKey = $input['secretKey'];
        // Call the function to update the title
        $result = updateMattressTitle($conn, $uId, sanitizeText($title), $secretKey);
    
        // Output the result
        echo $result;
    }else{
        echo "{'error':'update failed'}";
    }
}

// Close connection
$conn->close();
?>