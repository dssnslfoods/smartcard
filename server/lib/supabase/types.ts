export type Role = "user" | "admin";

export type FieldType = "text" | "textarea" | "multiselect";

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
  slug: string;
  name: string;
  event_date: string | null;
  fields: EventField[];
};

export type EventResponse = Record<
  string,
  string | { selected: string[]; other?: string }
>;

export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  role: Role;
  created_at: string;
};

export type EventRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  event_date: string | null;
  fields: EventField[];
  active: boolean;
  created_at: string;
  created_by: string | null;
  archived_at: string | null;
};

export type ContactRow = {
  id: string;
  name: string | null;
  position: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  image_urls: string[];
  event_id: string | null;
  event_data: Record<string, string>;
  scanned_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ProfileTable = {
  Row: Profile;
  Insert: Partial<Profile> & { id: string; email: string };
  Update: Partial<Profile>;
  Relationships: [];
};

type EventTable = {
  Row: EventRow;
  Insert: Partial<EventRow> & { slug: string; name: string };
  Update: Partial<EventRow>;
  Relationships: [];
};

type ContactTable = {
  Row: ContactRow;
  Insert: Partial<ContactRow>;
  Update: Partial<ContactRow>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: ProfileTable;
      events: EventTable;
      contacts: ContactTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
