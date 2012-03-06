var http = require('http');  
var hrtime = require('hrtime');
var fs =require('fs');
var stream = fs.createWriteStream('output.json', {'flags':'a'});
var userinput = process.argv.slice(2);
var numberofrequest =userinput[0];;
var intervaltime= userinput[1];
var latarray=[];
var startarray=[];
var badrequest=0;
var latarrayindex=0;
var total=0;
var mean=0;
var sd=0;

//numberofrequest = userinput[0];
//intervaltime= userinput[1];
//console.log(userinput);

http.globalAgent.maxSockets=1000;

var server = http.createServer(function(req, res){ 
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('HAHAHFHAHFHHHFH');
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
           host: 'www.amazon.com',   
           port: 80,
	   method: 'GET'
};
//testing LAN proxy
var options4 = {  
           host: '192.168.8.99',   
           port: 5555,
	   method: 'GET'  
};


function test(n,t){

	var counter = 0;
	
	var interval = function(){
		if(counter < n){
			temp(counter, latarray);						
			counter++
		} else {
			clearInterval(interval);
		};
	};
	
	setInterval(interval, t);	
};

function testnowait(n){
	for (var i =0; i< n; i++){
			temp(i, latarray);
	};
};

function temp(k, array){
	//'optionsX' for host option
	startarray[k]=hrtime.time();
	var req = http.request(options1, function(res) {
			
		var starttime = hrtime.time();
		//startarray[k]=starttime;	
		//console.log('Request #',k,': sending http request to',options2.host,'at time =',starttime/1000000000);
		//var timeRecorded=false;		
		res.on('data', function () {
                       //if(!timeRecorded){
			var receivetime = hrtime.time();			
			var latency = receivetime - starttime;	
			//console.log(res);		
			//console.log('Request #',k,': data received');
			array[latarrayindex] = latency*1;
			//console.log('Request #',k,': Latency =',array[latarrayindex],'nanoseconds' );
			latarrayindex++;
			//console.log('printint array', array);
			//console.log('-------------DATA---------------');
			//console.log(chunk);
			//timeRecorded=true;
				if (array.length===numberofrequest-badrequest){
				
					endoftest(array);	
					//res.emit('finish',endoftest(array));
				};
	
			//};
			req.end();
			//res.on('end', function() {
			//	var endtime = hrtime.time();
			//	var timeneeded = endtime - receivetime;						
			//	console.log('Request #',k,': END OF DATA');
			//	console.log('Request #',k,': data transfer time =',timeneeded,'nanoseconds');
			//});
		});	
	});
	req.on('error', function(e) {
		console.log('Request #',k,': ERROR',e.message);
		badrequest++;
		if (array.length==numberofrequest-badrequest){
			endoftest(array);			
			//req.emit('finish',endoftest(array));
		};
	});
	req.write('data\n');

	req.end();		
};

function endoftest(array){

	console.log('END OF LATENCY TEST');
	total = calTotal(array);
	mean = calMean(total,array.length);
	sd = calSD(array,mean);
	console.log('Number of request = ',startarray.length);
	console.log('Total Latency = ',Math.round(total/1000000)/1000,'seconds');				
	//console.log(total);
	console.log('Mean = ',Math.round(mean/1000)/1000,'milliseconds');
	//console.log(mean);
	console.log('Standard Deviation = ',Math.round(sd/1000)/1000,'milliseconds');
	//console.log(sd);
	console.log('Number of bad request =',badrequest);
	output();
	
	//testing start time

	var temp=0;
	startarray.sort();
	//console.log(startarray);
	for (var i=0; i<startarray.length-1; i++){
		//console.log(startarray[i]);
		//console.log(startarray[i+1]);
				
		temp = temp+ ( startarray[i+1]*1-startarray[i]*1);
		//console.log(temp);
		//console.log(startarray[i]/1000000000);
		//	console.log(temp);
	};
	//console.log(numberofrequest,'  ',startarray.length);
	//console.log(temp);
	//console.log(numberofrequest);
	console.log( (temp/(numberofrequest-1))/1000000000+' seconds');
};

function output(){

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
	console.log('SUMMARY SAVED TO OUTPUT.JSON');
	stream.write('{\n');	
	//stream.write('"testresult": {\n');
	stream.write('   "numberofrequest": '+numberofrequest+',\n');	
	stream.write('   "totallatency": '+total+',\n');
	stream.write('   "mean": ' +mean+',\n');
	stream.write('   "sd": '+sd+',\n');
	stream.write('   "badrequest": '+badrequest+'\n');
	stream.write('},\n');
	//stream.write(data);
	stream.end();
	//process.exit();
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


test(numberofrequest,intervaltime);

//testnowait(numberofrequest);


