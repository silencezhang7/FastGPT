import { FlowNodeTemplateTypeEnum } from '../../constants';
import { FlowNodeTypeEnum } from '../../node/constant';
import { FlowNodeTemplateType } from '../../type/node';
import { getHandleConfig } from '../utils';

export const RunToolNode: FlowNodeTemplateType = {
  id: FlowNodeTypeEnum.tool,
  templateType: FlowNodeTemplateTypeEnum.other,
  flowNodeType: FlowNodeTypeEnum.tool,
  sourceHandle: getHandleConfig(true, true, true, true),
  targetHandle: getHandleConfig(true, true, true, true),
  intro: '',
  name: '',
  showStatus: false,
  isTool: true,
  version: '4.9.6',
  inputs: [],
  outputs: []
};
