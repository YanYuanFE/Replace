<?php
	require 'config.php';
	$sql ="select * from data order by rand() limit 1"; //SQL语句



	$result = mysql_query($sql,$con); //查询
	if(!$result){
		die("Valid result!");
	}else{
		//循环从数据集取出数据
		$arr=array();
		while( $row = mysql_fetch_array($result) ){

		    array_push($arr,array("type"=>urlencode($row['type']),"detail"=>$row['detail'],"time"=>urlencode($row['time'])));
		}
		echo urldecode(json_encode($arr));
		// echo $callback.'('.json_encode($arr).')';
	}


?>