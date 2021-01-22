const { functions_responses } = require('../../json/Responses.json').errors;
const { error } = require('../../Logger');

module.exports = function(input)
{
	if (!input) return error('[Global Functions > Responses] The input is undefined!');
	if (!input.length || input.length < 1) return error(`[Global Functions > Responses] ${this.Randomized(functions_responses)}`);
	const output = input[Math.floor(Math.random() * input.length)];
	return output;
};