import container from "@/lib/container";

export default abstract class CacheScheduler {
    /** How often the cache should be scheduled to run. */
    public readonly schedule: string;
    /** A reference to the container piece. */
    public readonly container: Container;
    /** Whether or not the cache piece is enabled. */
    public readonly enabled: boolean = true;

    constructor(options: { schedule: string; }) {
        this.schedule = options.schedule;
        this.container = container;
    }

    public abstract run(): Promise<void> | void;
}