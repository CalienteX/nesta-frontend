const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const request = async (method, path, body) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export const api = {
  // Estates
  lookupEstate: (query) => request('POST', '/api/estates/lookup', { query }),

  // Residents
  register: (fullName, estateId) => request('POST', '/api/residents/register', { fullName, estateId }),
  login: (uniqueId) => request('POST', '/api/residents/login', { uniqueId }),
  getVisitors: (residentId) => request('GET', `/api/residents/${residentId}/visitors`),

  // Visitors
  registerVisitor: (residentId, visitorName, visitDate, visitTime, estateCode) =>
    request('POST', '/api/visitors', { residentId, visitorName, visitDate, visitTime, estateCode }),
  verifyPass: (passId) => request('GET', `/api/visitors/verify/${passId}`),
}
