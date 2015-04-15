var locations = [
	{
		text: 'Foor',
		x: 26.25,
		y: 20.5
	},
	{
		text: 'Ringristmik',
		x: 36.5,
		y: 11.75
	},
	{
		text: 'Parkla 1',
		x: 58.1,
		y: 20.25
	},
	{
		text: 'Parkla 2',
		x: 63.5,
		y: 20.25
	}
];
var penalties = {
	border: {
		text: 'Tee piiri ületamine',
		max: 9,
		amount: 5
	},
	house: {
		text: 'Hoone riivamine',
		max: 9,
		amount: 5
	},
	light: {
		text: 'Punase foori eiramine',
		max: 1,
		amount: 30
	},
	giveway: {
		text: 'Punase joone ületamine',
		max: 1,
		amount: 30
	}
};

var startTime = null;
var stepper = null;

function showTimeSec(time) {
	var sec = time % 60;
	var min = Math.floor(time / 60);

	return (time < 0 ? '-' : '') + min.toString() + ':' + (sec < 10 ? '0' : '') + sec;
}

function showTimeDiff(time) {
	return showTimeSec(startTime !== null ? Math.round((time - startTime) / 1000) : 0);
}

function updateTimer() {
	$('#time').text(showTimeDiff(Date.now()));
}

function startTimer() {
	startTime = Date.now();
	updateTimer();
	stepper = setInterval(updateTimer, 1000);

	$('.loc-area').removeClass('disabled');
	//$('#penalties input').attr('disabled', 'disabled').removeClass('disabled');
}

function stopTimer() {
	clearInterval(stepper);
	stepper = null;
	updateTimer();
	calcTimes();
	//$('#totals').show();

	$('.loc-area').addClass('disabled');
	//$('#penalties input').attr('disabled', 'disabled').addClass('disabled');
}

function resetTimer() {
	stopTimer();
	startTime = null;
	updateTimer();
	resetButtons();
	calcTimes();
}

function resetButtons() {
	//$('#totals').hide();

	$('.loc-area').addClass('disabled').attr('data-time', '').removeClass('btn-success').addClass('btn-danger');
	locations.forEach(function(location, li) {
		$('.loc-area[data-li="' + li + '"]').text(location.text);
	});

	for (var pi in penalties) {
		var div = $('#penalty-' + pi);

		$('label', div).removeClass('active');
		$('label:first', div).addClass('active');
		$('input:checked', div).prop('checked', false);
		$('input:first', div).prop('checked', true);
	}
}

function calcTimes() {
	var totalLoc = '&nbsp;', totalLocTime = 0;
	for (var li = locations.length - 1; li >= 0; li--) {
		var $$ = $('.loc-area[data-li=' + li + ']');
		if ($$.attr('data-time')) {
			totalLoc = locations[li].text;
			totalLocTime = Math.round((parseInt($$.attr('data-time')) - startTime) / 1000);
			break;
		}
	}

	var totalPenaltyTime = 0;
	for (var pi in penalties) {
		var tr = $('#penalty-' + pi);
		var cnt = parseInt($('input:checked', tr).val());
		if (isNaN(cnt))
			cnt = 0;
		var amount = cnt * penalties[pi].amount;
		totalPenaltyTime += amount;

		$('td:last', tr).text(amount > 0 ? showTimeSec(amount) : '');
	}

	$('#total-loc').html(totalLoc);
	$('#total-loc-time').text(showTimeSec(totalLocTime));
	$('#total-penalty-time').text(showTimeSec(totalPenaltyTime));
	$('#total-time').text(showTimeSec(totalLocTime + totalPenaltyTime));
}

$(function() {
	locations.forEach(function(location, li) {
		var button = $('<button></button>').attr('type', 'button').addClass('btn btn-danger loc-area').attr('autocomplete', 'off').text(location.text);
		button.css('left', location.x + 'em');
		button.css('top', location.y + 'em');

		button.attr('data-li', li);
		$('#map-panel').append(button);
	});

	$('.loc-area').click(function() {
		var $$ = $(this);
		var time = Date.now();

		if ($$.attr('data-time')) { // active
			$$.attr('data-time', '');
			$$.text(locations[parseInt($$.attr('data-li'))].text);
			$$.removeClass('btn-success').addClass('btn-danger');
		}
		else {
			$$.attr('data-time', time);
			$$.text(showTimeDiff(time));
			$$.removeClass('btn-danger').addClass('btn-success');
		}

		calcTimes();
	});

	for (var pi in penalties) {
		var tr = $('<tr></tr>').attr('id', 'penalty-' + pi);

		var radios = $('<div><div>').addClass('btn-group penalty-radio').attr('data-toggle', 'buttons');
		for (var i = 0; i <= penalties[pi].max; i++) {
			var label = $('<label></label>').addClass('btn btn-default').text(i);
			var radio = $('<input></input>').attr('type', 'radio').attr('name', 'penalty-' + pi).attr('autocomplete', 'off').val(i);

			label.append(radio);
			radios.append(label);
		}

		tr.append($('<td></td>').text(penalties[pi].text));
		tr.append($('<td></td>').append(radios));
		tr.append($('<td></td>').text(''));

		$('#penalties').append(tr);
	}

	$('#penalties input').change(function() {
		calcTimes();
	});

	resetTimer();
});