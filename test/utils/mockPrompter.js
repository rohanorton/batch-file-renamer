const mockPrompter = (...responses) =>
    () => responses.shift();

export default mockPrompter;
