<html>
<body>

<?php

/* Get the name of the uplaod file */
$filename = $_FILES['file']['name'];

/* Choose where to save the uplaoded file */
$location = "images/".$filename;

/* Save the uploaded file to the local filesystem */
if( move_uploaded_file($_FILES['file']['tmp_name'], $location)){
	echo '<p> File uploaded successfully! </p>';
}	else{
	echo '<p> Error uploading file. </p>';
}
	


?>

</body>
</html>