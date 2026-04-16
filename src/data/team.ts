export interface TeamMember {
  id: string;
  name: string;
  position: string;
  phone: string | null;
  email: string | null;
  image: string;
  bio?: string | null;
  isManager?: boolean;
}

export const TEAM_DATA: TeamMember[] = [];
