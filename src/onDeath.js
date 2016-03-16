const DEATH_RATTLES = [ 'SIGINT', 'SIGTERM', 'SIGQUIT' ];

const handleDeath = (handler) => {
    for (const signal of DEATH_RATTLES) {
        process.on(signal, handler);
    }
    return () => {
        for (const signal of DEATH_RATTLES) {
            process.removeListener(signal, handler);
        }
    };
};

export default handleDeath;
