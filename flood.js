var http = require('http');  
var hrtime = require('hrtime');
var fs =require('fs');
var event = require('events');
var stream = fs.createWriteStream('output.json');
var userinput = process.argv.slice(2);
var numberofrequest =0;
var latarray=[];
var badrequest=0;
var latarrayindex=0;
var total=0;
var mean=0;
var sd=0;

var server = http.createServer(function(req, res){ 
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('duh');
  res.end();
}).listen(8080);

//pre-entered host options
var options1 = {  
           host: 'localhost',   
           port: 800,
	   method: 'GET'  
};

var options2 = {  
           host: 'www.google.com',   
           port: 80,
	   method: 'GET'  
};

var options3 = {  
           host: 'www.ibm.com',   
           port: 80,
	   method: 'GET'  
};

var options4 = {  
           host: '142.58.63.146',   
           port: 8888,
	   method: 'POST'  
};



function test(t){
	numberofrequest = t;	
	for (var i =0; i< t; i++){
		temp(i, latarray);
	};
	
};

function temp(k, array){
	//'optionsX' for host option		
	var req = http.request(options2, function(res) {
		var starttime = hrtime.time();		
		console.log('Request #',k,': sending http request');
		res.on('data', function () {
			var receivetime = hrtime.time();			
			var latency = receivetime - starttime;			
			console.log('Request #',k,': data received');
			array[latarrayindex] = latency*1;
			console.log('Request #',k,': Latency =',array[latarrayindex],'nanoseconds' );
			latarrayindex++;
			if (array.length==numberofrequest-badrequest){
				res.emit('finish',endoftest(array));
			};
			res.on('end', function() {
				var endtime = hrtime.time();
				var timeneeded = endtime - receivetime;						
				console.log('Request #',k,': END OF DATA');
				console.log('Request #',k,': data transfer time =',timeneeded,'nanoseconds');
			});
		});	
	});
	req.on('error', function(e) {
		console.log('Request #',k,': ERROR',e.message);
		badrequest++;
		if (array.length==numberofrequest-badrequest){
			res.emit('finish',endoftest(array));
		};
	});
	req.write('data\n');
	//req.end();		
};

function endoftest(array){

	console.log('END OF LATENCY TEST');
	total = calTotal(array);
	mean = calMean(total,array.length);
	sd = calSD(array,mean);
	console.log('Total Latency = ',Math.round(total/1000000)/1000,'seconds');				
	//console.log(total);
	console.log('Mean = ',Math.round(mean/1000)/1000,'milliseconds');
	//console.log(mean);
	console.log('Standard Deviation = ',Math.round(sd/1000)/1000,'milliseconds');
	//console.log(sd);
	console.log('Number of bad request =',badrequest);
	output();
};

function output(){
	
	var options = {
		numberofrequest: numberofrequest,
		total: total,
		mean: mean,
		sd: sd,
		badrequest: badrequest,
	};
	var data = JSON.stringify(options, null,2);
	console.log('SUMMARY SAVED TO OUTPUT.JSON');	
	stream.write(data);
	process.exit();
};


function calTotal(array){
	//console.log('running caltotal function');	
	var temp=0;
	for (var i=0; i<array.length; i++){
	//	console.log('i=',i,'=' ,array[i]);		
		temp = temp + array[i];
	//	console.log('running sum :',temp);
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

test(userinput);
