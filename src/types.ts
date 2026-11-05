export interface MonetizationHypothesis {
  primaryModel: string;
  whoPays: string;
  whatTheyPayFor: string;
  whyFreeAlternativeFails: string;
  cheapestTest: string;
  firstUserReach: string;
}

export interface TargetUserAndMoment {
  who: string;
  moment: string;
}

export interface ReferenceTemplate {
  id: 'tiny-prototype' | 'paid-pilot' | 'unexpected-twist';
  title: string;
  tagline: string;
  whatChanges: string;
  whatStays: string;
  coreWorkflow: string;
  mainRisk: string;
  buildPrompt: string;
}

export interface OddIdea {
  id: string;
  name: string;
  tagline: string;
  targetUserAndMoment: TargetUserAndMoment;
  surprisingMechanism: string;
  workingFirstVersion: string;
  monetizationHypothesis: MonetizationHypothesis;
  biggestAssumption: string;
  decisionSummary: string;
  worldContext?: string;
  createdAt: string;
  saved?: boolean;
}

export interface ProposedRevision {
  summary: string;
  fieldModifications: {
    name?: string;
    tagline?: string;
    surprisingMechanism?: string;
    workingFirstVersion?: string;
    biggestAssumption?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'pip';
  text: string;
  timestamp: string;
  proposedRevision?: ProposedRevision;
}

export interface BuildPromptResult {
  fullPrompt: string;
  templates: ReferenceTemplate[];
}
