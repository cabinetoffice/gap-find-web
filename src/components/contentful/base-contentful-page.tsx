import React from 'react';
import Layout from '../../components/partials/Layout';
import RelatedContent from '../../components/related-content';
import { BaseContentfulRenderer } from '../../components/contentful/base-contentful-renderer';

export interface BaseContentfulPageProps {
  title: string;
  description: string;
  content: any;
  links: Array<{ title: string; href: string }>;
}

export const BaseContentfulPage = (props: BaseContentfulPageProps) => {
  return (
    <>
      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds govuk-!-margin-top-7">
            <h1
              className="govuk-heading-xl govuk-!-margin-bottom-4"
              data-cy={`cy${props.title}Title`}
              id="main-content-focus"
              tabIndex={-1}
            >
              {props.title}
            </h1>
          </div>
        </div>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <BaseContentfulRenderer content={props.content} />
          </div>
          <RelatedContent links={props.links} />
        </div>
      </Layout>
    </>
  );
};
