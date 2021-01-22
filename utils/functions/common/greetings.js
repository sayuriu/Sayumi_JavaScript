const { greetings } = require('../../json/Responses.json');
const DateTime = require('../time-manupilation/date-time');
const randomize = require('../common/randomize');
module.exports = function()
{
	const { hrs, min, sec } = DateTime();
	const time = parseInt(hrs) + parseInt(min) / 60 + parseInt(sec) / 3600;
	let output;
	if (time > -1 && time < 24)
	{
		if (time < 12)
		{
			if (time >= 0 && time < 6)
			{
				output = greetings.daytime.early_morning;
			}
			if (time >= 6 && time < 12)
			{
				output = greetings.daytime.morning;
			}
		}
		if (time >= 12)
		{
			if (time >= 12 && time < 13)
			{
				output = greetings.daytime.noon;
			}
			if (time >= 13 && time < 18.75)
			{
				output = greetings.daytime.afternoon;
			}
			if (time >= 18.75 && time < 22)
			{
				output = greetings.nighttime.evening;
			}
			if (time >= 22 && time < 24)
			{
				output = greetings.nighttime.night;
			}
		}
		return randomize(output);
	}
};