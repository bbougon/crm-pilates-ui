export async function api(endpoint, { body, ...customConfig } = {}) {
    const headers = { 'Content-Type': 'application/json' }

    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
        mode: 'cors'
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    let data
    try {
        const response = await fetch(process.env.REACT_APP_API_URI + endpoint, config)
        data = await response.json()
        if (response.ok) {
            return {
                status: response.status,
                data,
                headers: response.headers,
                url: response.url,
            }
        }
        throw new Error()
    } catch (err) {
        return Promise.reject(err.message ? err.message : data)
    }
}

api.createClient = (body) => {
    const customConfig = {}
    return api("/clients", {...customConfig, body})
}

api.fetchClients = () => {
    const customConfig = {}
    return api("/clients", {...customConfig, method: 'GET'})
}

api.fetchSessions = (link) => {
    const customConfig = {}
    return api(link, {...customConfig, method: 'GET'})
}

api.sessionCheckin = (checkin) => {
    const customConfig = {}
    const body = {
        classroom_id: checkin.classroom_id,
        session_date: checkin.schedule.start,
        attendee: checkin.id
    }
    return api("/sessions/checkin", {...customConfig, body})
}

api.addClassroom = (body) => {
    const customConfig = {}
    return api("/classrooms", {...customConfig, body})
}