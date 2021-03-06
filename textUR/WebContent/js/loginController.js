function checkEnter(){
	
	document.getElementById('username').addEventListener('keypress', function check(event){
		var keycode = event.keyCode;
		if(keycode == '13') {
		    $('#button').click();   
		}
	});
	document.getElementById('password').addEventListener('keypress', function check(event){
		var keycode = event.keyCode;
		if(keycode == '13') {
		    $('#button').click();   
		}
	});
};

function login(){
	var spin = $('<div></div>').addClass("se-pre-con").attr("id","loading");
	$("body").append(spin);
	
	$.ajax({
		url : 'login',
		data : {
			username : $('#usernameInput').val(),
			password : $('#passwordInput').val()
		},
		success : function(response) {
			if(response == "password"){
				swal("Error", "Wrong password!", "error")
					.then(() => {
						$('#passwordInput').val("");
						$('#passwordInput').css("border-color","red");
						$('#passwordInput').css("border-style","solid");
						$('#passwordInput').attr("onfocus","reset();");
						$('#loading').remove();
					});
			}
			else if(response == "user"){
				swal("Error","User not found!", "error")
					.then(() => {
						$('#usernameInput').css("border-color","red");
						$('#usernameInput').css("border-style","solid");
						$('#usernameInput').val("");
						$('#passwordInput').val("");
						$('#usernameInput').attr("onfocus","reset();");
						$('#loading').remove();
					});
			} else{
				document.location.href = "page?action=index";
			}
		},
		type : 'GET',
	});
}

function reset()
{
	$('.Input').removeAttr("style", null);
//	$('.Input').removeAttr("onfocus", null);
}


function onSignIn(googleUser) {
	  var profile = googleUser.getBasicProfile();
	  $.ajax({
			url : 'loginAPI',
			data : {
				email : profile.getEmail(),
				image: profile.getImageUrl()
			},
			success : function(responseText) {
				if(responseText == "register")
				{
					swal("Please choose your username:", {
						content: "input",
						})
						.then((value) => {
							if (value != null && value != "") {
								$.ajax({
									url: 'loginAPI',
									data : {
										email : profile.getEmail(),
										name :  value,
										image: profile.getImageUrl()
									},
									success : function(){
										document.location.href = "page?action=index";
									},
									error : function(){ 
										alert("error");
									},
									type : 'POST'
								});
							}
						})
				}	
				else
					document.location.href = "page?action=index";
			},
			type : 'GET'
	});
}

function logout() {
	 document.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:8080/SIW_InstanText/html/page?action=logout";
}