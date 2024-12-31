import { FolderTree } from '@/components/ui/folder-tree'

export default function FolderStructure() {
  return (
    <FolderTree>
      <FolderTree.Folder name="ai-agents-project" defaultOpen>
        <FolderTree.Folder name="src" defaultOpen>
          <FolderTree.Folder name="agents">
            <FolderTree.File name="analysis-agent.ts" />
            <FolderTree.File name="pipeline-agent.ts" />
            <FolderTree.File name="orchestrator-agent.ts" />
          </FolderTree.Folder>
          <FolderTree.Folder name="types">
            <FolderTree.File name="index.ts" />
          </FolderTree.Folder>
          <FolderTree.Folder name="utils">
            <FolderTree.File name="data-simulator.js" />
          </FolderTree.Folder>
          <FolderTree.File name="example-usage.ts" />
        </FolderTree.Folder>
        <FolderTree.Folder name="public">
          <FolderTree.File name="index.html" />
          <FolderTree.File name="app.js" />
        </FolderTree.Folder>
        <FolderTree.File name="server.js" />
        <FolderTree.File name="package.json" />
        <FolderTree.File name="tsconfig.json" />
        <FolderTree.File name="README.md" />
      </FolderTree.Folder>
    </FolderTree>
  )
}

