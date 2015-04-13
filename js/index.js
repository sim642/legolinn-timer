var locations = ['Foor', 'Ring', 'Parkla'];
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
	return showTimeSec(startTime !== null ? Math.floor((time - startTime) / 1000) : 0);
}

function updateTimer() {
	$('#time').text(showTimeDiff(Date.now()));
}

function startTimer() {
	startTime = Date.now();
	updateTimer();
	stepper = setInterval(updateTimer, 1000);

	$('.loc-check').bootstrapSwitch('disabled', false);
	//$('#penalties input').attr('disabled', 'disabled').removeClass('disabled');
}

function stopTimer() {
	clearInterval(stepper);
	stepper = null;
	updateTimer();
	calcTimes();
	//$('#totals').show();

	$('.loc-check').bootstrapSwitch('disabled', true);
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

	$('.loc-check').bootstrapSwitch('disabled', false); // can't change state when disabled...
	$('.loc-check').bootstrapSwitch('state', false);
	$('.loc-check').bootstrapSwitch('disabled', true);

	for (var pi in penalties) {
		var div = $('#penalty-' + pi);

		$('label', div).removeClass('active');
		$('label:first', div).addClass('active');
		$('input:checked', div).prop('checked', false);
		$('input:first', div).prop('checked', true);
	}
}

function calcTimes() {
	var totalLoc = '', totalLocTime = 0;
	for (var li = locations.length - 1; li >= 0; li--) {
		var lit = $('*[data-lit=' + li + ']');
		if (lit.text() !== '') {
			totalLoc = locations[li];
			totalLocTime = Math.floor((parseInt(lit.attr('data-time')) - startTime) / 1000);
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

	$('#total-loc').text(totalLoc);
	$('#total-loc-time').text(showTimeSec(totalLocTime));
	$('#total-penalty-time').text(showTimeSec(totalPenaltyTime));
	$('#total-time').text(showTimeSec(totalLocTime + totalPenaltyTime));
}

$(function() {
	locations.forEach(function(location, li) {
		var tr = $('<tr></tr>');

		var checkbox = $('<input></input>').attr('type', 'checkbox').addClass('loc-check').attr('data-label-text', location).attr('data-li', li);
		tr.append($('<td></td>').append(checkbox));
		tr.append($('<td></td>').attr('data-lit', li));

		$('#locations').append(tr);
	});

	$('.loc-check').bootstrapSwitch({
		inverse: true
	}).on('switchChange.bootstrapSwitch', function(e, state) {
		var lit = $('*[data-lit=' + $(this).attr('data-li') + ']');
		var time = Date.now();
		lit.text(state ? showTimeDiff(time) : '');
		lit.attr('data-time', time);

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