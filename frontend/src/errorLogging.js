import axios from 'axios';

const errorLogging = (() => {
    let errorCache = [];
    const interval = 10000; // 10 seconds

    const logError = (...args) => {
        const errorString = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : arg)).join(' ');
        errorCache.push({
            error: errorString,
            timestamp: new Date().toISOString(),
        });
    };

    const sendErrors = () => {
        if (errorCache.length > 0) {
            const errorsToSend = [...errorCache];
            errorCache = [];

            axios.post('/api/log', { errors: errorsToSend })
                .catch(err => {
                    console.error('Failed to send logs to the server:', err);
                    // In case of failure, re-add errors to the cache
                    errorCache = [...errorsToSend, ...errorCache];
                });
        }
    };

    // Set an interval to send errors every 10 seconds
    setInterval(sendErrors, interval);

    return {
        logError,
    };
})();

export default errorLogging;
