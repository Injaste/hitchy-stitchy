export interface RSVPFieldConfig {
  visible: boolean;
  required: boolean;
}

export interface RSVPSectionConfig {
  fields: {
    message: RSVPFieldConfig;
  };
  messages?: {
    deadline_closed?: string | null;
    invite_message?: string | null;
  };
}
