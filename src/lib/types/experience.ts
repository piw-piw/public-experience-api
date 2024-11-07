export type BaseMaterial<T extends string = string> = {
    name: string;
    currency_type: string;
    last_difference: number;
    current_difference: number;
    values: {
        type: T;
        base_value: number;
        current_value: number;
    }[];
};

export interface MaterialStockMarket {
    [x: string]: Record<string, BaseMaterial<string>>;
    Trees: Record<string, BaseMaterial<'raw' | 'milled' | 'planked'>>;
    Rocks: Record<string, BaseMaterial<'raw' | 'forged' | 'refiend'>>;
    Ores: Record<string, BaseMaterial<'forged' | 'refined'>>;
};

interface RockVariant {
    [key: string]: number;
};

export type RockVariantRNG = Record<string, Record<string, RockVariant>>;

export type StoreItem = {
    name: string;
    currency: string;
    price: number;
    identifier: string;
    type: string;
};

export type StoresItems = Record<string, StoreItem[]>;

export type ShipLocation = {
    current_position: number;
    next_position: number;
    next_reset: number;
};

export type TranslationKeys = Record<string, Record<string, string>>;

type NewsletterParagraph = {
    type: "Paragraph";
    text: string;
};

type NewsletterImage = {
    type: "Image";
    image_id: string;
};

type NewsletterImageCarousel = {
    type: "ImageCarousel";
    image_ids: string[];
};

type NewsletterVideo = {
    type: "Video";
    video_id: string;
};

type NewsletterSection = {
    header: string;
    content: (NewsletterParagraph | NewsletterImage | NewsletterImageCarousel | NewsletterVideo)[]; 
};

interface NewsletterPage {
    banner_image_id: string;
    header_text: string;
    subheader_text: string;
    sections: NewsletterSection[];
}

export interface Newsletters {
    latest_page: string;
    pages: Record<string, NewsletterPage>;
}