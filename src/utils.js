function wrapToolResult(func) {
    return async (...args) => {
        const result = await func(...args);
        return {
            content: [
                result
            ]
        }
    }
}

export { wrapToolResult };