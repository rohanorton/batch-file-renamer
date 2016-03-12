// This prompter acts as a super simple drop-in replacement for the
// prompter.prompt method provided by keypress-prompt.

const mockPrompter = (...responses) =>
    () => responses.shift();

export default mockPrompter;
