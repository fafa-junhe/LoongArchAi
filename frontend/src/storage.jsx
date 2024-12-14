// storageWrapper.js
const isLocalStorageAvailable = (() => {
    try {
        const testKey = "__test__";
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
})();

const memoryStorage = (() => {
    const storage = {};
    return {
        setItem: (key, value) => {
            storage[key] = value;
        },
        getItem: (key) => {
            return storage[key] || null;
        },
        removeItem: (key) => {
            delete storage[key];
        }
    };
})();

const storage = isLocalStorageAvailable ? localStorage : memoryStorage;

export default storage;