import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'ARTI Wiki',
  description: 'ARTI 项目知识库',
  srcDir: '.',
  srcExclude: ['node_modules/**', '.vitepress/**'],

  cleanUrls: true,

  lang: 'zh-CN',

  markdown: {
    config: (md) => {
      md.renderer.rules.code_inline = (tokens, idx) => {
        return `<code v-pre>${md.utils.escapeHtml(tokens[idx].content)}</code>`
      }
    },
  },

  themeConfig: {
    siteTitle: 'ARTI Wiki',

    nav: [
      { text: '首页', link: '/' },
      { text: 'PRD', link: '/docs/prd/' },
      { text: '决策记录', link: '/docs/decisions/' },
      { text: '协作指南', link: '/docs/guides/collaboration-guide' },
      { text: '技术参考', link: '/docs/reference/' },
      { text: 'Sprint', link: '/sprint/2026-w16-progress' },
    ],

    sidebar: [
      {
        text: 'PRD 产品需求',
        collapsed: false,
        items: [
          { text: 'PRD 目录', link: '/docs/prd/' },
          { text: '数据架构 PRD', link: '/docs/prd/data-architecture' },
          { text: 'Pathfinder 功能 PRD', link: '/docs/prd/pathfinder' },
          { text: '定价设计 PRD', link: '/docs/prd/pricing-design' },
        ],
      },
      {
        text: '决策记录',
        collapsed: false,
        items: [
          { text: '决策记录说明', link: '/docs/decisions/' },
          {
            text: '2026-04-14 Repo 作为事实源',
            link: '/docs/decisions/2026-04-14-repo-as-source-of-truth',
          },
        ],
      },
      {
        text: '协作指南',
        collapsed: false,
        items: [
          { text: '协作规范', link: '/docs/guides/collaboration-guide' },
          { text: 'PRD 写作模板', link: '/docs/guides/prd-template' },
        ],
      },
      {
        text: '技术参考',
        collapsed: true,
        items: [
          { text: '参考索引', link: '/docs/reference/' },
          { text: 'ARTI 商业计划', link: '/docs/reference/ARTI_Business_Plan' },
          { text: 'ARTI QA Memo', link: '/docs/reference/ARTI_QA_Memo' },
          { text: 'DESIGN 产品设计', link: '/docs/reference/DESIGN' },
          { text: 'ARTI 系统全景 + 产品规划', link: '/docs/reference/arti-system-overview' },
          { text: 'AI 数据源规划（三市版）', link: '/docs/reference/ai-datasource-exploration' },
          { text: 'Benchmark 设计', link: '/docs/reference/benchmark-design' },
          { text: 'Chat 系统参考', link: '/docs/reference/chat-system-reference' },
          { text: '数据 API', link: '/docs/reference/data-api' },
          { text: '模型分层策略', link: '/docs/reference/model-strategy' },
          { text: '输出模板汇总', link: '/docs/reference/output-templates' },
          { text: 'Railway 迁移手册', link: '/docs/reference/railway-migration-runbook' },
          { text: '前端 IA 审计', link: '/docs/reference/frontend-ia-audit' },
          { text: 'Landing 设计系统', link: '/docs/reference/landing-design-system' },
          { text: 'TODO 清单', link: '/docs/reference/TODO' },
        ],
      },
      {
        text: 'Sprint 进度',
        collapsed: false,
        items: [
          { text: 'W16 本周进度', link: '/sprint/2026-w16-progress' },
        ],
      },
    ],

    search: {
      provider: 'local',
    },

    outline: {
      label: '本页目录',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新',
    },

    editLink: {
      pattern: 'https://github.com/botearn/arti-wiki/edit/main/:path',
      text: '在 GitHub 上编辑此页',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/botearn/arti-wiki' },
    ],

    footer: {
      message: 'ARTI 项目内部知识库',
    },
  },
})
