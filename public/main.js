import { ref, createApp } from 'vue'

const app = createApp({
	setup() {
		const fileInput = ref(null)
		const file = ref(null)
		const uploadStatus = ref('idle')

		const handleFileChange = (event) => {
			file.value = event.target.files[0]
		}

		const handleSubmit = async () => {
			const formData = new FormData()

			formData.append('file', file.value)

			uploadStatus.value = 'pending'

			try {
				const res = await fetch('/cook', {
					method: 'POST',
					body: formData
				})

				if (!res.ok) {
					throw new Error('Something went wrong')
				}

				const blob = await res.blob()

				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = 'converted.xlsx'
				a.click()
				URL.revokeObjectURL(url)
				a.remove()

				uploadStatus.value = 'success'
			} catch (error) {
				uploadStatus.value = 'error'
			}
		}

		function getFileSize(size) {
			if (size < 1024) return size + ' bytes'
			else if (size < 1048576) return (size / 1024).toFixed(2) + ' KB'
			else if (size < 1073741824) return (size / 1048576).toFixed(2) + ' MB'
			else return (size / 1073741824).toFixed(2) + ' GB'
		}

		return {
			file,
			fileInput,
			handleFileChange,
			handleSubmit,
			uploadStatus,
			getFileSize
		}
	}
})

app.mount('#app')
