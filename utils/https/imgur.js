const mainModules = require('../../MainModules');

const clientID = mainModules.APIs.imgur.clientID;
const clientSecret = mainModules.APIs.imgur.clientSecret;

const log = mainModules.Log;

module.exports = class Imgur
{
	static Get(hash)
	{
		// Request data
		const options = {
			method: 'GET',
			url: `https://api.imgur.com/3/image/${hash}`,
			headers: {
				Authorization: `Client-ID ${clientID}`,
			},
		};

		return options;
	}

	static Post(imageBuffer)
	{
		// Request data
		const options = {
			method: 'POST',
			url: 'https://api.imgur.com/3/image',
			headers: {
				Authorization: `Client-ID ${clientID}`,
			},
			formData: {
				image: Buffer.from(imageBuffer).toString('base64'),
			},
		};

		return options;
	}

	static async Delete(hash)
	{
		// Request data
		const options = {
			method: 'DELETE',
			url: `https://api.imgur.com/3/image/${hash}`,
			headers: {
				Authorization: `Client-ID ${clientID}`,
			},
		};

		return options;
	}
};