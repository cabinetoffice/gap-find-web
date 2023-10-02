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
    ContentfulPage.PRIVACY_NOTICE,
  );

  return {
    props: {
      title: entry.fields.pageName,
      description: 'Privacy for Find a grant',
      content: entry.fields.body,
      links: [
        RelatedContentLinks.get(RelatedLinksNames.ABOUT_US),
        RelatedContentLinks.get(RelatedLinksNames.TERMS_AND_CONDITIONS),
      ],
    },
  };
};

const Privacy = (props: BaseContentfulPageProps) => {
  return (
    <>
      <Head>
        <title>Privacy Policy - Find a grant</title>
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

export default Privacy;
