import express from 'express'
import multer from 'multer'
import excel from 'excel4node'

const app = express()

const storage = multer.memoryStorage()
const upload = multer({ storage })

app.use(express.static('public'))

function JSONtoExcelHandler(req, res) {
	const jsonFile = req.file

	if (!jsonFile) {
		return res.status(400).json({ message: 'No file uploaded' })
	}

	let jsonData = null

	try {
		jsonData = JSON.parse(jsonFile.buffer.toString('utf8'))
	} catch (error) {
		return res.status(400).json({ message: 'Invalid JSON file' })
	}

	try {
		const workbook = new excel.Workbook()
		const worksheet = workbook.addWorksheet('Sheet 1')

		worksheet.cell(1, 1).string('Key')
		worksheet.cell(1, 2).string('Value')

		function processJson(obj, parentKey = '', row = { value: 2 }) {
			for (let key in obj) {
				const fullKey = parentKey ? `${parentKey}.${key}` : key
				if (Array.isArray(obj[key])) {
					obj[key].forEach((item, index) => {
						processJson(item, `${fullKey}[${index}]`, row)
					})
				} else if (typeof obj[key] === 'object' && obj[key] !== null) {
					processJson(obj[key], fullKey, row)
				} else {
					worksheet.cell(row.value, 1).string(fullKey)
					worksheet.cell(row.value, 2).string(String(obj[key]))
					row.value++
				}
			}
		}

		processJson(jsonData)

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		)
		res.setHeader('Content-Disposition', 'attachment; filename=converted.xlsx')

		workbook.writeToBuffer().then((buffer) => {
			res.send(buffer)
		})
	} catch (error) {
		console.error('Error processing JSON:', error)
		res.status(500).json({ message: 'Error processing JSON file' }) // Handle errors
	}
}

app.post('/cook', upload.single('file'), (req, res) => {
	JSONtoExcelHandler(req, res)
})

app.listen(6969, () => {
	console.log('Server is running on port 6969')
})
