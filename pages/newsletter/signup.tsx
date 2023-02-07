import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { ParsedUrlQuery } from 'querystring';
import React from 'react';
import Layout from '../../src/components/partials/Layout';
import SignupForm from '../../src/components/sign-up/SignupForm';
import gloss from '../../src/utils/glossary.json';
import { getValidationErrorsFromQuery } from '../../src/utils/request';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const errors: Array<Object> = query['errors[]']
    ? getValidationErrorsFromQuery(query['errors[]'])
    : [];

  const titleContent =
    errors.length > 0 ? `Error: ${gloss.title}` : gloss.title;

  return {
    props: {
      errors,
      previousFormValues: query,
      titleContent,
    },
  };
};

type newsletterSignupFormProps = {
  errors: Array<Object>;
  previousFormValues: ParsedUrlQuery;
  titleContent: string;
};

const Signup = ({
  errors,
  previousFormValues,
  titleContent,
}: newsletterSignupFormProps) => {
  const formData = {
    fields: [],
    action: '/newsletter/confirmation',
    resultingAction:
      'Enter your email address to get updates when new grants have been added.',
  };

  return (
    <>
      <Head>
        <title>{titleContent}</title>
      </Head>

      <Layout>
        <SignupForm
          formData={formData}
          errors={errors}
          previousFormValues={previousFormValues}
        />
      </Layout>
    </>
  );
};

export default Signup;
