import ky from "ky";
import { z } from "zod";

const defaultHeaders = {
  "Content-Type": "application/json"
};

export const attendeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["valid", "duplicate", "expired", "invalid"])
});

export type Attendee = z.infer<typeof attendeeSchema>;

export const apiClient = ky.create({
  prefixUrl: "https://api.example.com", // TODO: replace with env-configured base URL
  headers: defaultHeaders,
  hooks: {
    beforeRequest: [
      (request) => {
        // Placeholder for auth tokens injection
        return request;
      }
    ]
  }
});
