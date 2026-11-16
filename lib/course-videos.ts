// One entry per filmed lesson, keyed by lesson id. Add a line here and the lesson
// page shows the video first and opens in its short version (the key points, the
// activity and the scripts), with the full text one tap away.
//
// `src` is either a direct .mp4 URL (played in the page) or an embed URL from
// YouTube, Vimeo or Loom (shown in a frame):
//   YouTube  https://www.youtube-nocookie.com/embed/VIDEO_ID
//   Vimeo    https://player.vimeo.com/video/VIDEO_ID
//   Loom     https://www.loom.com/embed/VIDEO_ID
// `poster` is the still shown before an .mp4 plays.
// Scripts for every lesson: content/course/video-scripts.md.
export interface LessonVideo { src: string; poster?: string }

export const VIDEOS: Record<string, LessonVideo> = {
  // "0.1": { src: "https://www.youtube-nocookie.com/embed/XXXXXXXXXXX" },
};
