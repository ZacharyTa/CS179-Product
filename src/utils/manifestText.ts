export function countContainers(manifestText: string): number {
    const lines = manifestText.split('\n');
    let count = 0;

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '') continue;

        const lastCommaIndex = trimmedLine.lastIndexOf(',');
        if (lastCommaIndex === -1) continue;

        const item = trimmedLine.substring(lastCommaIndex + 1).trim();
        if (item !== "UNUSED" && item !== "NAN") count++;
    }

    return count;
}