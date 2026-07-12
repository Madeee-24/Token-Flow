import axios from 'axios'

const usageClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
  timeout: 10000,
})

export async function getUsageData() {
  const { data } = await usageClient.get('/api/usage')
  return data
}

export default usageClient
