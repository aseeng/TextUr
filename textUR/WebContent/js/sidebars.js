$(document).ready(function() { 
	checkLogin();
	
	if($('#user').html() == "")
		$('#aside').css("display","none");
})

window.onload= function() {
	$("#loading").remove();
};

function checkLogin(){
	$.ajax({  
		url: 'checkLogin',
		data : {
			page : document.location.href
		},
		success: function(response){				
			if(response=="false"){

				swal("You are not logged in!", "You will be redirected to the login page", "warning")
				.then(() => {
					document.location.href = "page?action=login";
				});
			}
		},
		type: 'GET'
	});
}