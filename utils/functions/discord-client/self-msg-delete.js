module.exports = function(message, options = {})
{
	message = Object.assign(message, { Sayumi: true });
	return message.delete(options);
};