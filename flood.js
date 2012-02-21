var http = require('http');  
var hrtime = require('hrtime');
var latarr=[];
var numberofrequest = process.argv.slice(2); 

var server = http.createServer(function(req, res){ 
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('duh');
  res.end();
}).listen(8080);

var options1 = {  
           host: 'localhost',   
           port: 8080,
	   method: 'POST'  
};

var options2 = {  
           host: 'www.google.com',   
           port: 80,
	   method: 'POST'  
};

var options3 = {  
           host: '142.58.162.176',   
           port: 8888,
	   method: 'POST'  
};

function test(t){
	for (var i =0; i< t; i++){
		temp(i, latarr);
	};
};

function temp(k, array){		
	var req = http.request(options3, function(res) {
		var starttime = hrtime.time();		
		console.log('Request #',k,': sending http request');
		res.on('data', function () {
			var receivetime = hrtime.time();			
			var latency = receivetime - starttime;			
			console.log('Request #',k,': data received');
			
			array[k] = latency*1;
			console.log('Request #',k,': Latency =',array[k],'nanoseconds' );
			if (array.length==numberofrequest){
				console.log('END OF LATENCY TEST');					
				console.log('Total Latency = ',calTotal(array),'seconds');				
				console.log('Mean = ',calMean(array),'milliseconds');
				console.log('Standard Deviation = ',calSD(array,calMean(array)),'milliseconds');
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
		console.log('Request #',k,': ERROR',e.message)
	});
	req.write('data\n');
	req.end();		
};

function calTotal(array){
	var sum=0;
	for (var i=0; i<array.length; i++){
		sum = sum + array[i];
	};
	sum=sum/1000000000;
	return Math.round(sum*1000)/1000;
};

function calMean (array){
	var mean=0;
	var sum=0;
	for (var i=0; i<array.length; i++){
		sum = sum + array[i];
	};
	mean = sum/array.length;
	//in millisecondes
	mean = mean/1000000;
	//round up to 3 decimal place
	return Math.round(mean*1000)/1000;
};

function calSD (array, mean){
	var temp=0;
	var sd=0;	
	for (var i=0; i<array.length; i++){
		temp = temp + Math.pow(array[i]-mean,2);
	}
	temp = temp/array.length;
	sd = Math.sqrt(temp);
	//in millisecondes	
	sd = sd/1000000;
	//round up to 3 decimal place
	return Math.round(sd*1000)/1000;
};

test(numberofrequest);
