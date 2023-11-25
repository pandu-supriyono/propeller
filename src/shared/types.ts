export type HeadingsList = {
  id: string;
  text: string;
  level: string;
}[];

export type headingsCollected = {
  type: 'HEADINGS_COLLECTED';
  payload: HeadingsList;
};
