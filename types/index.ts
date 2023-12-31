export * from "./funny";

export interface Laptop {
  id: string;
  cart: number;
  exists: boolean;
}

export interface Cart {
  id: number;
  name: string;
  location: {
    room: string;
    floor: string | number;
  };
  color: string;
}

export interface Floor {
  name: string;
  carts: Cart[];
}

export interface NewEvent {
  name: string;
  room: number | null;
  block: {
    start: string;
    end: string;
  };
}

export interface ConfigData {
  floors: Floor[];
  blocks: { name: string; start: string; end: string }[];
  rooms: string[];
}
