// Board members. Add one entry per person, newest board each year.
// Only add a name, bio or photo with that person's consent.
// Photos go in /public/board and are referenced like "/board/jane.jpg".

export type BoardMember = {
  name: string;
  role: string;
  bio?: string;
  photo?: string;
};

// Empty until the board list and consent are confirmed.
export const board: BoardMember[] = [];
