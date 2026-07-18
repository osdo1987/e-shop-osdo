let onAuthError = null

export function setAuthErrorCallback(cb) {
    onAuthError = cb
}

const originalFetch = window.fetch

window.fetch = async function (...args) {
    const res = await originalFetch.apply(this, args)
    if (res.status === 401 && onAuthError) {
        onAuthError()
    }
    return res
}
