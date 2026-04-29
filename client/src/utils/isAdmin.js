const isAdmin = (s) => {
    return String(s || '').toUpperCase() === 'ADMIN'
}

export default isAdmin