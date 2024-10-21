export type BaseMaterial<T extends string = string> = {
    name: string;
    currency_type: string;
    last_difference: number;
    current_difference: number;
    values: {
        type: T;
        base_value: number;
        current_value: number;
    }[]
};

export interface MaterialStockMarket {
    Trees: Record<string, BaseMaterial<'raw' | 'milled' | 'planked'>>;
    Rocks: Record<string, BaseMaterial<'raw' | 'forged' | 'refiend'>>;
    Ores: Record<string, BaseMaterial<'forged' | 'refined'>>;
};

interface RockVariant {
    [key: string]: number;
};

export type RockVariantRNG = Record<string, Record<string, RockVariant>>;