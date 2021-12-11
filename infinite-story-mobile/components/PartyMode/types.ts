import { StoryBit, PlayerStatus } from '../../types';

export type GameState =
  | 'PROPOSING'
  | 'VOTING'
  | 'TIE'
  | 'RESULT'
  | 'READING'
  | 'JOINING'
  | 'ENDING';

export interface Player {
  nickname: string;
  profilePic: string;
  status: PlayerStatus;
  lastPing: number;
}

export interface Proposal {
  user: string;
  proposal: {
    type: 'TELL_ME_MORE' | 'ROLLBACK' | 'ACT_DO' | 'ACT_SAY';
    payload?: string;
  };
  votes: string[];
}

export interface Players {
  [id: string]: Player;
}

export interface Achievement {
  type: string;
  title: string;
  description: string;
}

export interface Achievements {
  [user: string]: Achievement[];
}

export interface VotingStats {
  [user: string]: number;
}

export interface VoiceCallStatus {
  playersInCall: string[],
  roomUrl: string
}

export interface PartyModeState {
  owner: string;
  joinCode: string;
  storyBits: StoryBit[];
  currentState: GameState;
  untilNextState: number;
  players: Players;
  playersReady: string[];
  proposals: Proposal[];
  achievements: Achievements;
  votingStats: VotingStats;
  voiceCallStatus: VoiceCallStatus;
  bannedPlayers: string[]
}
