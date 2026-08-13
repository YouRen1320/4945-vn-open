import type { OrganizationDefinition, OrganizationId } from '@/engine/types'

// 组织表记录7月28日素材中的默认格局；玩家路线会在状态中替换二至六组首领槽位。
export const organizations: Record<OrganizationId, OrganizationDefinition> = {
  org1: {
    id: 'org1',
    name: '群雄逐鹿',
    index: 1,
    color: '#b49aff',
    initialPower: '2800万',
    defaultLeader: 'qifu',
    theme: '秩序与代表权',
  },
  org2: {
    id: 'org2',
    name: '江南',
    index: 2,
    color: '#f39ac7',
    initialPower: '2600万',
    defaultLeader: 'shana',
    theme: '治理与外交债务',
  },
  org3: {
    id: 'org3',
    name: '抚梅观清雪',
    index: 3,
    color: '#8ad8ff',
    initialPower: '2300万',
    defaultLeader: 'heartbeat',
    theme: '扩张与人才合法性',
  },
  org4: {
    id: 'org4',
    name: '天上白玉京',
    index: 4,
    color: '#d5b1ff',
    initialPower: '1900万',
    defaultLeader: 'yanqiu',
    theme: '制度与分配',
  },
  org5: {
    id: 'org5',
    name: '未闻花名',
    index: 5,
    color: '#e8bc78',
    initialPower: '1800万',
    defaultLeader: 'wenxian',
    theme: '生存与组织名字',
  },
  org6: {
    id: 'org6',
    name: '第六组织',
    index: 6,
    color: '#76d6b4',
    initialPower: '从零开始',
    defaultLeader: 'yyt',
    theme: '创业、承认与吞并',
  },
}
