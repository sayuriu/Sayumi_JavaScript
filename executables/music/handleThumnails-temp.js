const request = require('request');
const { dwebp } = require('webp-converter');
const { getColor } = require('colorthief');

function HandleThumbnail(thumbnailURL, callback)
{
	request.head(thumbnailURL, () => {
		let fileExtension = thumbnailURL.match('i.ytimg.com') ? thumbnailURL.substr(0, thumbnailURL.indexOf('?') > 0 ? thumbnailURL.indexOf('?') : thumbnailURL.length).split('.').pop() : 'webp';
		fileExtension
		const timestamp = Date.now();

		// request(thumbnailURL).pipe(createWriteStream(`./temp-imgs/${timestamp}.${fileExtension}`))
		.on('close', async () => {
			try {
				if (fileExtension.toLowerCase() === 'webp')
				{
					await dwebp(`./temp-imgs/${timestamp}.${fileExtension}`, `./temp-imgs/${timestamp}.png`, "-o");
					fileExtension = 'png';
				}
				const color = await getColor(`./temp-imgs/${timestamp}.${fileExtension}`, 150);
				return callback(color);
			}
			catch(e) {
				if (e.stack.includes('SOI not found'))
				{
					fileExtension = 'webp';
					return soiErrHandle(`./temp-imgs/${timestamp}`, fileExtension, callback);
				}
				return callback('random');
			}
		});
	});
}


async function soiErrHandle(path, ext, callback)
{
	// webp
	await dwebp(`${path}.jpg`, `${path}.png`, "-o");
	const color = await getColor(`${path}.png`, 150);
	return callback(color);
}

const url = 'https://i.ytimg.com/vi/XVjtVvOgjUg/hqdefault.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAnAlAiYuxa0lF7EDikSB0i-f73lA';
HandleThumbnail(url, cb);


function cb(a)
{
	return console.log(a);
}
