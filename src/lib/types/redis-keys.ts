import type { ChangelogEntry } from "@/lib/types/experience";


export interface RedisKeys {
    // -- Changelogs

    [`changelog:versions_list`]: string[];
    [`changelog:current_version`]: {
        id: number;
        version: string;
    };
    [key: `changelog:versions:${string}`]: {
        _id: number;
        date: Date;
        added: string[] | never[];
        changed: string[] | never[];
        fixed: string[] | never[];
    };

    //-- Newsletters

    [`newsletter:current_page`]: string;
    [`newsletter:pages_list`]: string[];
    [key: `newsletter:pages:${string}`]: {
        banner_image_id: string;
        header_text: string;
        subheader_text: string;
        sections: {
            header: string;
            content: ({ type: "Paragraph"; text: string; } | { type: "Image";image_id: string; } | { type: "ImageCarousel"; image_ids: string[]; } | { type: "Video"; video_id: string; })[];
        }[];
    };

    //-- Translation Strings

    [`translations:languages_list`]: string[];
    [key: `translations:language:${string}`]: Record<string, string>;
}