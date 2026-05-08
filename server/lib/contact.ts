export type Contact = {
  rowIndex: number;
  date: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  device: string;
};

export const emptyContact: Omit<Contact, "rowIndex"> = {
  date: "",
  name: "",
  position: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  device: "",
};
