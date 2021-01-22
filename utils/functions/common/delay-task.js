module.exports = function(duration)
{
	if (duration === 0 || typeof duration !== 'number') return;
	const timestamp = Date.now();
	while(Date.now() - timestamp < duration);
};