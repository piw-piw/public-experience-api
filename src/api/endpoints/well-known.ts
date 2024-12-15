import path from 'path';
import { readFileSync } from 'fs';
import app from "@/lib/app";

app.get('/.well-known/security.txt', async (res) => {
    const contents = readFileSync(path.join(process.cwd(), '.well-known', 'security.txt'), 'utf8');
    return res.text(contents);
});