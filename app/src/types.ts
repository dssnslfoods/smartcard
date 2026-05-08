export type CardData = {
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
};

export const emptyCard: CardData = {
  name: "",
  position: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  address: "",
};

export type EventField =
  | { type: "text"; key: string; labelTh: string; labelEn: string; placeholder?: string }
  | { type: "textarea"; key: string; labelTh: string; labelEn: string; rows?: number }
  | {
      type: "multiselect";
      key: string;
      labelTh: string;
      labelEn: string;
      options: string[];
      allowOther?: boolean;
    };

export type EventConfig = {
  id: string;
  name: string;
  sheetTab: string;
  active: boolean;
  fields: EventField[];
};

export type EventResponseValue =
  | string
  | { selected: string[]; other?: string };

export type EventResponse = Record<string, EventResponseValue>;
