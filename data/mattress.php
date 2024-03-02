<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

/*
//config.php//
<?php
// Database connection details
define('DB_HOST', 'mysql.mattressminute.com');
define('DB_USER', 'xxx');
define('DB_PASSWORD', 'xxx');
define('DB_NAME', 'mattress_minute');
?>
*/


// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    echo "{'connection error':'" . $conn->connect_error ."'}";
    die("Connection failed: " . $conn->connect_error);
}else{
    // echo "connected?";
}
//*

// Function to fetch all entries
function getAllEntries($conn) {
    $sql = "SELECT * FROM mattresses";
    $result = $conn->query($sql);
    $entries = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $entries[] = $row;
        }
    }
    return $entries;
}
// Function to fetch a single entry by uId
function getEntryByUid($conn, $uId) {
    $sql = "SELECT * FROM mattresses WHERE uId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $uId);
    $stmt->execute();
    $result = $stmt->get_result();
    $entry = $result->fetch_assoc();
    return $entry;
}

function getMattressByOffset($conn, $uId, $offset, $needsTitle) {
    // Convert parameters to integers
    // $uId = intval($uId);
    // $offset = intval($offset);

    // Determine the direction (forward or backward)
    $direction = ($offset >= 0) ? 'ASC' : 'DESC';
    $offsetSize = abs($offset);
    // Prepare and execute a SQL query to select the mattress with the specified offset
    $sql = "";
    if($needsTitle==1){
        $sql = "SELECT * FROM mattresses WHERE uId " . ($offset >= 0 ? ">=" : "<=") . " ? AND title = '' ORDER BY uId $direction LIMIT 1 OFFSET ?";
    }else{
        $sql = "SELECT * FROM mattresses WHERE uId " . ($offset >= 0 ? ">=" : "<=") . " ? ORDER BY uId $direction LIMIT 1 OFFSET ?";
    }
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $uId, $offsetSize); // Use abs() to ensure positive offset value
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch the mattress from the result set
    $mattress = $result->fetch_assoc();

    if (!$mattress && $offset >= 0) {
        $sql = "SELECT * FROM mattresses ORDER BY uId ASC LIMIT 1";
        $result = $conn->query($sql);
        $mattress = $result->fetch_assoc();
    }
    // If no mattress is found and the offset is negative (backward), wrap around to the last mattress
    elseif (!$mattress && $offset < 0) {
        $sql = "SELECT * FROM mattresses ORDER BY uId DESC LIMIT 1";
        $result = $conn->query($sql);
        $mattress = $result->fetch_assoc();
    }
    // Return the mattress
    return $mattress;
}

function getMattressOffset($conn, $uId, $offset) {
    // Validate that the offset is a number
    if (!is_numeric($offset)) {
        // Handle the case where offset is not a number (e.g., return an error message)
        return "Error: Offset must be a number.";
    }

    // Convert the offset to an integer (optional, depending on your requirements)
    $offset = (int) $offset;

    // Determine the direction (forward or backward)
    $direction = ($offset >= 0) ? 'ASC' : 'DESC';

    // Prepare and execute a SQL query to select the adjacent mattress
    $sql = "SELECT * FROM mattresses WHERE uId ". ($offset >= 0 ? ">=" : "<=") ." ? ORDER BY uId $direction LIMIT 1 OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $uId, $offset); // Assuming uId is an integer
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch the adjacent mattress from the result set
    $adjacentMattress = $result->fetch_assoc();

    // If no adjacent mattress is found and the offset is positive (forward), wrap around to the first mattress
    if (!$adjacentMattress && $offset >= 0) {
        $sql = "SELECT * FROM mattresses ORDER BY uId ASC LIMIT 1";
        $result = $conn->query($sql);
        $adjacentMattress = $result->fetch_assoc();
    }
    // If no adjacent mattress is found and the offset is negative (backward), wrap around to the last mattress
    elseif (!$adjacentMattress && $offset < 0) {
        $sql = "SELECT * FROM mattresses ORDER BY uId DESC LIMIT 1";
        $result = $conn->query($sql);
        $adjacentMattress = $result->fetch_assoc();
    }

    // Return the adjacent mattress
    return $adjacentMattress;
}
function getMattressOffsetWithEmptyTitle($conn, $uId, $offset) {
    // Validate that the offset is a number
    if (!is_numeric($offset)) {
        // Handle the case where offset is not a number (e.g., return an error message)
        return "Error: Offset must be a number.";
    }

    // Convert the offset to an integer (optional, depending on your requirements)
    $offset = (int) $offset;

    // Determine the direction (forward or backward)
    $direction = ($offset >= 0) ? 'ASC' : 'DESC';

    // Prepare and execute a SQL query to select the adjacent mattress with an empty title
    $sql = "SELECT * FROM mattresses WHERE uId " . ($offset >= 0 ? ">=" : "<=") . " ? AND title = '' ORDER BY uId $direction LIMIT 1 OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $uId, $offset); // Assuming uId is an integer
    $stmt->execute();
    $result = $stmt->get_result();

    // Fetch the adjacent mattress from the result set
    $adjacentMattress = $result->fetch_assoc();

    // If no adjacent mattress with an empty title is found and the offset is positive (forward), wrap around to the first mattress with an empty title
    if (!$adjacentMattress && $offset >= 0) {
        $sql = "SELECT * FROM mattresses WHERE title = '' ORDER BY uId ASC LIMIT 1";
        $result = $conn->query($sql);
        $adjacentMattress = $result->fetch_assoc();
    }
    // If no adjacent mattress with an empty title is found and the offset is negative (backward), wrap around to the last mattress with an empty title
    elseif (!$adjacentMattress && $offset < 0) {
        $sql = "SELECT * FROM mattresses WHERE title = '' ORDER BY uId DESC LIMIT 1";
        $result = $conn->query($sql);
        $adjacentMattress = $result->fetch_assoc();
    }

    // Return the adjacent mattress with an empty title
    return $adjacentMattress;
}
function getRandomRecord($conn) {
    // Prepare and execute a SQL query to select a random record from the table
    $sql = "SELECT * FROM mattresses ORDER BY RAND() LIMIT 1";
    $result = $conn->query($sql);

    // Fetch the random record from the result set
    $randomRecord = $result->fetch_assoc();

    // Return the random record
    return $randomRecord;
}

//get a random
if(isset($_GET['random'])){
    $entry = getRandomRecord($conn);
    echo json_encode($entry);
    $conn->close();
    return;
}
if (isset($_GET['uId'])) {
    $uId = intval($_GET['uId']);
    //are we offsetting from that id?
    $needsTitle=0;
    if(isset($_GET['needsTitle'])){
        $needsTitle=$_GET['needsTitle'];
    }
    if (isset($_GET['idOffset'])){
        $offset = intval($_GET['idOffset']);
        if(!is_numeric($offset)){
            echo "{'error':'idOffset is not a number'}";
        }
        // if($needsTitle==1){
        //     $entry = getMattressOffsetWithEmptyTitle($conn, $uId, $offset);
        //     echo json_encode($entry);
        // }else{
        // }
        $entry = getMattressByOffset($conn, $uId, $offset, $needsTitle);
        echo json_encode($entry);
    }else{
        //get single uid
        $entry = getEntryByUid($conn, $uId);
        echo json_encode($entry);
    }
} else {
    //get all
    $entries = getAllEntries($conn);
    echo json_encode($entries);
}

// Close connection
$conn->close();
?>