export interface TeamCreateInput {
  name: string;
  description?: string;
  memberIds?: string[];
}

export interface TeamUpdateInput {
  name?: string;
  description?: string;
}

export interface AddMemberInput {
  userId: string;
}
