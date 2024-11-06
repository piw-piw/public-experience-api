import path from 'path';
import { getFilePaths } from "@/lib/util";
import container from '@/lib/container';

export const routes = getFilePaths(path.join(process.cwd(), 'src/api/endpoints'));

for (const router of routes) {
    try {
        await import(router);
    }
    catch (e) {
        console.log(e);
    }
}

container.events.emit('registered_endpoints');