import DocPageTemplate from '../../components/docs/DocPageTemplate'
import content from '../../docs/text.md?raw'

export default function DocsText() {
  return <DocPageTemplate content={content} />
}
