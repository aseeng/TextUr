$(document).ready(function() {
	
	var page = document.location.href.split("&");
	if(page[1] != undefined)
		var mode = page[1].split("\=")[1];
	else
		return;
	
	$('#sidebar').attr("style","display:block");
	
	editor = CodeMirror.fromTextArea($('#fileCode')[0], {
		tabSize : 4,
		lineNumbers : true,
		matchBrackets : true,
		mode : "text/x-java",
		extraKeys : {
			"Ctrl-Space" : "autocomplete"
		},
		autoCloseBrackets: true
	});
	
	if(mode == "read")
		editor.setOption("readOnly", true);
	
	editor2 = CodeMirror.fromTextArea($('#textarea2')[0], {
		tabSize : 4,
		lineNumbers : true,
		mode : "text/x-java",
		readOnly: 'nocursor'
	});
	
	initComments();
	initOptions();
});

window.onload = function(){

	loadChat();
	window.setInterval(loadChat,5000);
}

function initComments() {
	
	for(i=0; i<editor.lineCount(); i++)
	{
		var id = "#comment"+(i+1);
		var div = $('<div></div>').addClass("commentDiv").attr("id", id.substr(1));
			div.attr("onmouseover", "showButton("+(i+1)+")");
			div.attr("onmouseout", "hideButton("+(i+1)+")");
			
		var button = $('<button></button>').addClass("commentPlus");
			button.attr({
				id: "button"+(i+1),
				onclick: "editComments("+(i+1)+", "+editor.lineCount()+")",
				style: "visibility:hidden"
			});
		
		var icon = $('<i></i>').addClass('fa fa-plus icon').attr("id","icon"+(i+1));
		button.append(icon);
		
		div.append(button);
		$('#comments').append(div);
	}
	
	$.ajax({
		url: 'comment',
		success: function(response){
			$.each(JSON.parse(response), function(idx, obj) {
				var comment = "#comment"+obj.line;
				$(comment).removeAttr("onmouseover", null);
				$(comment).removeAttr("onmouseout", null);
				
				var button = "#button"+obj.line;
				$(button).removeAttr("style",null);
				$(button).attr("style","opacity:50");
				
				var icon = "#icon"+obj.line;
				$(icon).removeClass();
				$(icon).addClass("fa fa-comment-o icon");
			})
		},
		type: 'GET'
	});
}

function initOptions() {
	$.ajax({
		url : 'readText',
		success: function(response){
			var string = response.substring(0,4);
			if(string == "lock")
			{
				editor.setOption("readOnly", true);
				window.setInterval(function(){
					$.ajax({
						url : 'readText',
						success: function(responseText){
							editor.setValue(responseText.substring(4));
						},
						type : 'GET'
					});
				}, 1500);	

			}
			else {
				window.setInterval(function(){
					$.ajax({
						url : 'saveText',
						data : {
							text : editor.getValue()
						},
						type : 'POST'
					});
				}, 2000);
			}
		},
		type : 'GET'
	});
}

function createCheckfile() {

	$.ajax({
		url: 'createCheckfile',
		success: function(response){
			if(response == "yes") {
				var name = null;
				swal("Please enter description:", {
					content: "input",
				})
				.then((value) => {
					name = value;
					if (name != null) {
						$.ajax({
							url: 'createCheckfile',
							data : {
								description : name
							},
							success: function(){
								swal("Created", "Checkpoint created successfully!", "success");
							},
							error : function(){ 
								alert("error");
							},
							type : 'POST'
						});
					}
				})
			}
			else if(response == "no") {
				swal("Error", "Impossible to create checkpoint, file in edit!","error");
			}
		},
		error : function(){ 
			alert("error");
		},
		type : 'GET'
	});
}

var fileConsulted;

function consult() {
	$.ajax({
		url: 'restoreCheckfile',
		success: function(response){
			var div = document.createElement("div");
		
			$.each(JSON.parse(response), function(idx, obj) {
				var button = document.createElement("button");
				button.className = "btn bg-red";
				
				button.onclick = function(){
					$('#contenuto').show();
					editor2.setValue(obj.code);
					$('#mainarea').attr("style","float: left; width: 45%; margin-left:2%;");
					fileConsulted = obj.id;
					$("div#contenuto h2").html(obj.name);
				};

				button.innerHTML = obj.name;
				div.appendChild(button);
				$('#ripristina').show();
			})
			swal({
				content:div,
				type:"info"
			});
		},
		error : function(){ 
			alert("error");
		},
		type : 'GET'
	});
}

function findString() {
	var name = null;
	var type = null;
	swal("Please enter string to find:", {
		content:"input"
	})
	.then((value) => {
		if(value != null) {
			name = value;

			swal("Select where do you want to find the string", {
				buttons:{
					checkpoint:"checkpoint",
					project:"project"
				}
			})
			.then((value)=> {
				type= value;
				if (name != null && name != "") {
					$.ajax({
						url: 'findString',
						data : {
							text : name,
							type : type
						},
						success: function(response){

							if(response == "empty"){
								swal("Warning","String not found!","warning");
							}
							else {
								var div = document.createElement("div");
								
								$.each(JSON.parse(response), function(idx, obj) {
									var button = document.createElement("button");
									button.className = "btn bg-red";

									button.onclick = function(){
										$('#mainarea').attr("style","float: left; width: 45%; margin-left:2%;");
										$('#contenuto').show();
										editor2.setValue(obj.code);
										$("div#contenuto h2").html(obj.name);
									};

									button.innerHTML = obj.name;
									div.appendChild(button);
									$('#ripristina').hide();
								})
								swal({
									title: "String: " + name,
									content: div,
									type: "info"
								});
							}
						},
						error : function(){ 
							alert("error");
						},
						type : 'GET'
					});
				}
			})
		}
	})
}

function ripristina() {
	var resp;
	$.ajax({
		url: 'restoreCheckfile',
		data : {
			fileConsulted : fileConsulted
		},
		success : function(response) {

			if(response != "not") {

				var mode = true;
				swal({
					text: "Salvare stato attuale del file? ", 
					buttons: {
						catch: "YES!",
						defeat:  "NO!"
					},
				})
				.then((value) => {
					switch (value) {

					case "catch":
						mode = true;
						break;
					case "defeat":
						mode = false;
						break;
					default:
						return;

					}
					if (mode == true) {
						var name = null;
						swal("Please enter description:", {
							content: "input",
						})
						.then((value) => {
							name = value;
							if (name != null) {
								$.ajax({
									url: 'createCheckfile',
									data : {
										description : name
									},
									success: function(){
										swal("Created", "Checkpoint created successfully!", "success");
									},
									error : function(){ 
										alert("error");
									},
									type : 'POST'
								});
							}
							$.ajax({
								url: 'restoreCheckfile',
								data : {
									fileConsulted : fileConsulted
								},
								success: function(response){
									swal("Success","Checkpoint restored successfully!","success");
									editor.setValue(response);
									nascondi();
								},
								type:'POST'
							});
						})
					}
					else {
						$.ajax({
							url: 'restoreCheckfile',
							data : {
								fileConsulted : fileConsulted
							},
							success : function(response) {
								editor.setValue(response);
								nascondi();
							},
							type:'POST'
						});
					}
				});

			}
			else {
				swal("Error", "Impossible to restore checkpoint, file in edit!","error");
			}
		},
		type:'POST'
	});

}
function nascondi() {
	$('#mainarea').removeAttr("style", null);
	$('#contenuto').hide();
}

function closeFile() {
	document.location.href="page?action=homepage";
}

function removeFile() {
	$.ajax({
		url : 'removeFile',
		success: function(response){
			if(response == "yes") {
				swal("Removed", "File removed successfully!", "success").then(() => {
					document.location.href = "page?action=homepage";								
				})
			}
			else if(response == "no") {
				swal("Error", "Impossible to remove file, file in edit!","error");
			}
		},
		type : 'POST'
	});
}

function renameFile() {
	swal("Please enter new name:", {
		content: "input",
	})
	.then((value) => {
		if (value != null && value != "") {
			$.ajax({
				url: 'renameFile',
				data : {
					name :  value
				},
				success: function(response){
					if(response == "exist")
						swal("Error", "There is already a file with the same name", "error").then(()=>{
							renameFile();
						});
					else {
						swal("Renamed","Successful renamed!", "success").then(() => {
							$('h2').html(value);								
						})
					}
				},
				error : function(){ 
					alert("error");
				},
				type : 'POST'
			});
		}
	})
}

function post(line)
{
	var text = $('#input').val();
	if(text == "" || text == " ")
		return;
	$.ajax({
		url: 'comment',
		data : {
			text :  text,
			line : line
		},
		success : function(response){
			var	div = $('<div></div>').addClass("direct-chat-msg");
			var div1 = $('<div></div>').addClass("box-footer box-comments");
			var date = new Date().getTime();
			var span1 = $('<span></span>').addClass("pull-left comment-date").text(moment().format('l').date(1));
			var span = $('<span></span>').addClass("pull-right username comment-user").text($('#user').html());
			var div3 = $('<div></div>').addClass("comment-text comment").text(text);

			span1.append(span);
			div1.append(span1);
			div.append(div1);
			div.append(div3);
			
			$('#comment').append(div);

			$('#input').val("");
			var iconId = "#icon"+line;
			$(iconId).removeClass();
			$(iconId).addClass("fa fa-comments-o icon");
		},
		error : function(){ 
			alert("error");
		},
		type : 'POST'
	});
}

function editComments(index, lines){
	$('.removable').remove();

	var iconId = "#icon"+index;
	var commentId = "#comment"+index;
	for(j=1; j<lines; j++){
		if(j != index)
		{
			var id = "#icon"+j;
			if($(id).hasClass("fa fa-comments-o icon"))
			{
				$(id).removeClass();
				$(id).addClass("fa fa-comment-o icon");
			}
			
			if(!$(id).hasClass("fa fa-comment-o icon"))
			{
				$(id).removeClass();
				$(id).addClass("fa fa-plus icon");
			
				var id = "#comment"+j;
				$(id).attr("onmouseout", "hideButton("+j+")");
				hideButton(j);
			}
		}
	}
	
	if($(iconId).hasClass("fa fa-minus icon")){
		$(iconId).removeClass();
		$(iconId).addClass("fa fa-plus icon");
		$(commentId).attr("onmouseout", "hideButton("+index+")");
		return;
	}
	
	if($(iconId).hasClass("fa fa-comments-o icon")){
		$(iconId).removeClass();
		$(iconId).addClass("fa fa-comment-o icon");
		return;
	}
	
	$(commentId).removeAttr("onmouseout", null);
	
	if($(iconId).hasClass("fa fa-comment-o icon"))
	{
		$(iconId).removeClass();
		$(iconId).addClass("fa fa-comments-o icon");
	}
	else {
		$(iconId).removeClass();
		$(iconId).addClass("fa fa-minus icon");
	}
	
	var forum = $('<div></div').addClass("removable");
	var mainDiv = $('<div></div').addClass("box box-danger direct-chat direct-chat-danger").attr("id","forum");
	var boxBody = $('<div></div').addClass("box-body");
	var comm = $('<div></div').addClass("direct-chat-message").attr("id", "comment");

	$.ajax({
		url: 'comment',
		data: {
			line: index
		},
		success : function(response){
			$.each(JSON.parse(response), function(idx, obj) {
				var	div = $('<div></div>').addClass("direct-chat-msg");
				var div1 = $('<div></div>').addClass("box-footer box-comments");
				var span1 = $('<span></span>').addClass("pull-left comment-date").text(obj.date.substr(0,19));
				var span = $('<span></span>').addClass("pull-right username comment-user").text(obj.user.username);
				var div3 = $('<div></div>').addClass("comment-text comment").text(obj.text);
				
				span1.append(span);
				div1.append(span1);
				div.append(div1);
				div.append(div3);
				
				comm.append(div);
			});
			var buttonDiv = $('<div></div>').addClass("input-group removable buttons").attr("id","buttons");
			var input = $('<input>').attr({
				id: "input",
				placeholder: "write a comment ..."
			});
			buttonDiv.append(input);
			
			var button = $('<button> </button>').attr("onclick","post("+index+");");
			var icon = $('<i></i>').addClass("fa fa-send");
			
			button.append(icon);
			buttonDiv.append(button);
			boxBody.append(comm);
			
			mainDiv.append(boxBody);

			forum.append(mainDiv);
			$(commentId).append(forum);
			$(commentId).append(buttonDiv);
		},
		error : function(){ 
			alert("error");
		},
		type : 'GET'
	});
}

function showButton(index){
	var id = "#button"+index;
	$(id).removeAttr("style", null);
}

function hideButton(index){
	var id = "#button"+index;
	$(id).attr("style","visibility:hidden");
}