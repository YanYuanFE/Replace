<?php

     header("Content-type:application/json,charset=utf-8");
	//连接服务器
	$con = mysql_connect('127.0.0.1', 'root', '');


	if (!$con) {

	die ('连接数据库出错: ' . mysql_error());


	}

	mysql_query("set names 'utf8'"); //数据库输出编码

	mysql_select_db("freshdata",$con); //打开数据库



?>
