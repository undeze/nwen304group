$(document).ready(function() {
	var Arrays=new Array();

	//Gets the data for the weather
	getWeather();
	//Gets data for shopping cart items
	getData(true);
	
	$('.add-to-cart-button').click(function(){

		var thisID 	  = $(this).parent().parent().attr('id').replace('detail-','');	
		var itemname  = $(this).parent().find('.item_name').html();
		var itemprice = $(this).parent().find('.price').html();
		
		//Add item to cart database
		addToCart(itemname);
		
		if(include(Arrays,thisID)) {
		// 	var price 	 = $('#each-'+thisID).children(".shopp-price").find('em').html();
		// 	var quantity = $('#each-'+thisID).children(".shopp-quantity").html();
		// 	quantity = parseInt(quantity)+parseInt(1);
			
		// 	var total = parseInt(itemprice)*parseInt(quantity);
			
		// 	//$('#each-'+thisID).children(".shopp-price").find('em').html(total);
		// 	//$('#each-'+thisID).children(".shopp-quantity").html(quantity);
			
		// 	var prev_charges = $('.cart-total span').html();
		// 	prev_charges = parseInt(prev_charges)-parseInt(price);
			
		// 	prev_charges = parseInt(prev_charges)+parseInt(total);
		// 	//$('.cart-total span').html(totalPrice);
			
		// 	$('#total-hidden-charges').val(prev_charges);
		}
		else {
		Arrays.push(thisID);
			
		// 	var prev_charges = $('.cart-total span').html();
		// 	prev_charges = parseInt(prev_charges)+parseInt(itemprice);
			
		// 	//$('.cart-total span').html(prev_charges);
		// 	$('#total-hidden-charges').val(prev_charges);
			
			var Height = $('#cart_wrapper').height();
			$('#cart_wrapper').css({height:Height+parseInt(45)});
			
		// 	$('#cart_wrapper .cart-info').append('<div class="shopp" id="each-'+thisID+'"><div class="label">'+itemname+'</div><div class="shopp-price"> $<em>'+itemprice+'</em></div><span class="shopp-quantity">1</span><img src="remove.png" class="remove" /><br class="all" /></div>');
		}
		$('.detail-view').slideUp('slow');
	});	
	
	$('.remove').livequery('click', function() {
		
		var item = $(this).parent().children(".label").html();
		console.log(item);
		
		//Remove item from datbase and reload
		removeFromCart(item);
		// var prev_charges = $('.cart-total span').html();		
		
		var thisID = $(this).parent().attr('id').replace('each-','');
		var pos = getpos(Arrays,thisID);
		Arrays.splice(pos,1,"0")
		
		// prev_charges = parseInt(prev_charges)-parseInt(deduct);
		// $('.cart-total span').html(prev_charges);
		// $('#total-hidden-charges').val(prev_charges);
		$(this).parent().remove();

		//Decrease size of wrapper
		var Height = $('#cart_wrapper').height();
		$('#cart_wrapper').css({height:Height-parseInt(45)});

		getData(false);
	});	
	
	$('#Submit').livequery('click', function() {
		makePurchase();
		$('#cart_wrapper').html('Thank you for your purchase');
		
		//return false;
		
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
function getData(isFirstLoad){
	$.ajax({
		method: 'GET',
		url: 'https://nwen304group6.herokuapp.com/cart',
		contentType: "application/json",
		dataType: "json",
		success: function(data){
			refreshList(data,isFirstLoad);
		},
		error: function() {
			console.log("An error ocurred retrieving data");
		}
	});
};

//Redraws the shopping cart for the client
function refreshList(data, isFirstLoad){
	//Clear data
	$('#cart_wrapper .cart-info').empty();

	//Loop through all items in the cart database
	var totalPrice = 0;
	for(items in data){
		var itemName = data[items].name;
		var price = data[items].price;
		var priceAsFloat = parseFloat(price.split("$").pop());
		var quantity = data[items].quantity;
		totalPrice += priceAsFloat * quantity;

		var itemHTML = '<div class="shopp" id="each-'+items+'"><div class="label">'+itemName+'</div><div class="shopp-price"> $<em>'+price+'</em></div><span class="shopp-quantity">'+quantity+'</span><img src="remove.png" class="remove" /><br class="all" /></div>';
		var $newItem = $(itemHTML);

		if(isFirstLoad){
			var Height = $('#cart_wrapper').height();
			$('#cart_wrapper').css({height:Height+parseInt(45)});
		}
		$('#cart_wrapper .cart-info').append($newItem);
	}
	$('.cart-total span').html(totalPrice);
};

//Gets the weather data from yahoo to be displayed
function getWeather(){
	$.ajax({
		//https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Wellington%2C%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys
		url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20%3D%2029344823&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
		method: "GET",
		dataType: "jsonp",
		success: function(data){
			var temp = data.query.results.channel.item.condition.temp;
			temp = ((temp - 32) * 5)/9;
			temp = temp.toFixed(1);
			var condition = data.query.results.channel.item.condition.text;
			var conditionCode = data.query.results.channel.item.condition.code;
			var desc = data.query.results.channel.item.description;
			console.log("Weather code: "+conditionCode);
			var response = getRecommendation(conditionCode,temp);
			desc = desc.match(/"[^"]+"/g);
			$('.footer').children('#weather').append("<b>Current Conditions:</b> <br />"+condition+"<br />"+temp+" Degrees<br /> <img src="+desc+"/> <br /> "+response+ "<br />");
			getPastPurchaseRecommendation();
		},
		error: function(){
			alert('Error retreiving weather results');
		}
	});
};

//Removes an item from the shopping cart
function removeFromCart(itemName){
	var stringURL = 'https://nwen304group6.herokuapp.com/cart/delete';
	$.post(stringURL, {name: itemName},
	function success(data, status){
		$('#cart_wrapper').slideUp('slow');
		getData();
		console.log("Successfully removed item from cart");
	});
};

//Adds an item to the shopping cart
function addToCart(itemName){
	var stringURL = 'https://nwen304group6.herokuapp.com/cart/add';
	$.post(stringURL, {name: itemName},
		function success(data, status){
			getData(false);
			console.log("Successfully added item to cart");
		});
};

//Makes a purchases putting everything from shopping cart into a purchase table
function makePurchase(){
	var stringURL = 'https://nwen304group6.herokuapp.com/cart/purchase';
		$.post(stringURL, {member: "8"},
		function success(data, status){
			console.log("Successfully made purchase");
		});
};

//Gets a recommendation based on a member's past purchases
function getPastPurchaseRecommendation(){
	$.ajax({
		method: 'GET',
		url: 'https://nwen304group6.herokuapp.com/recommendation',
		contentType: "application/json",
		dataType: "json",
		success: function(data){
			var col = data[0].colour;
			$('.footer').children('#weather').append("Suggested Colour: "+col);
		},
		error: function() {
			console.log("An error ocurred retrieving data");
		}
	});
};

//Gets a purchase recommendation for the user
function getRecommendation(weatherCode,temperature){
//Weather Codes from yahoo
//https://developer.yahoo.com/weather/documentation.html

	//Stormy
	if(weatherCode <= 4){
		response = "The weather looks terrible out there, you may want some gumboots";
	}
	//Raining
	else if(weatherCode <= 12){
		response = "Stay nice and dry with a waterproof jacket";
	}
	//Snow / hail / sleet
	else if(weatherCode <= 18){
		response = "You should get some warm gloves to play out in the snow";
	}
	//Fog,haze,smoky
	else if(weatherCode <= 22){
		response = "Could be hard to see out there, maybe look for some glasses";
	}
	//Windy
	else if(weatherCode <= 24){
		response = "It's looking pretty windy out there, check out some windproof jackets";
	}
	//Cold
	else if(weatherCode <= 25){
		response = "Stay warm with a nice warm jacket";
	}
	//Cloudy
	else if(weatherCode <= 30){
		if(temperature < 10){
			response = "Cloudy and cold, check out some warm pants";
		}
		else{
			response = "Cloudy but not cold, check out some jerseys";
		}
	}
	//Sunny,clear
	else if(weatherCode <= 34){
		if(temperature > 20){
			response = "It's looking beautiful out there, check out our range of singlets";
		}
		else if(temperature > 15){
			response = "It's looking nice out there, check out our range of t-shirts";
		}
		else{
			response = "It's looking nice out there, not too warm though, stay protected with some sunnies";
		}
	}
	//Rain,hail
	else if(weatherCode <= 35){
		rsponse = "Rain, with chances of hail, maybe you should check out some weatherproof gear";
	}
	//Hot
	else if(weatherCode <= 36){
		response = "It sure is hot outside, check out some sunnies and singlets to stay cool";
	}
	//Thunderstorms
	else if(weatherCode <= 40){
		response = "It's an inside day today, enjoy it with some whiskey";
	}
	//Snow
	else if(weatherCode <= 43){
		response = "Go play in the snow with some warm gloves and boots";
	}
	else{
		response = "Check out our whole range, there will be something everyone will love";
	}
	return response;
};