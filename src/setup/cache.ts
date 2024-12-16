import path from 'path';
import NodeSchedule from "node-schedule";
import { getFilePaths } from "@/lib/util";
import type CachePiece from '@/lib/structures/CachePiece';

const paths = getFilePaths(path.join(process.cwd(), 'src/setup/cache'));

const runners: Function[] = [];
const schedulers: Record<string, Function[]> = {};

for (const path of paths) {
    try {
        const piece: CachePiece = new (await import(path)).default;

        if (!piece.enabled) continue;

        runners.push(piece.run.bind(piece));

        if (!schedulers[piece.schedule]) {
            schedulers[piece.schedule] = [];
        }

        schedulers[piece.schedule].push(piece.run.bind(piece));
    }
    catch (e) {
        console.log(e);
    }
}

await Promise.all(Object.values(runners).map((func) => func()));

for (const [spec, func] of Object.entries(schedulers)) {
    NodeSchedule.scheduleJob(spec, async() => await Promise.all(
        Object.values(func).map((func) => func()
    )));
}