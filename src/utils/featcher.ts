export const fetcher = async <T>(url: string) => {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data as T;
    } catch (e) {
        console.error(e);
        return null;
    }
};