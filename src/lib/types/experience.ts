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
}