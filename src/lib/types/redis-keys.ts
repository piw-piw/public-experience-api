export interface RedisKeys {
    // -- Changelogs

    [`oaklands:changelog:versions_list`]: string[];
    [`oaklands:changelog:current_version`]: {
        id: number;
        version: string;
    };
    [key: `oaklands:changelog:versions:${string}`]: {
        _id: number;
        date: Date;
        added: string[] | never[];
        changed: string[] | never[];
        fixed: string[] | never[];
    };

    //-- Newsletters

    [`oaklands:newsletter:current_page`]: string;
    [`oaklands:newsletter:pages_list`]: string[];
    [key: `oaklands:newsletter:pages:${string}`]: {
        banner_image_id: string;
        header_text: string;
        subheader_text: string;
        sections: {
            header: string;
            content: ({ type: "Paragraph"; text: string; } | { type: "Image";image_id: string; } | { type: "ImageCarousel"; image_ids: string[]; } | { type: "Video"; video_id: string; })[];
        }[];
    };

    //-- Translation Strings

    [`oaklands:translations:languages_list`]: string[];
    [key: `oaklands:translations:language:${string}`]: Record<string, string>;
}