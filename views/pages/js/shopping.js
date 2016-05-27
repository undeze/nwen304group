

$(document).ready(function() {
	
	var Arrays=new Array();
	//getData();
	getWeather();
	
	$('.add-to-cart-button').click(function(){
		
		var thisID 	  = $(this).parent().parent().attr('id').replace('detail-','');
		
		var itemname  = $(this).parent().find('.item_name').html();
		var itemprice = $(this).parent().find('.price').html();
		
		if(include(Arrays,thisID))
		{
			var price 	 = $('#each-'+thisID).children(".shopp-price").find('em').html();
			var quantity = $('#each-'+thisID).children(".shopp-quantity").html();
			quantity = parseInt(quantity)+parseInt(1);
			
			var total = parseInt(itemprice)*parseInt(quantity);
			
			$('#each-'+thisID).children(".shopp-price").find('em').html(total);
			$('#each-'+thisID).children(".shopp-quantity").html(quantity);
			
			var prev_charges = $('.cart-total span').html();
			prev_charges = parseInt(prev_charges)-parseInt(price);
			
			prev_charges = parseInt(prev_charges)+parseInt(total);
			$('.cart-total span').html(prev_charges);
			
			$('#total-hidden-charges').val(prev_charges);
		}
		else
		{
			Arrays.push(thisID);
			
			var prev_charges = $('.cart-total span').html();
			prev_charges = parseInt(prev_charges)+parseInt(itemprice);
			
			$('.cart-total span').html(prev_charges);
			$('#total-hidden-charges').val(prev_charges);
			
			var Height = $('#cart_wrapper').height();
			$('#cart_wrapper').css({height:Height+parseInt(45)});
			
			$('#cart_wrapper .cart-info').append('<div class="shopp" id="each-'+thisID+'"><div class="label">'+itemname+'</div><div class="shopp-price"> $<em>'+itemprice+'</em></div><span class="shopp-quantity">1</span><img src="remove.png" class="remove" /><br class="all" /></div>');
		}
		$('.detail-view').slideUp('slow');
	});	
	
	$('.remove').livequery('click', function() {
		
		var deduct = $(this).parent().children(".shopp-price").find('em').html();
		var prev_charges = $('.cart-total span').html();
		
		var thisID = $(this).parent().attr('id').replace('each-','');
		
		var pos = getpos(Arrays,thisID);
		Arrays.splice(pos,1,"0")
		
		prev_charges = parseInt(prev_charges)-parseInt(deduct);
		$('.cart-total span').html(prev_charges);
		$('#total-hidden-charges').val(prev_charges);
		$(this).parent().remove();
		
	});	
	
	$('#Submit').livequery('click', function() {
		
		var totalCharge = $('#total-hidden-charges').val();
		
		$('#cart_wrapper').html('Total Charges: $'+totalCharge);
		
		return false;
		
	});	
	
	// this is for 2nd row's li offset from top. It means how much offset you want to give them with animation
	var single_li_offset 	= 200;
	var current_opened_box  = -1;
	
	$('#wrap li').click(function() {
	
		var thisID = $(this).attr('id');
		var $this  = $(this);
		
		var id = $('#wrap li').index($this);
		
		if(current_opened_box == id) // if user click a opened box li again you close the box and return back
		{
			$('#wrap .detail-view').slideUp('slow');
			return false;
		}
		$('#cart_wrapper').slideUp('slow');
		$('#wrap .detail-view').slideUp('slow');
		
		// save this id. so if user click a opened box li again you close the box.
		current_opened_box = id;
		
		var targetOffset = 0;
		
		// below conditions assumes that there are four li in one row and total rows are 4. How ever if you want to increase the rows you have to increase else-if conditions and if you want to increase li in one row, then you have to increment all value below. (if(id<=3)), if(id<=7) etc
		
		if(id<=3)
			targetOffset = 0;
		else if(id<=7)
			targetOffset = single_li_offset;
		else if(id<=11)
			targetOffset = single_li_offset*2;
		else if(id<=15)
			targetOffset = single_li_offset*3;
		
		$("html:not(:animated),body:not(:animated)").animate({scrollTop: targetOffset}, 800,function(){
			
			$('#wrap #detail-'+thisID).slideDown(500);
			return false;
		});
		
	});
	
	$('.close a').click(function() {
		
		$('#wrap .detail-view').slideUp('slow');
		
	});
	
	$('.closeCart').click(function() {
		
		$('#cart_wrapper').slideUp('slow');
		
	});
	
	$('#show_cart').click(function() {
		
		$('#cart_wrapper').slideToggle('slow');
		
	});
	
});

function include(arr, obj) {
  for(var i=0; i<arr.length; i++) {
    if (arr[i] == obj) return true;
  }
}

function getpos(arr, obj) {
  for(var i=0; i<arr.length; i++) {
    if (arr[i] == obj) return i;
  }
}

//A GET request. If successful, this passes data to the 'refreshList' function
function getData(){
	$.get('https://nwen304group6.herokuapp.com/cart',function(data){
			alert(data);
			//refreshList(data);
		});
	// });
	// $.ajax({
	// 	method: 'GET',
	// 	url: 'https://nwen304group6.herokuapp.com/cart',
	// 	data: JSON.stringify({
	// 		member: "8"
	// 	}),
	// 	contentType: "application/json",
	// 	dataType: "json"
	// }).then(refreshList,alert('hello'));//ERROR_LOG);
	// $.ajax({
	// 	method: 'GET',
	// 	url: 'https://nwen304group6.herokuapp.com/cart',
	// 	data: JSON.stringify({
	// 		member: 8
	// 	}),
	// 	contentType: "application/json",
	// 	dataType: "json",
	// 	success: function(data){
	// 		alert('No Error...');
	// 		refreshList(data);
	// 	},
	// 	error: function(){
	// 		alert('Error...');
	// 	}
	// });
};

//Redraws the shopping cart for the client
function refreshList(data){
	//Loop through all items in the cart database
	alert(data.length);
	for(items in data){
		var itemName = data[items].name;
		var price = data[items].price;
		var quantity = data[items].quantity;

		$('#cart_wrapper .cart-info').append('<div class="shopp" id="each-'+thisID+'"><div class="label">'+itemName+'</div><div class="shopp-price"> $<em>'+price+'</em></div><span class="shopp-quantity">'+quantity+'</span><img src="remove.png" class="remove" /><br class="all" /></div>');
	}
};

function getWeather(){
	$.ajax({
		url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20%3D%2015021762&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
		method: "GET",
		dataType: "jsonp",
		success: function(data){
			var temp = data.query.results.channel.item.condition.temp;
			temp = ((temp - 32) * 5)/9;
			temp = temp.toFixed(1);
			var condition = data.query.results.channel.item.condition.text;
			var desc = data.query.results.channel.item.description;
			desc = desc.match(/"[^"]+"/g);
			$('.footer').children('#weather').html("<b>Current Conditions:</b> <br />"+condition+"</b> <br />"+temp+" Degrees </b> <br /> <img src="+desc+"/>");
		},
		error: function(){
			alert('Error retreiving weather results');
		}
	});
};

function getRecommendation(weather,temperature){
	
}