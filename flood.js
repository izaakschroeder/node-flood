var http = require('http');  
var hrtime = require('hrtime');
var fs =require('fs');
//var stream = fs.createWriteStream('output.txt', {'flags':'a'});
var userinput = process.argv.slice(2);
var numberoftest = 0;
var stop = 10;
var globalStartTime = hrtime.time();
//var numberofrequest =userinput[0];;
//var intervaltime= userinput[1];
//var latarray=[];
//var startarray=[];
//var badrequest=0;
//var latarrayindex=0;
//var total=0;
//var mean=0;
//var sd=0;
//var globalStartTime = hrtime.time();
//var reqPerSecond=0;
//var testresult;
var resultarray= [];

http.globalAgent.maxSockets=10000;

var server = http.createServer(function(req, res){ 
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('TEST PAGE');
  res.end();
}).listen(8080);

//pre-entered host options
var options1 = {  
           host: 'localhost',   
           port: 8080,
	   method: 'GET'  
};

var options2 = {  
           host: 'www.google.com',   
           port: 80,
	   method: 'GET'
};

var options3 = {  
           host: 'www.6park.com',   
           port: 80,
	   method: 'GET'
};
//testing LAN proxy
var options4 = {  
           host: '142.58.63.37',   
           port: 8888,
	   method: 'GET',
path:'/fab'
};

function setup(){
	testresult = {
			numberofrequest:userinput[0],
			intervaltime:userinput[1],
			latarray:[],
			badrequest:0,
			total:0,
			mean:0,
			sd:0,
			testStartTime: hrtime.time(),
			reqPerSecond:0,
			testEndTime:0, 
			};
	resultarray.push(testresult);

};

function test(n,t){
	//setup();
	var counter = 0;	
	var interval = function(){
		if(counter < n){
			temp(counter, testresult.latarray);						
			counter++
		} else {
			clearInterval(interval);
		};
	};
	
	setInterval(interval, t);	
};

function testnowait(n){
	//for (var i =0; i< n; i++){
	//		temp(i, latarray);
	//};
	var counter = 0;
	while (counter < n){
		temp(counter, latarray);
		counter++;
	};
};

function temp(k, array){
	//'optionsX' for host option
	var starttime ;
	
	var req = http.request(options1, function(res) {
			
		var receivetime = hrtime.time();			
		var latency = receivetime - req.starttime;
		array.push(latency);
		//console.log('Request #',k,': sending http request to',options1.host,'at time =',req.starttime/1000000000,'seconds');
		
		res.on("end", function() {
			if (array.length==testresult.numberofrequest-testresult.badrequest){
				endoftest(array);	
				//res.emit('finish',endoftest(array));
			};
		})

			
	});
	req.on('error', function(e) {
		console.log('Request #',k,': ERROR',e.message);
		//testresult.badrequest++;
		//console.log('test array length',array.length);
		//console.log(testresult.numberofrequest);
		//console.log(testresult.badrequest);
		if (array.length==testresult.numberofrequest-testresult.badrequest){
			endoftest(array);			
			//req.emit('finish',endoftest(array));
		};
	});
	req.write('data\n');
	req.on("drain", function() {
		req.starttime = hrtime.time();
	})
	req.end();		
};

function endoftest(array){
	numberoftest++;
	var testTook = hrtime.time() - testresult.testStartTime;
	testresult.testEndTime = hrtime.time() - globalStartTime;
	testresult.reqPerSecond = array.length / ((testTook/1000000)/1000);
	console.log('END OF LATENCY TEST RUN '+numberoftest);
	console.log('Test Run Ends at',testresult.testEndTime/1000000000,'seconds after start');
	console.log('Number of request =',testresult.numberofrequest);
	console.log('waitInterval =',testresult.intervaltime);
	console.log('Req Per Second =',testresult.reqPerSecond);
	testresult.total = calTotal(array);
	testresult.mean = calMean(testresult.total,array.length);
	//testresult.sd = calSD(array,testresult.mean);

	console.log('Total Latency =',Math.round(testresult.total/1000000)/1000,'seconds');				
	//console.log(total);
	console.log('Mean =',Math.round(testresult.mean/1000)/1000,'milliseconds');
	//console.log(mean);
	//console.log('Standard Deviation =',Math.round(testresult.sd/1000)/1000,'milliseconds');
	//console.log(sd);
	console.log('Number of bad request =',testresult.badrequest);
	output2();
	
	//testing start time

	//var temp=0;
	//startarray.sort();
	//console.log(startarray);
	//for (var i=0; i<startarray.length-1; i++){
		//console.log(startarray[i]);
		//console.log(startarray[i+1]);
				
	//	temp = temp+ ( startarray[i+1]*1-startarray[i]*1);
		//console.log(temp);
		//console.log(startarray[i]/1000000000);
		//	console.log(temp);
	//};
	//console.log(numberofrequest,'  ',startarray.length);
	//console.log(temp);
	//console.log(numberofrequest);
	
};

function output1(){
var stream = fs.createWriteStream('output.txt', {'flags':'a'});
	//var options = {
		//numberofrequest: numberofrequest [
	//	testresult:{
	//	numberofrequest: numberofrequest,	
	//	total:total,
	//	mean: mean,
	//	sd: sd,
	//	badrequest: badrequest
	//	}
	//};
	//var data = JSON.stringify(options, null,2);
	console.log('SUMMARY SAVED TO OUTPUT.TXT');
	stream.write('{\n');	
	//stream.write('"testresult": {\n');
	stream.write('   "numberofrequest": '+testresult.numberofrequest+',\n');	
	stream.write('   "reqPerSecond": '+testresult.reqPerSecond+',\n');
	stream.write('   "totallatency": '+testresult.total+',\n');
	stream.write('   "mean": ' +testresult.mean+',\n');
	stream.write('   "sd": '+testresult.sd+',\n');
	stream.write('   "badrequest": '+testresult.badrequest+'\n');
	stream.write('},\n');
	//stream.write(data);
	stream.end();

};

function output2(){
var stream = fs.createWriteStream('output.txt', {'flags':'a'});
	//var options = {
		//numberofrequest: numberofrequest [
	//	testresult:{
	//	numberofrequest: numberofrequest,	
	//	total:total,
	//	mean: mean,
	//	sd: sd,
	//	badrequest: badrequest
	//	}
	//};
	//var data = JSON.stringify(options, null,2);
	console.log('SUMMARY SAVED TO OUTPUT.TXT');
	//stream.write('{\n');	
	//stream.write('"testresult": {\n');
	stream.write(Math.round(testresult.reqPerSecond)+'\n');
	stream.write((testresult.numberofrequest)+'\n');
	stream.write((testresult.mean)+'\n');
	stream.write((Math.round(testresult.testEndTime/1000000)/1000)+' seconds\n');
	stream.end();
	runLinear();
};

function calTotal(array){
	//console.log('running caltotal function');	
	var temp=0;
	for (var i=0; i<array.length; i++){
		//console.log('i=',i,'=' ,array[i]);		
		temp = temp + array[i];
		//console.log('running sum :',temp);
	};
	return temp;
};

function calMean(sum,number){
	//console.log('running calMean');
	var temp=0;
	temp = sum/number;
	return temp;
};

function calMeanArray (array){
	//console.log('input length:::::',array.length);	
	var temp=0;
	for (var i=0; i<array.length; i++){
		temp = temp + array[i];
	};	
	temp = temp/array.length;
	return temp;
};

function calSD (array, m){
	//console.log('running calSD');	
	var temp=0;
	for (var i=0; i<array.length; i++){
		temp = temp + Math.pow(array[i]-m,2);
	}
	temp = temp/array.length;
	temp = Math.sqrt(temp);
	return temp;
};

function run(){

	setup();
	
	test(resultarray[0].numberofrequest,resultarray[0].intervaltime);
};

function runLinear(){
	if (numberoftest < stop){
		setup();
			//console.log(testresult.numberofrequest);
			//console.log('numberoftest',numberoftest);
			//console.log(numberoftest*10);
		testresult.numberofrequest = testresult.numberofrequest*1+(numberoftest*userinput[0]);
		testresult.intervaltime = testresult.intervaltime*1-(numberoftest*userinput[1]/10);
		if (testresult.intervaltime<=0){testresult.intervaltime=1};
		test(resultarray[resultarray.length-1].numberofrequest,resultarray[resultarray.length-1].intervaltime);
		} else {
			//process.exit();
		console.log('END OF FLOOD');
		setTimeout(function(){process.exit();},2500);


		};
};

run();

//if (userinput.length == 1){
	//console.log('no wait');
//	testnowait(numberofrequest);
//}else { 
//test(numberofrequest,intervaltime);
//};
//console.log(testresult.badrequest);


//setup();
//resultarray.push(testresult);
//testresult.badrequest = 100;
//setup();
//resultarray.push(testresult);
//testresult.badrequest = 110;
//setup();
//resultarray.push(testresult);
//setup();
//resultarray.push(testresult);
//testresult;
//setup();
//resultarray.push(testresult);
//setup()
/*
resultarray[0].badrequest=0;
resultarray[1].badrequest=1;
resultarray[2].badrequest=2;
resultarray[3].badrequest=3;
resultarray[4].badrequest=4;
//testresult.badrequest = 100000000;
console.log(resultarray[0].badrequest);
console.log(resultarray[1].badrequest);
console.log(resultarray[2].badrequest);
console.log(resultarray[3].badrequest);
console.log(resultarray[4].badrequest);
console.log(testresult.badrequest);
console.log('end of setup test');


//console.log(testresult.badrequest);
//resultarray.push(testresult);
//console.log(resultarray[5].badrequest);
//testresult.badrequest = 10000;

//console.log(resultarray[0]);
//console.log(resultarray[1]);
//console.log(resultarray[2]);
//console.log(resultarray[3]);
//console.log(resultarray[4]);
//testresult.badrequest = 100;
//console.log('testing after');
//console.log(testresult.badrequest);
//console.log(resultarray[0].badrequest);
//console.log(resultarray[1].badrequest);*/

