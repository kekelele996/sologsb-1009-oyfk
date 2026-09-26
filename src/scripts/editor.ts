import "@shoelace-style/shoelace/dist/shoelace.js";

type BlockType = "heading" | "paragraph" | "image" | "link";
type ReviewStatus = "pending" | "approved" | "needs-work";
type Severity = "error" | "warning" | "info";
type CommentRole = "reviewer" | "editor";

interface CommentReply {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

/** 记录“是哪条意见把已通过内容退回待审核”以及当时的通过依据 */
interface ReturnTrace {
  at: string;
  fromApprover: string;
  approvalBasis: string;
}

interface CommentItem {
  id: string;
  author: string;
  role: CommentRole;
  body: string;
  createdAt: string;
  resolved: boolean;
  replies: CommentReply[];
  triggeredReturn: ReturnTrace | null;
}

/** 通过依据：审核人确认通过时填写，随版本快照一并保存 */
interface ApprovalRecord {
  basis: string;
  approvedBy: string;
  approvedAt: string;
}

interface ContentBlock {
  id: string;
  type: BlockType;
  text: string;
  accessibleText: string;
  headingLevel?: number;
  imageSrc?: string;
  imageAlt?: string;
  linkHref?: string;
  changeReason: string;
  reviewStatus: ReviewStatus;
  comments: CommentItem[];
  approval: ApprovalRecord | null;
}

interface GlossaryTerm {
  id: string;
  source: string;
  preferred: string;
  note: string;
}

interface VersionSnapshot {
  id: string;
  label: string;
  createdAt: string;
  blocks: ContentBlock[];
  glossary: GlossaryTerm[];
}

interface ChapterProject {
  id: string;
  title: string;
  subject: string;
  grade: string;
  blocks: ContentBlock[];
  glossary: GlossaryTerm[];
  versions: VersionSnapshot[];
  updatedAt: string;
}

interface AccessibilityIssue {
  id: string;
  blockId: string;
  type: "heading" | "link" | "image" | "glossary" | "sentence";
  severity: Severity;
  title: string;
  detail: string;
  suggestion: string;
}

const STORAGE_KEY = "sologsb-1009-accessible-textbook-v1";
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function createSeedProject(): ChapterProject {
  const isoMinutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
  const blocks: ContentBlock[] = [
    {
      id: "block-h1",
      type: "heading",
      headingLevel: 1,
      text: "第三章 水循环与城市",
      accessibleText: "第三章 水循环与城市",
      changeReason: "",
      reviewStatus: "approved",
      comments: [],
      approval: { basis: "章节标题与纸质教材一致，层级 H1 正确。", approvedBy: "审核人 王老师", approvedAt: isoMinutesAgo(60) },
    },
    {
      id: "block-p1",
      type: "paragraph",
      text: "城市中的水并非取之不尽，由于其会通过蒸发、降水以及地表径流等若干复杂过程在自然界中持续循环，因此理解这些过程对于建设具有韧性的城市具有十分重要的意义。",
      accessibleText: "城市里的水会不断循环。它经过蒸发、降水并沿地面流动。了解这些过程，可以帮助我们建设更能适应变化的城市。",
      changeReason: "拆分长句，把抽象表述改为更直接的说明。",
      reviewStatus: "pending",
      comments: [
        {
          id: "comment-seed-return",
          author: "审核专家 李老师",
          role: "reviewer",
          body: "“沿地面流动”建议补一句就是原来的“地表径流”，否则学生后面看到术语对不上。",
          createdAt: isoMinutesAgo(20),
          resolved: false,
          replies: [],
          triggeredReturn: {
            at: isoMinutesAgo(20),
            fromApprover: "审核人 王老师",
            approvalBasis: "三个短句语义完整，已替换“地表径流”为通俗表达。",
          },
        },
      ],
      approval: null,
    },
    {
      id: "block-h2",
      type: "heading",
      headingLevel: 2,
      text: "一、水从哪里来",
      accessibleText: "一、水从哪里来",
      changeReason: "保留原章节结构。",
      reviewStatus: "approved",
      comments: [],
      approval: { basis: "H2 紧接 H1，层级无跳跃，表述保留原意。", approvedBy: "审核人 王老师", approvedAt: isoMinutesAgo(55) },
    },
    {
      id: "block-img",
      type: "image",
      text: "图 3-1 城市水循环示意",
      imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='420'%3E%3Crect width='800' height='420' fill='%23dcecf3'/%3E%3Ccircle cx='650' cy='85' r='45' fill='%23f4c95d'/%3E%3Cpath d='M0 300 Q180 240 340 300 T800 280 V420 H0Z' fill='%2389b7d0'/%3E%3Cpath d='M130 285 Q220 170 330 285' fill='none' stroke='%233a7c9e' stroke-width='12'/%3E%3C/svg%3E",
      imageAlt: "",
      accessibleText: "",
      changeReason: "",
      reviewStatus: "needs-work",
      comments: [],
      approval: null,
    },
    {
      id: "block-p2",
      type: "paragraph",
      text: "当太阳照射到水面时，水会受热变成水蒸气升到空中。水蒸气冷却后形成云，再以雨或雪的形式落回地面。",
      accessibleText: "太阳照在水面上，水会变成水蒸气升到空中。水蒸气冷却后变成云，最后以雨或雪落回地面。",
      changeReason: "使用较短句子，并明确每个步骤的先后顺序。",
      reviewStatus: "approved",
      comments: [],
      approval: { basis: "蒸发、凝结、降水三个步骤顺序清楚，无术语遗漏。", approvedBy: "审核人 王老师", approvedAt: isoMinutesAgo(40) },
    },
    {
      id: "block-link",
      type: "link",
      text: "点击这里",
      linkHref: "/resources/water-cycle",
      accessibleText: "打开水循环互动实验",
      changeReason: "改为说明链接目标的独立文案。",
      reviewStatus: "pending",
      comments: [],
      approval: null,
    },
    {
      id: "block-h3",
      type: "heading",
      headingLevel: 3,
      text: "雨水花园怎样工作",
      accessibleText: "雨水花园怎样工作",
      changeReason: "",
      reviewStatus: "pending",
      comments: [
        {
          id: "comment-seed-resolved",
          author: "审核专家 李老师",
          role: "reviewer",
          body: "H3 位于 H2 之下，层级可以，但“怎样工作”偏口语，确认是否符合教材体例。",
          createdAt: isoMinutesAgo(30),
          resolved: true,
          replies: [
            { id: "reply-seed-1", author: "当前编辑", body: "本章其余小节标题同为问句体，体例一致。", createdAt: isoMinutesAgo(25) },
          ],
          triggeredReturn: {
            at: isoMinutesAgo(30),
            fromApprover: "审核人 王老师",
            approvalBasis: "标题层级 H3 正确，问句体例与本章一致。",
          },
        },
      ],
      approval: null,
    },
    {
      id: "block-p3",
      type: "paragraph",
      text: "雨水花园利用土壤和植物的共同作用暂时储存雨水，同时通过下渗补给地下水，并在降雨较集中时减轻城市排水管道所承受的压力。",
      accessibleText: "雨水花园用土壤和植物暂时存住雨水。雨水还会慢慢渗入地下，补充地下水。雨很大时，它可以减轻排水管的压力。",
      changeReason: "把并列成分拆成短句，减少专业术语密度。",
      reviewStatus: "pending",
      comments: [],
      approval: null,
    },
  ];

  return {
    id: "accessible-textbook-1009",
    title: "科学（五年级下册）·无障碍改写稿",
    subject: "科学",
    grade: "五年级",
    blocks,
    glossary: [
      { id: "term-1", source: "水循环", preferred: "水循环", note: "全书统一使用" },
      { id: "term-2", source: "地表径流", preferred: "沿地面流动的水", note: "首次出现时使用通俗解释" },
      { id: "term-3", source: "下渗", preferred: "渗入地下", note: "避免单独使用专业词" },
    ],
    versions: [],
    updatedAt: new Date().toISOString(),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseImportedChapter(input: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push(blankBlock("heading", heading[2], { headingLevel: heading[1].length }));
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)(?:\s+(.+))?$/.exec(line);
    if (image) {
      blocks.push(blankBlock("image", image[3] || "未命名图片", { imageSrc: image[2], imageAlt: image[1] }));
      continue;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(line);
    if (link) {
      blocks.push(blankBlock("link", link[1], { linkHref: link[2] }));
      continue;
    }
    blocks.push(blankBlock("paragraph", line));
  }
  return blocks.length ? blocks : [blankBlock("paragraph", input.trim() || "请输入章节内容")];
}

function blankBlock(type: BlockType, text: string, extra: Partial<ContentBlock> = {}): ContentBlock {
  return {
    id: uid("block"),
    type,
    text,
    accessibleText: type === "image" ? extra.imageAlt ?? "" : text,
    changeReason: "",
    reviewStatus: "pending",
    comments: [],
    approval: null,
    ...extra,
  };
}

const openComments = (block: ContentBlock) => block.comments.filter((comment) => !comment.resolved);
const roleLabel = (role: CommentRole) => (role === "reviewer" ? "审核专家" : "编辑");

/**
 * 已通过内容出现未解决批注时自动退回待审核：
 * 在批注上留痕，标明是哪条意见造成退回，以及原通过依据。
 */
function autoReturnFromComment(block: ContentBlock, comment: CommentItem) {
  if (block.reviewStatus !== "approved") return false;
  const previous = block.approval;
  comment.triggeredReturn = {
    at: new Date().toISOString(),
    fromApprover: previous?.approvedBy ?? "审核人",
    approvalBasis: previous?.basis ?? "（未记录通过依据）",
  };
  block.reviewStatus = "pending";
  block.approval = null;
  return true;
}

/** 迁移旧版本地数据，并对历史上“已通过却有未解决批注”的内容补做退回 */
function normalizeProject(stored: ChapterProject): ChapterProject {
  const project = structuredClone(stored);
  if (!Array.isArray(project.blocks)) project.blocks = [];
  if (!Array.isArray(project.glossary)) project.glossary = [];
  if (!Array.isArray(project.versions)) project.versions = [];
  for (const block of project.blocks) {
    if (!Array.isArray(block.comments)) block.comments = [];
    block.approval ??= null;
    for (const comment of block.comments) {
      comment.role ??= "editor";
      if (!Array.isArray(comment.replies)) comment.replies = [];
      comment.triggeredReturn ??= null;
    }
    if (block.reviewStatus === "approved" && openComments(block).length) {
      for (const comment of openComments(block)) {
        comment.triggeredReturn ??= {
          at: project.updatedAt ?? new Date().toISOString(),
          fromApprover: block.approval?.approvedBy ?? "审核人",
          approvalBasis: block.approval?.basis ?? "（迁移的历史数据，未记录通过依据）",
        };
      }
      block.reviewStatus = "pending";
      block.approval = null;
    }
  }
  for (const version of project.versions) {
    if (!Array.isArray(version.blocks)) version.blocks = [];
    if (!Array.isArray(version.glossary)) version.glossary = [];
    for (const block of version.blocks) {
      if (!Array.isArray(block.comments)) block.comments = [];
      block.approval ??= null;
      for (const comment of block.comments) {
        comment.role ??= "editor";
        if (!Array.isArray(comment.replies)) comment.replies = [];
        comment.triggeredReturn ??= null;
      }
    }
  }
  return project;
}

function sentenceLength(text: string) {
  const normalized = text.replace(/\s+/g, "");
  return /[A-Za-z]/.test(text) ? text.trim().split(/\s+/).length : normalized.length;
}

function analyze(project: ChapterProject): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  let lastHeading = 0;
  for (const block of project.blocks) {
    if (block.type === "heading") {
      const level = block.headingLevel ?? 2;
      if (lastHeading && level > lastHeading + 1) {
        issues.push({
          id: `heading-${block.id}`,
          blockId: block.id,
          type: "heading",
          severity: "error",
          title: "标题层级跳跃",
          detail: `从 H${lastHeading} 直接到 H${level}，读屏用户会失去清晰的章节结构。`,
          suggestion: `改为 H${lastHeading + 1}，或补上中间的上级标题。`,
        });
      }
      lastHeading = level;
    }
    if (block.type === "image" && !(block.imageAlt ?? block.accessibleText).trim()) {
      issues.push({
        id: `image-${block.id}`,
        blockId: block.id,
        type: "image",
        severity: "error",
        title: "图片缺少替代文本",
        detail: "视觉用户能看到的图表信息，读屏用户目前无法获得。",
        suggestion: "说明图中主体、变化和结论；纯装饰图片应标记为空替代文本。",
      });
    }
    if (block.type === "link") {
      const label = block.accessibleText || block.text;
      if (/^(点击这里|这里|链接|更多|here|click here|read more)$/i.test(label.trim())) {
        issues.push({
          id: `link-${block.id}`,
          blockId: block.id,
          type: "link",
          severity: "error",
          title: "链接文案缺少目的",
          detail: `“${label}”单独朗读时无法说明会前往哪里。`,
          suggestion: "改成“打开水循环互动实验”等可独立理解的文案。",
        });
      }
    }
    const text = block.type === "image" ? block.text : block.text;
    const sentences = text.split(/(?<=[。！？!?])\s*/).filter(Boolean);
    for (const [index, sentence] of sentences.entries()) {
      if (sentenceLength(sentence) > (/[A-Za-z]/.test(sentence) ? 28 : 42)) {
        issues.push({
          id: `sentence-${block.id}-${index}`,
          blockId: block.id,
          type: "sentence",
          severity: "warning",
          title: "句子过长",
          detail: `该句约 ${sentenceLength(sentence)} ${/[A-Za-z]/.test(sentence) ? "个词" : "个字"}，一次理解的信息较多。`,
          suggestion: "按动作或因果关系拆成 2—3 个短句。",
        });
      }
    }
    const source = `${block.text} ${block.accessibleText}`;
    for (const term of project.glossary) {
      if (source.includes(term.source) && block.accessibleText && !block.accessibleText.includes(term.preferred)) {
        issues.push({
          id: `term-${block.id}-${term.id}`,
          blockId: block.id,
          type: "glossary",
          severity: "info",
          title: `术语“${term.source}”尚未统一`,
          detail: `全书建议表述为“${term.preferred}”。${term.note}`,
          suggestion: `将无障碍文本调整为“${term.preferred}”。`,
        });
      }
    }
  }
  return issues;
}

function simplifyText(input: string, glossary: GlossaryTerm[]) {
  let result = input
    .replaceAll("由于其", "因为")
    .replaceAll("因此", "所以")
    .replaceAll("具有十分重要的意义", "很重要")
    .replaceAll("利用", "使用")
    .replaceAll("共同作用", "一起作用")
    .replaceAll("暂时储存", "暂时存住")
    .replaceAll("所承受的压力", "受到的压力")
    .replace(/([^。！？]{38,}?)[，、]([^。！？]{12,}?[。！？])/g, "$1。$2");
  for (const term of glossary) {
    if (result.includes(term.source)) result = result.replaceAll(term.source, term.preferred);
  }
  result = result
    .split(/(?<=[。！？!?])\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join("\n");
  return result;
}

function blockRole(block: ContentBlock) {
  if (block.type === "heading") return `H${block.headingLevel ?? 2} 标题`;
  if (block.type === "image") return "图片 / 替代文本";
  if (block.type === "link") return "链接";
  return "正文段落";
}

function statusLabel(status: ReviewStatus) {
  if (status === "approved") return "已通过";
  if (status === "needs-work") return "需修改";
  return "待审核";
}

function severityLabel(severity: Severity) {
  if (severity === "error") return "必须修复";
  if (severity === "warning") return "建议优化";
  return "一致性提醒";
}

const APPROVER_NAME = "审核人 王老师";

function defaultApprovalBasis(block: ContentBlock) {
  return block.changeReason
    ? `已核对改写原因“${block.changeReason}”，信息无遗漏、表达易读，同意通过。`
    : "已逐句核对原文与无障碍表达，语义一致且符合结构要求，同意通过。";
}

function exportHtml(project: ChapterProject) {
  const body = project.blocks.map((block) => {
    if (block.type === "heading") {
      const level = Math.min(6, Math.max(1, block.headingLevel ?? 2));
      return `<h${level}>${escapeHtml(block.accessibleText || block.text)}</h${level}>`;
    }
    if (block.type === "image") {
      return `<figure><img src="${escapeHtml(block.imageSrc ?? "")}" alt="${escapeHtml(block.imageAlt || block.accessibleText)}"><figcaption>${escapeHtml(block.text)}</figcaption></figure>`;
    }
    if (block.type === "link") {
      return `<p><a href="${escapeHtml(block.linkHref ?? "#")}">${escapeHtml(block.accessibleText || block.text)}</a></p>`;
    }
    return `<p>${escapeHtml(block.accessibleText || block.text)}</p>`;
  }).join("\n      ");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(project.title)} · 无障碍版本</title>
  <style>
    :root { font-family: "Noto Sans SC", sans-serif; font-size: 20px; line-height: 1.85; color: #17231f; background: #fffdf7; }
    body { max-width: 760px; margin: 0 auto; padding: 32px 24px 80px; }
    a { color: #075c9d; text-decoration-thickness: 2px; text-underline-offset: 3px; }
    a:focus-visible, [tabindex]:focus-visible { outline: 4px solid #d08a00; outline-offset: 3px; }
    h1, h2, h3, h4, h5, h6 { line-height: 1.4; margin-top: 1.8em; }
    figure { margin: 2em 0; } img { max-width: 100%; height: auto; } figcaption { font-size: .86em; color: #46554f; }
    .skip { position: absolute; left: -9999px; } .skip:focus { position: static; display: inline-block; padding: .5em; background: #fff; }
  </style>
</head>
<body>
  <a class="skip" href="#main">跳到正文</a>
  <main id="main" tabindex="-1">
      ${body}
  </main>
</body>
</html>`;
}

function download(filename: string, content: string, type = "text/html;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadProject(): ChapterProject {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as { schema?: number; project?: ChapterProject };
    if ((stored.schema === 1 || stored.schema === 2) && stored.project?.blocks?.length) {
      return normalizeProject(stored.project);
    }
  } catch {
    // Fall back to the bundled sample.
  }
  return createSeedProject();
}

const rootElement = document.querySelector<HTMLDivElement>("#app");
if (!rootElement) throw new Error("Application root was not found");
const app: HTMLDivElement = rootElement;

let project = loadProject();
let activeBlockId = project.blocks[0]?.id ?? "";
let activeIssueId = "";
let previewMode: "normal" | "assisted" = "normal";
let selectedVersionId = "";
let showGlossary = false;
let showApproveDialog = false;
let showExportWarning = false;
let commentRole: CommentRole = "reviewer";
let notice: { tone: "info" | "warning" | "error"; text: string } | null = null;
let undoStack: ChapterProject[] = [];
let redoStack: ChapterProject[] = [];
let saveTimer = 0;

const activeBlock = () => project.blocks.find((block) => block.id === activeBlockId) ?? project.blocks[0];
const issues = () => analyze(project);
const totalOpenComments = () => project.blocks.reduce((sum, block) => sum + openComments(block).length, 0);
const exportBlockers = () =>
  project.blocks.flatMap((block) =>
    openComments(block).map((comment) => ({
      block,
      comment,
      index: project.blocks.indexOf(block) + 1,
      excerpt: block.accessibleText || block.text || "（空内容）",
    })),
  );

function saveSoon() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema: 2, project }));
  }, 320);
}

function commit(label: string, update: (draft: ChapterProject) => void | { notice?: typeof notice }, renderAfter = true) {
  undoStack = [...undoStack.slice(-49), structuredClone(project)];
  redoStack = [];
  const draft = structuredClone(project);
  const result = update(draft);
  draft.updatedAt = new Date().toISOString();
  project = draft;
  notice = result?.notice ?? null;
  document.documentElement.dataset.lastAction = label;
  saveSoon();
  if (renderAfter) render();
}

function undo() {
  const previous = undoStack.pop();
  if (!previous) return;
  redoStack = [structuredClone(project), ...redoStack].slice(0, 50);
  project = previous;
  if (!project.blocks.some((block) => block.id === activeBlockId)) activeBlockId = project.blocks[0]?.id ?? "";
  notice = null;
  saveSoon();
  render();
}

function redo() {
  const next = redoStack.shift();
  if (!next) return;
  undoStack = [...undoStack.slice(-49), structuredClone(project)];
  project = next;
  notice = null;
  saveSoon();
  render();
}

function updateActiveBlock(update: (block: ContentBlock, draft: ChapterProject) => void, label = "修改无障碍文本", renderAfter = true) {
  commit(label, (draft) => {
    const block = draft.blocks.find((item) => item.id === activeBlockId);
    if (block) update(block, draft);
  }, renderAfter);
}

function render() {
  const list = issues();
  const active = activeBlock();
  const activeIssues = list.filter((issue) => issue.blockId === active.id);
  const approved = project.blocks.filter((block) => block.reviewStatus === "approved").length;
  const openCount = totalOpenComments();
  const activeOpen = openComments(active);
  const activeReturns = activeOpen.filter((comment) => comment.triggeredReturn);
  const activeResolvedReturns = active.comments.filter((comment) => comment.resolved && comment.triggeredReturn);
  const version = project.versions.find((item) => item.id === selectedVersionId) ?? project.versions[0];

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand"><span>无障碍</span><b>1009</b></div>
        <div class="title-block">
          <input id="project-title" aria-label="教材名称" value="${escapeHtml(project.title)}" />
          <div class="meta"><span>${escapeHtml(project.subject)}</span><span>${escapeHtml(project.grade)}</span><span class="save-dot">本地自动保存</span></div>
        </div>
        <div class="top-actions">
          <span class="online-pill">${navigator.onLine ? "在线" : "离线可编辑"}</span>
          <sl-button size="small" variant="default" ${undoStack.length ? "" : "disabled"} data-action="undo">撤销</sl-button>
          <sl-button size="small" variant="default" ${redoStack.length ? "" : "disabled"} data-action="redo">重做</sl-button>
          <sl-button size="small" variant="default" data-action="glossary">术语表</sl-button>
          <sl-button size="small" variant="primary" data-action="save-version">保存版本</sl-button>
          <sl-button size="small" variant="${openCount ? "warning" : "success"}" data-action="export">${openCount ? "导出被批注拦截" : "导出无障碍 HTML"}</sl-button>
        </div>
      </header>

      <div class="progress-strip">
        <div class="progress-copy"><b>${approved}/${project.blocks.length}</b><span>内容块已审核通过</span></div>
        <div class="progress-bar"><i style="width:${Math.round((approved / Math.max(1, project.blocks.length)) * 100)}%"></i></div>
        <div class="issue-counts">
          <span class="error">${list.filter((issue) => issue.severity === "error").length} 必须修复</span>
          <span class="warning">${list.filter((issue) => issue.severity === "warning").length} 建议优化</span>
          <span class="info">${list.filter((issue) => issue.severity === "info").length} 术语提醒</span>
          <span class="comment-pill ${openCount ? "open" : ""}">${openCount} 条未解决批注</span>
        </div>
      </div>

      <div class="workspace">
        <aside class="outline-panel">
          <div class="panel-title"><span>章节结构</span><sl-badge>${project.blocks.length} 块</sl-badge></div>
          <div class="block-list">
            ${project.blocks.map((block, index) => {
              const blockIssues = list.filter((issue) => issue.blockId === block.id);
              const blockOpen = openComments(block).length;
              return `<button class="block-item ${block.id === active.id ? "active" : ""}" data-action="select-block" data-block-id="${block.id}">
                <span class="block-order">${index + 1}</span>
                <span class="block-copy"><b>${block.type === "heading" ? `H${block.headingLevel}` : blockRole(block)}</b><span>${escapeHtml(block.accessibleText || block.text || "（空）")}</span></span>
                <i class="status-${block.reviewStatus}" title="${statusLabel(block.reviewStatus)}"></i>
                ${blockOpen ? `<u class="block-open-comments">${blockOpen} 条意见</u>` : ""}
                ${blockIssues.length ? `<em>${blockIssues.length}</em>` : ""}
              </button>`;
            }).join("")}
          </div>
          <input id="chapter-file" type="file" accept=".txt,.md,.markdown" hidden />
          <sl-button class="import-button" variant="default" data-action="import">导入章节文本</sl-button>
          <div class="keyboard-note"><b>键盘</b><span><kbd>J</kbd><kbd>K</kbd> 跳转问题</span><span><kbd>E</kbd> 自动改写</span><span><kbd>⌘ Z</kbd> 撤销</span><span><kbd>1</kbd><kbd>2</kbd> 预览模式</span></div>
        </aside>

        <main class="editor-panel">
          <div class="editor-head">
            <div><span class="eyebrow">当前内容块</span><h1>${blockRole(active)}</h1></div>
            <div class="review-actions">
              <span class="status-chip status-${active.reviewStatus}">${statusLabel(active.reviewStatus)}${activeOpen.length ? ` · ${activeOpen.length} 条未解决` : ""}</span>
              <sl-button size="small" variant="${active.reviewStatus === "approved" ? "success" : "default"}" data-action="approve">${active.reviewStatus === "approved" ? "✓ 已通过" : "审核通过"}</sl-button>
              <sl-button size="small" variant="${active.reviewStatus === "needs-work" ? "danger" : "default"}" data-action="needs-work">需修改</sl-button>
            </div>
          </div>

          ${notice ? `<div class="notice-bar ${notice.tone}">${escapeHtml(notice.text)}</div>` : ""}
          ${activeReturns.length ? `<div class="review-banner returned">
            <strong>已自动退回待审核</strong>
            <p>以下未解决批注出现在内容通过之后，审核状态已自动退回，需审核人再次确认：</p>
            ${activeReturns.map((comment) => `<div class="return-cause">
              <b>退回意见（${roleLabel(comment.role)} · ${new Date(comment.createdAt).toLocaleString()}）：</b>
              <q>${escapeHtml(comment.body)}</q>
              <small>原通过依据（${escapeHtml(comment.triggeredReturn!.fromApprover)}）：${escapeHtml(comment.triggeredReturn!.approvalBasis)}</small>
            </div>`).join("")}
          </div>` : ""}
          ${!activeReturns.length && activeOpen.length ? `<div class="review-banner open">
            <strong>${activeOpen.length} 条批注尚未解决</strong>
            <p>批注全部解决后，仍需审核人再次点击“审核通过”才会恢复为已通过。</p>
          </div>` : ""}
          ${!activeOpen.length && activeResolvedReturns.length && active.reviewStatus !== "approved" ? `<div class="review-banner resolved-note">
            <strong>${activeResolvedReturns.length} 条退回意见已解决，等待审核人再次确认</strong>
            <p>内容不会因意见解决而自动恢复通过，请审核人核对后重新“审核通过”。</p>
          </div>` : ""}
          ${active.approval ? `<div class="approval-card">
            <span class="approval-stamp">✓ 审核通过依据</span>
            <p>${escapeHtml(active.approval.basis)}</p>
            <small>${escapeHtml(active.approval.approvedBy)} · ${new Date(active.approval.approvedAt).toLocaleString()} · 若再出现未解决批注，内容将自动退回待审核</small>
          </div>` : ""}

          ${activeIssues.length ? `<div class="active-issues">${activeIssues.map((issue) => `
            <div class="issue-card ${issue.severity}">
              <div><sl-badge variant="${issue.severity === "error" ? "danger" : issue.severity === "warning" ? "warning" : "primary"}">${severityLabel(issue.severity)}</sl-badge><strong>${escapeHtml(issue.title)}</strong></div>
              <p>${escapeHtml(issue.detail)}</p><small>${escapeHtml(issue.suggestion)}</small>
            </div>`).join("")}</div>` : `<div class="issue-clear">✓ 当前内容块没有新的无障碍问题</div>`}

          <section class="edit-card source-card">
            <div class="section-heading"><div><span class="eyebrow">原教材</span><h2>${active.type === "image" ? "图片信息" : active.type === "link" ? "链接信息" : "原文"}</h2></div><sl-badge variant="neutral">${active.type}</sl-badge></div>
            ${renderSourceEditor(active)}
          </section>

          <section class="edit-card rewrite-card">
            <div class="section-heading">
              <div><span class="eyebrow">Accessible rewrite</span><h2>无障碍表达</h2></div>
              <sl-button size="small" variant="primary" outline data-action="generate">生成易读版本</sl-button>
            </div>
            ${renderAccessibleEditor(active)}
            <label class="field-label" for="reason-${active.id}">改写原因（每处改写必须记录）</label>
            <sl-textarea id="reason-${active.id}" data-field="reason" rows="2" value="${escapeHtml(active.changeReason)}" placeholder="例如：拆分长句、替换专业表达、补充链接目的"></sl-textarea>
          </section>

          <section class="edit-card">
            <div class="section-heading"><div><span class="eyebrow">Review discussion</span><h2>批注与回复</h2></div><sl-badge variant="${activeOpen.length ? "danger" : "neutral"}">${activeOpen.length} 未解决 / ${active.comments.length} 条</sl-badge></div>
            <div class="comment-compose">
              <sl-select id="comment-role" size="small" value="${commentRole}">
                <sl-option value="reviewer">以审核专家身份</sl-option>
                <sl-option value="editor">以编辑身份</sl-option>
              </sl-select>
              <sl-textarea id="new-comment" rows="2" placeholder="记录改写依据、审核意见或术语讨论。已通过内容新增未解决批注会自动退回待审核…"></sl-textarea>
              <sl-button size="small" variant="primary" data-action="add-comment">添加批注</sl-button>
            </div>
            <div class="comment-list">
              ${active.comments.length ? active.comments.map((comment) => `
                <article class="comment ${comment.resolved ? "resolved" : ""} ${comment.triggeredReturn ? "return-source" : ""}">
                  <header><span class="comment-id"><b>${escapeHtml(comment.author)}</b><em class="role-tag ${comment.role}">${roleLabel(comment.role)}</em>${comment.resolved ? '<em class="state-tag resolved">已解决</em>' : '<em class="state-tag open">未解决</em>'}</span><time>${new Date(comment.createdAt).toLocaleString()}</time></header>
                  <p>${escapeHtml(comment.body)}</p>
                  ${comment.triggeredReturn ? `<div class="return-trace">
                    <b>↩ 此意见造成通过被退回</b>
                    <span>退回于 ${new Date(comment.triggeredReturn.at).toLocaleString()}；原通过依据（${escapeHtml(comment.triggeredReturn.fromApprover)}）：${escapeHtml(comment.triggeredReturn.approvalBasis)}</span>
                  </div>` : ""}
                  ${comment.replies.map((reply) => `<div class="reply"><b>${escapeHtml(reply.author)}</b><span>${escapeHtml(reply.body)}</span></div>`).join("")}
                  <div class="reply-row"><sl-input size="small" id="reply-${comment.id}" placeholder="回复…"></sl-input><sl-button size="small" data-action="reply" data-comment-id="${comment.id}">回复</sl-button><sl-button size="small" variant="${comment.resolved ? "default" : "success"}" outline data-action="resolve-comment" data-comment-id="${comment.id}">${comment.resolved ? "重新打开（将再次退回）" : "标记解决"}</sl-button></div>
                </article>`).join("") : `<div class="empty-note">当前内容块还没有批注。</div>`}
            </div>
          </section>
        </main>

        <aside class="review-panel">
          <section class="preview-card">
            <div class="section-heading"><div><span class="eyebrow">Reader preview</span><h2>阅读预览</h2></div><div class="mode-switch"><button class="${previewMode === "normal" ? "active" : ""}" data-action="preview-normal">普通</button><button class="${previewMode === "assisted" ? "active" : ""}" data-action="preview-assisted">辅助</button></div></div>
            <div class="reader-preview mode-${previewMode}">${renderPreview()}</div>
          </section>

          <section class="order-card">
            <div class="section-heading"><div><span class="eyebrow">Screen reader order</span><h2>读屏阅读顺序</h2></div><sl-badge>从上到下</sl-badge></div>
            <ol class="reading-order">
              ${project.blocks.map((block, index) => `<li class="${block.id === active.id ? "active" : ""}"><b>${index + 1}</b><div><strong>${blockRole(block)}</strong><span>${escapeHtml(block.accessibleText || block.text || "（无内容）")}</span></div></li>`).join("")}
            </ol>
          </section>

          <section class="issues-panel">
            <div class="section-heading"><div><span class="eyebrow">All checks</span><h2>全章问题</h2></div><sl-button size="small" variant="default" outline data-action="approve-all">全部通过（跳过有未解决批注的内容）</sl-button></div>
            <div class="issue-list">
              ${list.length ? list.map((issue) => `<button class="${issue.id === activeIssueId ? "active" : ""} ${issue.severity}" data-action="jump-issue" data-issue-id="${issue.id}" data-block-id="${issue.blockId}"><span>${severityLabel(issue.severity)}</span><b>${escapeHtml(issue.title)}</b><small>段 ${project.blocks.findIndex((block) => block.id === issue.blockId) + 1} · ${escapeHtml(issue.suggestion)}</small></button>`).join("") : `<div class="issue-clear">✓ 全章检查通过</div>`}
            </div>
          </section>

          <section class="version-card">
            <div class="section-heading"><div><span class="eyebrow">Version compare</span><h2>版本比较</h2></div><sl-badge>${project.versions.length} 版</sl-badge></div>
            ${project.versions.length ? `
              <sl-select id="version-select" size="small" value="${version?.id ?? ""}">${project.versions.map((item) => `<sl-option value="${item.id}">${escapeHtml(item.label)} · ${new Date(item.createdAt).toLocaleTimeString()}</sl-option>`).join("")}</sl-select>
              <div class="version-diff">${version ? renderVersionDiff(version, active) : ""}</div>
            ` : `<div class="empty-note">保存版本后，可比较改写前后的无障碍文本。</div>`}
          </section>
        </aside>
      </div>

      <footer class="statusbar"><span>最近操作：${escapeHtml(document.documentElement.dataset.lastAction || "示例章节已载入")}</span><span>${project.blocks.length} 个内容块 · ${list.length} 个待处理问题</span></footer>
    </div>

    <sl-dialog label="全书术语表" ${showGlossary ? "open" : ""} data-dialog="glossary">
      <div class="glossary-editor">
        ${project.glossary.map((term) => `<div class="term-row"><div><b>${escapeHtml(term.source)}</b><sl-input size="small" value="${escapeHtml(term.preferred)}" data-term-id="${term.id}"></sl-input><small>${escapeHtml(term.note)}</small></div><sl-button size="small" variant="danger" outline data-action="remove-term" data-term-id="${term.id}">删除</sl-button></div>`).join("")}
      </div>
      <div class="term-add"><sl-input id="new-term-source" placeholder="原文术语"></sl-input><sl-input id="new-term-preferred" placeholder="统一表达"></sl-input><sl-button variant="primary" data-action="add-term">添加术语</sl-button></div>
      <sl-button slot="footer" variant="primary" data-action="close-glossary">完成</sl-button>
    </sl-dialog>

    <sl-dialog id="dialog-approve" label="确认审核通过" ${showApproveDialog ? "open" : ""} data-dialog="approve">
      <p class="dialog-note">请再次核对“${escapeHtml(blockRole(active))}”，并留下本次通过依据。保存版本会同时记录批注状态与该依据，重新打开可恢复。</p>
      <sl-textarea id="approval-basis" rows="4" value="${escapeHtml(active.approval?.basis ?? defaultApprovalBasis(active))}"></sl-textarea>
      <small class="dialog-hint">审核人：${escapeHtml(APPROVER_NAME)} · 通过时间将自动记录</small>
      <sl-button slot="footer" variant="default" data-action="cancel-approve">取消</sl-button>
      <sl-button slot="footer" variant="success" data-action="confirm-approve">确认通过</sl-button>
    </sl-dialog>

    <sl-dialog id="dialog-export-warning" label="导出已停止：仍有未解决批注" ${showExportWarning ? "open" : ""} data-dialog="export-warning">
      <p class="dialog-note warning-text">共有 ${exportBlockers().length} 条未解决批注，分布在 ${new Set(exportBlockers().map((item) => item.block.id)).size} 个内容块。为避免未审核意见混进最终稿，本次未生成导出文件。请先解决以下意见并由审核人再次确认通过：</p>
      <div class="export-block-list">
        ${exportBlockers().map(({ block, comment, index, excerpt }) => `<button class="export-block-item" data-action="jump-blocker" data-block-id="${block.id}">
          <div class="export-block-head"><b>内容块 ${index} · ${escapeHtml(blockRole(block))}</b><span class="state-tag open">未解决</span></div>
          <p class="export-block-excerpt">${escapeHtml(excerpt.length > 60 ? `${excerpt.slice(0, 60)}…` : excerpt)}</p>
          <div class="export-block-comment"><em class="role-tag ${comment.role}">${roleLabel(comment.role)}</em><q>${escapeHtml(comment.body)}</q></div>
        </button>`).join("")}
      </div>
      <sl-button slot="footer" variant="primary" data-action="close-export-warning">我知道了，先处理批注</sl-button>
    </sl-dialog>`;

  wireLiveFields();
}

function renderSourceEditor(block: ContentBlock) {
  if (block.type === "image") {
    return `<div class="image-source"><img src="${escapeHtml(block.imageSrc ?? "")}" alt="" /><div><b>图注</b><p>${escapeHtml(block.text)}</p><b>现有替代文本</b><p>${escapeHtml(block.imageAlt || "（空）")}</p></div></div>
      <sl-input id="source-${block.id}" data-field="source" label="图注" value="${escapeHtml(block.text)}"></sl-input>
      <sl-input id="image-alt-${block.id}" data-field="image-alt" label="替代文本" value="${escapeHtml(block.imageAlt ?? "")}" help-text="描述图片传达的信息，不写“图片”二字。"></sl-input>`;
  }
  if (block.type === "link") {
    return `<sl-input id="source-${block.id}" data-field="source" label="原链接文案" value="${escapeHtml(block.text)}"></sl-input><sl-input id="link-href-${block.id}" data-field="link-href" label="链接地址" value="${escapeHtml(block.linkHref ?? "")}"></sl-input>`;
  }
  if (block.type === "heading") {
    return `<div class="heading-edit"><sl-select id="heading-level-${block.id}" data-field="heading-level" label="标题层级" value="${String(block.headingLevel ?? 2)}"><sl-option value="1">H1</sl-option><sl-option value="2">H2</sl-option><sl-option value="3">H3</sl-option><sl-option value="4">H4</sl-option></sl-select><sl-input id="source-${block.id}" data-field="source" label="标题文本" value="${escapeHtml(block.text)}"></sl-input></div>`;
  }
  return `<sl-textarea id="source-${block.id}" data-field="source" rows="4" value="${escapeHtml(block.text)}"></sl-textarea>`;
}

function renderAccessibleEditor(block: ContentBlock) {
  if (block.type === "image") {
    return `<sl-textarea id="accessible-${block.id}" data-field="accessible" rows="3" label="图片替代文本" value="${escapeHtml(block.imageAlt || block.accessibleText)}" help-text="读屏软件会朗读这里的内容。"></sl-textarea>`;
  }
  return `<sl-textarea id="accessible-${block.id}" data-field="accessible" rows="6" value="${escapeHtml(block.accessibleText)}"></sl-textarea>`;
}

function renderPreview() {
  return project.blocks.map((block, index) => {
    const content = escapeHtml(block.accessibleText || block.text);
    if (block.type === "heading") {
      const tag = `h${Math.min(6, Math.max(1, block.headingLevel ?? 2))}`;
      return `<${tag} class="${block.id === activeBlockId ? "active-block" : ""}"><span class="order-marker">${index + 1}</span>${content}</${tag}>`;
    }
    if (block.type === "image") {
      return `<figure class="${block.id === activeBlockId ? "active-block" : ""}"><img src="${escapeHtml(block.imageSrc ?? "")}" alt="${escapeHtml(block.imageAlt || block.accessibleText)}"><figcaption><span class="order-marker">${index + 1}</span>${escapeHtml(block.text)}</figcaption></figure>`;
    }
    if (block.type === "link") {
      return `<p class="${block.id === activeBlockId ? "active-block" : ""}"><span class="order-marker">${index + 1}</span><a href="${escapeHtml(block.linkHref ?? "#")}" onclick="return false">${content}</a><span class="link-role">链接</span></p>`;
    }
    return `<p class="${block.id === activeBlockId ? "active-block" : ""}"><span class="order-marker">${index + 1}</span>${content}</p>`;
  }).join("");
}

function renderVersionDiff(version: VersionSnapshot, current: ContentBlock) {
  const oldBlock = version.blocks.find((block) => block.id === current.id);
  if (!oldBlock) return `<div class="empty-note">当前内容块不在该版本中。</div>`;
  const oldOpen = openComments(oldBlock).length;
  const oldMeta = `<div class="diff-meta">
    <span class="status-chip status-${oldBlock.reviewStatus}">${statusLabel(oldBlock.reviewStatus)}</span>
    <span class="diff-comments ${oldOpen ? "open" : ""}">批注 ${oldBlock.comments.length} 条 · 未解决 ${oldOpen} 条</span>
  </div>
  ${oldBlock.approval ? `<div class="diff-approval"><b>通过依据</b><p>${escapeHtml(oldBlock.approval.basis)}</p><small>${escapeHtml(oldBlock.approval.approvedBy)} · ${new Date(oldBlock.approval.approvedAt).toLocaleString()}</small></div>` : `<div class="diff-approval missing">该版本未通过审核，没有通过依据。</div>`}`;
  return `<div class="diff-column"><span>旧版</span><p>${escapeHtml(oldBlock.accessibleText || oldBlock.text)}</p>${oldMeta}</div><div class="diff-column current"><span>当前</span><p>${escapeHtml(current.accessibleText || current.text)}</p></div>`;
}

function wireLiveFields() {
  app.querySelectorAll<HTMLElement>("sl-input[data-field], sl-textarea[data-field], sl-select[data-field]").forEach((element) => {
    element.addEventListener("sl-input", () => {
      const value = (element as HTMLElement & { value: string }).value;
      updateActiveBlock((block) => {
        const field = element.dataset.field;
        if (field === "source") block.text = value;
        if (field === "accessible") {
          block.accessibleText = value;
          if (block.type === "image") block.imageAlt = value;
        }
        if (field === "image-alt") {
          block.imageAlt = value;
          block.accessibleText = value;
        }
        if (field === "link-href") block.linkHref = value;
        if (field === "reason") block.changeReason = value;
        block.reviewStatus = "pending";
        block.approval = null;
      }, "编辑无障碍文本", false);
    });
    element.addEventListener("sl-change", () => render());
  });
}

app.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "undo") undo();
  if (action === "redo") redo();
  if (action === "select-block") {
    activeBlockId = target.dataset.blockId ?? activeBlockId;
    activeIssueId = "";
    notice = null;
    render();
  }
  if (action === "jump-issue") {
    activeIssueId = target.dataset.issueId ?? "";
    activeBlockId = target.dataset.blockId ?? activeBlockId;
    notice = null;
    render();
    requestAnimationFrame(() => app.querySelector<HTMLElement>(".editor-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  if (action === "generate") {
    const block = activeBlock();
    const suggestion = block.type === "link"
      ? "打开水循环互动实验"
      : simplifyText(block.type === "image" ? block.imageAlt || block.text : block.text, project.glossary);
    updateActiveBlock((current) => {
      if (current.type === "image") current.imageAlt = suggestion;
      current.accessibleText = suggestion;
      current.changeReason ||= "拆分长句并替换复杂表达，保留原有知识信息。";
      current.reviewStatus = "pending";
      current.approval = null;
    }, "生成易读版本");
  }
  if (action === "approve") {
    const block = activeBlock();
    const open = openComments(block);
    if (open.length) {
      notice = { tone: "error", text: `还有 ${open.length} 条未解决批注，不能审核通过。请先解决批注，再由审核人确认。` };
      render();
      return;
    }
    showApproveDialog = true;
    render();
  }
  if (action === "cancel-approve") { showApproveDialog = false; render(); }
  if (action === "confirm-approve") {
    const basis = app.querySelector<HTMLElement & { value: string }>("#approval-basis")?.value.trim() || defaultApprovalBasis(activeBlock());
    showApproveDialog = false;
    updateActiveBlock((block) => {
      block.reviewStatus = "approved";
      block.approval = { basis, approvedBy: APPROVER_NAME, approvedAt: new Date().toISOString() };
    }, "审核通过");
    notice = { tone: "info", text: "已记录通过依据并标记为已通过。" };
    render();
  }
  if (action === "needs-work") updateActiveBlock((block) => {
    block.reviewStatus = "needs-work";
    block.approval = null;
  }, "标记需修改");
  if (action === "add-comment") {
    const input = app.querySelector<HTMLElement & { value: string }>("#new-comment");
    const body = input?.value.trim();
    if (body) {
      const role: CommentRole = commentRole;
      updateActiveBlock((block) => {
        const comment: CommentItem = {
          id: uid("comment"),
          author: role === "reviewer" ? "审核专家 李老师" : "当前编辑",
          role,
          body,
          createdAt: new Date().toISOString(),
          resolved: false,
          replies: [],
          triggeredReturn: null,
        };
        block.comments.unshift(comment);
        const returned = autoReturnFromComment(block, comment);
        if (returned) {
          notice = {
            tone: "warning",
            text: `该内容原为“已通过”，因新批注“${body.length > 30 ? `${body.slice(0, 30)}…` : body}”未解决，已自动退回待审核；解决后仍需审核人再次确认。`,
          };
        }
      }, "添加批注");
      if (notice) render();
    }
  }
  if (action === "reply") {
    const commentId = target.dataset.commentId ?? "";
    const input = app.querySelector<HTMLElement & { value: string }>(`#reply-${CSS.escape(commentId)}`);
    const body = input?.value.trim();
    if (body) updateActiveBlock((block) => {
      block.comments.find((comment) => comment.id === commentId)?.replies.push({ id: uid("reply"), author: "当前编辑", body, createdAt: new Date().toISOString() });
    }, "回复批注");
  }
  if (action === "resolve-comment") {
    const commentId = target.dataset.commentId ?? "";
    updateActiveBlock((block) => {
      const comment = block.comments.find((item) => item.id === commentId);
      if (!comment) return;
      if (comment.resolved) {
        // 重新打开一条旧意见：若内容当前已通过，需再次退回
        comment.resolved = false;
        const returned = autoReturnFromComment(block, comment);
        notice = returned
          ? { tone: "warning", text: `批注“${comment.body.length > 30 ? `${comment.body.slice(0, 30)}…` : comment.body}”被重新打开，内容已再次自动退回待审核。` }
          : { tone: "info", text: "批注已重新打开，状态保持待审核。" };
      } else {
        comment.resolved = true;
        notice = { tone: "info", text: "批注已标记解决，但内容仍为待审核，请由审核人核对后再次确认通过。" };
      }
    }, "更新批注状态");
    if (notice) render();
  }
  if (action === "preview-normal") { previewMode = "normal"; render(); }
  if (action === "preview-assisted") { previewMode = "assisted"; render(); }
  if (action === "glossary") { showGlossary = true; render(); }
  if (action === "close-glossary") { showGlossary = false; render(); }
  if (action === "add-term") {
    const source = app.querySelector<HTMLElement & { value: string }>("#new-term-source");
    const preferred = app.querySelector<HTMLElement & { value: string }>("#new-term-preferred");
    if (source?.value.trim() && preferred?.value.trim()) {
      commit("添加术语", (draft) => { draft.glossary.push({ id: uid("term"), source: source.value.trim(), preferred: preferred.value.trim(), note: "编辑新增术语" }); });
    }
  }
  if (action === "remove-term") {
    const termId = target.dataset.termId;
    commit("删除术语", (draft) => { draft.glossary = draft.glossary.filter((term) => term.id !== termId); });
  }
  if (action === "save-version") {
    const versionId = uid("version");
    commit("保存版本快照", (draft) => {
      draft.versions.unshift({ id: versionId, label: `版本 ${draft.versions.length + 1}`, createdAt: new Date().toISOString(), blocks: structuredClone(draft.blocks), glossary: structuredClone(draft.glossary) });
      draft.versions = draft.versions.slice(0, 10);
    });
    selectedVersionId = versionId;
    render();
  }
  if (action === "approve-all") {
    commit("全部审核通过", (draft) => {
      let skipped = 0;
      draft.blocks.forEach((block) => {
        if (openComments(block).length) {
          skipped += 1;
          return;
        }
        block.reviewStatus = "approved";
        block.approval ??= {
          basis: "批量通过：已复核无障碍检查项且该内容块没有未解决批注。",
          approvedBy: APPROVER_NAME,
          approvedAt: new Date().toISOString(),
        };
      });
      return {
        notice: skipped
          ? { tone: "warning" as const, text: `已通过其余内容；${skipped} 个内容块因仍有未解决批注被跳过，需先处理意见。` }
          : { tone: "info" as const, text: "全部内容块均已审核通过。" },
      };
    });
  }
  if (action === "export") {
    const blockers = exportBlockers();
    if (blockers.length) {
      showExportWarning = true;
      document.documentElement.dataset.lastAction = "导出被未解决批注拦截";
      render();
      return;
    }
    download(`${project.title}-无障碍版.html`, exportHtml(project));
    document.documentElement.dataset.lastAction = "已导出无障碍 HTML";
    render();
  }
  if (action === "close-export-warning") { showExportWarning = false; render(); }
  if (action === "jump-blocker") {
    activeBlockId = target.dataset.blockId ?? activeBlockId;
    activeIssueId = "";
    showExportWarning = false;
    notice = null;
    render();
    requestAnimationFrame(() => app.querySelector<HTMLElement>(".editor-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  if (action === "import") app.querySelector<HTMLInputElement>("#chapter-file")?.click();
});

app.addEventListener("sl-change", (event) => {
  const element = event.target as HTMLElement;
  if (element.id === "chapter-file") return;
  if (element.id === "comment-role") {
    commentRole = (element as HTMLElement & { value: string }).value as CommentRole;
    return;
  }
  if (element.id.startsWith("heading-level-")) {
    const level = Number((element as HTMLElement & { value: string }).value);
    updateActiveBlock((block) => { block.headingLevel = level; block.reviewStatus = "pending"; block.approval = null; }, "修改标题层级");
  }
  if (element.id === "version-select") {
    selectedVersionId = (element as HTMLElement & { value: string }).value;
    render();
  }
  if (element.matches("[data-term-id]")) {
    const termId = element.dataset.termId;
    const value = (element as HTMLElement & { value: string }).value;
    commit("修改术语表", (draft) => { const term = draft.glossary.find((item) => item.id === termId); if (term) term.preferred = value; });
  }
});

app.addEventListener("sl-request-close", (event) => {
  const dialog = (event.target as HTMLElement).dataset.dialog;
  if (dialog === "glossary") showGlossary = false;
  if (dialog === "approve") showApproveDialog = false;
  if (dialog === "export-warning") showExportWarning = false;
  render();
});

app.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id !== "chapter-file" || !input.files?.[0]) return;
  void input.files[0].text().then((text) => {
    commit("导入章节文本", (draft) => {
      draft.blocks = parseImportedChapter(text);
      activeBlockId = draft.blocks[0]?.id ?? "";
      activeIssueId = "";
    });
  });
});

app.addEventListener("input", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id === "project-title") {
    project.title = input.value;
    saveSoon();
  }
});

window.addEventListener("online", render);
window.addEventListener("offline", render);
window.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement;
  if (target.matches("input, textarea, sl-input, sl-textarea, [contenteditable='true']")) return;
  const command = event.metaKey || event.ctrlKey;
  if (command && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
    return;
  }
  if (command && event.key.toLowerCase() === "s") {
    event.preventDefault();
    const versionId = uid("version");
    commit("键盘保存版本", (draft) => { draft.versions.unshift({ id: versionId, label: `版本 ${draft.versions.length + 1}`, createdAt: new Date().toISOString(), blocks: structuredClone(draft.blocks), glossary: structuredClone(draft.glossary) }); });
    selectedVersionId = versionId;
    return;
  }
  if (event.key.toLowerCase() === "j" || event.key.toLowerCase() === "k") {
    const list = issues();
    if (!list.length) return;
    const current = Math.max(0, list.findIndex((issue) => issue.id === activeIssueId));
    const next = (current + (event.key.toLowerCase() === "j" ? 1 : -1) + list.length) % list.length;
    activeIssueId = list[next].id;
    activeBlockId = list[next].blockId;
    render();
  }
  if (event.key.toLowerCase() === "e") {
    const button = app.querySelector<HTMLElement>('[data-action="generate"]');
    button?.click();
  }
  if (event.key === "1") { previewMode = "normal"; render(); }
  if (event.key === "2") { previewMode = "assisted"; render(); }
});

render();
