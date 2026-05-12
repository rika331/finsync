const KEY = 'funds'

export const getFundsStorage = () => {
  try {
    const data = localStorage.getItem(KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export const setFundsStorage = (data) => {
  localStorage.setItem(KEY, JSON.stringify(data))
}
