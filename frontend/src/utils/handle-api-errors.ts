export async function handleApiErrors(response: Response, setError: any) {
  const errorData = await response.json()
  
  if (errorData.errors && Array.isArray(errorData.errors)) {
    errorData.errors.forEach((err: any) => {
      if (err.path) {
        setError(err.path, { message: err.msg })
      }
    })
    return
  }
  
  throw new Error(errorData.message || errorData.error || 'Erro na API')
}