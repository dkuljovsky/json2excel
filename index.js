const readXlsxFile = require('read-excel-file/node')
const fs = require('fs')

const result = {}

readXlsxFile(`${__dirname}/en-US.xlsx`).then((rows) => {
	const [keys, values] = rows

	keys.forEach((key, index) => {
		const value = values[index]
		const keyParts = key.split('.')

		keyParts.reduce((acc, part, i) => {
			if (i === keyParts.length - 1) {
				acc[part] = value
			} else {
				acc[part] = acc[part] || {}
			}
			return acc[part]
		}, result)
	})

	fs.writeFileSync(`${__dirname}/en-US.json`, JSON.stringify(result, null, 2))
})
