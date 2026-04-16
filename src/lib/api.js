export const getMeta = async () => (await fetch('/api/meta')).json();
