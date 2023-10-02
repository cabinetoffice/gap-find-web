import React from 'react';
import Head from 'next/head';
import {
  BaseContentfulPage,
  BaseContentfulPageProps,
} from '../../src/components/contentful/base-contentful-page';
import { GetServerSideProps } from 'next';
import {
  RelatedContentLinks,
  RelatedLinksNames,
} from '../../src/utils/related-content-links';
import {
  ContentfulPage,
  ContentfulPageService,
} from '../../src/service/contentful-page-service';

export const getServerSideProps: GetServerSideProps<
  BaseContentfulPageProps
> = async () => {
  const contentfulPageService = ContentfulPageService.getInstance();
  const entry = await contentfulPageService.getContentfulPageEntry(
    ContentfulPage.ACCESSIBILITY,
  );

  return {
    props: {
      title: entry.fields.pageName,
      description: 'Accessibility for Find a grant',
      content: entry.fields.body,
      links: [
        RelatedContentLinks.get(RelatedLinksNames.ABOUT_US),
        RelatedContentLinks.get(RelatedLinksNames.PRIVACY_NOTICE),
      ],
    },
  };
};

const Accessibility = (props: BaseContentfulPageProps) => {
  return (
    <>
      <Head>
        <title>Accessibility - Find a grant</title>
      </Head>
      <BaseContentfulPage
        title={props.title}
        description={props.description}
        content={props.content}
        links={props.links}
      />
    </>
  );
};

export default Accessibility;
