export type BaseMaterial<T extends string = string> = {
    /** The name of the material. */
    name: string;
    /** The currency that the material sells for. */
    currency_type: string;
    /** The last percentage the material sold for. */
    last_difference: number;
    /** The current percentage the material sells for. */
    current_difference: number;
    values: {
        /** The type of material. */
        type: T;
        /** The value without difference multipliers. */
        base_value: number;
        /** The value based on the base_value and current_difference. */
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
    /** The name of the item. */
    name: string;
    /** The currency the item sells for. */
    currency: string;
    /** The cost of the item. */
    price: number;
    /** A non-translation string identifier for other APIs. */
    identifier: string;
    /** The type of item. */
    type: string;
};

export type StoresItems = Record<string, StoreItem[]>;

export type ShipLocation = {
    /** Where the ship current is. */
    current_position: number;
    /** Where the ship will be next. */
    next_position: number;
    /** The time the ship will move. */
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