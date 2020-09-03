let array = [1, 2, 3, 4, 5, 6];
const filteredArray = [];

for (let i = 0; i < 2; i++)
			{
				const max = Math.max(...array);
				filteredArray.push(max);

				const newArray = array.splice(array.indexOf(max) - 1, 1);
				array = newArray;
			}
console.log(filteredArray.sort());