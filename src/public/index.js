var MYNODE = {};
var inStart = 1;
var quill = null;
var loading = false;
var ISADMIN = false;
var uac = null;

function $(sel)
{
	return document.querySelector(sel);
}

function $$(sel)
{
	return document.querySelectorAll(sel);
}

function OpenModal()
{
	$('#modalBox').style.display='block';
	$("#userpass").value = '';
	$("#userpass").focus();
	$("#modalBox").onkeyup = function(evt)
	{
		if(evt.keyCode == 13 )
			LogIn();
	}
}

function Run(action,params)
{
	return new Promise(async (Resolve,Reject)=>
	{
		if( !params )
			params = {};
		try
		{
			params.method = action;
			let rv = await fetch(	"/run", {
									method: 'POST',
									headers: {
									  'Accept': 'application/json',
									  'Content-Type': 'application/json'
									},
									body:JSON.stringify(params)
								});
			let j = await rv.json();
			if( j.login )
			{
				alert("Your new Chainmail is set up\nPlease re-log in to start using Chainmail");
				OpenModal();
				throw("Please re-log in");
			}
			if( j.error )
				throw( j.error.message || j.error );
			else
				Resolve(j.data);
		}
		catch(e)
		{
			console.error(e);
			Reject(e);
		}
	});
}

function Wait(tf)
{
	if( tf )
		document.body.style.cursor = 'wait';
	else
		document.body.style.cursor = 'default';
}

function ArrayToB64( buffer )
{
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function SlideLeft()
{
	return new Promise((Resolve)=>
	{
		let le = $('#messageList');
		let re = $('#messageData');
		let ce = $('#mainContainer')
		let lw = 340;
		let max = ce.offsetWidth * 0.9;
		let rw = 0;
		function Run()
		{
			if( lw > 20 )
			{
				lw -= 15;
				le.style.width = lw+"px";
			}
			if( rw < max )
			{
				rw += 15;
				re.style.width = rw+"px";
			}
			if( lw <= 20 && rw >= max )
				Resolve(true);
			else
				setTimeout(Run,1);
		}
		Run();
	});
}

function SlideRight()
{
	return new Promise((Resolve)=>
	{
		let le = $('#messageList');
		let re = $('#messageData');
		let ce = $('#mainContainer')
		let lw = 0;
		let max = ce.offsetWidth * 0.9;
		let rw = max;
		function Run()
		{
			if( rw > 0 )
			{
				rw -= 15;
				re.style.width = rw+"px";
			}
			if( lw < 340 )
			{
				lw += 15;
				le.style.width = lw+"px";
			}
			if( lw >= 340 && rw <= 0 )
				Resolve(true);
			else
				setTimeout(Run,1);
		}
		Run();
	});
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

async function NewMail()
{
	$("#newBtn").style.display = 'none';
	$('#inBoxHdr').style.display = 'none';
	$("#rBtn").style.display = 'block';
	await SlideLeft();
	CreateEditor();
}

async function CloseMessageText()
{
	$("#rBtn").style.display = 'none';
	await SlideRight();
	$("#newBtn").style.display = 'block';
	$('#inBoxHdr').style.display = 'block';
	$('#data').innerHTML = "";
}

function CreateEditor(data="\n",sub='',tID='',attach=null,docName='')
{
	$("#data").innerHTML = "";
	let e = document.createElement('div');
	e.id = 'editorDiv';
	e.width = '100%';
	e.height = '90%';
	let htm = `
		<p>From: <span id='inpFrom'>${MYNODE.name}</span></p>
		<p>To:<br><input id='inpTo' style='width:250px;' type='text' value='${tID}' size='33'></p>
		<p>Subject:<br><input id='inpSubj' style='width:95%;' type='text' value='${sub}'></p>
		<div id='editor' class='w3-white' style='height:250px;'></div>
	`;
	if( !attach )
		htm += `<p>Attachment:<br><input id='inpAttach' type='file'></p>`;
	else
		htm += `<input type='checkbox' id='inc' data-docID='${attach}'> Include attachment: <span id='docname'>${docName}</span>`;
	htm += `
		<p class='w3-margin-top'>
			<div class='w3-padding w3-right'><button class='w3-button w3-red' onclick='CloseMessageText()'><i class="fas fa-ban"></i> Cancel</button></div>
			<div class='w3-padding w3-right'><button class='w3-button w3-green' onclick='Send()'><i class="far fa-paper-plane"></i> Send</button></div>
		</p>
	`;
	e.innerHTML = htm;
	$('#data').appendChild(e);

	var toolbarOptions = [
		['bold', 'italic', 'underline'],        // toggled buttons
		[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
		[{ 'font': [] }],
		[{ 'align': [] }],
		['blockquote'],

		[{ 'header': 1 }, { 'header': 2 }],               // custom button values
		[{ 'list': 'ordered'}, { 'list': 'bullet' }],
		[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
		[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent

		[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme

		['clean']                                         // remove formatting button
	];

	let options = {
//		debug: 'info',
		modules: {
			 toolbar: toolbarOptions
		},
		placeholder: 'Compose an epic...',
		readOnly: false,
		theme: 'snow'
	}
	quill = new Quill('#editor',options);
	quill.root.innerHTML = data;
	if( data.length > 2 )
		quill.insertText(0,"");
	
	$('#inpFrom').fontFamily = 'monospace';
	let inp = $("#inpTo");
	inp.style.fontFamily = 'monospace';
	inp.onblur = function(evt)
	{
		let regex = RegExp('[1-9A-Za-z]','g');
		let v = inp.value;

		if( v.substr(0,1) === '@' && regex.test(v.substr(1)) )
		{
			inp.value = inp.value.toUpperCase();
			return;
		}
		else
		{
			v = v.replace(/\-/g,"");
			v = v.replace(/ /g,"");
			if( v.length !== 12 )
			{
				res.send("ERROR:\nCheck the TO ID");
				return;
			}
			if( !regex.test(v) )
			{
				res.send({error:'Invalid TO address'});
				return;
			}			
			let v1 = v.substr(0,4);
			let v2 = v.substr(4,4);
			let v3 = v.substr(8,4) || '';
			if( v1.length == 4 )
				v1 += '-';
			if( v2.length == 4 )
				v2 += '-';		
			inp.value = (v1+v2+v3).toUpperCase();
		}
	};
}

async function Send()
{
	Wait(true);
	var errTxt = '', attach = null;
	try
	{
		var j, fdata = null, docID = false, docName = false;
		let toID = $("#inpTo").value;
		let subj = $("#inpSubj").value;
		let htm = quill.root.innerHTML;
		if($("#inpAttach") && $("#inpAttach").files.length > 0 )
			attach = $("#inpAttach").files;
		toID = toID.trim();
		if( toID.indexOf('@') == 0 )
		{
			toID = toID.trim(' ');
			errTxt = 'Unknown alias';
			let id = await Run('LookupAlias',{key:toID});
			if( !id )
			{
				throw("Unkown alias")
			}
			toID = id;
		}
		else
		{
			errTxt = 'Invalid to ID';
			toID = toID.replace(/\-/g,"");
			if( toID.length !== 12 )
			{
				throw('Invalid TO ID');
			}
			let v1 = toID.substr(0,4);
			let v2 = toID.substr(4,4);
			let v3 = toID.substr(8,4);
			toID = v1+'-'+v2+'-'+v3;
		}

		if( attach )
		{
			errTxt = 'ERROR:\nAttachement could not be saved';
			fdata = await ReadAttachemntFile(attach[0]);
			docID = Random36(16);
			console.log(docID);
			docName = attach[0].name || false;
			errTxt = 'ERROR:\nError sending attachment';
			let data = {toID:toID,fromID:MYNODE.nodeID,docID:docID,attachment:fdata};
			await Run('SendAttachment',data);
		}
		let inc = $('#inc');
		if( inc )
		{
			let ck = inc.checked;
			if( ck )
			{
				docID = inc.getAttribute('data-docID');
				fdata = await Run('GetAttachment',{docID:docID});
				errTxt = 'ERROR:\nError sending attachment';
				docID = Random36(16)
				let data = {toID:toID,fromID:MYNODE.nodeID,docID:docID,attachment:fdata};
				await Run('SendAttachment',data);
			}
		}		
		
		
		errTxt = 'ERROR:\nError sending mail';
		let data = {toID:toID,fromID:MYNODE.nodeID,subj:"Fwd: "+subj,message:htm,docID:docID,docName:docName};
		await Run('SendMail',data);
		


		alert("Success:\nMessage Sent");
		await CloseMessageText();
		LoadInBox();
	}
	catch(e)
	{
		if( !e )
			alert("ERROR:\n"+errTxt);
		else
			alert("NOTICE:\n"+e);
	}
	Wait(false);
}

function ReadAttachemntFile(file)
{
	return new Promise((Resolve,Reject)=>
	{
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			Resolve(e.target.result);
		};
		reader.onerror = function() 
		{
			console.log(reader.error);
			Reject(reader.error);
		};

		reader.readAsDataURL(file);
	});
}

async function LoadInBox()
{
	if( loading )
		return;
	loading = true;
	let inbox = $("#inBox")
	inbox.innerHTML = '';
//	let start = -inStart;
	try
	{	let i, j = await Run('GetInBox',{count:50,start:-1});
		for(i=0;i<j.length;i++)
		{
			let e = document.createElement('div');
			e.style.border = '1px solid black';
			e.classList.add('w3-container');
			let htm = `<div style='padding:6px 8px 6px 2px;' data-txid='${j[i].txid}' class="w3-left far fa-envelope-open fa-2x"></div>`;
			htm += `<b>From: <span class='mailmsg' data-nodeID='${j[i].fromID}'>${j[i].fromID}</span></b><br>`;
			htm += `${j[i].timestamp}`;
			e.innerHTML = htm;
			let ico = e.querySelector('div');
			inbox.appendChild(e);
			ico.style.cursor = 'pointer';
			ico.onclick = OpenMessage;
		}
		GetAlias();
		loading = false;
	}
	catch(e)
	{
		loading = false;
	}
}

async function GetAlias()
{
	let i, j = $$('.mailmsg');
	for(i=0;i<j.length;i++)
	{
		let id = j[i].getAttribute('data-nodeID');
		let alias = await Run('GetAlias',{nodeID:id});
		if( alias )
			j[i].innerText = alias;
	}
}

async function OpenMessage(evt)
{
	$('#data').innerHTML = '';
	let alias = evt.target.parentNode.querySelector('.mailmsg').innerText;
	let txid = evt.target.getAttribute('data-txid');
	let msg = await Run("GetMessage",{txid:txid});
	$("#newBtn").style.display = 'none';
	$('#inBoxHdr').style.display = 'none';
	$("#rBtn").style.display = 'block';
	await SlideLeft();
	let e = document.createElement('div');
	e.id = 'editorDiv';
	e.width = '100%';
	e.height = '90%';
	let htm = `
		<p>From:<br><span id='fromID'>${msg.fromID}</span>
	`;
	if( alias.substr(0,1) == '@' )
		htm += ` [${alias}]`;
	htm += `
		</p>
		<p>To:<br><span id='toID' data-addr'='${MYNODE.nodeID}'>${MYNODE.nodeID}</span></p>
		<p>Subject:<br><span id='subj'>${msg.subject}</span></p>
		<p>Timestamp:<br><span id='timestamp'>${msg.timestamp}</span></p>
		<div id='msg' style='height:250px;width:95%;border:1px solid black;overflow-y:auto;' class='w3-container w3-white'>${msg.message}</div>
	`;
	if( msg.docID )
	{
		let name = msg.docName.substr(0,64);
		htm += `
			<div><button id='attach' onclick="OpenAttachment('${msg.docID}')"><i class="fas fa-paperclip"></i> ${msg.docName}</button>
			</div><br>
		`;
	}
	htm += `	
		<div class='w3-container'>
			<div class='w3-padding w3-right'><button class='w3-button w3-red' onclick='CloseMessageText()'><i class="far fa-envelope"></i> Close</button></div>
			<div class='w3-padding w3-left'><button class='w3-button w3-green' onclick='Reply()'><i class="fas fa-reply"></i> Reply</button></div>		
			<div class='w3-padding w3-left'><button class='w3-button w3-green' onclick="Forward('${msg.docID}')"><i class="fas fa-share"></i> Forward</button></div>		
		</div>
	`;
	e.innerHTML = htm;
	$('#data').appendChild(e);
}

async function OpenAttachment(docID)
{
	Wait(true)
	let doc = await Run('GetAttachment',{docID:docID});
	window.open(doc);
	Wait(false);
}

function Start()
{
	OpenModal();
}

function Reload()
{
	LoadInBox();
}
	
	
async function LogIn()
{
	let j = null;
	let code = $("#userpass").value;
	if( uac && uac != code )
	{
		alert("Codes do not match try again");
		uac = null;
		OpenModal();
		return;
	}
	let rv = await Run('getaddresses');
	MYNODE.address = rv[0];
	console.log(MYNODE);
	try
	{
		j = await Run('nodeinfo',{code:code});
		if( j )
		{
			MYNODE.nodeID = j.nodeID;
			MYNODE.name = MYNODE.nodeID;
			$('#node').innerHTML = MYNODE.nodeID;
			inStart = 1;
			let rv = await Run('GetAlias',{nodeID:MYNODE.nodeID});
			if( rv )
				$('#node').innerHTML += "<br>"+rv.alias+"<br>;"+rv.expire;
			$('#modalBox').style.display='none';
			ISADMIN = await Run('IsAdmin');
			LoadInBox();
		}
		else
		{
			uac = code;
			alert("Validate your User Access Code");
			OpenModal();
		}
	}
	catch(e)
	{
		alert("ERROR\n"+e);
	}
}

async function Reply()
{
	let msg = $("#msg").innerHTML;
	let toID = $("#fromID").innerHTML;
	let subj = $("#subj").innerHTML;
	msg = "\n======== Original Message ========\n"+msg;	
	CreateEditor(msg, subj, toID);
}

async function Forward(docID)
{
	let msg = $("#msg").innerHTML;
	let subj = $("#subj").innerHTML;
	let docName = $('#attach').innerText;
	msg = "\n======== Original Message ========\n"+msg;	
	CreateEditor(msg,subj,'',docID,docName);
}


Start();