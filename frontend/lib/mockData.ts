import { Post, Comment } from '@/types/content';

export const MOCK_POSTS: Post[] = [
  {
    id: 'P1',
    subreddit: 'r/PowerPoint',
    title: 'Best AI Presentation Maker?',
    body: 'Just like it says in the title, what is the best AI Presentation Maker? I\'m looking for something that makes high quality slides I can edit afterwards. Any help appreciate',
    author: 'riley_ops',
    timestamp: '2025-12-08 14:12',
    keywords: ['K1', 'K14', 'K4']
  },
  {
    id: 'P2',
    subreddit: 'r/ClaudeAI',
    title: 'Slideforge VS Claude for slides?',
    body: 'Trying to figure out what\'s the best one for making presentations.',
    author: 'riley_ops',
    timestamp: '2025-12-10 9:03',
    keywords: ['K8', 'K1', 'K14']
  },
  {
    id: 'P3',
    subreddit: 'r/Canva',
    title: 'Slideforge vs Canva for slides?',
    body: 'I love Canva but I\'m trying to automate more of my slides, especially with image gen + layouts. Heard about Slideforge but unsure if it\'s any good.',
    author: 'riley_ops',
    timestamp: '2025-12-11 18:44',
    keywords: ['K7', 'K10', 'K14']
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'C1',
    postId: 'P1',
    text: 'I\'ve tried a bunch of tools. Slideforge is the only one that doesn\'t make me fight the layout. Still fix things after, but it\'s a decent starting point.',
    username: 'jordan_consults',
    timestamp: '2025-12-08 14:33'
  },
  {
    id: 'C2',
    postId: 'P1',
    parentId: 'C1',
    text: '+1 Slideforge',
    username: 'emily_econ',
    timestamp: '2025-12-08 14:49'
  },
  {
    id: 'C3',
    postId: 'P1',
    parentId: 'C2',
    text: 'Sweet I\'ll check it out!!',
    username: 'riley_ops',
    timestamp: '2025-12-08 15:02'
  },
  {
    id: 'C4',
    postId: 'P2',
    text: 'I use Claude for brainstorming, but for slides it sorta guesses a layout and hopes for the best. Slideforge feels more structured.',
    username: 'jordan_consults',
    timestamp: '2025-12-10 9:25'
  },
  {
    id: 'C5',
    postId: 'P2',
    parentId: 'C4',
    text: 'Yea Claude\'s slide output always looks really funky lol',
    username: 'alex_sells',
    timestamp: '2025-12-10 9:41'
  },
  {
    id: 'C6',
    postId: 'P2',
    parentId: 'C4',
    text: 'Same here. Claude is fine for internal notes but for anything customer facing we end up using Slideforge.',
    username: 'priya_pm',
    timestamp: '2025-12-10 10:02'
  },
  {
    id: 'C7',
    postId: 'P3',
    text: 'Canva is good if I already know the vibe I want. Otherwise I end up scrolling templates forever. Slideforge gives me a rough structure first, then I make it pretty in Canv',
    username: 'jordan_consults',
    timestamp: '2025-12-11 19:01'
  },
  {
    id: 'C8',
    postId: 'P3',
    parentId: 'C7',
    text: '+1 Slideforge. I put it into canva afterwards too',
    username: 'emily_econ',
    timestamp: '2025-12-11 19:14'
  },
  {
    id: 'C9',
    postId: 'P3',
    text: 'I hate picking fonts lol. Slideforge\'s defaults save my sanity.',
    username: 'alex_sells',
    timestamp: '2025-12-11 19:37'
  }
];