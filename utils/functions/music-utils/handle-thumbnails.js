const request = require('request');
const { dwebp } = require('webp-converter');
const { createWriteStream } = require('fs');
const { getColor } = require('colorthief');


module.exports = function HandleThumbnail(thumbnailURL, callback)
{
	request.head(thumbnailURL, () => {
		let fileExtension = thumbnailURL.match('i.ytimg.com') ? thumbnailURL.substr(0, thumbnailURL.indexOf('?') > 0 ? thumbnailURL.indexOf('?') : thumbnailURL.length).split('.').pop() : 'webp';
		const timestamp = Date.now();

		request(thumbnailURL).pipe(createWriteStream(`./temp-imgs/${timestamp}.${fileExtension}`))
		.on('close', async () => {
			try {
				if (fileExtension.toLowerCase() === 'webp')
				{
					await dwebp(`./temp-imgs/${timestamp}.${fileExtension}`, `./temp-imgs/${timestamp}.png`, "-o");
					fileExtension = 'png';

					const color = await getColor(`./temp-imgs/${timestamp}.${fileExtension}`, 150);
					return callback(color);
				}
			}
			catch(e) {
				return callback('random');
			}
		});
	});
};
