import container from "@/lib/container";

container.logger = (message: string) => {
    const time = Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(Date.now());

    console.log(`[UTC-${time}]: ${message}`);
}