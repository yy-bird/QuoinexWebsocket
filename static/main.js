
var products = {"btcusd": 1, "qashbtc": 52, "qashusd": 57};
var api_base = "https://api.quoine.com";
var app = new Vue({
	el: "#app",
	data: {
		orderbooks: {},
	},
	computed: {
		accumulate_orderbooks: function(){
			var a_orderbooks = {};
			var orderbooks = this.orderbooks;
			for(var name in orderbooks){
				a_orderbooks[name] = {"sell":[], "buy":[]}
				if(this.orderbooks[name]["sell"])
				{
					for(var i = 0; i<10; i++){
						if(a_orderbooks[name]["sell"].length == 0){
							a_orderbooks[name]["sell"].push([orderbooks[name]["sell"][i][0]*1, orderbooks[name]["sell"][i][1]*1, orderbooks[name]["sell"][i][0] * orderbooks[name]["sell"][i][1]])
						}else{
							var current_total = orderbooks[name]["sell"][i][0] * orderbooks[name]["sell"][i][1] * 1;
							var pre_total = a_orderbooks[name]["sell"][i-1][2] * 1;
							var amount = a_orderbooks[name]["sell"][i-1][1] * 1 + orderbooks[name]["sell"][i][1] * 1;
							var price = (current_total + pre_total)/amount *1;
							a_orderbooks[name]["sell"].push([price, amount, pre_total+current_total])
						}
					}
				}
				if(this.orderbooks[name]["buy"])
				{
					for(var i = 0; i<10; i++){
						if(a_orderbooks[name]["buy"].length == 0){
							a_orderbooks[name]["buy"].push([orderbooks[name]["buy"][i][0]*1, orderbooks[name]["buy"][i][1]*1, orderbooks[name]["buy"][i][0] * orderbooks[name]["buy"][i][1]])
						}else{
							var current_total = orderbooks[name]["buy"][i][0] * orderbooks[name]["buy"][i][1] * 1;
							var pre_total = a_orderbooks[name]["buy"][i-1][2] * 1;
							var amount = a_orderbooks[name]["buy"][i-1][1] * 1 + orderbooks[name]["buy"][i][1] * 1;
							var price = (current_total + pre_total)/amount *1;
							a_orderbooks[name]["buy"].push([price, amount, pre_total+current_total])
						}
					}
				}
			}
			return a_orderbooks;
		},
		exchange_positive: function(){
			if(this.accumulate_orderbooks["qashusd"] && this.accumulate_orderbooks["qashusd"]["sell"].length &&
				this.accumulate_orderbooks["qashbtc"] && this.accumulate_orderbooks["qashbtc"]["buy"].length &&
				this.accumulate_orderbooks["btcusd"] && this.accumulate_orderbooks["btcusd"]["buy"].length)
			{
				var amount = Math.ceil(this.accumulate_orderbooks["btcusd"]["buy"][0][0] * 0.001);
				var from_sell, mid_buy, to_buy;
				for(var i =0; i<10;i++){
					if(this.accumulate_orderbooks["qashusd"]["sell"][i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = this.accumulate_orderbooks["qashusd"]["sell"][i][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashusd"]["sell"][i][1] * 1;
						}else{
							pre_total = this.accumulate_orderbooks["qashusd"]["sell"][i-1][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashusd"]["sell"][i-1][1] * 1;
						}
						var current_amount = this.accumulate_orderbooks["qashusd"]["sell"][i][1];
						var current_price = this.orderbooks["qashusd"]["sell"][i][0];
						from_sell = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount-pre_amount) * current_price)/amount};
						break;
					}
				}
				for(var i =0; i<10;i++){
					if(this.accumulate_orderbooks["qashbtc"]["buy"][i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = this.accumulate_orderbooks["qashbtc"]["buy"][i][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashbtc"]["buy"][i][1] * 1;
						}else{
							pre_total = this.accumulate_orderbooks["qashbtc"]["buy"][i-1][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashbtc"]["buy"][i-1][1] * 1;
						}
						var current_amount = this.accumulate_orderbooks["qashbtc"]["buy"][i][1];
						var current_price = this.orderbooks["qashbtc"]["buy"][i][0];
						mid_buy = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount - pre_amount) * current_price)/amount};
						break;
					}
				}
				to_buy = {"pre_total": this.accumulate_orderbooks["btcusd"]["buy"][2], "pre_amount": this.accumulate_orderbooks["btcusd"]["buy"][1], "ave_price": this.accumulate_orderbooks["btcusd"]["buy"][0][0]}
				
				return {"ratio": (100/from_sell["ave_price"]*mid_buy["ave_price"]*to_buy["ave_price"]).toFixed(8), 
						"availabe_amount": Math.min(from_sell["current_amount"], mid_buy["current_amount"]).toFixed(8), 
						"trade_amount": amount, "from_ave_price": from_sell["ave_price"], "mid_ave_price": mid_buy["ave_price"], "to_ave_price": to_buy["ave_price"]};
			}
			return {};
		},
		exchange_negative: function(){
			if(this.accumulate_orderbooks["qashusd"] && this.accumulate_orderbooks["qashusd"]["buy"].length &&
				this.accumulate_orderbooks["qashbtc"] && this.accumulate_orderbooks["qashbtc"]["sell"].length &&
				this.accumulate_orderbooks["btcusd"] && this.accumulate_orderbooks["btcusd"]["sell"].length)
			{
				var amount = Math.ceil(this.accumulate_orderbooks["btcusd"]["sell"][0][0] * 0.001);
				var to_sell, mid_sell, from_buy;
				for(var i =0; i<10;i++){
					if(this.accumulate_orderbooks["qashusd"]["buy"][i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = this.accumulate_orderbooks["qashusd"]["buy"][i][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashusd"]["buy"][i][1] * 1;
						}else{
							pre_total = this.accumulate_orderbooks["qashusd"]["buy"][i-1][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashusd"]["buy"][i-1][1] * 1;
						}
						var current_amount = this.accumulate_orderbooks["qashusd"]["buy"][i][1];
						var current_price = this.orderbooks["qashusd"]["buy"][i][0];
						from_buy = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount-pre_amount) * current_price)/amount};
						break;
					}
				}
				for(var i =0; i<10;i++){
					if(this.accumulate_orderbooks["qashbtc"]["sell"][i][1] > amount){
						var pre_total = 0, pre_amount = 0;
						if(i==0){
							pre_total = this.accumulate_orderbooks["qashbtc"]["sell"][i][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashbtc"]["sell"][i][1] * 1;
						}else{
							pre_total = this.accumulate_orderbooks["qashbtc"]["sell"][i-1][2] * 1;
							pre_amount = this.accumulate_orderbooks["qashbtc"]["sell"][i-1][1] * 1;
						}
						var current_amount = this.accumulate_orderbooks["qashbtc"]["sell"][i][1];
						var current_price = this.orderbooks["qashbtc"]["sell"][i][0];
						mid_sell = {"pre_total": pre_total, "pre_amount": pre_amount, "current_amount": current_amount, "ave_price": (pre_total + (amount - pre_amount) * current_price)/amount};
						break;
					}
				}
				to_sell = {"pre_total": this.accumulate_orderbooks["btcusd"]["sell"][2], "pre_amount": this.accumulate_orderbooks["btcusd"]["sell"][1], "ave_price": this.accumulate_orderbooks["btcusd"]["sell"][0][0]}
				return {"ratio": (100/to_sell["ave_price"]/mid_sell["ave_price"]*from_buy["ave_price"]).toFixed(8), 
						"availabe_amount": Math.min(from_buy["current_amount"], mid_sell["current_amount"]).toFixed(8), 
						"trade_amount": amount, "from_ave_price": from_buy["ave_price"], "mid_ave_price": mid_sell["ave_price"], "to_ave_price": to_sell["ave_price"]};
			}
			return {};
		}
	},
	filters: {
		to8Decimal: function(value){
			if(isNaN(value)){
				return 0;
			}
			return (value*1).toFixed(8);
		}
	},
	methods: {
		positive_trade: function(){
			var from_amount = this.exchange_positive["trade_amount"] * 1;
			var mid_ave_price = this.exchange_positive["mid_ave_price"] * 1;
			var from_order = {"order":{"order_type": "market", "product_id": products["qashusd"], "side": "buy", "quantity": from_amount, "price": 0}};			
			var mid_order = {"order":{"order_type": "market", "product_id": products["qashbtc"], "side": "sell", "quantity": from_amount, "price": 0}};	
			var to_order = {"order":{"order_type": "market", "product_id": products["btcusd"], "side": "sell", "quantity": (from_amount * mid_ave_price).toFixed(8), "price": 0}};	
			trade = this.trade;
			trade(from_order, function(data_from_order){
				trade(mid_order, function(data_mid_order){
					trade(to_order, function(data_to_order){

					})
				})
			})
		},
		trade: function(order, callback){
			$.ajax({
				url: "/trade",
				method: "POST",
				data: JSON.stringify(order),
				contentType: "application/json; charset=UTF-8",
				dataType: "json",
				success: function(data){
					console.log(data);
					callback(data)
				}
			})
		}
	}
})

var pusher = new Pusher("2ff981bb060680b5ce97", {
	wsHost: "ws.pusherapp.com",
	wsPort: 80,
	enabledTransports: ["ws", "flash", "wss"],
	disabledTransports: ["flash"]
});

for(var name in orderbooks){
	pusher.subscribe("price_ladders_cash_" + name + "_sell");
	pusher.subscribe("price_ladders_cash_" + name + "_buy");
}

pusher.allChannels().forEach(channel => {
	var name = channel.name.replace("price_ladders_cash_", "").split("_");
	var key = name[0];
	var type = name[1];
	channel.bind("updated", function(data){
		orderbooks[key][type] = data;
		app.$data.orderbooks = orderbooks;
	})
});