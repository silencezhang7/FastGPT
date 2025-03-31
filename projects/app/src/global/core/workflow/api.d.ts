import { AppSchema } from '@fastgpt/global/core/app/type';
import { ChatHistoryItemResType } from '@fastgpt/global/core/chat/type';
import { RuntimeNodeItemType } from '@fastgpt/global/core/workflow/runtime/type';
import { WorkflowInteractiveResponseType } from '@fastgpt/global/core/workflow/template/system/interactive/type';
import { StoreNodeItemType } from '@fastgpt/global/core/workflow/type';
import { RuntimeEdgeItemType, StoreEdgeItemType } from '@fastgpt/global/core/workflow/type/edge';

export type PostWorkflowDebugProps = {
  nodes: RuntimeNodeItemType[];
  edges: RuntimeEdgeItemType[];
  variables: Record<string, any>;
  appId: string;
  query?: UserChatItemValueItemType[];
  history?: ChatItemType[];
};

export type PostWorkflowDebugResponse = {
  finishedNodes: RuntimeNodeItemType[];
  finishedEdges: RuntimeEdgeItemType[];
  nextStepRunNodes: RuntimeNodeItemType[];
  flowResponses: ChatHistoryItemResType[];
  workflowInteractiveResponse?: WorkflowInteractiveResponseType;
  newVariables: Record<string, any>;
};
