/////////////////////////////////////////////
// chainmail.js - for Node JS execution
// By Charles C. Christmann
// Cedar Creek technologies, LLC
// Released under GNU General Public License v3.0
// Version 0.3.1 Beta 1 
/////////////////////////////////////////////

'use strict';

const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const nacl = require('./nacl.js');
var ADMIN = false;

/*
if( fs.existsSync("keys/admin.js") )
{
	ADMIN = require("./keys/admin.js");
}
*/

var CFG = {
	ready:false,
	swver:'0.3.2 Beta 1',
	msgver:1,
	lastAccess:0,
	RPCUSER:'multichainrpc',
	RPCPASS:'',
	RPCPATH:"127.0.0.1",
	RPCPORT:'9001',
	MYNODE:'',
	web:'8088'
};
nacl.Open();
var credentials = {key: fs.readFileSync('./keys/host.key', 'utf8'), cert:  fs.readFileSync('./keys/host.crt', 'utf8')};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '20mb' }));

app.get('/', function (req, res) 
{
	CFG.lastAccess = Date.now();
	res.sendFile(__dirname+'/public/index.html');
});

app.get('/*', function (req, res) 
{
	CFG.lastAccess = Date.now();
	res.sendFile(__dirname+'/public'+req.url);
});

fs.readFile('./chainmail/multichain.conf','utf8',(err,data)=>
{
	let s = data.toString('utf8').split("\n");
	let ss = s[1].split("=");
	CFG.RPCPASS = ss[1].trim();
	RPC.Initialize(CFG);
});

app.post('/run', async (req, res)=>
{
	let now = Date.now();
	if( now > CFG.lastAccess+600000)
	{
		CFG.ready = false;
	}
	let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	if( ip !== '127.0.0.1' && ip !== '::1' && ip != '::ffff:127.0.0.1')
	{
		res.send({error:'Invalid IP Source'});
		return;
	}
//	console.log(req.body);
	switch(req.body.method)
	{
	case 'getaddresses':
		CFG.lastAccess = now;
		let addr = await RPC.Call('getaddresses');
		res.send({data:addr});
		break;
	case 'nodeinfo':
		NodeInfo(res,req.body);
		break;
	case 'SendMail':
		CFG.lastAccess = now;
		SendMail(res,req.body);
		break;
	case 'SendAttachment':
		CFG.lastAccess = now;
		SendAttachment(res,req.body);
		break;
	case 'GetInBox':
		if( !req.body.auto )
			CFG.lastAccess = now;
		GetInBox(res,req.body);
		break;
	case 'GetMessage':
		CFG.lastAccess = now;
		GetMessage(res,req.body);
		break;
	case 'GetAttachment':
		CFG.lastAccess = now;
		GetAttachment(res,req.body);
		break;
	case 'SaveAlias':
		if( ADMIN !== false )
		{
			CFG.lastAccess = now;
			ADMIN.SaveAlias(res,req.body,RPC);
		}
		break;
	case 'GetAlias':
		CFG.lastAccess = now;
		GetAlias(res,req.body);
		break;
	case 'LookupAlias':
		CFG.lastAccess = now;
		LookupAlias(res,req.body);
		break;
	case 'IsAdmin':
		let tf = (ADMIN === false)?false:true;
		res.send({data:tf});
		break;
	}
});

console.log('Chainmail version ' + CFG.swver);

https.createServer(credentials, app).listen(CFG.web);
console.log('Secure web server running on port ' +CFG.web);
if(ADMIN !== false)
	console.log("Running as administrator")

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

function Initialize(code)
{
	return new Promise((Resolve,Reject)=>
	{
		if( fs.existsSync(__dirname+'/keys/local.json'))
		{
			fs.readFile(__dirname+'/keys/local.json',(err,encoded)=>
			{
				
				try
				{
					encoded = encoded.toString();
					let j = JSON.parse(encoded);
					let key = nacl.Sym.KeysFromSeed(j.nonce+code);
					CFG.pvtkey = nacl.Sym.Decrypt(JSON.stringify(j.pvtkey),key);
					CFG.pubkey = j.pubkey;
					CFG.nodeID = j.nodeID;
					CFG.ready = true;
					Resolve(true)
				}
				catch(e)
				{
					Reject("Invalid User Access Code");
				}
			});
		}
		else
		{
			if( CFG.code )
			{
				CreateMe(CFG.code);
				CFG.code = null;
				Resolve(true);
			}
			else
			{
				CFG.code = code;
				Resolve(null);
			}
		}
	});
}



async function NodeInfo(res,params)
{
	try
	{
		let tf = await Initialize(params.code);
		if( tf === true )
			res.send({data:{nodeID:CFG.nodeID}});
		else if( tf === false )
			res.send({'login':true});
		else
			res.send({'login':false});
	}
	catch(e)
	{
		res.send({error:e});
	}
}

function Random36(len)
{
	var digit = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var i, s = "";
	for(i=0;i<len;i++)
	{
		let d = Math.floor((Math.random() * 36));
		s += digit[d];
	}
	return s;
}

async function CreateMe(code)
{
	console.log("Creating this node");
	let j, id, go = true;
	try
	{
		let k = nacl.MsgBox.MakeKeys();
		CFG.pubkey = k.pubkey;
		CFG.pvtkey = k.pvtkey;
		j = await RPC.Call('getaddresses');
		let addr = j[0];
		do
		{
			id = Random36(4)+'-'+Random36(4)+'-'+Random36(4);
			try
			{
				j = await RPC.Call('liststreams',{streams:id});
			}
			catch(e)
			{
				console.log("Creating your personal chain stream");
				await RPC.Call('create',{type:'stream',name:id,params:{restrict:''}});
				go = false;
				CFG.nodeID = id;
			}
		} while(go);
		CFG.nodeAlias = "";
		console.log("Subscribing to your stream");
		await RPC.Call('subscribe',{item:id});
		console.log("Subscribing to index");
		await RPC.Call('subscribe',{item:'$index'});
		console.log("Subscribing to alias");
		await RPC.Call('subscribe',{item:'$alias'});
		console.log("Publishing your user ID in the index");
		await RPC.Call('publish',{stream:'$index',key:[CFG.nodeID,addr],data:{json:{key:CFG.pubkey}}});
		let n = Math.floor(Math.random() * 8);
		let nonce = Random36(n+24);
		let key = nacl.Sym.KeysFromSeed(nonce+code);
		CFG.pvtkey = JSON.parse(nacl.Sym.Encrypt(CFG.pvtkey,key));
		
		j = {"pubkey":CFG.pubkey,
			"pvtkey":CFG.pvtkey,
			"nodeID":CFG.nodeID,
			"nonce":nonce};

		let ej = JSON.stringify(j);
		let path = __dirname+'/keys/local.json';
		fs.writeFile(path,ej,()=>{});
		CFG.ready = true;
	}
	catch(e)
	{
		throw(e);
	}
}



async function SendMail(res,params)
{
	if( !CFG.ready )
	{
		res.send({'login':true});
		return;
	}
	let j, regex = RegExp('[1-9A-Z@\-]','g');
	if( params.toID.substr(0,1) == '@' && (params.toID.length < 2 || params.toID.length > 32) )
	{
		res.send({error:'Invalid TO alias'});
		return;
	}
	if( params.toID.substr(0,1) != '@' && (params.toID.length !== 14 || !regex.test(params.toID)) )
	{
		res.send({error:'Invalid TO alias'});
		return;
	}
	if( params.fromID.substr(0,1) == '@' && (params.fromID.length < 2 || params.fromID.length > 32) )
	{
		res.send({error:'Invalid FROM alias'});
		return;
	}
	if( params.fromID.substr(0,1) != '@' && (params.fromID.length !== 14 || !regex.test(params.fromID)) )
	{
		res.send({error:'Invalid FROM alias'});
		return;
	}

	try
	{
		j = await RPC.Call('liststreamkeyitems',{stream:'$index',key:params.toID});
		if(j.length == 0 )
		throw(false);
	}
	catch(e)
	{
		res.send({error:'Unknown to address'});
		return;
	}

	let body = JSON.stringify({
		fromID:CFG.nodeID,
		subject:params.subj,
		message:params.message,
		docID:params.docID,
		docName:params.docName,
		version:CFG.ver
	});
	let recvKey = j[0].data.json.key
	let crypt = nacl.MsgBox.Encrypt(body,recvKey,CFG.pvtkey);
	let ts = Date.now();
	try
	{
		j = await RPC.Call('liststreams',{streams:params.toID});
		if( !j || !j.length )
			throw(false);
		if( !j[0].subscribed )
			await RPC.Call('subscribe',{streams:params.toID});
		let txid = await RPC.Call('publish',{stream:params.toID,key:['mail'],data:{json:{msgver:CFG.msgver,timestamp:ts,from:CFG.nodeID,message:crypt}}});
		res.send({data:txid});
	}
	catch(e)
	{
		res.send({error:'Error saving mail message'});
	}
}

async function SendAttachment(res,params)
{
	if( !CFG.ready )
	{
		res.send({'login':true});
		return;
	}
	let j, regex = RegExp('[1-9A-Z\-]','g');
	if( !regex.test(params.toID) )
	{
		res.send({error:'Invalid to address'});
		return;
	}	
	if( !regex.test(params.fromID) )
	{
		res.send({error:'Invalid from address'});
		return;
	}
	if( params.docID.length !== 16 )
	{
		res.send({error:'Invalid document ID received'});
		return;
	}
	if( params.attachment.length < 5 )
	{
		res.send({error:'No data for the attachment'});
		return;
	}

	try
	{
		j = await RPC.Call('liststreamkeyitems',{stream:'$index',key:params.toID});
	}
	catch(e)
	{
		res.send({error:'Unknow to address'});
		return;
	}

	let recvKey = j[0].data.json.key
	let crypt = nacl.MsgBox.Encrypt(params.attachment,recvKey,CFG.pvtkey);
	try
	{
		let txid = await RPC.Call('publish',{stream:params.toID,
			key:[params.docID],
			data:{json:{msgver:CFG.msgver,from:CFG.nodeID,message:crypt}},
			options:'offchain'});
		res.send({data:txid});
	}
	catch(e)
	{
		res.send({error:'Error saving mail message'});
	}
}

async function GetInBox(res,params)
{
	if( !CFG.ready )
	{
		res.send({'login':true});
		return;
	}
	try
	{
		let i, list = [];
		let j = await RPC.Call('liststreamkeyItems',{stream:CFG.nodeID,key:'mail',count:params.count});
		for(i=0;i<j.length;i++)
		{
			let jd = j[i].data.json;
			let dt = new Date(jd.timestamp);
			let timestamp = dt.toLocaleString();
			list.unshift({fromID:jd.from,timestamp:timestamp,txid:j[i].txid});
		}
		res.send({'data':list});
	}
	catch(e)
	{
		res.send({error:'Error retreiving inbox'});
	}
}

async function GetAlias(res,params)
{
	let j;
	try
	{
		let now = Date.now();
		j = await RPC.Call('liststreamkeyitems',{stream:'$alias',key:params.nodeID});
		if( j && j.length && j[0].data.json.expire > now )
			res.send({'data':j[0].data.json.alias});
		else
			res.send({data:false});
	}
	catch(e)
	{
		res.send({data:false});
	}
}

async function LookupAlias(res,params)
{
	let j;
	try
	{
		let now = Date.now();
		j = await RPC.Call('liststreamkeyitems',{stream:'$alias',key:params.key});
		if( j && j.length && j[0].data.json.expire > now )
			res.send({'data':{alias:j[0].data.json.nodeID,expire:j[0].data.json.expire}});
		else
			res.send({data:false});
	}
	catch(e)
	{
		res.send({data:false});
	}
}

async function GetMessage(res,params)
{
	if( !CFG.ready )
	{
		res.send({'login':true});
		return;
	}
	try
	{
		let jmsg = await RPC.Call('getstreamitem',{stream:CFG.nodeID,txid:params.txid});
		let jkey = await RPC.Call('liststreamkeyitems',{stream:'$index',key:jmsg.data.json.from});
		let msg;
		if( !jmsg.data.json.msgver )
			jmsg.data.json.msgver = 1;
		switch(jmsg.data.json.msgver)
		{
		case 1:
			msg = DecodeMessageVer1(jmsg,jkey);
			break;
		}
		res.send({'data':msg});
	}
	catch(e)
	{
		res.send({error:'Message error'});
	}
}

function DecodeMessageVer1(jmsg,jkey)
{
	let msg = JSON.parse(nacl.MsgBox.Decrypt(jmsg.data.json.message,jkey[0].data.json.key,CFG.pvtkey));
	let dt = new Date(jmsg.data.json.timestamp)
	msg.timestamp = dt.toLocaleString();
	return msg;	
}

async function GetAttachment(res,params)
{
	if( !CFG.ready )
	{
		res.send({'login':true});
		return;
	}
	try
	{
		let j = await RPC.Call('liststreamkeyItems',{stream:CFG.nodeID,key:params.docID,verbose:true});
		j = await RPC.Call('gettxoutdata',{txid:j[0].txid,vout:j[0].vout});
		let jdata = j.json;
		let jkey = await RPC.Call('liststreamkeyitems',{stream:'$index',key:jdata.from});
		let msg;
		if( !jdata.msgver )
			jdata.msgver = 1;
		switch(jdata.msgver)
		{
		case 1:
			msg = DecodeAttachmentVer1(jdata,jkey);
			break;
		}
		
		res.send({data:msg});
	}
	catch(e)
	{
		res.send({error:'Message error'});
	}
}

function DecodeAttachmentVer1(jdata,jkey)
{
	let msg = nacl.MsgBox.Decrypt(jdata.message,jkey[0].data.json.key,CFG.pvtkey);
	return msg;	
}

const RpcClient = require('node-json-rpc2').Client;
var RPC = {};


const CMDS = {
// utility
	stop:{},
	getinfo:{},
	getaddresses:{verbose:false},
	getpeerinfo:{},
	create:{type:'?',name:'?',params:{restrict:'write,offchain'}},
	signmessage:{address:'?',message:'?'},
	verifymessage:{address:'?',signature:'?',message:'?'},
	verifypermission:{address:'?',permission:'?'},
	
// permissions
	listpermissions:{permissions:'*',addresses:'*',verbose:false},
	grant:{addresses:'?',permissions:'?'},
	revoke:{addresses:'?',permissions:'?'},
	
// Assets
	listassets:{assets:'*',verbose:false,count:100000000,start:''},
	issue:{address:'?',nameparams:'?',qty:1,units:1},
	issuemore:{address:'?',asset:'?',qty:'?'},
	listassettransactions:{asset:'?',verbose:false,count:10,start:'',localordering:false},

// wallet 
	getaddressbalances:{address:'?',minconf:1,includeLocked:false},
	getmultibalances:{addresses:'*',assets:'*',minconf:1,includeWatchOnly:false,includeLocked:false},
	gettotalbalances:{minconf:1,includeWatchOnly:false,includeLocked:false},
	listaddresstransactions:{address:'?',count:10,skip:0,verbose:false},
	listwallettransactions:{count:10,skip:0,includeWatchOnly:false,verbose:false},

// payments
	send:{address:'?',amount:'?'},
	sendasset:{address:'?',asset:'?',qty:'?'},
	
// Streams
	liststreams:{streams:'*',verbose:false},
	publish:{stream:'?',key:'?',data:'?',options:''},
	publishmulti:{stream:'?',items:'?',options:''},
	liststreamkeyitems:{stream:'?',key:'?',verbose:false,count:1,start:'',localordering:false},
	liststreamkeys:{stream:'?',key:'*',verbose:false,count:100000000,start:'',localordering:false},
	liststreamitems:{stream:'?',verbose:false,count:100000000,start:'',localordering:false},
	liststreampublisheritems:{stream:'?',address:'?',verbose:false,count:100000000,start:'',localordering:false},
	liststreampublishers:{stream:'?',address:'*',verbose:false,count:100000000,start:'',localordering:false},
	gettxoutdata:{txid:'?',vout:'?'},
	getstreamitem:{stream:'?',txid:'?',verbose:false},
	
//subscribe
	subscribe:{item:'?',rescan:false},
	unsubscribe:{item:'?'},
};

RPC.Initialize = function(cfg)
{
	let config = {
		host:cfg.RPCPATH,
		user:cfg.RPCUSER,
		password:cfg.RPCPASS,
		port:cfg.RPCPORT
	};
	RPC.rpc = new RpcClient(config);
	RPC.ID = 0;
	console.log("RPC Ready");
}

RPC.Call = function(method,params={})
{
	method = method.toLowerCase();
	return new Promise(async (Resolve,Reject)=>
	{
		try
		{
//			console.log(params);
			var n, list = [], count = CMDS[method].count;
			if( !CMDS[method] )
			{
				throw("Invalid Action");
			}
			for(n in CMDS[method])
			{
				if( typeof params[n] !== 'undefined' )
				{
					list.push(params[n]);
					if( n == 'count' )
						count = params[n];
				}
				else if( CMDS[method][n] === '?' )
				{
					console.error('Error: \"'+n+'\" Parameter required in RPC call');
					throw(n+' parameter required');
				}
				else
				{
					if( n == 'start' )
					{
						let v = CMDS[method].start;
						if( v == '' )
							v = -count;
						list.push(v);
					}
					else
						list.push(CMDS[method][n]);
					if( n == 'count' )
						count = CMDS[method][n];
				}
			}
			RPC.ID = (RPC.ID+1)%100 + 100;
			let l = JSON.stringify(list).substr(0,1024)+" ...";

			console.log("RPC Call: "+method+" "+l+" ID# "+RPC.ID);
			RPC.rpc.call({
				method:method,
				params:list,
				id:RPC.ID
			},(err, res)=>{
				if(err)
				{
					console.error("\x1b[31m\n====== RPC ERROR =====")
//					console.log("RPC Call: "+method+" "+l+" ID# "+RPC.ID);
					console.error("RPC error: "+err);
					console.error(err.stack);
					console.error("\x1b[31m====== RPC ERROR =====\n\x1b[0;37m")
					Reject(err);
				}
				else
				{
//					console.log("\x1b[32mRPC Return ID# "+res.id+"\x1b[0;37m");
					Resolve(res.result);
				}
			});
		}
		catch(e)
		{
			console.error("Error: "+	method);
			console.error(e);
			console.error(e.stack);
			Reject(e);
		}
	});
}


 