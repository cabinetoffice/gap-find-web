import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { Block, BLOCKS, Document, INLINES } from '@contentful/rich-text-types';
import { ReactNode } from 'react';

interface BaseContentfulRendererProps {
  content: any;
}
const list_item_options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node: Block, children: ReactNode) => (
      <span>{children}</span>
    ),
    [INLINES.HYPERLINK]: (node: Block, children: ReactNode) => (
      <a
        className="govuk-link"
        target="_blank"
        rel="noreferrer"
        href={node.data.uri}
      >
        {children}
      </a>
    ),
  },
};

const options = {
  renderNode: {
    [BLOCKS.HEADING_1]: (node: Block, children: ReactNode) => (
      <h1 className="govuk-heading-xl govuk-!-margin-top-8 govuk-!-margin-bottom-4">
        {children}
      </h1>
    ),
    [BLOCKS.HEADING_2]: (node: Block, children: ReactNode) => (
      <h2 className="govuk-heading-l govuk-!-margin-top-8 govuk-!-padding-top-0 govuk-!-margin-bottom-4">
        {children}
      </h2>
    ),
    [BLOCKS.HEADING_3]: (node: Block, children: ReactNode) => (
      <h3 className="govuk-heading-m govuk-!-font-size-27 govuk-!-margin-top-8 govuk-!-margin-bottom-4">
        {children}
      </h3>
    ),
    [BLOCKS.PARAGRAPH]: (node: Block, children: ReactNode) => (
      <p className="govuk-body">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node: Block, children: ReactNode) => (
      <ul className="govuk-list govuk-list--bullet">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (node: Block) => (
      <>{documentToReactComponents(node as Document, list_item_options)}</>
    ),
    [BLOCKS.QUOTE]: (node: Block, children: ReactNode) => (
      <div className="gap-contact-inset govuk-body">{children}</div>
    ),
    [INLINES.HYPERLINK]: (node: Block, children: ReactNode) => (
      <a
        className="govuk-link"
        target="_blank"
        rel="noreferrer"
        href={node.data.uri}
        data-cy={`cyAccessibilityLink_${node.data.uri}`}
      >
        {children}
      </a>
    ),
  },
};

export const BaseContentfulRenderer = (props: BaseContentfulRendererProps) => {
  return <>{documentToReactComponents(props.content, options)}</>;
};
