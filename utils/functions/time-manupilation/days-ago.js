module.exports = function(date, compare = new Date()) {
	const diff = compare.getTime() - date.getTime();
	const days = Math.floor(diff / 86400000);

	const yearsRaw = days / 365.25;
	const years = Math.floor(days / 365.25);
	const months = Math.floor(12 * (yearsRaw - years));
	const day = Math.floor(days - 365.25 * yearsRaw);

	let output = '';

	if (years > 0)
	{
		if (months === 6) output += `${years} and a half year${years > 1 ? 's' : ''}`;
		else output += years + ` year${years > 1 ? 's' : ''}`;
	}
	if (months > 0 && months !== 6)
	{
		if (years > 0) output += ` and ${months} month${months > 1 ? 's' : ''}`;
		else output += months + ` month${months > 1 ? 's' : ''}`;
	}
	if (days > 0 && years === 0)
	{
		if (days < 10) output += `a few days`;
		else if (months > 0) output += `and ${day} day${days > 1 ? 's' : ''}`;
		else output += days + ` day${days > 1 ? 's' : ''}`;
	}

	output = output.replace(/\b0*?1\b/g, function() {
		return 'a';
	});

	// output = output[0].toUpperCase() + output.substr(1);
	return { daysRaw: days, years: years, months: months, day: day, message: output };
};