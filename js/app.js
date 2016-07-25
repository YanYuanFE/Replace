$(document).ready(function(){
	var $top=$(".page-head");
	var $body=$(".page-body");
	var $bg1=$(".svgBg-one");
	var $bg2=$(".svgBg-two");
	var $bg3=$(".svgBg-three");

	var $trees=[].slice.call(document.querySelectorAll(".svgTree"));
	var $treeParts=[].slice.call(document.querySelectorAll("svgTree-item"));

	var $leftTrees=$(".svgTree.svgTree-left");
	var $rightTrees=$(".svgTree.svgTree-right");
	var $planeRotater=$(".plane-wrapper");
	var $plane=$(".plane");
	var isDesktop=window.matchMedia("(min-width:769px)").matches;
	var topH=186;
	var bg1change,bg2change,bg3change;
	var bg1max=10;
	var bg2max=22;
	var bg3max=44;
	var pullDeltaY;
	var maxPullDeltaY=110;

	var treesData={};
	var treeMaxX=18;
	var treeMaxCoef=treeMaxX/maxPullDeltaY;
	var treeChange;
	//飞机旋转最大角度
	var planeMaxDeg=-45;
	var planeMaxCoef=planeMaxDeg/maxPullDeltaY;
	var planeChange;
	//每秒60帧
	var frame=1000/60;
	//释放动画的时间
	var releaseTime=900;
	var animating=false;
	var planeAnimTime=3500;

	$(document).on("mousedow touchstart",".page-body",function(e){
		//当释放动画时阻止下拉
		if(animating) return;
		var startY=e.pageY || e.originalEvent.touches[0].pageY;

		

		$(document).on("mousemove touchmove",function(e){
			var y=e.pageY || e.originalEvent.touches[0].pageY;
			
			pullDeltaY=(y-startY)/1.5;
			//阻止快速点击事件
			if(!pullDeltaY) return;
			pullChange(pullDeltaY);
			
		});
		$(document).on("mouseup touchend",function(){
			$(document).off("mousemove touchmove mouseup touchend");

			if(!pullDeltaY) return;

			release();
		});
	});

	//当下滑时，计算applyChange的y值
	function pullChange(y){
		//向上滑动
		if(y<0) y=0;
		if(y>maxPullDeltaY){
			y=maxPullDeltaY;
		}
		bg1change=bg2change=bg3change=y;
		checkMaxBgValues();

		treeChange=y*treeMaxCoef;
		planeChange=y*planeMaxCoef;

		applyChanges(y);
		console.log(y);

	}


	function checkMaxBgValues(){
		if(bg1change>bg1max) bg1change=bg1max;
		if(bg2change>bg2max) bg2change=bg2max;
		if(bg3change>bg3max) bg3change=bg3max;
	}

	//更新页面布局
	function applyChanges(topY){
		$top.css("height",topH+topY+"px");
		moveBgs();
		tiltTrees(treeChange);
		$planeRotater.css({"-webkit-transform":"rotate("+planeChange+"deg)",
							"transform":"rotate("+planeChange+"deg)"});

	}
	//移动山和树的背景通过变换
	function moveBgs(){
		$bg1.css({"-webkit-transform":"translate3d(0,"+bg1change+"px,0)",
					"transform":"translate3d(0,"+bg1change+"px,0)"});
		$bg2.css({"-webkit-transform":"translate3d(0,"+bg2change+"px,0)",
					"transform":"translate3d(0,"+bg2change+"px,0)"});
		$bg3.css({"-webkit-transform":"translate3d(0,"+bg3change+"px,0)",
					"transform":"translate3d(0,"+bg3change+"px,0)"});
		$leftTrees.css({"-webkit-transform":"translate3d(0,"+bg2change+"px,0)",
					"transform":"translate3d(0,"+bg2change+"px,0)"});
		$rightTrees.css({"-webkit-transform":"translate3d(0,"+bg3change+"px,0)",
					"transform":"translate3d(0,"+bg3change+"px,0)"});
	}
	//每棵树分两部分树干和树叶。
	// 这两部分具有两个二次Bezier曲线创建（左右）。
	// 基本上，我只是改变每一部分的中间点X坐标
	// 它会影响这两个曲线，所以这看起来像我神奇地倾斜这些树
	function tiltTrees(x){
		var treeId,treeObj,trunkArr,leafArr,changeX;

		$trees.forEach(function($tree){
			treeId=$tree.getAttribute("data-id");
			treeObj=treesData["tree"+treeId];
			trunkArr=treeObj.trunkInitArrD.slice();
			leafsArr=treeObj.leafsInitArrD.slice();
			changeX=(treeObj.isRight) ? x:-x;

			trunkArr[2]=(treeObj.trunkInitX+changeX/2)+","+treeObj.trunkInitY;
			leafsArr[3]=(treeObj.leafsInitX+changeX)+","+treeObj.leafsInitY;
			console.log(trunkArr);
			console.log(leafsArr);
			console.log(treeObj);
			treeObj.$treeTrunk.setAttribute("d",trunkArr.join(" "));
			treeObj.$treeLeafs.setAttribute("d",leafsArr.join(" "));
		});
	}
	//存储的树部分路径D属性数组和X和Y坐标的中间点
	function storeTreeCoords(){
		var treeId,treeObj,trunkTop,leafsTop;

		$trees.forEach(function($tree){
			treeId=$tree.getAttribute("data-id");
			treesData["tree"+treeId]={};
			treeObj=treesData["tree"+treeId];
			treeObj.isRight=$tree.classList.contains("svgTree-right");
			treeObj.$treeTrunk=$tree.querySelector(".svgTree-trunk");
			treeObj.$treeLeafs=$tree.querySelector(".svgTree-leafs");
			treeObj.trunkInitArrD=treeObj.$treeTrunk.getAttribute("d").split(" ");
			treeObj.leafsInitArrD=treeObj.$treeLeafs.getAttribute("d").split(" ");
			trunkTop=treeObj.trunkInitArrD[2];
			leafsTop=treeObj.leafsInitArrD[3];
			treeObj.trunkInitX=+trunkTop.split(",")[0];
			treeObj.leafsInitX=+leafsTop.split(",")[0];
			treeObj.trunkInitY=+trunkTop.split(",")[1];
			treeObj.leafsInitY=+leafsTop.split(",")[1];

		});
		console.log(treeObj);
	};

	storeTreeCoords();

	function release(){
		//动画帧数
		var steps=Math.floor(releaseTime/frame);
		var curStep=0;
		var topY,bgY,treeVal,planeDeg;
		var y=pullDeltaY;
		if(y>maxPullDeltaY){
			y=maxPullDeltaY;
		}
		var releasePlane=y>=maxPullDeltaY/2;
		//动画触发时阻止下拉事件
		animating=true;
		//当下拉距离>1/2*maxPullDeltaY时，开始飞机动画
		if(releasePlane){
			//增加Class开始帧动画
			$plane.addClass("fly");
			setTimeout(function(){
				//当动画完成，允许下拉事件，移除动画Class并加载数据
				animating=false;
				$plane.removeClass("fly");
				insertData();
			},planeAnimTime);
		}

		animate();
		//这个功能可以发射每一个帧，直到动画结束（curstep >steps）
		function animate(){
			curStep++;
			//适用于不同元素的速度曲线动画
			topY=easings.elastic(curStep,y,0-y,steps);
			bgY=easings.elastic(curStep,y,0-y,steps);
			treeVal=easings.elasticBig(curStep,y,0-y,steps);
			planeDeg=easings.inCubic(curStep,y,0-y,steps);

			releaseChange({topY:topY,bgY:bgY,treeVal:treeVal,planeDeg:planeDeg});

			if(curStep>steps){
				pullDeltaY=0;
				//如果下拉距离小于1/2*maxPullDeltaY,允许下拉事件更早
				if(!releasePlane) animating=false;
				return;
			}
			requestAnimFrame(animate);
		}


	}

	//当释放事件触发时计算更新页面的值
	function releaseChange(props){
		bg1change=bg2change=bg3change=props.bgY;
		checkMaxBgValues();

		treeChange=props.treeVal*treeMaxCoef;
		planeChange=props.planeDeg*planeMaxCoef;

		applyChanges(props.topY);
	}

	//速度曲线
	var easings={
		elastic:function(t,b,c,d) {
	      var ts = (t/=d)*t;
	      var tc = ts*t;
	      return b+c*(33*tc*ts + -106*ts*ts + 126*tc + -67*ts + 15*t);
	    },
	    elasticBig: function(t,b,c,d) {
	      var ts = (t/=d)*t;
	      var tc = ts*t;
	      return b+c*(21*tc*ts + -150*ts*ts + 250*tc + -150*ts + 30*t);
	    },
	    inCubic: function(t,b,c,d) {
	      var tc = (t/=d)*t*t;
	      return b+c*(tc);
	    }
	};



});

window.requestAnimFrame=(function(){
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback,1000/60);
		};
})();