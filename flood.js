var http = require('http');  
var hrtime = require('hrtime');
var latarr=[];

var server = http.createServer(function(req, res){ 
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('duh');
  res.end();
}).listen(8080);

var options = {  
           host: 'localhost',   
           port: 8080,
	   method: 'POST'  
};

var options2 = {  
           host: 'www.ibm.com',   
           port: 80,
	   method: 'POST'  
};

function test(times){
	for (var i =0; i< times; i++){
		temp(i, latarr);
	};
};

function temp(k, array){		
	var req = http.request(options, function(res) {
		var starttime = hrtime.time();		
		console.log('Request #',k,': sending http request');
		res.on('data', function () {
			var receivetime = hrtime.time();			
			console.log('Request #',k,': data received');
			var latency = receivetime - starttime;
			array[k] = latency*1;
			console.log('Request #',k,': Latency =',array[k],'nanoseconds' );
			console.log('Latency Mean = ',calMean(array));
			console.log('SD = ',calSD(array,calMean(array)));
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

function calMean (array){
	var mean=0;
	var sum=0;
	for (var i=0; i<array.length; i++){
		sum = sum + array[i];
	};
	mean = sum/array.length;
	return mean;
};

function calSD (array, mean){
	var temp=0;
	var sd=0;	
	for (var i=0; i<array.length; i++){
		temp = temp + Math.pow(array[i]-mean,2);
	}
	temp = temp/array.length;
	sd = Math.sqrt(temp);
	return sd;
};
		
test(1000);
