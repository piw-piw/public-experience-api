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

    //-- Stock Market
    
    [`oaklands:stock_market:reset`]: Date;
    [`oaklands:stock_market:updated`]: Date;
    [`oaklands:stock_market:values`]: Record<string, Record<string, {
        name: string;
        currency_type: string;
        last_difference: number;
        current_difference: number;
        values: {
            type: string;
            base_value: number;
            current_value: number;
        }[];
    }>>;

    //-- Misc

    [`oaklands:ore_rarity`]: Record<string, Record<string, { [k: string]: number }>>;
}

export type RedisString = {
    [K in keyof RedisKeys as RedisKeys[K] extends string ? K : never]: RedisKeys[K];
};

export type RedisSet = {
    [K in keyof RedisKeys as RedisKeys[K] extends string[] ? K : never]: RedisKeys[K];
};

export type RedisJson = {
    [K in keyof RedisKeys as RedisKeys[K] extends object ? K : never]: RedisKeys[K];
};