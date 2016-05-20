$(document).ready(function(){
	$('#form').validate({
		rules: {
			firstname: {
				required: true,
				minlength: 4,
				maxlength:10
			},
			lastname: {
				required: true,
				minlength: 4,
				maxlength:10
			},
			email: {
				required: true,
				email: true
			},
			password: {
				required: true,
				minlength: 5,
				maxlength:10
			},
			phone: {
				required: true,
				maxlength:12,
				minlength:5
			}
		}
	});
});